import { CaseStudy } from '../types';

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case_financial_tick',
    title: 'GB 级金融高频 Tick 交易数据高速读写',
    tag: '量化金融 / 超大吞吐',
    scale: '10,000,000 行 / 1.2 GB 文本',
    industry: '高频做市与策略回测',
    background: '某高频量化团队每个交易日产生千万级别 L2 Tick 逐笔委托及成交数据。原先使用 Base R 的 read.csv() 读取需要超过 4 分钟，且内存瞬间暴涨至 5.8 GB 触发系统 SWAP 交换区，严重拖累策略计算。',
    challenge: '在保证毫秒级纳秒时间戳精度、浮点买卖量价不失真的前提下，将加载时间压缩到 5 秒以内，同时降低 70% 的内存峰值占用。',
    solutionSummary: '使用 data.table::fread(nThread = 8) 进行多线程流式批量读入，或通过 arrow::read_parquet() 实现列式分块按需拉取；持久化存储采用 Parquet (Snappy 压缩) 代替 CSV。',
    metrics: {
      datasetRows: '10,000,000 行',
      throughput: '320 MB/s (fread) vs 12 MB/s (read.csv)',
      compressionRatio: '81.4% (1.2GB CSV -> 228MB Parquet)',
      speedup: '约 28.5 倍加速'
    },
    rCode: `# === 案例 1: 金融高频 Tick 数据高速读写 ===
library(data.table)
library(arrow)
library(lobstr)

# 1. 传统 Base R 对比 (极为缓慢，生产切忌使用)
# t0 <- Sys.time()
# base_df <- read.csv("ticks_20261008.csv") # 耗时 ~ 240 秒，内存占用 ~ 5.2 GB

# 2. 方案 A：data.table 极致极速并发读入 (耗时 ~ 3.8 秒)
t_start <- Sys.time()
dt_ticks <- fread(
  file = "ticks_20261008.csv",
  sep = ",",
  header = TRUE,
  nThread = 8,                     # 启用 8 线程并行解析
  select = c("timestamp", "symbol", "price", "volume", "bid1", "ask1"), # 仅读入必需列
  colClasses = list(character = "symbol", numeric = c("price", "bid1", "ask1"), integer = "volume")
)
cat("fread 耗时:", round(difftime(Sys.time(), t_start, units = "secs"), 2), "秒\\n")
cat("内存占用:", format(lobstr::obj_size(dt_ticks)), "\\n")

# 3. 方案 B：落盘为 Apache Arrow Parquet 列式存储 (体积暴降 80%)
write_parquet(
  x = dt_ticks,
  sink = "ticks_20261008.parquet",
  compression = "snappy"
)

# 4. 方案 C：利用 Arrow 零拷贝按需流式拉取
ds <- open_dataset("ticks_20261008.parquet")
# 毫秒级直接过滤大单并仅拉取目标结果进入 R 内存
large_trades <- ds |>
  filter(volume > 10000 & symbol == "600519.SH") |>
  select(timestamp, price, volume) |>
  collect()`,
    sampleData: [
      { timestamp: '09:30:00.012', symbol: '600519.SH', price: 1782.50, volume: 120, bid1: 1782.40, ask1: 1782.60 },
      { timestamp: '09:30:00.025', symbol: '600519.SH', price: 1782.60, volume: 450, bid1: 1782.50, ask1: 1782.70 },
      { timestamp: '09:30:00.040', symbol: '000001.SZ', price: 12.35, volume: 2400, bid1: 12.34, ask1: 12.36 },
      { timestamp: '09:30:00.058', symbol: '600519.SH', price: 1782.70, volume: 80, bid1: 1782.60, ask1: 1782.80 },
      { timestamp: '09:30:00.082', symbol: '000858.SZ', price: 145.20, volume: 600, bid1: 145.15, ask1: 145.25 }
    ]
  },
  {
    id: 'case_bio_excel',
    title: '生信多表 Excel 批量读入、元数据对齐与合并',
    tag: '生物信息 / 临床多组学',
    scale: '16 个实验组 Sheet / 35,000 个基因探针',
    industry: '转录组与单细胞差异表达分析',
    background: '临床实验中心递交了一份复杂的 multi-sheet Excel 文件，包含 16 个样本批次的基因芯片定量数据。每个 Sheet 名称为样本批次号，表头前两行为仪器元数据注释，表尾包含质控总结。',
    challenge: '手动复制粘贴容易造成批次错位；需要跳过前两行注释行、从 Sheet 名称中动态抽取样本元数据（Batch ID、Timepoint、Treatment），并纵向安全堆叠为整洁格式（Tidy Data）。',
    solutionSummary: '利用 readxl::excel_sheets() 探测所有 Sheet 名称，结合 purrr::map_dfr() 管道动态迭代，设置 skip = 2 与 col_types，自动注入 Sheet 元数据列。',
    metrics: {
      datasetRows: '560,000 行观测',
      throughput: '全自动化无缝合并',
      compressionRatio: '消除 16 次手动重复操作',
      speedup: '从半小时人工缩短至 1.4 秒'
    },
    rCode: `# === 案例 2: 生信多表 Excel 批量自动化合并 ===
library(readxl)
library(dplyr)
library(purrr)
library(stringr)

excel_path <- here::here("data", "clinical_expression_multi_batch.xlsx")

# 1. 获取工作簿内所有 Sheet 清单
sheet_names <- excel_sheets(excel_path)
cat("发现 Sheet 数量:", length(sheet_names), "\\n")

# 2. 编写安全单表读取解析函数
read_and_annotate_sheet <- function(sheet_name, file_path) {
  raw_df <- read_excel(
    path = file_path,
    sheet = sheet_name,
    skip = 2,                     # 跳过前两行仪器 Header 注释
    na = c("", "NA", "#N/A", "-"),# 规范缺失值符号
    col_types = c("text", "numeric", "numeric", "numeric", "text")
  )
  
  # 动态解析 Sheet 命名规则 (例如 "Batch01_Treat_24h")
  meta_parts <- str_split(sheet_name, "_")[[1]]
  
  raw_df |>
    filter(!is.na(gene_id)) |>   # 剔除表尾质控汇总空行
    mutate(
      sheet_source = sheet_name,
      batch_id = meta_parts[1],
      treatment_group = meta_parts[2],
      timepoint = meta_parts[3]
    )
}

# 3. purrr 函数式管道批量聚合 (返回整洁长表)
combined_expression <- map_dfr(sheet_names, ~ read_and_annotate_sheet(.x, excel_path))

# 4. 预览合并结果并输出为紧凑 RDS
saveRDS(combined_expression, "combined_expression_tidy.rds", compress = "xz")`,
    sampleData: [
      { gene_id: 'ENSG00000139618', tpm: 45.2, p_val: 0.0012, fold_change: 2.45, batch: 'Batch_01', treat: 'Drug_A' },
      { gene_id: 'ENSG00000141510', tpm: 12.8, p_val: 0.0450, fold_change: -1.82, batch: 'Batch_01', treat: 'Drug_A' },
      { gene_id: 'ENSG00000157764', tpm: 88.6, p_val: 0.0001, fold_change: 3.12, batch: 'Batch_01', treat: 'Drug_A' },
      { gene_id: 'ENSG00000139618', tpm: 18.4, p_val: 0.1200, fold_change: 0.95, batch: 'Batch_02', treat: 'Control' },
      { gene_id: 'ENSG00000141510', tpm: 11.9, p_val: 0.2310, fold_change: 1.02, batch: 'Batch_02', treat: 'Control' }
    ]
  },
  {
    id: 'case_cross_lang_parquet',
    title: '跨语言 (R / Python) Parquet 零损耗数据中台共享',
    tag: '数据架构 / 多语言协同',
    scale: '2,500,000 行 / 复杂类型 (时间戳+分类因子+多维向量)',
    industry: '混合团队机器学习流水线',
    background: '数据科学团队中，统计学家在 R (Tidyverse) 中做复杂的试验设计与数据清洗，机器学习工程师在 Python (PyTorch/Polars) 中训练深度模型。以往使用 CSV 传递时，浮点截断、POSIXct 时区错乱、因子顺序丢失，经常导致模型复现失败。',
    challenge: '建立一套完全不需要重复类型转换、跨语言零损耗对接的数据落盘规范，保持精确的时间戳微秒精度与 Categorical 顺序。',
    solutionSummary: '统一使用 Apache Arrow / Parquet 规范标准。R 端使用 arrow::write_parquet() 保留元数据 schema，Python 端使用 polars.read_parquet() 实现毫秒级零拷贝接入。',
    metrics: {
      datasetRows: '2,500,000 行',
      throughput: 'R 写出 420 MB/s, Python 读入 780 MB/s',
      compressionRatio: 'ZSTD 压缩下 74% 节省',
      speedup: '跨语言数据解析耗时归零 (0 parsing cost)'
    },
    rCode: `# === 案例 3: R 端写出 Parquet 标准中台文件 ===
library(arrow)
library(dplyr)

# 1. 构建富类型数据框 (含时间戳、有序因子、数值)
model_features <- tibble(
  entity_id = sprintf("USR_%07d", 1:100000),
  event_time = as.POSIXct("2026-10-08 12:00:00", tz = "UTC") + runif(100000, 0, 86400),
  risk_level = factor(sample(c("Low", "Medium", "High"), 100000, replace = TRUE),
                      levels = c("Low", "Medium", "High"), ordered = TRUE),
  feature_score = rnorm(100000, mean = 50, sd = 10),
  is_active = sample(c(TRUE, FALSE), 100000, replace = TRUE, prob = c(0.85, 0.15))
)

# 2. 以统一 Parquet 格式持久化，指定 ZSTD 高压缩
write_parquet(
  x = model_features,
  sink = "shared_features.parquet",
  compression = "zstd",
  compression_level = 5
)`,
    pythonCode: `# === Python 端 (Polars 极速接入，完全免去类型推断) ===
import polars as pl

# 1. 毫秒级零拷贝读入，自动识别微秒时间戳与 Categorical 有序类型
df = pl.read_parquet("shared_features.parquet")

print("Python 成功载入数据:")
print(df.schema)
# 输出: {'entity_id': String, 'event_time': Datetime(time_unit='us', time_zone='UTC'),
#        'risk_level': Categorical(ordering='physical'), 'feature_score': Float64, 'is_active': Boolean}

# 2. 策略特征工程无缝衔接
result = df.group_by("risk_level").agg([
    pl.col("feature_score").mean().alias("avg_score"),
    pl.col("is_active").sum().alias("active_users")
])
print(result)`,
    sampleData: [
      { entity_id: 'USR_0000001', event_time: '2026-10-08 12:15:32', risk_level: 'Low', feature_score: 52.3, is_active: true },
      { entity_id: 'USR_0000002', event_time: '2026-10-08 13:42:19', risk_level: 'High', feature_score: 78.1, is_active: false },
      { entity_id: 'USR_0000003', event_time: '2026-10-08 14:05:01', risk_level: 'Medium', feature_score: 46.8, is_active: true },
      { entity_id: 'USR_0000004', event_time: '2026-10-08 14:18:44', risk_level: 'Low', feature_score: 55.4, is_active: true },
      { entity_id: 'USR_0000005', event_time: '2026-10-08 15:50:28', risk_level: 'Medium', feature_score: 61.2, is_active: true }
    ]
  },
  {
    id: 'case_sqlite_concurrency',
    title: '高并发与轻量级 SQLite 数据库分块读写与索引优化',
    tag: '嵌入式数据库 / 事务与检索',
    scale: '5,000,000 条传感器日志 / 480 MB 数据库',
    industry: '物联网与边缘监控分析',
    background: 'IoT 设备采集端需要将不断涌入的温度、湿度与振动记录在边缘节点存储。若全量加载到 R 内存中会导致内存耗尽；若每次追加写入 CSV 则会面临磁盘写入锁定和低效的全局扫描。',
    challenge: '利用单一轻量文件数据库（无需部署复杂数据库服务），实现事务批处理批量写出、B-Tree 索引加速以及毫秒级 SQL 条件切片查询。',
    solutionSummary: '采用 DBI 与 RSQLite，开启 WAL 预写日志模式，分批次开启 dbBegin/dbCommit 事务极速批量入库，并在时间戳和设备 ID 建立复合索引。',
    metrics: {
      datasetRows: '5,000,000 条日志',
      throughput: '事务批量写入 85,000 行/秒',
      compressionRatio: '单文件免维护，支持 ACID 事务',
      speedup: '索引查询从 12.8 秒降至 0.015 秒 (850倍)'
    },
    rCode: `# === 案例 4: RSQLite 嵌入式数据库高效读写与索引 ===
library(DBI)
library(RSQLite)

# 1. 建立本地 SQLite 连接
con <- dbConnect(RSQLite::SQLite(), dbname = "iot_telemetry.sqlite")

# 2. 调优 SQLite 写入参数 (开启 WAL 模式加速并发写入)
dbExecute(con, "PRAGMA journal_mode = WAL;")
dbExecute(con, "PRAGMA synchronous = NORMAL;")

# 3. 事务批量入库 (比单条写入快 500 倍以上)
batch_data <- data.frame(
  device_id = sample(paste0("DEV_", 100:199), 100000, replace = TRUE),
  timestamp = as.integer(Sys.time()) + 1:100000,
  temperature = round(rnorm(100000, mean = 24.5, sd = 3.2), 2),
  humidity = round(runif(100000, 40, 85), 1)
)

dbBegin(con) # 开启事务
dbWriteTable(con, "sensor_logs", batch_data, append = TRUE)
dbCommit(con) # 提交事务

# 4. 创建高性能复合索引
dbExecute(con, "CREATE INDEX IF NOT EXISTS idx_dev_time ON sensor_logs (device_id, timestamp);")

# 5. 毫秒级直接下推过滤查询 (直接在 SQLite 引擎完成，仅返回极小结果集)
query_res <- dbGetQuery(
  con,
  "SELECT device_id, AVG(temperature) AS avg_temp, MAX(humidity) AS max_hum
   FROM sensor_logs
   WHERE device_id = 'DEV_102'
   GROUP BY device_id"
)

# 6. 安全释放连接
dbDisconnect(con)`,
    sampleData: [
      { device_id: 'DEV_101', timestamp: 1791460801, temperature: 24.18, humidity: 55.4 },
      { device_id: 'DEV_102', timestamp: 1791460802, temperature: 26.85, humidity: 62.1 },
      { device_id: 'DEV_103', timestamp: 1791460803, temperature: 23.90, humidity: 58.7 },
      { device_id: 'DEV_102', timestamp: 1791460804, temperature: 27.10, humidity: 63.4 },
      { device_id: 'DEV_104', timestamp: 1791460805, temperature: 21.45, humidity: 49.8 }
    ]
  }
];
