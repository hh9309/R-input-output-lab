import React, { useState } from 'react';
import { ModuleId } from './types';
import { MODULES_CONFIG } from './data/modulesMeta';
import { Header } from './components/common/Header';
import { ModuleNav } from './components/common/ModuleNav';
import { FloatingAiAssistant } from './components/common/FloatingAiAssistant';

// The 10 Core Modules
import { Module1PathAlgebra } from './components/modules/Module1PathAlgebra';
import { Module2TextFormats } from './components/modules/Module2TextFormats';
import { Module3ComplexSpreadsheet } from './components/modules/Module3ComplexSpreadsheet';
import { Module4BinaryDatabase } from './components/modules/Module4BinaryDatabase';
import { Module5CaseStudies } from './components/modules/Module5CaseStudies';
import { Module6CodeEngine } from './components/modules/Module6CodeEngine';
import { Module7AiDiagnosis } from './components/modules/Module7AiDiagnosis';
import { Module8WorkflowGuide } from './components/modules/Module8WorkflowGuide';
import { Module9ExportEngine } from './components/modules/Module9ExportEngine';
import { Module10KnowledgeSlices } from './components/modules/Module10KnowledgeSlices';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('path_algebra');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);

  const activeModuleMeta =
    MODULES_CONFIG.find((m) => m.id === activeModule) || MODULES_CONFIG[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* 顶部导航 */}
      <Header
        activeModuleTitle={`模块 0${activeModuleMeta.index} · ${activeModuleMeta.title}`}
        onOpenAiDiagnosis={() => setIsAiDrawerOpen(true)}
        onJumpToKnowledge={() => setActiveModule('knowledge_slices')}
        onJumpToCodeEngine={() => setActiveModule('code_engine')}
      />

      {/* 10大核心模块切片矩阵导航 */}
      <ModuleNav
        activeModule={activeModule}
        onSelectModule={(id) => setActiveModule(id)}
      />

      {/* 模块主工作区 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeModule === 'path_algebra' && <Module1PathAlgebra />}
        {activeModule === 'text_io' && <Module2TextFormats />}
        {activeModule === 'spreadsheet_io' && <Module3ComplexSpreadsheet />}
        {activeModule === 'binary_db' && <Module4BinaryDatabase />}
        {activeModule === 'case_studies' && <Module5CaseStudies />}
        {activeModule === 'code_engine' && <Module6CodeEngine />}
        {activeModule === 'ai_diagnosis' && <Module7AiDiagnosis />}
        {activeModule === 'workflow_pipeline' && <Module8WorkflowGuide />}
        {activeModule === 'export_reports' && <Module9ExportEngine />}
        {activeModule === 'knowledge_slices' && <Module10KnowledgeSlices />}
      </main>

      {/* 随身 AI 诊断与答疑抽屉 */}
      <FloatingAiAssistant
        isOpen={isAiDrawerOpen}
        onOpen={() => setIsAiDrawerOpen(true)}
        onClose={() => setIsAiDrawerOpen(false)}
      />

      {/* 页脚 */}
      <footer className="mt-auto border-t border-slate-200/90 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif italic font-bold text-slate-800">R</span>
            <span>R语言数据文件的读写实验室 (R Data File I/O Lab) · 10大核心模块精炼切片</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>代数建模 · 列式存储 · 零拷贝 · 字符编码 · 智能随诊</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
