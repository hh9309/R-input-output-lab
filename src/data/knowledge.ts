import { KnowledgeSlice, QuizQuestion } from '../types';

export const KNOWLEDGE_SLICES: KnowledgeSlice[] = [
  {
    id: 'slice_1',
    sliceNumber: '切片一',
    title: '工作路径设置与路径转义机理',
    tag: '基础架构 / 根节点寻址',
    summary: '工作路径 getwd()/setwd() 是 R 运行时定位相对路径的根基准。Windows 路径中的单反斜杠 \\ 会被 R 词法分析器误认为转义字符导致崩溃，推荐统一使用正斜杠 / 或 here 包实现工程化跨平台兼容。',
    theory: [
      '工作路径是 R 进程宿主环境的当前工作目录（CWD）。所有相对路径（如 "data/raw.csv"）都以 getwd() 作为前缀拼接。',
      'Windows 路径陷阱：在 Windows 资源管理器复制的路径形如 "C:\\Users\\Data"，在 R 字符串中反斜杠 \\ 是转义控制符（如 \\n 表示换行），单独反斜杠会抛出 "unrecognized escape sequence" 或 "\\U used without hex digits" 语法错误。',
      '工程化最佳实践：RStudio Project (.Rproj) + here::here()。here 包能够自动定位含有 .Rproj 或 .git 的根目录，在不同团队成员的 Mac/Linux/Windows 环境下无缝自适应，彻底杜绝路径硬编码。'
    ],
    codeContrast: {
      badLabel: '危险/反模式：硬编码绝对路径与未转义反斜杠',
      badCode: `# 错误 1: 未转义反斜杠，语法解析直接崩溃
# data <- read.csv("C:\\projects\\my_data\\sales.csv") # Error!

# 错误 2: 团队协作毒药，换台电脑立刻报错
setwd("C:/Users/ZhangSan/Documents/R_Projects/Project_A")
data <- read.csv("sales.csv")`,
      goodLabel: '推荐/工业级范式：正斜杠规范与 here 包根节点定位',
      goodCode: `# 推荐 1: 全平台统一使用正斜杠 / (Windows 原生完全兼容)
data <- read.csv("C:/projects/my_data/sales.csv")

# 推荐 2 (黄金标准): 使用 here 包基于项目根目录相对寻址
library(here)
data_path <- here::here("data", "raw", "sales.csv")
data <- readr::read_csv(data_path)`
    },
    keyTakeaway: '在 R 代码里永不写单个 \\，永不写 setwd("C:/Users/...")。项目根目录 + here::here("sub", "file.csv") 是可复现性金标准。'
  },
  {
    id: 'slice_2',
    sliceNumber: '切片二',
    title: '文本 CSV vs. 列式 Parquet vs. 原生 RDS',
    tag: '存储格式 / 选型矩阵',
    summary: 'CSV 通用但慢且丢失全部类型（时间戳变字符串、因子等级丢失）；RDS 完美保留 R 对象的类属性、因子顺序与复杂嵌套结构；Parquet 具备极高压缩比、列式索引与跨语言（R/Python/Spark）极致互通性能。',
    theory: [
      '【文本 CSV】：行式存储，纯文本 ASCII/UTF-8 字符流。优点是文本编辑器人类可读，跨工具通用；致命缺陷是读写须经过字符编码转换与类型猜测，体积庞大，浮点数可能面临精度舍入截断。',
      '【原生 RDS (.rds)】：R 的原生序列化二进制格式。通过 serialize() 保留 R 对象完整的环境闭包、S3/S4 类、因子 levels 顺序以及属性属性（attributes）。适合 R 管道内部中间产物缓存，但无法被 Python/Java 直接读取。',
      '【列式 Parquet (.parquet)】：工业界现代标准。按列组织并采用字典编码、Run-Length、Snappy/ZSTD 压缩。支持统计下推（Pushdown Predicate）与内存零拷贝映射，兼具极致速度与跨语言通用性。'
    ],
    codeContrast: {
      badLabel: '低效做法：大宽表用 CSV 存储导致反复类型转换与膨胀',
      badCode: `# 读入 500 万行带时区时间戳与 Ordered Factor 的数据
# 丢失因子有序属性，时间戳退化为纯文本字符
write.csv(complex_data, "large_data.csv")
recovered <- read.csv("large_data.csv")
# 此时 class(recovered$timestamp) 变为了 "character"！`,
      goodLabel: '高效做法：内部用 saveRDS，跨平台用 arrow::write_parquet',
      goodCode: `# 内部 R 对象保真 (完全保留 class, levels, attributes)
saveRDS(complex_data, "model_input.rds", compress = "fast")
obj <- readRDS("model_input.rds")

# 跨语言高性能 (体积暴降 80%，毫秒级读入，保留 schema)
library(arrow)
write_parquet(complex_data, "shared.parquet", compression = "snappy")
fast_obj <- read_parquet("shared.parquet")`
    },
    keyTakeaway: '单机纯 R 开发持久化选 RDS；大数据量或多语言团队协作统一选 Parquet；小样本对外汇报才用 CSV。'
  },
  {
    id: 'slice_3',
    sliceNumber: '切片三',
    title: '三大致命读写陷阱与深度规避',
    tag: '防御性编程 / 避坑指南',
    summary: '深入剖析 R 语言数据工程中最常见的 3 大崩溃级陷阱：未设路径报文件不存在、大文件未指定列类型导致推断卡死、以及写出 CSV 默认 row.names=TRUE 导致列头严重整体错位。',
    theory: [
      '【陷阱一：未设路径报 No such file or directory】：只在脚本开头写了个文件名，未考虑当前脚本运行环境与数据文件的相对位置，或者路径中含有隐藏空格、扩展名双重后缀（如 data.csv.csv）。',
      '【陷阱二：读写超大文件未指定 colClasses 卡死推断】：read.csv 默认只对前 1000 行抽样推断类型，若前 1000 行某列全为整数，第 1001 行出现字符，Base R 会被迫清空并重新以更高阶类型重构向量，引发持续的 GC 停顿甚至卡死。',
      '【陷阱三：写出 CSV 默认保留行名引发列名错位】：Base R 的 write.csv(df, "out.csv") 默认参数是 row.names = TRUE。如果不加该参数，导出的 CSV 第一列是行号无列名，用 Excel 打开或后续用 read.csv 读入时，所有列名整体向左偏移一位，导致数据字段全盘错乱！'
    ],
    codeContrast: {
      badLabel: '高危触发：三大致命陷阱典型代码',
      badCode: `# 陷阱 1: 直接读取，不校验文件存在性
df <- read.csv("sales.csv") # 报错: cannot open file

# 陷阱 2: 读入 1000 万行未指定列类型，耗光 CPU 与内存
huge_df <- read.csv("huge_file.csv") # 卡死！

# 陷阱 3: 默认保留行名，列名整体向左错位 1 列
write.csv(clean_df, "result.csv") # 产生无名第一列导致灾难`,
      goodLabel: '安全防御：工业级防御性读写规范',
      goodCode: `# 防御 1: 路径存在性防御校验
file_p <- here::here("data", "sales.csv")
stopifnot("数据文件不存在，请检查路径" = file.exists(file_p))

# 防御 2: 显式声明 colClasses 或改用 data.table::fread
dt <- data.table::fread(
  file_p,
  colClasses = list(character = "id", numeric = c("val1", "val2")),
  showProgress = TRUE
)

# 防御 3: 导出时显式关闭行名 (或改用 readr::write_csv)
write.csv(clean_df, "result.csv", row.names = FALSE)
# 或者: readr::write_csv(clean_df, "result.csv") # 默认无行名`
    },
    keyTakeaway: '写出 CSV 必写 row.names = FALSE；读入大文件必声明列类型；读入前必调 file.exists() 校验。'
  },
  {
    id: 'slice_4',
    sliceNumber: '切片四',
    title: '误区警示与跨版本反序列化陷阱',
    tag: '系统架构 / 长期维护性',
    summary: '警惕硬编码绝对路径破坏科研与生产代码的可复现性；深入分析二进制文件（.RData / .RDS）跨 R 主版本（如 R 3.x 与 R 4.x）反序列化时的兼容性危机与 ALTREP 机制。',
    theory: [
      '【绝对路径的脆弱性】：在单机上写 C:/Users/YourName/... 会导致其他协作者或者 CI/CD 自动化构建容器直接崩溃。可复现性（Reproducibility）是现代数据科学与科研论文的第一准绳。',
      '【二进制版本反序列化危机】：R 3.5.0 引入了序列化格式版本 3（Serialization format version 3），R 3.6 默认使用该格式。用较新版 R 保存的 RDS 拿到旧版 R (如仍运行 R 3.4 的老服务器) 上使用 readRDS() 会抛出 "cannot read workspace version 3 in R < 3.5.0" 错误。',
      '【字符串与因子兼容性】：R 4.0.0 起将 stringsAsFactors 的全局默认值由 TRUE 改为了 FALSE。在维护历史脚本时，未显式声明 stringsAsFactors 会导致在旧版本读入为 factor，新版本读入为 character，引发 downstream 逻辑中断。'
    ],
    codeContrast: {
      badLabel: '隐患代码：未声明环境兼容性与老旧默认值依赖',
      badCode: `# 隐患 1: 依赖全局 stringsAsFactors 默认状态
# 在 R 3.6 环境下生成 factor，在 R 4.3 环境下生成 character
df <- read.csv("users.csv")
is.factor(df$city) # 结果在不同 R 版本中完全不同！

# 隐患 2: 高版本保存 RDS 直接发给旧服务器
saveRDS(my_model, "model_latest.rds") # 默认采用当前最新序列化版本`,
      goodLabel: '规范代码：显式指定参数与向下兼容版本',
      goodCode: `# 规范 1: 显式声明 stringsAsFactors，不受 R 全局版本波动影响
df <- read.csv("users.csv", stringsAsFactors = FALSE)

# 规范 2: 保存 RDS 时指定 version = 2 确保向后兼容极旧 R 运行时
saveRDS(my_model, "model_v2_compat.rds", version = 2)

# 规范 3: 或采用语言无关的标准化格式 (Parquet / ONNX)
library(arrow)
write_parquet(df, "users_standard.parquet")`
    },
    keyTakeaway: '涉及老旧服务器交付时，saveRDS 显式传参 version = 2；字符串转换切忌依赖全局默认行为。'
  },
  {
    id: 'slice_5',
    sliceNumber: '切片五',
    title: 'R 包安装生态与全局变量/选项配置',
    tag: '环境工程 / 系统配置',
    summary: '系统掌握 R 语言四大多源包安装生态（CRAN 官方源、Bioconductor 生信源、GitHub 分支与离线归档），以及全局环境调优（options() 会话参数、Sys.setenv()/Sys.getenv()、.Renviron 与 .Rprofile 工程化持久化，以及 <<- 超赋值作用域防坑规范）。',
    theory: [
      '【四大多源包安装生态】：1. CRAN 官方库：install.packages("pkg")，推荐配置国内高校镜像加速；2. 生信专有库：BiocManager::install("DESeq2")；3. GitHub 开发版：remotes::install_github("user/repo")；4. 离线/内网安装：install.packages("pkg.tar.gz", repos = NULL, type = "source")。',
      '【包依赖防御性自检规范】：严禁在脚本中裸写 install.packages()（每次执行均会重复下载引发阻塞）。工业级规范应采用条件守卫：if (!requireNamespace("pkg", quietly = TRUE)) install.packages("pkg")。',
      '【全局选项 options() 核心调优】：options(timeout = 600) 解决安装大包（如 arrow、torch）或下载大文件时的 60 秒断连超时；options(scipen = 999) 禁用令人困惑的科学计数法；options(digits = 4) 统一浮点显示。',
      '【环境变量与工程化持久化配置】：Sys.setenv() 与 Sys.getenv() 管理系统级环境标头；工程实践建议在项目根目录下通过 .Renviron 注入私密 Token 密钥，在 .Rprofile 中固化项目初始化镜像与工作环境。',
      '【全局变量与超赋值 <<- 的机理与副作用警示】：标准赋值 <- 局限于当前执行帧（Frame）；超赋值 <<- 跨越作用域向外逐层搜寻直至在全局环境 (.GlobalEnv) 中修改或创建对象。生产代码切忌在函数内滥用 <<-，推荐纯函数显式返回 list()。'
    ],
    codeContrast: {
      badLabel: '隐患/反模式：无防御反复裸装、超时断连与滥用 <<- 污染全局',
      badCode: `# 隐患 1: 每次跑脚本都重复下载，且无国内镜像经常触发 timeout 报错
install.packages("readr")
install.packages("arrow")

# 隐患 2: 在函数内部滥用超赋值 <<- 修改全局变量，极难排错与调试
process_data <- function(df) {
  GLOBAL_SUMMARY <<- summary(df) # 制造隐蔽副作用，污染 .GlobalEnv
  GLOBAL_COUNT <<- nrow(df)
}

# 隐患 3: 明文硬编码 Token 密钥进入代码库
Sys.setenv(OPENAI_API_KEY = "sk-1234567890abcdef")`,
      goodLabel: '工业级范式：防御性条件自检、超时优化与 .Rprofile 体系',
      goodCode: `# 规范 1: 镜像源加速 + 延长时间 (防止大包断连) + 防御性安装
options(
  repos = c(CRAN = "https://mirrors.tuna.tsinghua.edu.cn/CRAN/"),
  timeout = 600,             # 延长至 10 分钟，根治安装超时
  scipen = 999               # 禁用科学计数法
)

# 自动化条件安装与安静加载
ensure_packages <- function(pkgs) {
  missing_pkgs <- pkgs[!vapply(pkgs, requireNamespace, logical(1), quietly = TRUE)]
  if (length(missing_pkgs) > 0) {
    install.packages(missing_pkgs, dependencies = TRUE)
  }
  invisible(lapply(pkgs, library, character.only = TRUE))
}
ensure_packages(c("here", "readr", "arrow", "data.table"))

# 规范 2: 纯函数显式返回值，杜绝 <<- 超赋值副作用
process_data <- function(df) {
  list(clean_df = na.omit(df), summary = summary(df), count = nrow(df))
}

# 规范 3: 敏感密钥通过 .Renviron 注入，由 Sys.getenv 读取
api_key <- Sys.getenv("PROJECT_SECRET_KEY")`
    },
    keyTakeaway: '安装包必用 requireNamespace 条件守卫；网络慢必设 options(timeout=600)；配置持久化存入 .Renviron 与 .Rprofile；函数内部严禁滥用 <<- 污染全局环境。'
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '在 Windows 操作系统中，若直接执行 read.csv("C:\\data\\test.csv") 会发生什么现象？',
    options: [
      '正常读取，R 会自动纠正反斜杠',
      '提示语法错误，因为 \\d 无法被识别为合法的字符串转义字符',
      '直接跳过该文件并返回空数据框',
      '导致 R 崩溃退出'
    ],
    correctIndex: 1,
    explanation: '反斜杠 \\ 在 R 字符串中是转义控制符。\\d 不是合法转义序列，会触发 "unrecognized escape sequence" 语法解析错误。正确写法应为正斜杠 "C:/data/test.csv" 或双反斜杠 "C:\\\\data\\\\test.csv"。'
  },
  {
    id: 2,
    question: '使用 Base R 的 write.csv() 导出表格时，若漏写 row.names = FALSE，后续用 read.csv() 重新读入该文件最常见的问题是？',
    options: [
      '所有数值数据全被转换为 NA 缺失值',
      '文件体积缩小 50%',
      '第一列被填充为无列名行号，导致所有列名与数据列整体向左错位一位',
      'Excel 拒绝打开该 CSV 文件'
    ],
    correctIndex: 2,
    explanation: 'write.csv() 默认参数 row.names = TRUE 会将 1, 2, 3... 写入第一列且表头不给其分配列名，重新解析时列名数量比数据列少 1，导致所有表头整体向左错位，极易引发生产事故。'
  },
  {
    id: 3,
    question: '面对 10GB 级别的超大规模宽表数据，以下哪种读取方式在 R 中读取最快且对峰值内存压力最小？',
    options: [
      'Base R 的 read.csv(..., stringsAsFactors = FALSE)',
      'openxlsx::read.xlsx()',
      'arrow::open_dataset() 结合 filter() 和 select() 零拷贝按需拉取',
      'utils::read.table()'
    ],
    correctIndex: 2,
    explanation: 'arrow::open_dataset() 基于 Apache Arrow 列式存储，仅建立流式 Dataset 指针，在 collect() 之前不会将全部数据拉入内存，且支持统计下推过滤与零拷贝加载，性能远超行式文本读入。'
  },
  {
    id: 4,
    question: '某中文 CSV 文件用 read.csv() 读取后，中文姓名全显示为 "锟斤拷" 或乱码，最根本的解决代码是？',
    options: [
      '设置 options(stringsAsFactors = TRUE)',
      '在 read.csv 中指定 fileEncoding = "GBK" 或改用 readr::read_csv(..., locale = locale(encoding = "GBK"))',
      '重新将电脑系统语言改为英文',
      '使用 saveRDS 重新保存'
    ],
    correctIndex: 1,
    explanation: '乱码是因为文件实际为 GBK (CP936) 编码，而解析器以 UTF-8 或 ASCII 字符集字节流解码。显式声明 fileEncoding = "GBK" 或使用 readr 的 locale(encoding = "GBK") 即可准确还原字符。'
  },
  {
    id: 5,
    question: '为何现代 R 工程项目推荐使用 here::here() 替代 setwd()？',
    options: [
      'here 包可以自动加快硬盘读写吞吐速率',
      'here 能够自适应项目根目录（以 .Rproj 或 .git 为锚点），避免硬编码绝对路径，提升多平台协同的可复现性',
      '因为 R 4.0 之后 setwd() 函数已被正式废弃',
      'here 会把所有文件自动加密存储'
    ],
    correctIndex: 1,
    explanation: 'here::here() 自动寻找当前项目的根节点（.Rproj 或 .git），团队各成员在不同的绝对路径（如 /Users/alice 或 C:/Users/bob）下运行同一套代码时均可准确找到相对子目录，无需改写任何工作路径。'
  },
  {
    id: 6,
    question: '在 R 中安装超大型数据处理包（如 arrow 或 torch）时经常因网络慢报超时错误（Timeout），以下哪项全局设置是官方推荐的最佳解决方案？',
    options: [
      '设置 options(timeout = 600) 延长连接超时限制，并配合国内高校 CRAN 镜像源',
      '在脚本中使用 setwd("https://cran.r-project.org") 直接重定向',
      '使用 Sys.setenv(R_TIMEOUT = "infinite")',
      '每次安装前手动重启电脑清除 R 缓存'
    ],
    correctIndex: 0,
    explanation: 'R 默认的下载连接超时仅为 60 秒，通过 options(timeout = 600) 可将下载超时安全延长至 600 秒（10分钟），再配合 options(repos = c(CRAN = "...")) 配置清华等国内镜像源，即可彻底解决包安装因网络波动断连的痛点。'
  }
];
