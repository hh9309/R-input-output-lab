import React, { useState } from 'react';
import { CodeSnippet } from '../common/CodeSnippet';
import {
  Terminal,
  Play,
  Download,
  Copy,
  Settings2,
  Sparkles,
  CheckCircle,
  FileCode,
  RotateCcw
} from 'lucide-react';

export const Module6CodeEngine: React.FC = () => {
  // Mode & Format
  const [ioMode, setIoMode] = useState<'read' | 'write'>('read');
  const [format, setFormat] = useState<'csv' | 'parquet' | 'rds' | 'excel' | 'sqlite'>('csv');
  const [engine, setEngine] = useState<'readr' | 'datatable' | 'arrow' | 'base'>('readr');

  // Path & Environment
  const [useHerePkg, setUseHerePkg] = useState<boolean>(true);
  const [dirPath, setDirPath] = useState<string>('data/processed');
  const [fileName, setFileName] = useState<string>('clinical_records');

  // Parameters
  const [encoding, setEncoding] = useState<'UTF-8' | 'GBK' | 'GB18030'>('UTF-8');
  const [nThreads, setNThreads] = useState<number>(4);
  const [compression, setCompression] = useState<'snappy' | 'zstd' | 'gzip' | 'none'>('zstd');
  const [rowNames, setRowNames] = useState<boolean>(false);
  const [explicitTypes, setExplicitTypes] = useState<boolean>(true);

  // Virtual Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);

  // Generate dynamic R Code based on inputs
  const generateRCode = () => {
    const fullFileName = `${fileName}.${format === 'excel' ? 'xlsx' : format}`;
    let codeLines: string[] = [];

    // Header comments & libraries
    codeLines.push(`# ========================================================`);
    codeLines.push(`# R 语言高性能数据文件 ${ioMode === 'read' ? '读入 (Ingest)' : '写出 (Persist)'} 工业级生产脚本`);
    codeLines.push(`# 生成时间: ${new Date().toLocaleDateString()} | 引擎: ${engine} | 格式: ${format.toUpperCase()}`);
    codeLines.push(`# ========================================================\n`);

    const packages: string[] = [];
    if (useHerePkg) packages.push('here');
    if (engine === 'readr') packages.push('readr');
    if (engine === 'datatable') packages.push('data.table');
    if (engine === 'arrow' || format === 'parquet') packages.push('arrow');
    if (format === 'excel') packages.push('readxl', 'openxlsx');
    if (format === 'sqlite') packages.push('DBI', 'RSQLite');

    packages.forEach((pkg) => {
      codeLines.push(`if (!requireNamespace("${pkg}", quietly = TRUE)) install.packages("${pkg}")`);
      codeLines.push(`library(${pkg})`);
    });
    codeLines.push(``);

    // Path resolution
    codeLines.push(`# --- 1. 工作路径定位与防御性检查 ---`);
    if (useHerePkg) {
      codeLines.push(`file_target <- here::here("${dirPath}", "${fullFileName}")`);
    } else {
      codeLines.push(`setwd("${dirPath}") # 注意：生产中建议统一使用 here()`);
      codeLines.push(`file_target <- "${fullFileName}"`);
    }

    if (ioMode === 'read') {
      codeLines.push(`stopifnot("目标文件不存在，请检查路径" = file.exists(file_target))\n`);
      codeLines.push(`# --- 2. 高效执行读入 ---`);
      codeLines.push(`t0 <- Sys.time()`);

      if (format === 'csv') {
        if (engine === 'readr') {
          codeLines.push(`df_result <- readr::read_csv(`);
          codeLines.push(`  file = file_target,`);
          if (encoding !== 'UTF-8') codeLines.push(`  locale = readr::locale(encoding = "${encoding}"),`);
          codeLines.push(`  na = c("", "NA", "NULL", "#N/A"),`);
          if (explicitTypes) {
            codeLines.push(`  col_types = cols(`);
            codeLines.push(`    id = col_character(),`);
            codeLines.push(`    timestamp = col_datetime(),`);
            codeLines.push(`    val = col_double()`);
            codeLines.push(`  ),`);
          }
          codeLines.push(`  progress = TRUE`);
          codeLines.push(`)`);
        } else if (engine === 'datatable') {
          codeLines.push(`dt_result <- data.table::fread(`);
          codeLines.push(`  file = file_target,`);
          codeLines.push(`  nThread = ${nThreads},`);
          if (encoding !== 'UTF-8') codeLines.push(`  encoding = "${encoding}",`);
          codeLines.push(`  na.strings = c("", "NA", "NULL"),`);
          codeLines.push(`  showProgress = TRUE`);
          codeLines.push(`)`);
        } else {
          codeLines.push(`base_df <- read.csv(`);
          codeLines.push(`  file = file_target,`);
          codeLines.push(`  stringsAsFactors = FALSE,`);
          if (encoding !== 'UTF-8') codeLines.push(`  fileEncoding = "${encoding}",`);
          codeLines.push(`  na.strings = c("", "NA")`);
          codeLines.push(`)`);
        }
      } else if (format === 'parquet') {
        codeLines.push(`arrow_table <- arrow::read_parquet(`);
        codeLines.push(`  file = file_target,`);
        codeLines.push(`  as_data_frame = TRUE`);
        codeLines.push(`)`);
      } else if (format === 'rds') {
        codeLines.push(`rds_object <- readRDS(file_target)`);
      } else if (format === 'excel') {
        codeLines.push(`excel_data <- readxl::read_excel(`);
        codeLines.push(`  path = file_target,`);
        codeLines.push(`  sheet = 1,`);
        codeLines.push(`  na = c("", "NA")`);
        codeLines.push(`)`);
      } else if (format === 'sqlite') {
        codeLines.push(`con <- DBI::dbConnect(RSQLite::SQLite(), file_target)`);
        codeLines.push(`sql_data <- DBI::dbReadTable(con, "${fileName}")`);
        codeLines.push(`DBI::dbDisconnect(con)`);
      }

      codeLines.push(`\n# --- 3. 性能诊断与结构校验 ---`);
      codeLines.push(`cat("读入耗时:", round(difftime(Sys.time(), t0, units = "secs"), 4), "秒\\n")`);
      codeLines.push(`cat("数据维度:", nrow(df_result), "行 ×", ncol(df_result), "列\\n")`);
      codeLines.push(`cat("内存占用:", format(lobstr::obj_size(df_result)), "\\n")`);
      codeLines.push(`print(head(df_result, 3))`);
    } else {
      // Write Mode
      codeLines.push(`\n# --- 2. 高效执行持久化写出 ---`);
      codeLines.push(`t0 <- Sys.time()`);

      if (format === 'csv') {
        if (engine === 'readr') {
          codeLines.push(`readr::write_csv(`);
          codeLines.push(`  x = data_to_export,`);
          codeLines.push(`  file = file_target,`);
          codeLines.push(`  na = "NA"`);
          codeLines.push(`)`);
        } else if (engine === 'datatable') {
          codeLines.push(`data.table::fwrite(`);
          codeLines.push(`  x = data_to_export,`);
          codeLines.push(`  file = file_target,`);
          codeLines.push(`  nThread = ${nThreads},`);
          codeLines.push(`  row.names = ${rowNames ? 'TRUE' : 'FALSE'}`);
          codeLines.push(`)`);
        } else {
          codeLines.push(`write.csv(`);
          codeLines.push(`  x = data_to_export,`);
          codeLines.push(`  file = file_target,`);
          codeLines.push(`  row.names = ${rowNames ? 'TRUE' : 'FALSE'}, # 警惕：漏设会导致列名错位！`);
          if (encoding !== 'UTF-8') codeLines.push(`  fileEncoding = "${encoding}"`);
          codeLines.push(`)`);
        }
      } else if (format === 'parquet') {
        codeLines.push(`arrow::write_parquet(`);
        codeLines.push(`  x = data_to_export,`);
        codeLines.push(`  sink = file_target,`);
        codeLines.push(`  compression = "${compression}",`);
        codeLines.push(`  compression_level = 5`);
        codeLines.push(`)`);
      } else if (format === 'rds') {
        codeLines.push(`saveRDS(`);
        codeLines.push(`  object = data_to_export,`);
        codeLines.push(`  file = file_target,`);
        codeLines.push(`  compress = "fast",`);
        codeLines.push(`  version = 2 # 保证跨旧版本 R 兼容性`);
        codeLines.push(`)`);
      } else if (format === 'excel') {
        codeLines.push(`openxlsx::write.xlsx(`);
        codeLines.push(`  x = data_to_export,`);
        codeLines.push(`  file = file_target,`);
        codeLines.push(`  asTable = TRUE,`);
        codeLines.push(`  overwrite = TRUE`);
        codeLines.push(`)`);
      } else if (format === 'sqlite') {
        codeLines.push(`con <- DBI::dbConnect(RSQLite::SQLite(), file_target)`);
        codeLines.push(`DBI::dbWriteTable(con, "${fileName}", data_to_export, overwrite = TRUE)`);
        codeLines.push(`DBI::dbDisconnect(con)`);
      }

      codeLines.push(`\ncat("持久化写出耗时:", round(difftime(Sys.time(), t0, units = "secs"), 4), "秒\\n")`);
      codeLines.push(`cat("输出文件大小:", file.size(file_target) / 1024 / 1024, "MB\\n")`);
    }

    return codeLines.join('\n');
  };

  const handleSimulateRun = () => {
    setIsRunning(true);
    setConsoleOutput(null);

    setTimeout(() => {
      const generated = `> source("r_io_engine_script.R")
[R 4.4.1 (2024-06-14)] 载入包: ${engine}, here...
✔ 项目根目录已定位: /Users/analyst/R_Projects/IO_Lab
✔ 目标文件定位成功: ${dirPath}/${fileName}.${format === 'excel' ? 'xlsx' : format}

${ioMode === 'read' ? '读入' : '写出'}耗时: 0.1284 秒
数据维度: 50,000 行 × 8 列
内存占用: 3.42 MB (3,584,216 bytes)

# A tibble: 3 × 8
  id      timestamp           symbol    price volume   cohort   status   score
  <chr>   <dttm>              <chr>     <dbl>  <int>   <chr>    <fct>    <dbl>
1 ID_001  2026-10-08 12:30:00 AAPL     225.4   1200   Group_A  Active    92.4
2 ID_002  2026-10-08 12:30:01 NVDA     118.2   4500   Group_A  Active    88.1
3 ID_003  2026-10-08 12:30:02 MSFT     442.8    800   Group_B  Pending   76.5

✔ 执行完毕：无解析 warning，数据完整一致。`;
      setConsoleOutput(generated);
      setIsRunning(false);
    }, 700);
  };

  const handleDownloadScript = () => {
    const code = generateRCode();
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `r_io_${format}_${engine}.R`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-2">
              <span>模块 06 · 工程实战</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              R / Tidyverse 动态代码引擎 (R Code Engine & REPL)
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              全参数动态改写 <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono text-xs">setwd()</code>、
              <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono text-xs">read_csv()</code>、
              <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono text-xs">fwrite()</code> 与
              <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono text-xs">write_parquet()</code> 语法；
              支持一键在虚拟 R 解释器中执行并导出可执行 <code className="text-indigo-700 font-mono">.R</code> 脚本。
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleDownloadScript}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>下载 .R 脚本</span>
            </button>
            <button
              onClick={handleSimulateRun}
              disabled={isRunning}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm cursor-pointer ${
                isRunning ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isRunning ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>执行中...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>运行 R 代码</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Configuration Deck */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              交互式语法调谐器 (Syntax Controls)
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* IO Mode */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">操作模式：</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIoMode('read')}
                  className={`py-1.5 rounded-lg border font-medium cursor-pointer ${
                    ioMode === 'read'
                      ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  读入数据 (Ingest / Read)
                </button>
                <button
                  onClick={() => setIoMode('write')}
                  className={`py-1.5 rounded-lg border font-medium cursor-pointer ${
                    ioMode === 'write'
                      ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  持久化写出 (Export / Write)
                </button>
              </div>
            </div>

            {/* Target Format */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">目标文件格式：</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 font-mono">
                {(['csv', 'parquet', 'rds', 'excel', 'sqlite'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => {
                      setFormat(fmt);
                      if (fmt === 'parquet') setEngine('arrow');
                    }}
                    className={`py-1 rounded border uppercase text-[11px] cursor-pointer ${
                      format === fmt
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    .{fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Engine Selection */}
            {format === 'csv' && (
              <div>
                <label className="block text-slate-600 font-semibold mb-1">解析引擎库：</label>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                  <button
                    onClick={() => setEngine('readr')}
                    className={`py-1 rounded border cursor-pointer ${
                      engine === 'readr' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    readr
                  </button>
                  <button
                    onClick={() => setEngine('datatable')}
                    className={`py-1 rounded border cursor-pointer ${
                      engine === 'datatable' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    data.table
                  </button>
                  <button
                    onClick={() => setEngine('base')}
                    className={`py-1 rounded border cursor-pointer ${
                      engine === 'base' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    Base R
                  </button>
                </div>
              </div>
            )}

            {/* Path controls */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={useHerePkg}
                  onChange={(e) => setUseHerePkg(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                <span>启用 here::here() 自动定位项目根节点 (金标准)</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-500">子目录 (Subdir)：</span>
                  <input
                    type="text"
                    value={dirPath}
                    onChange={(e) => setDirPath(e.target.value)}
                    className="w-full px-2.5 py-1 rounded border border-slate-300 font-mono text-[11px] mt-0.5"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">文件名 (不含后缀)：</span>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full px-2.5 py-1 rounded border border-slate-300 font-mono text-[11px] mt-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Advanced knobs */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <span className="font-semibold text-slate-700 block">进阶编译参数：</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">编码格式：</span>
                  <select
                    value={encoding}
                    onChange={(e) => setEncoding(e.target.value as any)}
                    className="w-full px-2 py-1 rounded border border-slate-300 bg-white font-mono mt-0.5"
                  >
                    <option value="UTF-8">UTF-8</option>
                    <option value="GBK">GBK (CP936)</option>
                    <option value="GB18030">GB18030</option>
                  </select>
                </div>

                {format === 'parquet' && (
                  <div>
                    <span className="text-slate-500">压缩算法：</span>
                    <select
                      value={compression}
                      onChange={(e) => setCompression(e.target.value as any)}
                      className="w-full px-2 py-1 rounded border border-slate-300 bg-white font-mono mt-0.5"
                    >
                      <option value="snappy">Snappy (极速)</option>
                      <option value="zstd">ZSTD (高压)</option>
                      <option value="gzip">GZIP</option>
                      <option value="none">无压缩</option>
                    </select>
                  </div>
                )}

                {engine === 'datatable' && (
                  <div>
                    <span className="text-slate-500">并行线程 (nThread)：</span>
                    <input
                      type="number"
                      min="1"
                      max="16"
                      value={nThreads}
                      onChange={(e) => setNThreads(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded border border-slate-300 font-mono mt-0.5"
                    />
                  </div>
                )}
              </div>

              {ioMode === 'read' && format === 'csv' && (
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={explicitTypes}
                    onChange={(e) => setExplicitTypes(e.target.checked)}
                    className="rounded accent-indigo-600"
                  />
                  <span className="text-slate-600">显式定义列类型 (col_types) 杜绝推断开销</span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Right: Code Generation Snippet & Virtual R Output Console */}
        <div className="lg:col-span-7 space-y-4">
          <CodeSnippet
            title={`动态生成的 R 生产代码 (${format.toUpperCase()} · ${engine})`}
            badge="实时响应"
            code={generateRCode()}
          />

          {/* Virtual Terminal */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs shadow-md space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                虚拟 R 4.4 解释器控制台 (R REPL Console)
              </span>
              <span className="text-slate-500">PID: 88204 · R_LIBS_USER</span>
            </div>

            <div className="min-h-[140px] text-slate-300 whitespace-pre-wrap leading-relaxed">
              {consoleOutput ? (
                consoleOutput
              ) : (
                <div className="text-slate-500 italic py-6 text-center">
                  点击上方 “运行 R 代码” 按钮，在此实时查看模拟终端输出、数据维度与对象结构...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
