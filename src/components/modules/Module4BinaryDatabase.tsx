import React, { useState } from 'react';
import { CodeSnippet } from '../common/CodeSnippet';
import { KatexMath } from '../common/KatexMath';
import {
  Database,
  Zap,
  HardDrive,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Globe
} from 'lucide-react';

export const Module4BinaryDatabase: React.FC = () => {
  // Compression slider state
  const [dataScaleRows, setDataScaleRows] = useState<number>(2000000); // 2 million rows
  const [selectedCodec, setSelectedCodec] = useState<'snappy' | 'zstd' | 'gzip'>('zstd');

  // Calculated estimates based on empirical benchmarks
  const rawCsvMb = Math.round((dataScaleRows * 128) / (1024 * 1024)); // ~128 bytes/row in CSV
  const rdsMb = Math.round(rawCsvMb * 0.28);
  const parquetSnappyMb = Math.round(rawCsvMb * 0.18);
  const parquetZstdMb = Math.round(rawCsvMb * 0.12);
  const sqliteMb = Math.round(rawCsvMb * 0.35);

  const currentParquetMb = selectedCodec === 'snappy' ? parquetSnappyMb : selectedCodec === 'zstd' ? parquetZstdMb : Math.round(rawCsvMb * 0.14);
  const compressionRatio = Math.round((1 - currentParquetMb / rawCsvMb) * 100);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-2">
              <span>模块 04 · 格式实操</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              高性能二进制与数据库 (RDS / Parquet / SQLite) 读写
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              深入演播 R 原生二进制序列化 <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono text-xs">readRDS/saveRDS</code>、
              工业级列式标准 <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono text-xs">arrow::read_parquet</code> 与
              嵌入式关系数据库 <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono text-xs">RSQLite</code>；
              深度剖析列式压缩比及零拷贝（Zero-Copy）加载流。
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
            <span className="font-mono text-indigo-700 font-bold">Arrow + RDS + RSQLite</span>
          </div>
        </div>
      </div>

      {/* 4.1 三大多维性能基准切片看板 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* RDS Card */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 font-mono">.rds (saveRDS/readRDS)</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-600 font-medium">R 原生对象</span>
          </div>
          <h4 className="text-sm font-bold text-slate-800">完美保留 R 原生类与属性</h4>
          <p className="text-xs text-slate-500">
            完全保真 S3/S4 类、因子 levels 顺序、模型拟合参数及闭包环境。压缩比优异，单机中间结果缓存首选。
          </p>
          <div className="border-t border-slate-100 pt-2 space-y-1 text-[11px] font-mono text-slate-600">
            <div className="flex justify-between">
              <span>跨语言兼容性：</span>
              <span className="text-amber-600 font-bold">仅限 R 环境</span>
            </div>
            <div className="flex justify-between">
              <span>压缩算法：</span>
              <span>gzip / bzip2 / xz</span>
            </div>
            <div className="flex justify-between">
              <span>反序列化开销：</span>
              <span className="text-emerald-600 font-bold">中等偏快</span>
            </div>
          </div>
        </div>

        {/* Parquet Card */}
        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-300 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800 font-mono">.parquet (arrow::read_parquet)</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-600 text-white font-bold">业界最高性能</span>
          </div>
          <h4 className="text-sm font-bold text-indigo-950">列式存储 · 零拷贝与跨语言生态</h4>
          <p className="text-xs text-slate-600">
            字典编码与列式压缩，支持下推谓词过滤 (Predicate Pushdown)，与 Python/Pandas/Polars/DuckDB 零损耗对接。
          </p>
          <div className="border-t border-indigo-200/60 pt-2 space-y-1 text-[11px] font-mono text-slate-700">
            <div className="flex justify-between">
              <span>跨语言兼容性：</span>
              <span className="text-emerald-700 font-bold">全语言标准 (★★★★★)</span>
            </div>
            <div className="flex justify-between">
              <span>压缩算法：</span>
              <span>Snappy (极速) / ZSTD (高压)</span>
            </div>
            <div className="flex justify-between">
              <span>零拷贝内存映射：</span>
              <span className="text-emerald-700 font-bold">原生支持 (Zero-Copy)</span>
            </div>
          </div>
        </div>

        {/* SQLite Card */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 font-mono">.sqlite (RSQLite + DBI)</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">嵌入式 SQL</span>
          </div>
          <h4 className="text-sm font-bold text-slate-800">事务性 ACID · 外部内存 SQL 切片</h4>
          <p className="text-xs text-slate-500">
            无需启动后台数据库服务。支持创建 B-Tree 索引，在不加载全量数据的情况下直接执行 SQL 过滤与聚合。
          </p>
          <div className="border-t border-slate-100 pt-2 space-y-1 text-[11px] font-mono text-slate-600">
            <div className="flex justify-between">
              <span>跨语言兼容性：</span>
              <span className="text-emerald-600 font-bold">全平台通用标准</span>
            </div>
            <div className="flex justify-between">
              <span>索引检索耗时：</span>
              <span className="text-emerald-600 font-bold">&lt; 5 毫秒 (毫秒级响应)</span>
            </div>
            <div className="flex justify-between">
              <span>内存开销：</span>
              <span className="text-emerald-600 font-bold">按需仅拉取结果集</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4.2 列式压缩比与吞吐量互动演播 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              4.2 存储格式压缩率与磁盘物理体积对比模拟器
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Parquet 压缩算法：</span>
            {(['snappy', 'zstd', 'gzip'] as const).map((codec) => (
              <button
                key={codec}
                onClick={() => setSelectedCodec(codec)}
                className={`px-2.5 py-1 rounded-lg border font-mono uppercase cursor-pointer ${
                  selectedCodec === codec
                    ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {codec}
              </button>
            ))}
          </div>
        </div>

        {/* Data volume slider */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <span className="font-semibold text-slate-700">
              压缩节省率代数公式：
              <KatexMath math="\text{CR} = \left( 1 - \frac{\text{Size}_{\text{Parquet}}}{\text{Size}_{\text{Raw}}} \right) \times 100\%" className="ml-2" />
            </span>
            <span className="font-mono text-indigo-700 font-bold">
              {(dataScaleRows / 10000).toFixed(0)} 万行 ({dataScaleRows.toLocaleString()} rows)
            </span>
          </div>
          <input
            type="range"
            min="500000"
            max="10000000"
            step="500000"
            value={dataScaleRows}
            onChange={(e) => setDataScaleRows(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Comparative horizontal bars */}
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between mb-1 font-mono">
              <span className="text-slate-600">纯文本 CSV (无压缩行式基线)</span>
              <span className="font-bold text-slate-800">{rawCsvMb} MB (100%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-slate-400 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 font-mono">
              <span className="text-slate-600">SQLite 嵌入式单文件数据库 (.sqlite)</span>
              <span className="font-bold text-slate-800">{sqliteMb} MB (~35%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '35%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 font-mono">
              <span className="text-slate-600">R 原生 RDS 二进制序列化 (saveRDS)</span>
              <span className="font-bold text-indigo-700">{rdsMb} MB (~28%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '28%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 font-mono">
              <span className="text-emerald-700 font-bold">
                Apache Parquet 列式存储 ({selectedCodec.toUpperCase()})
              </span>
              <span className="font-bold text-emerald-700">{currentParquetMb} MB (节省 {compressionRatio}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((currentParquetMb / rawCsvMb) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4.3 零拷贝 (Zero-Copy) 与 Arrow IPC 机制架构图解 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Zap className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900">
            4.3 Apache Arrow 零拷贝 (Zero-Copy) 内存映射机理解析
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-800">传统 CSV 读取流 (耗时密集型)</div>
            <div className="text-[11px] text-slate-500 leading-relaxed space-y-1 font-sans">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-mono text-[10px]">1</span>
                <span>磁盘块读取到内核缓冲区</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-mono text-[10px]">2</span>
                <span>字符串 Lexer 逐行扫描、寻找分隔符与换行</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-mono text-[10px]">3</span>
                <span>C 级内存分配并逐个解析为 double/integer</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700 font-semibold">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-mono text-[10px]">4</span>
                <span>拷贝到 R SEXP 向量中 (发生数据深复制与 GC 负担)</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="text-xs font-bold text-emerald-900">Arrow 零拷贝内存映射 (Zero-Copy)</div>
            <div className="text-[11px] text-emerald-800 leading-relaxed space-y-1 font-sans">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-mono text-[10px]">1</span>
                <span>mmap() 系统调用直接映射磁盘文件至 OS Page Cache</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-mono text-[10px]">2</span>
                <span>Arrow RecordBatch 严格按列对齐二进制物理布局</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-mono text-[10px]">3</span>
                <span>通过 R ALTREP 机制直接将指针提供给 R 向量引擎</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-300 text-emerald-900 flex items-center justify-center font-mono text-[10px]">4</span>
                <span>零数据复制 (0-Copy)，瞬时响应，百毫秒加载数千万行！</span>
              </div>
            </div>
          </div>
        </div>

        {/* 工业级 R 代码 */}
        <CodeSnippet
          title="Arrow Parquet 与 RSQLite 高性能读写实战 R 代码"
          badge="高性能落盘规范"
          code={`# === 1. Apache Arrow Parquet 列式高性能读写 ===
library(arrow)
library(dplyr)

# 写出高压缩 Parquet 文件
write_parquet(
  x = my_dataset,
  sink = "output_dataset.parquet",
  compression = "${selectedCodec}",
  compression_level = 5
)

# 零拷贝只读拉取：通过 open_dataset 仅建立流式指针
ds <- open_dataset("output_dataset.parquet")
target_subset <- ds |>
  filter(sales_amount > 5000 & region == "East") |>
  select(order_id, sales_amount, customer_id) |>
  collect() # 仅此时将下推过滤后的极小结果载入 R 内存

# === 2. R 原生 RDS 保真缓存 ===
# compress = "fast" 采用轻量 lzo/gzip 算法，极快落盘
saveRDS(complex_model_object, "model_cache.rds", compress = "fast")
restored_model <- readRDS("model_cache.rds")

# === 3. RSQLite 嵌入式关系数据库 ===
library(DBI)
library(RSQLite)

con <- dbConnect(RSQLite::SQLite(), "analytics_store.sqlite")
# 分批事务追加写入
dbWriteTable(con, "orders", my_dataset, append = TRUE)
dbExecute(con, "CREATE INDEX IF NOT EXISTS idx_cust ON orders(customer_id);")
dbDisconnect(con)`}
        />
      </div>
    </div>
  );
};
