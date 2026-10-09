import React, { useState } from 'react';
import { CodeSnippet } from '../common/CodeSnippet';
import {
  FileSpreadsheet,
  Palette,
  Tags,
  Layers,
  Sparkles,
  Check,
  Eye
} from 'lucide-react';

export const Module3ComplexSpreadsheet: React.FC = () => {
  // Active sheet in multi-sheet preview
  const [activeSheet, setActiveSheet] = useState<'demographics' | 'biomarkers' | 'adverse_events'>('demographics');

  // openxlsx style customizer state
  const [headerBgColor, setHeaderBgColor] = useState<string>('#312E81'); // Indigo-900
  const [headerTextColor, setHeaderTextColor] = useState<string>('#FFFFFF');
  const [numFormat, setNumFormat] = useState<string>('currency'); // 'currency' | 'percent' | 'comma'
  const [freezeHeader, setFreezeHeader] = useState<boolean>(true);

  // haven SPSS label view mode
  const [spssDisplayMode, setSpssDisplayMode] = useState<'raw' | 'labeled' | 'factor'>('factor');

  // Sheet datasets
  const SHEET_DATA = {
    demographics: [
      { pid: 'PT_1001', age: 48, gender: '男', cohort: '实验组 A' },
      { pid: 'PT_1002', age: 62, gender: '女', cohort: '对照组 B' },
      { pid: 'PT_1003', age: 39, gender: '女', cohort: '实验组 A' },
      { pid: 'PT_1004', age: 55, gender: '男', cohort: '对照组 B' }
    ],
    biomarkers: [
      { pid: 'PT_1001', alt_u_l: 28.4, ast_u_l: 32.1, crp_mg_l: 1.85 },
      { pid: 'PT_1002', alt_u_l: 45.2, ast_u_l: 41.8, crp_mg_l: 4.20 },
      { pid: 'PT_1003', alt_u_l: 22.0, ast_u_l: 19.5, crp_mg_l: 0.92 },
      { pid: 'PT_1004', alt_u_l: 38.6, ast_u_l: 35.4, crp_mg_l: 2.10 }
    ],
    adverse_events: [
      { pid: 'PT_1001', event_name: '头晕 (Dizziness)', grade: 'Grade 1', outcome: '已缓解' },
      { pid: 'PT_1002', event_name: '皮疹 (Rash)', grade: 'Grade 2', outcome: '随访中' },
      { pid: 'PT_1003', event_name: '无不良事件', grade: 'None', outcome: '正常' },
      { pid: 'PT_1004', event_name: '胃部不适 (Nausea)', grade: 'Grade 1', outcome: '已缓解' }
    ]
  };

  // SPSS survey data mock with value labels
  const SPSS_MOCK_DATA = [
    { id: 1, gender: 1, educ: 2, satisfaction: 4, score: 85.5 },
    { id: 2, gender: 2, educ: 3, satisfaction: 5, score: 92.0 },
    { id: 3, gender: 1, educ: 1, satisfaction: 2, score: 64.0 },
    { id: 4, gender: 2, educ: 2, satisfaction: 3, score: 78.5 }
  ];

  const SPSS_VALUE_LABELS: Record<string, Record<number, string>> = {
    gender: { 1: '男 (Male)', 2: '女 (Female)' },
    educ: { 1: '高中及以下', 2: '大学本科', 3: '硕士及以上' },
    satisfaction: { 1: '非常不满意', 2: '比较不满意', 3: '基本中立', 4: '比较满意', 5: '非常满意' }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-2">
              <span>模块 03 · 格式实操</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              复杂电子表格 (Excel / SPSS / SAS) 读写与样式工程
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              全面贯通 <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono text-xs">readxl</code> (高性能只读)、
              <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono text-xs">openxlsx</code> (格式样式自定义与公式输出) 与
              <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono text-xs">haven</code> (SPSS .sav / SAS .sas7bdat 标签与分类因子转换)。
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
            <span className="font-mono text-indigo-700 font-bold">readxl + openxlsx + haven</span>
          </div>
        </div>
      </div>

      {/* 3.1 2D 动态演示：多 Sheet 结构浏览与 purrr 管道合并 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              3.1 多 Sheet 动态页签浏览与合并
            </h3>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <span className="text-slate-500 text-[11px] px-1 hidden sm:inline">工作簿切片：</span>
            {[
              { id: 'demographics', label: 'Sheet 1: 临床信息' },
              { id: 'biomarkers', label: 'Sheet 2: 生化指标' },
              { id: 'adverse_events', label: 'Sheet 3: 不良反应' }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSheet(s.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeSheet === s.id
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2D Sheet Grid View */}
        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="font-mono font-semibold">clinical_trials_2026.xlsx [{activeSheet}]</span>
            </div>
            <span className="text-[11px] text-slate-400">readxl::read_excel(path, sheet = "{activeSheet}")</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono">
                <tr>
                  <th className="px-4 py-2.5 w-12 text-slate-400 text-center font-normal">#</th>
                  {Object.keys(SHEET_DATA[activeSheet][0]).map((col) => (
                    <th key={col} className="px-4 py-2.5 font-bold uppercase tracking-wider text-slate-800">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {SHEET_DATA[activeSheet].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 text-slate-400 text-center select-none bg-slate-50/50">{idx + 1}</td>
                    {Object.values(row).map((val: any, colIdx) => (
                      <td key={colIdx} className="px-4 py-2 text-slate-700">
                        {typeof val === 'number' ? val.toFixed(2) : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <CodeSnippet
          title="使用 readxl + purrr 自动遍历所有 Sheet 批量合并 R 脚本"
          badge="purrr::map_dfr 范式"
          code={`library(readxl)
library(purrr)
library(dplyr)

file_path <- here::here("data", "clinical_trials_2026.xlsx")

# 1. 获取工作簿包含的全部 Sheet 名称清单
all_sheets <- readxl::excel_sheets(file_path)
cat("Sheet 清单:", paste(all_sheets, collapse = ", "), "\\n")

# 2. 批量读取各表并打上 sheet 来源标签 (返回整洁列表)
sheets_list <- purrr::map(all_sheets, function(s) {
  readxl::read_excel(file_path, sheet = s)
})
names(sheets_list) <- all_sheets

# 3. 按 PID 主键将多表做内联对齐 (Join)
master_dataset <- sheets_list$demographics |>
  left_join(sheets_list$biomarkers, by = "pid") |>
  left_join(sheets_list$adverse_events, by = "pid")`}
        />
      </div>

      {/* 3.2 openxlsx 样式定制与专业报表写出沙盒 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              3.2 openxlsx 报表视觉样式定制器 (Styling Engine)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            openxlsx::createStyle() + addStyle()
          </span>
        </div>

        {/* Styling controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">表头填充背景色：</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={headerBgColor}
                onChange={(e) => setHeaderBgColor(e.target.value)}
                className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
              />
              <span className="font-mono text-slate-700">{headerBgColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">表头文字颜色：</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={headerTextColor}
                onChange={(e) => setHeaderTextColor(e.target.value)}
                className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
              />
              <span className="font-mono text-slate-700">{headerTextColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">数值格式 (NumberFormat)：</label>
            <select
              value={numFormat}
              onChange={(e) => setNumFormat(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
            >
              <option value="currency">货币 ($#,##0.00)</option>
              <option value="comma">千分位 (4 位小数 #,##0.0000)</option>
              <option value="percent">百分比 (0.00%)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">工作表视图设置：</label>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={freezeHeader}
                onChange={(e) => setFreezeHeader(e.target.checked)}
                className="rounded accent-indigo-600"
              />
              <span className="text-slate-700">冻结首行 (freezePane)</span>
            </label>
          </div>
        </div>

        {/* Live Preview Styled Excel */}
        <div className="rounded-xl border border-slate-300 overflow-hidden shadow-xs">
          <div className="bg-slate-200 px-3 py-1.5 text-[11px] font-mono text-slate-600 border-b border-slate-300">
            📊 Excel 渲染预览 (基于 openxlsx 样式规则)
          </div>
          <table className="w-full text-xs text-left">
            <thead>
              <tr style={{ backgroundColor: headerBgColor, color: headerTextColor }}>
                <th className="px-4 py-2.5 font-bold border-r border-slate-400/40">指标项 (Item)</th>
                <th className="px-4 py-2.5 font-bold border-r border-slate-400/40">实验组均值</th>
                <th className="px-4 py-2.5 font-bold border-r border-slate-400/40">对照组均值</th>
                <th className="px-4 py-2.5 font-bold">格式化输出预览</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono bg-white">
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-medium text-slate-900 border-r border-slate-200">ALT 谷丙转氨酶</td>
                <td className="px-4 py-2 text-slate-700 border-r border-slate-200">28.4500</td>
                <td className="px-4 py-2 text-slate-700 border-r border-slate-200">45.2100</td>
                <td className="px-4 py-2 font-bold text-indigo-700">
                  {numFormat === 'currency' ? '$28.45' : numFormat === 'percent' ? '28.45%' : '28.4500'}
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-medium text-slate-900 border-r border-slate-200">AST 谷草转氨酶</td>
                <td className="px-4 py-2 text-slate-700 border-r border-slate-200">32.1200</td>
                <td className="px-4 py-2 text-slate-700 border-r border-slate-200">41.8000</td>
                <td className="px-4 py-2 font-bold text-indigo-700">
                  {numFormat === 'currency' ? '$32.12' : numFormat === 'percent' ? '32.12%' : '32.1200'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeSnippet
          title="openxlsx 样式注入与导出完整 R 脚本"
          badge="openxlsx 样式工程"
          code={`library(openxlsx)

# 1. 实例化工作簿
wb <- createWorkbook()
addWorksheet(wb, "Clinical_Report")

# 2. 创建自定义表头样式 (Header Style)
header_style <- createStyle(
  fgFill = "${headerBgColor}",
  fontColour = "${headerTextColor}",
  textDecoration = "bold",
  halign = "center",
  border = "TopBottomLeftRight",
  borderColour = "#CBD5E1"
)

# 3. 创建数字格式样式
num_style <- createStyle(
  numFmt = "${numFormat === 'currency' ? '$#,##0.00' : numFormat === 'percent' ? '0.00%' : '#,##0.0000'}"
)

# 4. 写入数据并应用样式
writeData(wb, sheet = "Clinical_Report", x = report_df, startRow = 1, startCol = 1)
addStyle(wb, sheet = "Clinical_Report", style = header_style, rows = 1, cols = 1:4, gridExpand = TRUE)
addStyle(wb, sheet = "Clinical_Report", style = num_style, rows = 2:(nrow(report_df) + 1), cols = 2:4, gridExpand = TRUE)

${freezeHeader ? '# 5. 冻结表头首行\nfreezePane(wb, sheet = "Clinical_Report", firstRow = TRUE)' : ''}

# 6. 保存工作簿
saveWorkbook(wb, "styled_report.xlsx", overwrite = TRUE)`}
        />
      </div>

      {/* 3.3 haven SPSS/SAS 标签与 R 对象的映射转换 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Tags className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              3.3 haven 处理 SPSS / SAS 标签与分类因子转换演播
            </h3>
          </div>
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSpssDisplayMode('raw')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer font-mono ${
                spssDisplayMode === 'raw' ? 'bg-white font-bold text-indigo-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              原始数值编码 (Raw 1,2,3)
            </button>
            <button
              onClick={() => setSpssDisplayMode('labeled')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer font-mono ${
                spssDisplayMode === 'labeled' ? 'bg-white font-bold text-indigo-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              haven::labelled 标签类
            </button>
            <button
              onClick={() => setSpssDisplayMode('factor')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer font-mono ${
                spssDisplayMode === 'factor' ? 'bg-white font-bold text-indigo-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              haven::as_factor() 转换后
            </button>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <span className="font-semibold text-slate-700">变量名标签 (Variable Label) 注解：</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 font-mono text-[11px] text-slate-600">
            <div className="p-2 bg-white rounded border border-slate-200">
              <span className="text-indigo-600 font-bold">gender:</span> "被试受访者生理性别"
            </div>
            <div className="p-2 bg-white rounded border border-slate-200">
              <span className="text-indigo-600 font-bold">educ:</span> "最高受教育程度层次"
            </div>
            <div className="p-2 bg-white rounded border border-slate-200">
              <span className="text-indigo-600 font-bold">satisfaction:</span> "服务满意度 5 级量表评分"
            </div>
          </div>
        </div>

        {/* Data table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">gender (性别)</th>
                <th className="px-4 py-2">educ (受教育水平)</th>
                <th className="px-4 py-2">satisfaction (满意度)</th>
                <th className="px-4 py-2">score (综合得分)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {SPSS_MOCK_DATA.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-500">{r.id}</td>
                  <td className="px-4 py-2 text-slate-800">
                    {spssDisplayMode === 'raw' ? r.gender : SPSS_VALUE_LABELS.gender[r.gender]}
                  </td>
                  <td className="px-4 py-2 text-slate-800">
                    {spssDisplayMode === 'raw' ? r.educ : SPSS_VALUE_LABELS.educ[r.educ]}
                  </td>
                  <td className="px-4 py-2 text-slate-800">
                    {spssDisplayMode === 'raw' ? r.satisfaction : SPSS_VALUE_LABELS.satisfaction[r.satisfaction]}
                  </td>
                  <td className="px-4 py-2 font-bold text-emerald-700">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CodeSnippet
          title="haven 读取 SPSS .sav / SAS .sas7bdat 并处理标签的核心范式"
          badge="haven 标签转换"
          code={`library(haven)
library(dplyr)

# 1. 读入 SPSS 数据 (保留 variable.labels 与 value.labels)
spss_data <- haven::read_sav("survey_2026.sav")

# 2. 查看变量元数据标签 (Variable Labels)
attr(spss_data$satisfaction, "label") # "服务满意度 5 级量表评分"

# 3. 将值标签 (Value Labels) 转换为 R 的原生有序因子 Factor
tidy_survey <- spss_data |>
  mutate(
    # as_factor 会自动将数字 1, 2, 3 映射为 "非常不满意", "比较不满意"...
    satisfaction = haven::as_factor(satisfaction, ordered = TRUE),
    gender = haven::as_factor(gender),
    educ = haven::as_factor(educ)
  )

# 4. 写出为 SAS 格式 (.sas7bdat 对应 write_sas)
haven::write_sav(tidy_survey, "clean_survey_with_labels.sav")`}
        />
      </div>
    </div>
  );
};
