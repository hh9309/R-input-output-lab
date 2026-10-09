import React, { useState } from 'react';
import { CodeSnippet } from '../common/CodeSnippet';
import { KatexMath } from '../common/KatexMath';
import {
  GitFork,
  ArrowRight,
  CheckCircle2,
  FolderSearch,
  FileInput,
  Cpu,
  Save,
  RotateCcw
} from 'lucide-react';

export const Module8WorkflowGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Workflow state parameters
  const [pipelineState, setPipelineState] = useState({
    subDir: 'data/raw',
    fileName: 'cohort_2026.csv',
    useHere: true,
    engine: 'readr',
    cleanNa: true,
    factorConvert: true,
    exportFormat: 'parquet',
    compression: 'zstd'
  });

  const STEPS = [
    {
      num: 1,
      title: '路径设置与检查',
      desc: '工作路径检查、项目根节点锚定与文件存在性防御性验证',
      icon: FolderSearch
    },
    {
      num: 2,
      title: '高效读入与结构重塑',
      desc: '选型解析器、编码识别、显式列类型规整与避免推断陷阱',
      icon: FileInput
    },
    {
      num: 3,
      title: '内存加工与结构校验',
      desc: '缺失值清洗、因子有序化、日期时间格式化与堆内存剖析',
      icon: Cpu
    },
    {
      num: 4,
      title: '持久化写出与压缩',
      desc: '格式压缩选型 (Parquet/RDS)、禁用行名、体积校验与归档',
      icon: Save
    }
  ];

  const generateFullPipelineCode = () => {
    return `# ========================================================
# R 语言数据工程全流程标准工业级流水线 (End-to-End Pipeline)
# 阶段 1: 路径设置 → 阶段 2: 读入 → 阶段 3: 加工 → 阶段 4: 持久化写出
# ========================================================

library(here)
library(readr)
library(dplyr)
library(lobstr)
library(arrow)

# --------------------------------------------------------
# 阶段 1: 工作路径检查与文件定位 (Path Setup & Anchoring)
# --------------------------------------------------------
# 使用 here::here() 自动定位项目根目录 (.Rproj / .git)
input_path <- here::here("${pipelineState.subDir}", "${pipelineState.fileName}")
stopifnot("致命错误: 目标数据文件不存在，请检查路径" = file.exists(input_path))
cat("✔ 成功定位数据文件:", input_path, "\\n")

# --------------------------------------------------------
# 阶段 2: 高效读入与结构重塑 (File Ingest & Explicit Types)
# --------------------------------------------------------
# 显式声明列类型，彻底杜绝采样推断卡死与类型退化
raw_data <- readr::read_csv(
  file = input_path,
  col_types = cols(
    patient_id = col_character(),
    visit_date = col_date(format = "%Y-%m-%d"),
    treatment_group = col_character(),
    biomarker_a = col_double(),
    biomarker_b = col_double()
  ),
  na = c("", "NA", "NULL", "#N/A"),
  progress = TRUE
)
cat("✔ 读入完成，当前维度:", nrow(raw_data), "行 ×", ncol(raw_data), "列\\n")

# --------------------------------------------------------
# 阶段 3: 内存加工与清洗校验 (Memory Reshape & Cleaning)
# --------------------------------------------------------
processed_data <- raw_data |>
  ${pipelineState.cleanNa ? '# 剔除关键标识符缺失项\n  filter(!is.na(patient_id)) |>' : ''}
  ${pipelineState.factorConvert ? '# 分类变量转换为因子并显式指定水平\n  mutate(treatment_group = factor(treatment_group, levels = c("Control", "Drug_A", "Drug_B"))) |>' : ''}
  # 计算复合检验指标与质控得分
  mutate(composite_score = round((biomarker_a * 1.5) + (biomarker_b * 0.8), 2))

cat("✔ 加工后对象内存占用:", format(lobstr::obj_size(processed_data)), "\\n")

# --------------------------------------------------------
# 阶段 4: 目标格式压缩写出 (Persistent Export & Compression)
# --------------------------------------------------------
output_path <- here::here("data", "processed", "cohort_2026_clean.${pipelineState.exportFormat}")

${
  pipelineState.exportFormat === 'parquet'
    ? `# 写入 Apache Arrow Parquet (启用 ${pipelineState.compression} 高压缩与零拷贝元数据)
arrow::write_parquet(
  x = processed_data,
  sink = output_path,
  compression = "${pipelineState.compression}",
  compression_level = 5
)`
    : `# 写入原生 RDS
saveRDS(processed_data, output_path, compress = "fast")`
}

cat("✔ 持久化写出成功！输出文件路径:", output_path, "\\n")
cat("✔ 磁盘占用大小:", round(file.size(output_path) / 1024, 2), "KB\\n")`;
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-2">
              <span>模块 08 · 智能与体系</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              全流程导引：路径设置 → 读入 → 加工 → 写出
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
              <span>流水线映射复合方程：</span>
              <KatexMath math="\mathcal{F}_{\text{ETL}} = \mathcal{P}_{\text{Export}} \circ \mathcal{T}_{\text{Reshape}} \circ \mathcal{I}_{\text{Ingest}} \circ \mathcal{A}_{\text{Path}}" />
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              现代数据工程闭环状态机：从项目根目录锚定与存在性防御、格式解析与列类型规整，到内存清洗校验，最终以高性能压缩格式持久化写出。
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-mono font-bold text-indigo-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              当前执行节点: 步骤 {currentStep} / 4
            </span>
          </div>
        </div>
      </div>

      {/* 4-Step Interactive Pipeline Flow Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isCurrent = currentStep === s.num;
          const isPassed = currentStep > s.num;

          return (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? 'bg-indigo-50/70 border-indigo-500 shadow-xs ring-1 ring-indigo-500/20'
                  : isPassed
                  ? 'bg-white border-emerald-300 shadow-2xs'
                  : 'bg-white/60 border-slate-200 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isCurrent
                        ? 'bg-indigo-600 text-white'
                        : isPassed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    步骤 0{s.num}
                  </span>
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`} />
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900">{s.title}</h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">{s.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Step Configuration Detail Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              节点 0{currentStep} 参数配置与自检项：{STEPS[currentStep - 1].title}
            </h3>
          </div>
          <div className="flex gap-2">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer hover:bg-slate-50"
              >
                ← 上一步
              </button>
            )}
            {currentStep < 4 && (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium cursor-pointer"
              >
                下一步 →
              </button>
            )}
          </div>
        </div>

        {/* Dynamic content per step */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block">路径定位设置：</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pipelineState.useHere}
                  onChange={(e) => setPipelineState({ ...pipelineState, useHere: e.target.checked })}
                  className="rounded accent-indigo-600"
                />
                <span>使用 here 包自动探测项目根节点</span>
              </label>
              <div>
                <span className="text-slate-500 block">相对子目录 (Sub-directory)：</span>
                <input
                  type="text"
                  value={pipelineState.subDir}
                  onChange={(e) => setPipelineState({ ...pipelineState, subDir: e.target.value })}
                  className="w-full px-2.5 py-1 rounded border border-slate-300 font-mono mt-1"
                />
              </div>
              <div>
                <span className="text-slate-500 block">数据源文件名：</span>
                <input
                  type="text"
                  value={pipelineState.fileName}
                  onChange={(e) => setPipelineState({ ...pipelineState, fileName: e.target.value })}
                  className="w-full px-2.5 py-1 rounded border border-slate-300 font-mono mt-1"
                />
              </div>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-900">
              <span className="font-bold block">防御性编程检查清单 (Pre-flight Checklist)：</span>
              <ul className="space-y-1.5 text-[11px] list-disc list-inside">
                <li>已杜绝 Windows 单反斜杠 <code className="bg-emerald-100 px-1 rounded">\</code> 转义错误</li>
                <li>已加入 <code className="font-mono">file.exists()</code> 阻断式校验</li>
                <li>避免使用硬编码 <code className="font-mono">setwd("C:/Users/...")</code></li>
                <li>代码在不同协作者机器上保证 100% 可复现</li>
              </ul>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block">读入解析器选型：</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPipelineState({ ...pipelineState, engine: 'readr' })}
                  className={`py-1.5 rounded-lg border font-mono ${
                    pipelineState.engine === 'readr'
                      ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                      : 'bg-white text-slate-700'
                  }`}
                >
                  readr::read_csv
                </button>
                <button
                  onClick={() => setPipelineState({ ...pipelineState, engine: 'datatable' })}
                  className={`py-1.5 rounded-lg border font-mono ${
                    pipelineState.engine === 'datatable'
                      ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                      : 'bg-white text-slate-700'
                  }`}
                >
                  data.table::fread
                </button>
              </div>
              <span className="text-slate-500 text-[11px] block">
                已自动开启缺失值规范化: <code className="font-mono">na = c("", "NA", "NULL")</code>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">列类型显式规整规约：</span>
              <div className="font-mono text-[11px] text-slate-600 space-y-1 bg-white p-2.5 rounded border border-slate-200">
                <div>patient_id → <span className="text-indigo-600 font-bold">col_character()</span></div>
                <div>visit_date → <span className="text-indigo-600 font-bold">col_date("%Y-%m-%d")</span></div>
                <div>biomarker_a/b → <span className="text-emerald-600 font-bold">col_double()</span></div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block">内存加工策略：</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pipelineState.cleanNa}
                  onChange={(e) => setPipelineState({ ...pipelineState, cleanNa: e.target.checked })}
                  className="rounded accent-indigo-600"
                />
                <span>清洗并剔除主键为空的废弃观测行 (filter)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pipelineState.factorConvert}
                  onChange={(e) => setPipelineState({ ...pipelineState, factorConvert: e.target.checked })}
                  className="rounded accent-indigo-600"
                />
                <span>将实验分组转换为显式指定 Levels 的 Ordered Factor</span>
              </label>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">内存剖析器 (lobstr::obj_size)：</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                在内存加工阶段，严密监控对象体积。利用原生向量向量化运算代替 for 循环复制，降低 R 垃圾回收器 (gc) 停顿开销。
              </p>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block">持久化写出格式与压缩：</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPipelineState({ ...pipelineState, exportFormat: 'parquet' })}
                  className={`py-1.5 rounded-lg border font-mono ${
                    pipelineState.exportFormat === 'parquet'
                      ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                      : 'bg-white text-slate-700'
                  }`}
                >
                  .parquet (列式压缩)
                </button>
                <button
                  onClick={() => setPipelineState({ ...pipelineState, exportFormat: 'rds' })}
                  className={`py-1.5 rounded-lg border font-mono ${
                    pipelineState.exportFormat === 'rds'
                      ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                      : 'bg-white text-slate-700'
                  }`}
                >
                  .rds (R 原生保真)
                </button>
              </div>

              {pipelineState.exportFormat === 'parquet' && (
                <div>
                  <span className="text-slate-500 block mb-1">选择 Parquet 压缩器：</span>
                  <select
                    value={pipelineState.compression}
                    onChange={(e) => setPipelineState({ ...pipelineState, compression: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-slate-300 bg-white font-mono"
                  >
                    <option value="zstd">ZSTD (极佳压缩比)</option>
                    <option value="snappy">Snappy (极速)</option>
                    <option value="gzip">GZIP</option>
                  </select>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-900 space-y-1.5 text-xs">
              <span className="font-bold block">避坑提醒：</span>
              <p className="text-[11px] leading-relaxed">
                若需写出 CSV，务必显式声明 <code className="font-mono bg-white px-1 rounded">row.names = FALSE</code>，或者统一采用 <code className="font-mono bg-white px-1 rounded">readr::write_csv</code>，严防首列行名无标题导致的列错位生产事故。
              </p>
            </div>
          </div>
        )}

        {/* Complete pipeline code */}
        <CodeSnippet
          title="端到端完整 R 全流程工程代码"
          badge="一键部署"
          code={generateFullPipelineCode()}
        />
      </div>
    </div>
  );
};
