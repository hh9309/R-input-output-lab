import React, { useState } from 'react';
import { KNOWLEDGE_SLICES, QUIZ_QUESTIONS } from '../../data/knowledge';
import { CodeSnippet } from '../common/CodeSnippet';
import {
  BookOpenCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Award,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const Module10KnowledgeSlices: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'slices' | 'quiz'>('slices');
  const [expandedSliceId, setExpandedSliceId] = useState<string>('slice_1');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct += 1;
      }
    });
    return Math.round((correct / QUIZ_QUESTIONS.length) * 100);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmittedQuiz(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-2">
              <span>模块 10 · 基础与建模</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              R 语言数据文件读写与工作路径知识导引 (五大精炼切片)
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              淡雅大方的切片式认知框架：涵盖工作路径转义机理、格式选型三维矩阵、三大读写陷阱、跨版本兼容性，以及 R 包多源安装生态与全局环境调优，配套交互式答题挑战。
            </p>
          </div>
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs self-start md:self-auto">
            <button
              onClick={() => setActiveTab('slices')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                activeTab === 'slices' ? 'bg-white text-indigo-700 font-bold shadow-2xs' : 'text-slate-600'
              }`}
            >
              五大核心切片
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                activeTab === 'quiz' ? 'bg-white text-indigo-700 font-bold shadow-2xs' : 'text-slate-600'
              }`}
            >
              读写自测挑战
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'slices' ? (
        <div className="space-y-4">
          {KNOWLEDGE_SLICES.map((slice) => {
            const isExpanded = expandedSliceId === slice.id;

            return (
              <div
                key={slice.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
              >
                {/* Slice Header Button */}
                <button
                  onClick={() => setExpandedSliceId(isExpanded ? '' : slice.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-center text-xs font-mono font-bold px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {slice.sliceNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                          {slice.title}
                        </h3>
                        <span className="text-[11px] px-2 py-0.2 rounded bg-slate-100 text-slate-600 font-sans hidden sm:inline">
                          {slice.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{slice.summary}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-xs hidden sm:inline">{isExpanded ? '收起切片' : '展开深研'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Slice Expanded Body */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-100 space-y-4">
                    {/* Theory Points */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 mt-4">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        理论推导与底层机制 (Core Mechanism)
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                        {slice.theory.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Code Contrast: Bad vs Good */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{slice.codeContrast.badLabel}</span>
                        </div>
                        <CodeSnippet
                          title="高危代码模式"
                          badge="警惕反模式"
                          code={slice.codeContrast.badCode}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{slice.codeContrast.goodLabel}</span>
                        </div>
                        <CodeSnippet
                          title="工业级安全范式"
                          badge="金标准"
                          code={slice.codeContrast.goodCode}
                        />
                      </div>
                    </div>

                    {/* Key Takeaway Card */}
                    <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 text-xs text-indigo-900 flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <span className="font-bold">【切片总结金律】：</span>
                        <span>{slice.keyTakeaway}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Quiz View
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                R 语言数据读写与工作路径实战能力自测 (5 道挑战题)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                覆盖 Windows 路径反斜杠转义、row.names 列错位、Arrow 列式存储与中文 GBK 乱码
              </p>
            </div>
            {submittedQuiz ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-indigo-700 font-mono">
                  得分：{calculateScore()} / 100 分
                </span>
                <button
                  onClick={handleResetQuiz}
                  className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold cursor-pointer hover:bg-slate-50"
                >
                  重新测验
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSubmittedQuiz(true)}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                交卷评分并查看深度解析
              </button>
            )}
          </div>

          <div className="space-y-6">
            {QUIZ_QUESTIONS.map((q, idx) => {
              const selectedOpt = selectedAnswers[q.id];
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div key={q.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                  <div className="flex items-start gap-2 text-xs font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[11px]">
                      第 0{idx + 1} 题
                    </span>
                    <span className="leading-relaxed">{q.question}</span>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selectedOpt === optIdx;
                      let optionStyle = 'bg-white border-slate-200 hover:border-slate-300 text-slate-700';

                      if (submittedQuiz) {
                        if (optIdx === q.correctIndex) {
                          optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                        } else if (isOptionSelected && !isCorrect) {
                          optionStyle = 'bg-red-50 border-red-500 text-red-900';
                        }
                      } else if (isOptionSelected) {
                        optionStyle = 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full p-2.5 rounded-lg border text-xs text-left transition-all cursor-pointer flex items-center justify-between ${optionStyle}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-400 text-[11px]">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span>{opt}</span>
                          </div>
                          {submittedQuiz && optIdx === q.correctIndex && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {submittedQuiz && isOptionSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {submittedQuiz && (
                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                      <span className="font-bold text-indigo-700 block">【名师深度解析】：</span>
                      <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
