import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Settings,
  Key,
  Lock,
  Cpu
} from 'lucide-react';
import { LlmSettingsModal } from './LlmSettingsModal';
import {
  LlmConfig,
  getStoredLlmConfig,
  hasConfiguredApiKey,
  executeLlmCall
} from '../../services/llmService';

interface FloatingAiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const FloatingAiAssistant: React.FC<FloatingAiAssistantProps> = ({
  isOpen,
  onClose,
  onOpen
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'chat'>('quick');
  const [chatInput, setChatInput] = useState<string>('');
  const [llmConfig, setLlmConfig] = useState<LlmConfig>(getStoredLlmConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsNotice, setSettingsNotice] = useState<string>('');

  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; model?: string }>>([
    {
      sender: 'ai',
      text: '您好！我是 R 语言 I/O 实验室随身 AI 助理。遇到任何路径错误 (No such file)、Windows 反斜杠转义、OOM 内存溢出或中文乱码问题，随时向我提问！\n\n💡 提示：本项目支持直接部署至 GitHub 纯前端运行。请点击右上角小齿轮 ⚙️ 手工输入并确认 API-Key 后方可调用大模型。'
    }
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLlmConfig(getStoredLlmConfig());
    }
  }, [isOpen]);

  const QUICK_TOPICS = [
    {
      q: '为什么我的 read.csv 提示 No such file or directory？',
      fix: `getwd() # 查看当前根目录
here::here("data", "my_file.csv") # 项目级根目录安全定位`
    },
    {
      q: 'Windows 路径反斜杠 \\ 报错 \\U used without hex digits？',
      fix: `# 在 R 中将所有反斜杠 \\ 统一替换为正斜杠 /
df <- read.csv("C:/Projects/Data/test.csv")`
    },
    {
      q: '中文 CSV 导入后名字全变成 "锟斤拷"？',
      fix: `# 指定源编码为 GBK
readr::read_csv("data.csv", locale = locale(encoding = "GBK"))`
    },
    {
      q: '数据量太大导致 cannot allocate vector of size ...？',
      fix: `# 改用 data.table 多线程或 arrow 零拷贝
library(arrow)
df <- read_parquet("huge_data.parquet")`
    }
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || chatInput.trim();
    if (!textToSend || loading) return;

    // 检查 API-Key
    if (!hasConfiguredApiKey()) {
      setSettingsNotice('项目要部署到 GitHub 浏览器调用，所有大模型调用必须输入 API-Key 后才能调用。请先输入并确认 API-Key。');
      setIsSettingsOpen(true);
      return;
    }

    if (!questionText) setChatInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setLoading(true);

    const prompt = `你是“R语言数据文件的读写实验室 (R Data File I/O Lab)”的随身 AI 专家顾问。
用户提问：${textToSend}
请提供简明扼要、准确的 R 解决方案代码与底层原因分析。`;

    try {
      const res = await executeLlmCall(
        prompt,
        '你是一个专业的R语言数据工程与高性能I/O诊断专家。',
        llmConfig
      );
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.content,
          model: res.model
        }
      ]);
    } catch (e: any) {
      if (e.message === 'API_KEY_REQUIRED') {
        setSettingsNotice('请先输入并确认有效的 API-Key 后再发起提问。');
        setIsSettingsOpen(true);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ 调用大模型 (${llmConfig.model}) 异常: ${e.message || '请检查 API-Key 或网络连接'}。可点击上方小齿轮重新设置。`
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Settings Modal */}
      <LlmSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        requiredNotice={settingsNotice}
        onSaved={(cfg) => {
          setLlmConfig(cfg);
          setSettingsNotice('');
        }}
      />

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="打开 AI 随诊助理"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-tight">AI 随诊专家</span>
        </button>
      )}

      {/* Slide-out Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold">AI 智能随诊顾问</h3>
                  <button
                    onClick={() => {
                      setSettingsNotice('');
                      setIsSettingsOpen(true);
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono"
                    title="设置大模型与手工输入 API-Key"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>{llmConfig.model}</span>
                    {llmConfig.isConfirmed && llmConfig.apiKey ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">R Data File I/O 专家诊断引擎 · GitHub 浏览器直调</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Tabs */}
          <div className="flex border-b border-slate-200 text-xs bg-slate-50">
            <button
              onClick={() => setActiveTab('quick')}
              className={`flex-1 py-2.5 font-semibold text-center cursor-pointer transition-colors ${
                activeTab === 'quick'
                  ? 'bg-white text-indigo-700 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              高频排错速查
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 font-semibold text-center cursor-pointer transition-colors ${
                activeTab === 'chat'
                  ? 'bg-white text-indigo-700 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI 自由问答
            </button>
          </div>

          {/* Missing API-Key Warning Bar */}
          {(!llmConfig.apiKey || !llmConfig.isConfirmed) && (
            <div className="p-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-[11px] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>调用大模型前必须先配置 API-Key</span>
              </span>
              <button
                onClick={() => {
                  setSettingsNotice('项目要部署到 GitHub 浏览器调用，所有大模型调用必须输入 API-Key 后才能调用。');
                  setIsSettingsOpen(true);
                }}
                className="px-2 py-0.5 bg-amber-600 text-white font-bold rounded cursor-pointer hover:bg-amber-700"
              >
                去设置
              </button>
            </div>
          )}

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'quick' ? (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  点击以下高频疑难，立即获取底层机理解析与修复代码：
                </span>
                {QUICK_TOPICS.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/60 transition-all text-xs space-y-2 cursor-pointer shadow-2xs"
                    onClick={() => {
                      setActiveTab('chat');
                      handleSend(item.q);
                    }}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{item.q}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>
                    <div className="text-[11px] font-mono text-indigo-700 bg-indigo-50/60 p-2 rounded border border-indigo-100">
                      <pre className="whitespace-pre-wrap">{item.fix}</pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Chat List
              <div className="space-y-3">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'ai' && (
                      <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-xl max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-indigo-600 text-white font-sans'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs font-sans'
                      }`}
                    >
                      {m.text}
                      {m.model && (
                        <div className="mt-1 pt-1 border-t border-slate-200/80 text-[10px] text-slate-400 font-mono">
                          via {m.model}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
                    <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>大模型 ({llmConfig.model}) 正在深度诊断中...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Drawer Footer Input */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={
                  hasConfiguredApiKey()
                    ? `向 ${llmConfig.model} 咨询任何 R 文件读写报错或疑问...`
                    : '⚠️ 请先点击右上角小齿轮输入并确认 API-Key...'
                }
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !chatInput.trim()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
