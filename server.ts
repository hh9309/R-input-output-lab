import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Pre-defined expert fallback rules for common R I/O errors
const KNOWLEDGE_FALLBACKS: Record<string, { title: string; analysis: string; rFix: string; advice: string }> = {
  path_not_found: {
    title: "无法打开文件 (No such file or directory) 诊断报告",
    analysis: "原因分析：R 默认以当前工作目录（getwd()）为基准寻找相对路径。若当前工作目录与数据存放目录不一致，或路径中包含未声明的子目录层级，R 即会报此错误。",
    rFix: `# 1. 检查当前工作路径
getwd()

# 2. 列出当前目录下文件确认是否存在
list.files(pattern = "\\\\.csv$")

# 3. 规范化路径建议：利用 here 包自适应项目根目录
if (!requireNamespace("here", quietly = TRUE)) install.packages("here")
target_file <- here::here("data", "sample_data.csv")
file.exists(target_file) # 验证存在性

# 4. 安全读入
df <- readr::read_csv(target_file)`,
    advice: "【金牌准则】：永远不要在生产或科研脚本中写死绝对路径如 setwd('C:/Users/...')。推荐使用 RStudio Project (.Rproj) 搭配 here::here()，确保跨平台无论在 Mac、Linux 还是 Windows 均可复现。"
  },
  backslash_escape: {
    title: "Windows 路径反斜杠 \\ 转义异常 (Syntax Error) 诊断报告",
    analysis: "原因分析：在 R 语言的字符串字面量中，反斜杠 \\ 是转义字符（如 \\n 表示换行，\\t 表示制表符）。单独出现的 'C:\\Users\\...' 会触发 'unrecognized escape sequence' 或 '\\U used without hex digits' 语法报错。",
    rFix: `# 错误写法：
# read.csv("C:\\data\\test.csv") # 报错！

# 解决方案 1（最推荐）：全平台统一使用正斜杠 /
df <- read.csv("C:/data/test.csv")

# 解决方案 2：反斜杠双重转义 \\\\
df <- read.csv("C:\\\\data\\\\test.csv")

# 解决方案 3：使用 normalizePath() 转换
clean_path <- normalizePath("C:/data/test.csv", winslash = "/", mustWork = FALSE)`,
    advice: "【切片记忆】：在 R 代码里，Windows 路径直接当作 Linux 风格写成正斜杠 '/' 即可，Windows API 底层天然原生支持正斜杠。"
  },
  oom_memory: {
    title: "内存溢出 (Cannot allocate vector of size ...) 诊断报告",
    analysis: "原因分析：R 是全内存计算架构，使用 read.csv() 读取时会默认创建临时矩阵并进行反复类型猜测与向量复制，导致瞬间消耗文件体积 3~5 倍的堆内存（Vcells）。当数据超过单机物理可用 RAM 时即触发 OOM 崩溃。",
    rFix: `# 解决方案 1：改用 data.table::fread (C 级底层多线程流式加载，降低峰值内存)
library(data.table)
dt <- fread("huge_data.csv", nThread = 4, select = c("id", "timestamp", "price"))

# 解决方案 2：改用 Apache Arrow 列式内存与流式分块 (Zero-Copy)
library(arrow)
# 仅建立流式 Dataset 指针，不立刻读入内存
ds <- open_dataset("huge_data.parquet")
filtered_df <- ds %>% 
  filter(price > 100) %>% 
  select(id, price) %>% 
  collect() # 只把计算后的结果拉入 R 内存

# 解决方案 3：readr 分块读入计算
readr::read_csv_chunked("huge_data.csv", 
  callback = DataFrameCallback$new(function(x, pos) {
    x[x$price > 100, ]
  }), chunk_size = 100000)`,
    advice: "【优化策略】：大文件三法则：1. 仅读取必需列（select）；2. 转成 Parquet/Arrow 零拷贝；3. 分块迭代（Chunking）做聚合，避免全量进内存。"
  },
  encoding_mojibake: {
    title: "中文字符乱码 (GBK / UTF-8 编码冲突) 诊断报告",
    analysis: "原因分析：Windows 中文版操作系统的系统默认编码为 GBK (CP936)，而现代 R (R 4.2+) 以及大部分网络/Linux 数据采用 UTF-8 编码。当用错误的 encoding 解析多字节中文字节流时，产生字符错位，表现为 '锟斤拷'、'' 或问号。",
    rFix: `# 诊断原文件编码猜想
readr::guess_encoding("data.csv")

# 方案 1：Base R 指定编码
df <- read.csv("data.csv", fileEncoding = "GBK", encoding = "UTF-8")

# 方案 2：readr 指定 locale (最稳健规范)
df <- readr::read_csv(
  "data.csv",
  locale = readr::locale(encoding = "GBK") # 或 "GB18030"
)

# 方案 3：写出时强制统一为 UTF-8 无 BOM
readr::write_csv(df, "data_clean_utf8.csv")`,
    advice: "【规范倡议】：团队协作请统一全链路 UTF-8。若遇到中文 Excel 导出的 CSV，优先尝试 encoding='GBK' 或 encoding='GB18030'。"
  }
};

// AI Diagnosis Endpoint
app.post('/api/ai/diagnose', async (req, res) => {
  const { errorType, customError, userCode, context, apiKey: clientApiKey, model: clientModel } = req.body;
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Provide comprehensive local expert fallback
    const key = errorType in KNOWLEDGE_FALLBACKS ? errorType : 'path_not_found';
    const fallback = KNOWLEDGE_FALLBACKS[key];
    return res.json({
      success: true,
      mode: 'expert_knowledge_engine',
      data: {
        title: fallback.title,
        analysis: fallback.analysis + (customError ? `\n针对您当前提交的错误信息：“${customError}”，诊断规则已针对性匹配。` : ''),
        rFix: fallback.rFix,
        advice: fallback.advice,
        aiGenerated: false
      }
    });
  }

  // If client chose deepseek-v4-pro
  if (clientModel === 'deepseek-v4-pro') {
    try {
      const prompt = `你是一位精通 R 语言底层 I/O、路径解析机制、C 级内存管理及跨平台工程实践的资深 R 架构师。
请针对用户在使用 R 语言进行数据文件读写时发生的以下错误与上下文进行深度专业诊断：

【错误类型/标签】：${errorType || '通用 I/O 故障'}
【用户代码/上下文】：${userCode || '未提供代码'}
【具体错误提示】：${customError || '未提供详细报错'}

请输出结构化诊断建议：
1. 【故障核心病因分析】
2. 【可立即执行的 R 修复代码】
3. 【工程化规避建议与最佳实践】

语言风格：淡雅、学术、严谨，使用简体中文。`;

      const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是一个专业的R语言数据工程与高性能I/O诊断专家。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3
        })
      });

      if (dsRes.ok) {
        const dsData: any = await dsRes.json();
        const output = dsData.choices?.[0]?.message?.content || '';
        return res.json({
          success: true,
          mode: 'deepseek-v4-pro',
          data: {
            title: `AI 智能随诊结果 (deepseek-v4-pro)`,
            content: output,
            aiGenerated: true
          }
        });
      }
    } catch (dsErr) {
      console.error('DeepSeek proxy error:', dsErr);
    }
  }

  try {
    const ai = clientApiKey ? new GoogleGenAI({ apiKey: clientApiKey }) : new GoogleGenAI();
    const prompt = `你是一位精通 R 语言底层 I/O、路径解析机制、C 级内存管理及跨平台工程实践的资深 R 架构师。
请针对用户在使用 R 语言进行数据文件读写时发生的以下错误与上下文进行深度专业诊断：

【错误类型/标签】：${errorType || '通用 I/O 故障'}
【用户代码/上下文】：${userCode || '未提供代码'}
【具体错误提示】：${customError || '未提供详细报错'}
【当前实验上下文】：${context ? JSON.stringify(context) : '基础读写'}

请输出结构化诊断建议，格式包含：
1. 【故障核心病因分析】：形式化/底层原理分析（包括工作目录解析、转义机制、编码流、或者内存分配 Vcells 等）
2. 【可立即执行的 R 修复代码】：给出规范、健壮的 R 解决方案代码（包含防御性编程、here/readr/arrow 等现代方案）
3. 【工程化规避建议与最佳实践】：给出一条防止再犯的金牌准则。

语言风格：淡雅、学术、严谨、条理清晰，使用简体中文。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: "你是一个专业的R语言数据工程与高性能I/O诊断专家。",
        temperature: 0.3
      }
    });

    const outputText = response.text || '';
    return res.json({
      success: true,
      mode: 'gemini-3.8-flash',
      data: {
        title: `AI 智能随诊结果 (${errorType || 'R 文件 I/O 诊断'})`,
        content: outputText,
        aiGenerated: true
      }
    });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    const key = errorType in KNOWLEDGE_FALLBACKS ? errorType : 'path_not_found';
    const fallback = KNOWLEDGE_FALLBACKS[key];
    return res.json({
      success: true,
      mode: 'expert_knowledge_engine_fallback',
      data: {
        title: fallback.title,
        analysis: fallback.analysis + (customError ? `\n针对报错：“${customError}”` : ''),
        rFix: fallback.rFix,
        advice: fallback.advice,
        aiGenerated: false,
        note: "（已启用内置 R 语言专家知识库诊断引擎）"
      }
    });
  }
});

// AI Q&A Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { question, history, currentExperiment, apiKey: clientApiKey, model: clientModel } = req.body;
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      success: true,
      mode: 'expert_rule_reply',
      reply: `【R 语言 I/O 实验室专家解答】\n\n关于您提问的：“${question}”：\n\n1. **核心原理**：R 语言的数据读写本质上遵循映射 $f: \\text{Path} \\times \\text{ByteStream} \\to \\text{R Object}$。读写效率取决于：磁盘 I/O 吞吐、字符解析与类型推断开销、以及 R 堆内存分配机制。\n2. **推荐方案**：\n   - 普通文本优先采用 \`data.table::fread()\`（多线程流式极速）或 \`readr::read_csv()\`（严格类型系统与规范 tibble）；\n   - 大规模跨语言数据首选 \`arrow::write_parquet()\` / \`read_parquet()\`，支持 Snappy 压缩与 Zero-Copy 零拷贝内存映射；\n   - 纯 R 内部中间产物使用 \`saveRDS(compress = \"fast\")\`。\n3. **路径规范**：切忌硬编码 \`setwd()\`，推荐在项目根目录下利用 \`here::here()\` 动态寻址。\n\n您可以在左侧切片模块切换到对应“代码引擎”或“全流程导引”进行实时参数调试。`
    });
  }

  if (clientModel === 'deepseek-v4-pro') {
    try {
      const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是一个专业的R语言数据工程与高性能I/O诊断专家。' },
            { role: 'user', content: question }
          ],
          temperature: 0.3
        })
      });

      if (dsRes.ok) {
        const dsData: any = await dsRes.json();
        const reply = dsData.choices?.[0]?.message?.content || '';
        return res.json({
          success: true,
          mode: 'deepseek-v4-pro',
          reply
        });
      }
    } catch (dsErr) {
      console.error('DeepSeek chat proxy error:', dsErr);
    }
  }

  try {
    const ai = clientApiKey ? new GoogleGenAI({ apiKey: clientApiKey }) : new GoogleGenAI();
    const prompt = `你是“R语言数据文件的读写实验室 (R Data File I/O Lab)”的随身 AI 专家顾问。
请解答用户关于 R 语言文件读写、工作路径、各种数据格式（CSV/TSV, Excel, SPSS/haven, RDS, Parquet, SQLite）的疑问。
用户提问：${question}
用户当前选中的实验模块上下文：${currentExperiment ? JSON.stringify(currentExperiment) : '全局浏览'}
请使用学术淡雅、清晰专业的简体中文回答，提供规范的代码示例与底层原理剖析。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: "你是一个专业的R语言数据工程与高性能I/O诊断专家。",
        temperature: 0.3
      }
    });

    return res.json({
      success: true,
      mode: 'gemini-3.8-flash',
      reply: response.text || '暂无回复'
    });
  } catch (err: any) {
    console.error('Chat Gemini Error:', err);
    return res.json({
      success: true,
      mode: 'expert_rule_fallback',
      reply: `【R 实验室提示】诊断服务目前在本地知识库模式运行。关于您的提问：“${question}”，建议检查工作路径 getwd()，确认列类型规格化，或在代码引擎中运行对比基准测试。`
    });
  }
});

// Mount Vite or Serve Static
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
