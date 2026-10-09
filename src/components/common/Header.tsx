import React from 'react';
import { Database, Bot, BookOpen, Sparkles, Terminal } from 'lucide-react';

interface HeaderProps {
  activeModuleTitle: string;
  onOpenAiDiagnosis: () => void;
  onJumpToKnowledge: () => void;
  onJumpToCodeEngine: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModuleTitle,
  onOpenAiDiagnosis,
  onJumpToKnowledge,
  onJumpToCodeEngine
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Lab Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-800 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5">
            <span className="font-serif font-black text-xl italic tracking-tight">R</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                R语言数据文件的读写实验室
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 hidden sm:inline-block">
                  I/O Lab · 10大核心模块
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-sans tracking-normal">
              R Data File I/O Laboratory · 路径代数 · 列式计算 · 格式工程
            </p>
          </div>
        </div>

        {/* Current Module & Fast Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400">当前模块：</span>
            <span className="font-semibold text-slate-800">{activeModuleTitle}</span>
          </div>

          <button
            onClick={onJumpToCodeEngine}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer"
            title="直达代码引擎"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">代码引擎</span>
          </button>

          <button
            onClick={onJumpToKnowledge}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer"
            title="浏览知识切片"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">知识切片</span>
          </button>

          {/* AI Diagnosis CTA */}
          <button
            onClick={onOpenAiDiagnosis}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span>AI 随诊答疑</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/50 text-indigo-100 font-mono">
              Q&A
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
