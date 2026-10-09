import React, { useState, useEffect } from 'react';
import { CodeSnippet } from '../common/CodeSnippet';
import { LlmSettingsModal } from '../common/LlmSettingsModal';
import {
  LlmConfig,
  getStoredLlmConfig,
  hasConfiguredApiKey,
  executeLlmCall
} from '../../services/llmService';
import {
  BotMessageSquare,
  AlertTriangle,
  Send,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  FileCode,
  ShieldAlert,
  Flame,
  FileQuestion,
  Settings,
  Key,
  Cpu,
  Lock
} from 'lucide-react';

export const Module7AiDiagnosis: React.FC = () => {
  // Preset or custom error input
  const [selectedPreset, setSelectedPreset] = useState<string>('path_not_found');
  const [customError, setCustomError] = useState<string>('');
  const [userCode, setUserCode] = useState<string>('df <- read.csv("data/clinical_samples.csv")');

  // LLM Config & Settings Modal State
  const [llmConfig, setLlmConfig] = useState<LlmConfig>(getStoredLlmConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsNotice, setSettingsNotice] = useState<string>('');

  // Diagnosis Response State
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnosisData, setDiagnosisData] = useState<{
    title: string;
    analysis?: string;
    rFix?: string;
    advice?: string;
    content?: string;
    aiGenerated?: boolean;
    mode?: string;
  } | null>(null);

  // Chat Q&A State
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'chat'>('diagnosis');
  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string; model?: string }>>([
    {
      sender: 'ai',
      text: '您好！我是 R 语言数据文件读写实验室的随身 AI 专家顾问。针对工作路径、read.csv、fread、Parquet 零拷贝、中文字符乱码或内存溢出 (OOM) 报错，随时向我提问！\n\n💡 提示：本项目支持直接部署至 GitHub 纯前端运行。请点击标题右侧的小齿轮 ⚙️ 手工输入并确认 API-Key 后方可调用大模型。'
    }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Sync stored config on mount & modal close
  useEffect(() => {
    setLlmConfig(getStoredLlmConfig());
  }, []);

  // 4 Core Fatal Error Presets
  const PRESET_ERRORS = [
    {
      id: 'path_not_found',
      title: '找不到文件 (No such file)',
      tag: '工作路径偏离',
      icon: FileQuestion,
      errorMsg: 'cannot open file "data/clinical_samples.csv": No such file or directory',
      sampleCode: 'df <- read.csv("data/clinical_samples.csv")'
    },
    {
      id: 'backslash_escape',
      title: 'Windows 反斜杠转义异常',
      tag: '语法解析崩溃',
      icon: AlertTriangle,
      errorMsg: "Error: '\\U' used without hex digits in character string starting \"'C:\\Users\\...\"",
      sampleCode: 'df <- read.csv("C:\\Users\\Analyst\\Data\\samples.csv")'
    },
    {
      id: 'oom_memory',
      title: '内存溢出 (OOM)',
      tag: '堆内存枯竭',
      icon: Flame,
      errorMsg: 'Error: cannot allocate vector of size 4.8 Gb in memory',
      sampleCode: 'huge_df <- read.csv("10gb_financial_ticks.csv")'
    },
    {
      id: 'encoding_mojibake',
      title: '中文字符乱码 (锟斤拷)',
      tag: 'GBK/UTF-8 冲突',
      icon: ShieldAlert,
      errorMsg: '读取中文 CSV 后姓名列显示为 "锟斤拷" 或 "\\xd5\\xc5\\xc8\\xfd"',
      sampleCode: 'chinese_df <- read.csv("hospital_records_gbk.csv")'
    }
  ];

  const handleSelectPreset = (p: typeof PRESET_ERRORS[0]) => {
    setSelectedPreset(p.id);
    setCustomError(p.errorMsg);
    setUserCode(p.sampleCode);
    handleTriggerDiagnosis(p.id, p.errorMsg, p.sampleCode);
  };

  const handleTriggerDiagnosis = async (
    errType: string = selectedPreset,
    errMsg: string = customError,
    code: string = userCode
  ) => {
    // 强制检查：所有大模型调用必须输入 API-Key 后才能调用
    if (!hasConfiguredApiKey()) {
      setSettingsNotice('项目要部署到 GitHub 浏览器调用，所有大模型调用必须输入 API-Key 后方可调用。请手工输入并确认您的 API-Key。');
      setIsSettingsOpen(true);
      return;
    }

    setLoading(true);
    setDiagnosisData(null);

    const prompt = `你是一位精通 R 语言底层 I/O、路径解析机制、C 级内存管理及跨平台工程实践的资深 R 架构师。
请针对用户在使用 R 语言进行数据文件读写时发生的以下错误与上下文进行深度专业诊断：

【错误类型/标签】：${errType || '通用 I/O 故障'}
【用户代码/上下文】：${code || '未提供代码'}
【具体错误提示】：${errMsg || '未提供详细报错'}
【当前实验上下文】：R Data File I/O Lab

请输出结构化诊断建议，格式必须包含：
1. 【故障核心病因分析】：形式化/底层原理分析（包括工作目录解析、转义机制、编码流、或者内存分配 Vcells 等）
2. 【可立即执行的 R 修复代码】：给出规范、健壮的 R 解决方案代码（包含防御性编程、here/readr/arrow 等现代方案）
3. 【工程化规避建议与最佳实践】：给出一条防止再犯的金牌准则。

语言风格：淡雅、学术、严谨、条理清晰，使用简体中文。`;

    try {
      const result = await executeLlmCall(
        prompt,
        '你是一个专业的R语言数据工程与高性能I/O诊断专家。',
        llmConfig
      );

      setDiagnosisData({
        title: `AI 智能随诊结果 (${result.model})`,
        content: result.content,
        aiGenerated: true,
        mode: result.model
      });
    } catch (err: any) {
      console.error('Diagnosis LLM Error:', err);
      if (err.message === 'API_KEY_REQUIRED') {
        setSettingsNotice('请先输入并确认有效的 API-Key 后再发起诊断。');
        setIsSettingsOpen(true);
      } else {
        setDiagnosisData({
          title: `诊断请求提示 (${llmConfig.model})`,
          content: `⚠️ 调用大模型接口返回异常: ${err.message || '网络连接或 API-Key 校验失败'}。\n\n请点击标题右侧的小齿轮 ⚙️ 检查您的 API-Key 是否正确无误，或尝试切换大模型（gemini 3 flash / deepseek-v4-pro）。`,
          aiGenerated: false
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;

    // 强制检查：所有大模型调用必须输入 API-Key 后才能调用
    if (!hasConfiguredApiKey()) {
      setSettingsNotice('项目要部署到 GitHub 浏览器调用，所有大模型调用必须输入 API-Key 后方可调用。请手工输入并确认您的 API-Key。');
      setIsSettingsOpen(true);
      return;
    }

    const q = chatInput.trim();
    setChatInput('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: q }]);
    setChatLoading(true);

    const prompt = `你是“R语言数据文件的读写实验室 (R Data File I/O Lab)”的随身 AI 专家顾问。
请解答用户关于 R 语言文件读写、工作路径、各种数据格式（CSV/TSV, Excel, SPSS/haven, RDS, Parquet, SQLite）的疑问。
用户提问：${q}
请使用学术淡雅、清晰专业的简体中文回答，提供规范的代码示例与底层原理剖析。`;

    try {
      const result = await executeLlmCall(
        prompt,
        '你是一个专业的R语言数据工程与高性能I/O诊断专家。',
        llmConfig
      );

      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: result.content,
          model: result.model
        }
      ]);
    } catch (err: any) {
      console.error('Chat LLM Error:', err);
      if (err.message === 'API_KEY_REQUIRED') {
        setSettingsNotice('请先输入并确认有效的 API-Key 后再发起提问。');
        setIsSettingsOpen(true);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ 调用 ${llmConfig.model} 失败: ${err.message || '请检查 API-Key 或网络连接'}。您可以点击标题右侧小齿轮 ⚙️ 重新核验 API-Key。`
          }
        ]);
      }
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Modal */}
      <LlmSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        requiredNotice={settingsNotice}
        onSaved={(newCfg) => {
          setLlmConfig(newCfg);
          setSettingsNotice('');
        }}
      />

      {/* Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-2">
              <span>模块 07 · 智能与体系</span>
            </div>

            {/* Title with Gear Settings Icon on the far right */}
            <div className="flex items-center flex-wrap gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                AI 诊断与大模型 Q&A 随诊 (AI Diagnostics & Copilot)
              </h2>

              {/* 小齿轮设置大模型图标 */}
              <button
                onClick={() => {
                  setSettingsNotice('');
                  setIsSettingsOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 shadow-2xs transition-all cursor-pointer group"
                title="设置大模型与手工输入 API-Key"
              >
                <Settings className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 group-hover:rotate-90 transition-all duration-300" />
                <span className="text-xs font-mono font-bold text-slate-700 group-hover:text-indigo-600">
                  {llmConfig.model}
                </span>
                {llmConfig.isConfirmed && llmConfig.apiKey ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="API-Key 已确认" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" title="未配置 API-Key" />
                )}
              </button>
            </div>

            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              支持直接部署至 GitHub 纯静态运行。支持选择 <span className="font-semibold text-slate-800">gemini 3 flash</span> 与 <span className="font-semibold text-slate-800">deepseek-v4-pro</span>，手工输入 API-Key 后浏览器跨域直调，随身动态诊断“找不到文件”、“反斜杠转义异常”、“内存溢出 (OOM)”与“中文字符乱码”。
            </p>
          </div>

          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs self-start md:self-auto">
            <button
              onClick={() => setActiveTab('diagnosis')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                activeTab === 'diagnosis' ? 'bg-white text-indigo-700 font-bold shadow-2xs' : 'text-slate-600'
              }`}
            >
              致命故障智能随诊
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                activeTab === 'chat' ? 'bg-white text-indigo-700 font-bold shadow-2xs' : 'text-slate-600'
              }`}
            >
              自由交互 Q&A
            </button>
          </div>
        </div>

        {/* Global Key Status Bar */}
        {(!llmConfig.apiKey || !llmConfig.isConfirmed) && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50/90 border border-amber-300/80 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>GitHub 浏览器调用提示：</strong>所有大模型调用必须输入 API-Key 后方可调用。当前尚未配置。
              </span>
            </div>
            <button
              onClick={() => {
                setSettingsNotice('项目要部署到 GitHub 浏览器调用，所有大模型调用必须输入 API-Key 后才能调用。');
                setIsSettingsOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs self-start sm:self-auto cursor-pointer transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>设置并确认 API-Key</span>
            </button>
          </div>
        )}
      </div>

      {activeTab === 'diagnosis' ? (
        <div className="space-y-5">
          {/* 4 Fatal Error Quick Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_ERRORS.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-500 shadow-xs ring-1 ring-indigo-500/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {p.tag}
                      </span>
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{p.title}</h4>
                  </div>
                  <span className="text-[11px] text-indigo-600 font-medium mt-2">
                    点击载入并诊断 →
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Diagnosis Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  用户 R 代码片段 (Code Context)：
                </label>
                <textarea
                  rows={3}
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="请输入导致报错的 R 语言代码..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  控制台具体报错信息 (Console Error Log)：
                </label>
                <textarea
                  rows={3}
                  value={customError}
                  onChange={(e) => setCustomError(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none text-red-600"
                  placeholder="例如: cannot open file ... No such file or directory"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span>调用引擎: <strong>{llmConfig.model}</strong></span>
                {!hasConfiguredApiKey() && (
                  <span className="text-amber-600">(需先配置 API-Key)</span>
                )}
              </div>

              <button
                onClick={() => handleTriggerDiagnosis(selectedPreset, customError, userCode)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>大模型正在深度诊断中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>启动 AI 智能诊断分析</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Diagnosis Result Card */}
          {diagnosisData && (
            <div className="bg-white p-5 rounded-2xl border border-indigo-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {diagnosisData.title}
                  </h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {diagnosisData.mode || llmConfig.model}
                </span>
              </div>

              {diagnosisData.content ? (
                <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {diagnosisData.content}
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-indigo-900 block">【故障核心病因分析】：</span>
                    <p className="text-slate-700 leading-relaxed">{diagnosisData.analysis}</p>
                  </div>

                  {diagnosisData.rFix && (
                    <div>
                      <span className="font-bold text-slate-900 block mb-1.5">【可立即执行的 R 修复代码】：</span>
                      <CodeSnippet
                        title="标准防御性修复代码"
                        badge="工业级规范"
                        code={diagnosisData.rFix}
                      />
                    </div>
                  )}

                  {diagnosisData.advice && (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed font-medium">
                      {diagnosisData.advice}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Chat Tab
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between px-2 text-xs text-slate-500 border-b border-slate-100 pb-2">
            <span className="flex items-center gap-1 font-mono">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              当前对话模型: <strong className="text-slate-800">{llmConfig.model}</strong>
            </span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>切换模型或更改 Key</span>
            </button>
          </div>

          <div className="h-[360px] overflow-y-auto space-y-3 p-3 bg-slate-50/60 rounded-xl border border-slate-200">
            {chatHistory.map((item, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${
                  item.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {item.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-xl whitespace-pre-wrap font-sans ${
                    item.sender === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                  }`}
                >
                  {item.text}
                  {item.model && (
                    <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                      via {item.model}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-2 items-center text-xs text-slate-500 italic p-2">
                <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>{llmConfig.model} 正在推导演导解答...</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder={
                hasConfiguredApiKey()
                  ? `向 ${llmConfig.model} 提问任何关于 R 语言文件读写、工作路径、Parquet 或编码的问题...`
                  : '⚠️ 请先点击右上角小齿轮输入并确认 API-Key 后再提问...'
              }
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSendChat}
              disabled={chatLoading || !chatInput.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              发送提问
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
