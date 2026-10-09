import React, { useState } from 'react';
import { CodeSnippet } from '../common/CodeSnippet';
import { KatexMath } from '../common/KatexMath';
import {
  DownloadCloud,
  FileSpreadsheet,
  FileCode,
  FileText,
  Printer,
  CheckCircle,
  Copy,
  Table,
  Terminal,
  Layers
} from 'lucide-react';

export const Module9ExportEngine: React.FC = () => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Benchmark data table
  const BENCHMARK_DATA = [
    { format: 'Apache Parquet (ZSTD)', pkg: 'arrow', writeMs: 420, readMs: 145, sizeMb: 24.8, compRatio: '84.5%', peakRamMb: 85, crossLang: '全语言标准' },
    { format: 'Apache Parquet (Snappy)', pkg: 'arrow', writeMs: 290, readMs: 95, sizeMb: 36.2, compRatio: '77.4%', peakRamMb: 78, crossLang: '全语言标准' },
    { format: 'data.table (fwrite/fread)', pkg: 'data.table', writeMs: 580, readMs: 380, sizeMb: 160.0, compRatio: '0.0% (基准)', peakRamMb: 420, crossLang: '仅文本' },
    { format: 'R 原生序列化 (.rds)', pkg: 'base::saveRDS', writeMs: 650, readMs: 410, sizeMb: 44.5, compRatio: '72.2%', peakRamMb: 210, crossLang: '仅 R 内部' },
    { format: 'Tidyverse (write_csv)', pkg: 'readr', writeMs: 1250, readMs: 780, sizeMb: 160.0, compRatio: '0.0%', peakRamMb: 520, crossLang: '仅文本' },
    { format: 'SQLite 嵌入式表', pkg: 'RSQLite', writeMs: 980, readMs: 28, sizeMb: 68.0, compRatio: '57.5%', peakRamMb: 32, crossLang: '通用 SQL' },
    { format: 'Base R (write.csv)', pkg: 'utils', writeMs: 8400, readMs: 6200, sizeMb: 160.0, compRatio: '0.0%', peakRamMb: 1150, crossLang: '仅文本' }
  ];

  // R Session Info Mock
  const sessionInfoText = `R version 4.4.1 (2024-06-14) -- "Race for Your Life"
Platform: x86_64-apple-darwin20.0 (64-bit)
Running under: macOS Sonoma 14.5

Matrix products: default
BLAS:   /Library/Frameworks/R.framework/Versions/4.4/Resources/lib/libRblas.dylib 
LAPACK: /Library/Frameworks/R.framework/Versions/4.4/Resources/lib/libRlapack.dylib

locale:
[1] zh_CN.UTF-8/zh_CN.UTF-8/zh_CN.UTF-8/C/zh_CN.UTF-8/zh_CN.UTF-8

attached base packages:
[1] stats     graphics  grDevices utils     datasets  methods   base     

other attached packages:
[1] arrow_17.0.0.1  data.table_1.16.0 readr_2.1.5      dplyr_1.1.4     
[5] here_1.0.1       openxlsx_4.2.7.1 readxl_1.4.3     haven_2.5.4     
[9] lobstr_1.1.2     DBI_1.2.3        RSQLite_2.3.7`;

  // Download real sample CSV
  const handleDownloadCsv = () => {
    const csvContent = `id,timestamp,symbol,price,volume,cohort,status,score
ID_001,2026-10-08 09:30:00,AAPL,228.50,1500,Cohort_A,Active,94.2
ID_002,2026-10-08 09:30:01,NVDA,124.80,4800,Cohort_A,Active,88.6
ID_003,2026-10-08 09:30:02,MSFT,448.20,920,Cohort_B,Pending,78.1
ID_004,2026-10-08 09:30:03,GOOGL,182.10,2100,Cohort_A,Active,91.4
ID_005,2026-10-08 09:30:04,AMZN,188.40,1750,Cohort_B,Active,85.0`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'r_io_lab_sample_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess('CSV 实体文件已生成并开始下载！');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Download Markdown Report
  const handleDownloadMarkdownReport = () => {
    let md = `# R 语言数据文件读写基准 (I/O Benchmark) 实验报告
**生成时间**: ${new Date().toLocaleString()}  
**实验环境**: R 4.4.1 x86_64 / Arrow / data.table / Tidyverse  
**工作路径模式**: here::here() 相对根目录规范  

---

## 1. 读写性能与压缩比横向基准 (Benchmark Matrix)
| 格式 / 引擎 | 写入耗时 (ms) | 读取耗时 (ms) | 磁盘文件体积 | 压缩节省率 | 内存峰值 (MB) | 跨语言兼容性 |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
`;

    BENCHMARK_DATA.forEach((b) => {
      md += `| ${b.format} (${b.pkg}) | ${b.writeMs} | ${b.readMs} | ${b.sizeMb} MB | ${b.compRatio} | ${b.peakRamMb} MB | ${b.crossLang} |\n`;
    });

    md += `
---

## 2. 关键工程结论
1. **最高吞吐首选**: \`arrow::read_parquet()\` 与 \`data.table::fread()\` 分别在二进制列式存储和纯文本解析中具备极速性能；
2. **零拷贝降维**: Arrow Parquet 基于 OS Page Cache 零拷贝映射，内存峰值仅为 Base R 的 1/14；
3. **避坑金律**: 写出 CSV 时务必添加 \`row.names = FALSE\`，避免第一列列名错位；大文件统一采用 ZSTD 压缩 Parquet。

---

## 3. R 运行期环境清单 (SessionInfo)
\`\`\`text
${sessionInfoText}
\`\`\`
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'R_IO_Lab_Benchmark_Report.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess('Markdown 分析报告已导出！');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-2">
              <span>模块 09 · 智能与体系</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              数据集与分析报告导出引擎 (Export & Reporting Engine)
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              支持导出加工后全量 CSV 数据文件、Parquet 结构元数据、读写性能基准（Benchmark）对比报告及当前 R 会话工作路径与环境配置清单 (sessionInfo)。
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>下载 CSV 数据集</span>
            </button>
            <button
              onClick={handleDownloadMarkdownReport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>导出 Markdown / PDF 报告</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
        )}
      </div>

      {/* Benchmark Matrix Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              各主流格式读写性能与压缩比横向基准测试 (Benchmark Matrix)
            </h3>
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span>吞吐量公式：</span>
            <KatexMath math="\text{Throughput} = \frac{\Delta \text{Volume (MB)}}{\Delta t \text{ (ms)} \times 10^{-3}} \text{ (MB/s)}" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono">
              <tr>
                <th className="px-3.5 py-2.5 font-bold">格式与库</th>
                <th className="px-3.5 py-2.5 font-bold text-right">写入耗时</th>
                <th className="px-3.5 py-2.5 font-bold text-right">读取耗时</th>
                <th className="px-3.5 py-2.5 font-bold text-right">磁盘物理体积</th>
                <th className="px-3.5 py-2.5 font-bold text-right">压缩空间节省率</th>
                <th className="px-3.5 py-2.5 font-bold text-right">内存峰值</th>
                <th className="px-3.5 py-2.5 font-bold">跨语言通用性</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {BENCHMARK_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-3.5 py-2 font-medium text-slate-900">
                    {row.format} <span className="text-[10px] text-slate-400">({row.pkg})</span>
                  </td>
                  <td className="px-3.5 py-2 text-right text-slate-700">{row.writeMs} ms</td>
                  <td className="px-3.5 py-2 text-right font-bold text-emerald-700">{row.readMs} ms</td>
                  <td className="px-3.5 py-2 text-right text-slate-700">{row.sizeMb} MB</td>
                  <td className="px-3.5 py-2 text-right font-semibold text-indigo-700">{row.compRatio}</td>
                  <td className="px-3.5 py-2 text-right text-slate-600">{row.peakRamMb} MB</td>
                  <td className="px-3.5 py-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-sans ${
                      row.crossLang === '全语言标准'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : row.crossLang === '仅 R 内部'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {row.crossLang}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* R Session Environment Manifest */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              当前 R 会话工作路径与运行期环境配置清单 (sessionInfo)
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            可复现性凭据
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed max-h-60">
          <pre>{sessionInfoText}</pre>
        </div>
      </div>
    </div>
  );
};
