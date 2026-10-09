import React, { useState } from 'react';
import { CASE_STUDIES } from '../../data/cases';
import { CodeSnippet } from '../common/CodeSnippet';
import {
  Briefcase,
  Play,
  RotateCcw,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  FileCode2,
  Table,
  Terminal
} from 'lucide-react';

export const Module5CaseStudies: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case_financial_tick');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionCompleted, setExecutionCompleted] = useState<boolean>(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'r' | 'python'>('r');
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);

  const currentCase = CASE_STUDIES.find((c) => c.id === selectedCaseId) || CASE_STUDIES[0];

  const handleRunSimulation = () => {
    setIsRunning(true);
    setExecutionCompleted(false);
    setExecutionLogs([
      `[${new Date().toLocaleTimeString()}] 🚀 正在初始化案例运行环境: ${currentCase.title}...`,
      `[${new Date().toLocaleTimeString()}] 正在载入依赖包与数据通道...`
    ]);

    setTimeout(() => {
      setExecutionLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 正在分配内存与多线程流式缓冲区 (${currentCase.scale})...`
      ]);
    }, 600);

    setTimeout(() => {
      setExecutionLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 数据解析完成！吞吐速率: ${currentCase.metrics.throughput}`,
        `[${new Date().toLocaleTimeString()}] ✅ 任务顺利完成，加速比达到: ${currentCase.metrics.speedup}`
      ]);
      setIsRunning(false);
      setExecutionCompleted(true);
    }, 1400);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-2">
              <span>模块 05 · 工程实战</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              四大文件读写实战案例库 (Real-World Case Studies)
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              汇集金融量化高频 Tick 数据、生信多组学 Multi-Sheet Excel 批量合并、跨语言 R/Python Parquet 零拷贝共享与高并发轻量级 SQLite 数据库分块读写四大生产级工业案例。
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleRunSimulation}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                isRunning
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>正在模拟高速 I/O 中...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>一键模拟运行本案例</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Case Tabs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CASE_STUDIES.map((c, idx) => {
          const isSelected = c.id === selectedCaseId;
          return (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCaseId(c.id);
                setExecutionCompleted(false);
                setExecutionLogs([]);
                setActiveCodeTab('r');
              }}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-500 shadow-xs ring-1 ring-indigo-500/20'
                  : 'bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    案例 0{idx + 1}
                  </span>
                  <span className="text-[11px] text-slate-400">{c.industry}</span>
                </div>
                <h3 className={`text-xs font-bold leading-snug line-clamp-2 ${
                  isSelected ? 'text-indigo-950' : 'text-slate-800'
                }`}>
                  {c.title}
                </h3>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>{c.tag}</span>
                <span className="font-mono text-indigo-700 font-semibold">{c.scale.split('/')[0]}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Case Detail & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Background & Challenge & Performance Scorecard */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono">
                {currentCase.tag}
              </span>
              <span className="text-xs text-slate-500">{currentCase.industry}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{currentCase.title}</h3>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <div>
                <span className="font-bold text-slate-800">【业务背景】：</span>
                {currentCase.background}
              </div>
              <div>
                <span className="font-bold text-slate-800">【技术痛点】：</span>
                {currentCase.challenge}
              </div>
              <div>
                <span className="font-bold text-indigo-700">【方案架构】：</span>
                {currentCase.solutionSummary}
              </div>
            </div>
          </div>

          {/* Performance Scorecard */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              性能基准基线对比 (Benchmark Scorecard)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-mono">数据体量</span>
                <span className="text-sm font-bold font-mono text-slate-800 mt-1 block">
                  {currentCase.metrics.datasetRows}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-mono">I/O 吞吐速率</span>
                <span className="text-sm font-bold font-mono text-indigo-700 mt-1 block">
                  {currentCase.metrics.throughput}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-mono">压缩率 / 空间优化</span>
                <span className="text-sm font-bold font-mono text-emerald-700 mt-1 block">
                  {currentCase.metrics.compressionRatio}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-mono">综合性能提升</span>
                <span className="text-sm font-bold font-mono text-indigo-700 mt-1 block">
                  {currentCase.metrics.speedup}
                </span>
              </div>
            </div>
          </div>

          {/* Execution Console Logs */}
          {executionLogs.length > 0 && (
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-slate-200 font-mono text-xs shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2 mb-2">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  R 4.4 模拟执行终端日志
                </span>
                {executionCompleted && (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> 执行成功
                  </span>
                )}
              </div>
              {executionLogs.map((log, idx) => (
                <div key={idx} className="text-[11.5px] leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Code Viewer & Sample Data Inspector */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sample Data Table View */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-800">
                  真实结构化样例数据预览 (Head 5 Rows Preview)
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Tibble / Data Frame</span>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono">
                  <tr>
                    {Object.keys(currentCase.sampleData[0]).map((col) => (
                      <th key={col} className="px-3.5 py-2 font-bold">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {currentCase.sampleData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {Object.values(row).map((val: any, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 text-slate-700">
                          {typeof val === 'number' ? val.toLocaleString() : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Full Code Snippet with Language Switch */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-800">
                  生产级工程源码 (Production Implementation)
                </h4>
              </div>
              {currentCase.pythonCode && (
                <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setActiveCodeTab('r')}
                    className={`px-2.5 py-0.5 rounded cursor-pointer font-mono ${
                      activeCodeTab === 'r' ? 'bg-white font-bold text-indigo-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    R 语言源码
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('python')}
                    className={`px-2.5 py-0.5 rounded cursor-pointer font-mono ${
                      activeCodeTab === 'python' ? 'bg-white font-bold text-indigo-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Python (Polars 对接)
                  </button>
                </div>
              )}
            </div>

            {activeCodeTab === 'r' ? (
              <CodeSnippet
                title={`${currentCase.title} - R 实现`}
                badge="R 4.4 / Tidyverse / Arrow"
                code={currentCase.rCode}
              />
            ) : (
              <CodeSnippet
                title={`${currentCase.title} - Python Polars 零拷贝对接`}
                badge="Python 3.11 / Polars"
                language="Python"
                code={currentCase.pythonCode || ''}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
