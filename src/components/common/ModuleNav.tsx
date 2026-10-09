import React from 'react';
import { ModuleId } from '../../types';
import { MODULES_CONFIG } from '../../data/modulesMeta';
import {
  Network,
  FileText,
  FileSpreadsheet,
  Database,
  Briefcase,
  Terminal,
  BotMessageSquare,
  GitFork,
  DownloadCloud,
  BookOpenCheck
} from 'lucide-react';

interface ModuleNavProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Network,
  FileText,
  Sheet: FileSpreadsheet,
  Database,
  Briefcase,
  Terminal,
  BotMessageSquare,
  GitFork,
  DownloadCloud,
  BookOpenCheck
};

export const ModuleNav: React.FC<ModuleNavProps> = ({
  activeModule,
  onSelectModule
}) => {
  return (
    <div className="bg-slate-50/80 border-b border-slate-200/80 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              实验室核心切片矩阵 (10 大模块)
            </span>
            <span className="text-[11px] text-slate-400">
              · 按照现代数据工程流水线与代数模型编排
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
            <span>当前选中实验台</span>
          </div>
        </div>

        {/* 10 Slice Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5">
          {MODULES_CONFIG.map((mod) => {
            const Icon = ICON_MAP[mod.icon] || Network;
            const isActive = activeModule === mod.id;

            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className={`group text-left p-2.5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500/20'
                    : 'bg-white/70 hover:bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}
                    >
                      模块 {mod.index}
                    </span>
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors ${
                        isActive
                          ? 'text-indigo-600'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-xs font-bold leading-snug line-clamp-1 ${
                      isActive ? 'text-indigo-950' : 'text-slate-800'
                    }`}
                  >
                    {mod.title}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 group-hover:text-slate-500">
                  {mod.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
