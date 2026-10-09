import React, { useState } from 'react';
import { CodeSnippet } from '../common/CodeSnippet';
import { KatexMath } from '../common/KatexMath';
import {
  FileText,
  Sliders,
  Type,
  Binary,
  Layers,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2,
  Sigma
} from 'lucide-react';

export const Module2TextFormats: React.FC = () => {
  // Engine selection
  const [selectedEngine, setSelectedEngine] = useState<'readr' | 'datatable' | 'base'>('readr');

  // Delimiter parser sandbox state
  const [delimiter, setDelimiter] = useState<string>(',');
  const [hasHeader, setHasHeader] = useState<boolean>(true);

  // Column inference trap state
  const [inferenceSampleRows, setInferenceSampleRows] = useState<number>(5);
  const [explicitTyping, setExplicitTyping] = useState<boolean>(false);

  // Encoding & Mojibake sandbox state
  const [sourceEncoding, setSourceEncoding] = useState<'GBK' | 'UTF-8'>('GBK');
  const [readerEncoding, setReaderEncoding] = useState<'GBK' | 'UTF-8'>('UTF-8');

  // Delimiter raw sample generator
  const getRawDelimitedSample = () => {
    const sep = delimiter;
    return `gene_id${sep}sample_name${sep}expression_val${sep}treatment_status
ENSG0001${sep}Patient_A1${sep}142.50${sep}Treated
ENSG0002${sep}Patient_A2${sep}89.15${sep}Control
ENSG0003${sep}Patient_A3${sep}310.88${sep}Treated
ENSG0004${sep}Patient_A4${sep}12.40${sep}Control`;
  };

  const parsedSampleRows = [
    { gene_id: 'ENSG0001', sample_name: 'Patient_A1', expression_val: 142.50, treatment_status: 'Treated' },
    { gene_id: 'ENSG0002', sample_name: 'Patient_A2', expression_val: 89.15, treatment_status: 'Control' },
    { gene_id: 'ENSG0003', sample_name: 'Patient_A3', expression_val: 310.88, treatment_status: 'Treated' },
    { gene_id: 'ENSG0004', sample_name: 'Patient_A4', expression_val: 12.40, treatment_status: 'Control' }
  ];

  // Encoding simulation logic
  const isEncodingMismatched = sourceEncoding !== readerEncoding;
  const sampleChineseOriginal = '张三 (上海研发中心 - 生物信息学实验组)';
  const sampleMojibake = '锟斤拷 (锟较猴拷锟叫凤拷锟斤拷锟斤拷 - 锟斤拷锟斤拷锟斤拷Ϣ学实验锟斤拷)';
  const hexBytesGbk = 'D5 C5 C8 FD 20 28 C9 CF BA A3 20 ...';
  const hexBytesUtf8 = 'E5 BC A0 E4 B8 89 20 28 E4 B8 8A ...';

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-2">
              <span>模块 02 · 格式实操</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              文本格式 (CSV / TSV / TXT) 读写与编码演播
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              全面对比 Base R、Tidyverse <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono text-xs">readr</code> 与 <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono text-xs">data.table::fread/fwrite</code>；
              动态演示分隔符解析、列类型推断失误与 GBK / UTF-8 字符乱码消除。
            </p>
          </div>
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs self-start md:self-auto">
            <button
              onClick={() => setSelectedEngine('readr')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedEngine === 'readr'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              readr::read_csv
            </button>
            <button
              onClick={() => setSelectedEngine('datatable')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedEngine === 'datatable'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              data.table::fread
            </button>
            <button
              onClick={() => setSelectedEngine('base')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedEngine === 'base'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Base R read.csv
            </button>
          </div>
        </div>
      </div>

      {/* 2.1 三大引擎横向切片对比 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Base R */}
        <div className={`p-4 rounded-xl border transition-all ${
          selectedEngine === 'base' ? 'bg-indigo-50/50 border-indigo-400 shadow-xs' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-slate-700">Base R (utils)</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">原生内置</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">read.csv / write.csv</h4>
          <p className="text-xs text-slate-500 mb-3">历史悠久但单线程，默认类型猜测容易反复回溯重新分配内存。</p>
          <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-2 font-mono">
            <div>• 线程模式：单线程 (Single Thread)</div>
            <div>• 默认行名：write.csv 默认保留 (易错位)</div>
            <div>• 返回结构：标准 data.frame</div>
            <div>• 读取速度：基准基线 (1x)</div>
          </div>
        </div>

        {/* readr */}
        <div className={`p-4 rounded-xl border transition-all ${
          selectedEngine === 'readr' ? 'bg-indigo-50/50 border-indigo-400 shadow-xs' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-indigo-700">Tidyverse (readr)</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">现代规范</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">read_csv / write_csv</h4>
          <p className="text-xs text-slate-500 mb-3">类型提示清晰，严格解析问题报告 (problems())，默认禁止行名。</p>
          <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-2 font-mono">
            <div>• 线程模式：多线程 (C++ 核心解析)</div>
            <div>• 默认行名：禁止行名 (绝对对齐)</div>
            <div>• 返回结构：规范 tibble</div>
            <div>• 读取速度：约 3~5x 加速</div>
          </div>
        </div>

        {/* data.table */}
        <div className={`p-4 rounded-xl border transition-all ${
          selectedEngine === 'datatable' ? 'bg-indigo-50/50 border-indigo-400 shadow-xs' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-emerald-700">data.table</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">极致性能</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">fread / fwrite</h4>
          <p className="text-xs text-slate-500 mb-3">纯 C 编写的快速文件读取器，自动嗅探分隔符与换行符，超高吞吐。</p>
          <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-2 font-mono">
            <div>• 线程模式：OpenMP 原生多线程 (如 8 线程)</div>
            <div>• 默认行名：不保留行名</div>
            <div>• 返回结构：data.table (可转 df)</div>
            <div>• 读取速度：高达 15~30x 加速</div>
          </div>
        </div>
      </div>

      {/* 2.2 动态演播：分隔符解析沙盒 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              2.2 动态分隔符嗅探与解析演播沙盒
            </h3>
          </div>
          {/* Delimiter selection pill */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">选择分隔符：</span>
            {[
              { label: '逗号 , (CSV)', val: ',' },
              { label: '制表符 \\t (TSV)', val: '\t' },
              { label: '分号 ; (欧洲)', val: ';' },
              { label: '竖线 | (管道)', val: '|' },
              { label: '空格 (TXT)', val: ' ' }
            ].map((item) => (
              <button
                key={item.val}
                onClick={() => setDelimiter(item.val)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono cursor-pointer transition-colors ${
                  delimiter === item.val
                    ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Raw Text Stream View */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <span>底层原始字节流与文本字符 (Raw Stream)</span>
              <span className="text-[10px] text-slate-400 font-mono">分隔符: "{delimiter === '\t' ? '\\t' : delimiter}"</span>
            </div>
            <div className="p-3 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800 leading-loose">
              {getRawDelimitedSample().split('\n').map((line, idx) => (
                <div key={idx} className="flex">
                  <span className="text-slate-600 w-6 select-none">{idx + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Parsed Structure View */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <span>R 结构化解析结果 (Parsed Tibble / Data Frame)</span>
              <span className="text-[10px] text-emerald-600 font-semibold font-mono">4 rows × 4 cols</span>
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono">
                  <tr>
                    <th className="px-3 py-2">gene_id <span className="text-[10px] text-indigo-600 font-normal">&lt;chr&gt;</span></th>
                    <th className="px-3 py-2">sample_name <span className="text-[10px] text-indigo-600 font-normal">&lt;chr&gt;</span></th>
                    <th className="px-3 py-2">expression_val <span className="text-[10px] text-emerald-600 font-normal">&lt;dbl&gt;</span></th>
                    <th className="px-3 py-2">treatment_status <span className="text-[10px] text-indigo-600 font-normal">&lt;chr&gt;</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {parsedSampleRows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="px-3 py-2 font-medium text-slate-800">{row.gene_id}</td>
                      <td className="px-3 py-2 text-slate-600">{row.sample_name}</td>
                      <td className="px-3 py-2 text-emerald-700 font-semibold">{row.expression_val.toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans ${
                          row.treatment_status === 'Treated'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {row.treatment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 2.3 编码转换演播沙盒与乱码修复 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Binary className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              2.3 字符编码流演播沙盒与“锟斤拷”乱码机理
            </h3>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>编码多字节代数模型：</span>
            <KatexMath math="\text{Len}_{\text{UTF-8}} \in \{1,2,3,4\}\text{B}" />
            <span className="text-slate-300">vs</span>
            <KatexMath math="\text{Len}_{\text{GBK}} \in \{1,2\}\text{B}" />
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              1. 磁盘文件源编码 (Source Encoding):
            </label>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setSourceEncoding('GBK')}
                className={`flex-1 py-1.5 rounded-lg border font-mono cursor-pointer ${
                  sourceEncoding === 'GBK'
                    ? 'bg-white border-indigo-500 text-indigo-700 font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                GBK / CP936 (常见于国内中文 Windows / Excel 导出)
              </button>
              <button
                onClick={() => setSourceEncoding('UTF-8')}
                className={`flex-1 py-1.5 rounded-lg border font-mono cursor-pointer ${
                  sourceEncoding === 'UTF-8'
                    ? 'bg-white border-indigo-500 text-indigo-700 font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                UTF-8 (现代通用标准)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              2. R 读取函数设定的解码模式 (Reader Encoding):
            </label>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setReaderEncoding('UTF-8')}
                className={`flex-1 py-1.5 rounded-lg border font-mono cursor-pointer ${
                  readerEncoding === 'UTF-8'
                    ? 'bg-white border-indigo-500 text-indigo-700 font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                UTF-8 (默认参数)
              </button>
              <button
                onClick={() => setReaderEncoding('GBK')}
                className={`flex-1 py-1.5 rounded-lg border font-mono cursor-pointer ${
                  readerEncoding === 'GBK'
                    ? 'bg-white border-indigo-500 text-indigo-700 font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                GBK (显式声明)
              </button>
            </div>
          </div>
        </div>

        {/* Simulation Output Card */}
        <div className={`p-4 rounded-xl border ${
          isEncodingMismatched ? 'bg-amber-50/70 border-amber-300' : 'bg-emerald-50/70 border-emerald-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isEncodingMismatched ? (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900">
                    解码冲突发生！出现典型中文字符乱码 (Mojibake)
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900">
                    编码严格对齐，中文字符完整无损解析
                  </span>
                </>
              )}
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              源: {sourceEncoding} → 读: {readerEncoding}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-mono">底层十六进制字节流序列 (Hex Stream)</span>
              <p className="font-mono text-slate-700 mt-1">
                {sourceEncoding === 'GBK' ? hexBytesGbk : hexBytesUtf8}
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-mono">R 内存中解析后的字符字面量</span>
              <p className={`font-mono text-sm mt-1 font-bold ${
                isEncodingMismatched ? 'text-amber-800' : 'text-emerald-800'
              }`}>
                {isEncodingMismatched ? sampleMojibake : sampleChineseOriginal}
              </p>
            </div>
          </div>
        </div>

        {/* 对应的解决方案代码 */}
        <CodeSnippet
          title="中文字符编码稳健读写方案 R 代码"
          badge={sourceEncoding === 'GBK' ? 'GBK 转 UTF-8 修复' : 'UTF-8 标准流'}
          code={`# === 方案 1: Tidyverse readr 显式指定 locale 编码 (最为稳健) ===
library(readr)

# 自动猜测文件编码 (返回猜测概率最高的 encoding 与 confidence)
guessed <- readr::guess_encoding("chinese_data.csv")
print(guessed)

# 使用指定 locale 安全读入 (消除全部乱码)
clean_tibble <- readr::read_csv(
  file = "chinese_data.csv",
  locale = readr::locale(encoding = "${sourceEncoding}"), # 动态声明 "${sourceEncoding}"
  col_types = cols(.default = col_character())
)

# === 方案 2: Base R 中通过 fileEncoding 指定 ===
# read.csv("chinese_data.csv", fileEncoding = "${sourceEncoding}", encoding = "UTF-8")

# === 方案 3: 规整后统一写出为全平台通用的 UTF-8 (无 BOM) ===
readr::write_csv(clean_tibble, "chinese_data_standard_utf8.csv")`}
        />
      </div>
    </div>
  );
};
