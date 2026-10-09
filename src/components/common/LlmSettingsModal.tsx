import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Key,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import {
  LlmModelType,
  LlmConfig,
  getStoredLlmConfig,
  saveStoredLlmConfig
} from '../../services/llmService';

interface LlmSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (config: LlmConfig) => void;
  requiredNotice?: string;
}

export const LlmSettingsModal: React.FC<LlmSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  requiredNotice
}) => {
  const [selectedModel, setSelectedModel] = useState<LlmModelType>('gemini 3 flash');
  const [apiKey, setApiKey] = useState<string>('');
  const [customEndpoint, setCustomEndpoint] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Load existing config on open
  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredLlmConfig();
      setSelectedModel(cfg.model);
      setApiKey(cfg.apiKey);
      setCustomEndpoint(cfg.customEndpoint || '');
      setErrorMessage('');
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmAndSave = () => {
    if (!apiKey.trim()) {
      setErrorMessage('请输入有效的 API-Key 后方可确认保存并调用大模型。');
      return;
    }

    const newConfig: LlmConfig = {
      model: selectedModel,
      apiKey: apiKey.trim(),
      customEndpoint: customEndpoint.trim() || undefined,
      isConfirmed: true
    };

    saveStoredLlmConfig(newConfig);
    setErrorMessage('');
    setSaveSuccess(true);

    if (onSaved) {
      onSaved(newConfig);
    }

    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Settings className="w-4 h-4 text-slate-100" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                大模型调用与 API-Key 设置
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/40 text-indigo-200 font-mono">
                  GitHub 浏览器直调
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                支持纯前端跨域直调 · 仅保存在浏览器本地
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Required Notice if triggered by an unauthenticated action */}
          {requiredNotice && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block">调用前拦截提示：</span>
                {requiredNotice}
              </div>
            </div>
          )}

          {/* 1. 大模型选择 (两个选项) */}
          <div className="space-y-2">
            <label className="block text-slate-700 font-bold text-xs flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>选择大模型 (LLM Model)：</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: gemini 3 flash */}
              <button
                type="button"
                onClick={() => setSelectedModel('gemini 3 flash')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedModel === 'gemini 3 flash'
                    ? 'bg-indigo-50/80 border-indigo-500 shadow-xs ring-1 ring-indigo-500/30'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      selectedModel === 'gemini 3 flash' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      Google AI
                    </span>
                    {selectedModel === 'gemini 3 flash' && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">gemini 3 flash</h4>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  官方推荐 · 高响应速度 · 专精代码与数学推理
                </p>
              </button>

              {/* Option 2: deepseek-v4-pro */}
              <button
                type="button"
                onClick={() => setSelectedModel('deepseek-v4-pro')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedModel === 'deepseek-v4-pro'
                    ? 'bg-indigo-50/80 border-indigo-500 shadow-xs ring-1 ring-indigo-500/30'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      selectedModel === 'deepseek-v4-pro' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      DeepSeek
                    </span>
                    {selectedModel === 'deepseek-v4-pro' && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">deepseek-v4-pro</h4>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  深度求索 · 高深度推理 · 兼容 OpenAI 格式
                </p>
              </button>
            </div>
          </div>

          {/* 2. 手工输入 API-Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold text-xs flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span>手工输入 API-Key (必填项)：</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedModel === 'gemini 3 flash' ? 'Gemini API Key' : 'DeepSeek API Key'}
              </span>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setErrorMessage('');
                }}
                placeholder={
                  selectedModel === 'gemini 3 flash'
                    ? '例如: AIzaSy...'
                    : '例如: sk-...'
                }
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? '隐藏' : '显示'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMessage && (
              <p className="text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}

            {/* Security Guarantee Notice */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>GitHub 静态部署安全承诺：</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                本项目已完全解耦后端服务。所有大模型请求均由用户浏览器端（Client-side）直接与 Google / DeepSeek 官方接口发起，您的 API-Key 仅持久化保存在当前浏览器的 LocalStorage 中，绝不上传至任何中间服务器。
              </p>
            </div>
          </div>

          {/* 3. 自定义 API 代理端点 (选填，主要给 DeepSeek 或国内中转) */}
          {selectedModel === 'deepseek-v4-pro' && (
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <label className="block text-slate-600 font-semibold text-[11px]">
                自定义 API 端点 (可选，默认使用 DeepSeek 官方接口)：
              </label>
              <input
                type="text"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="https://api.deepseek.com/chat/completions"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>
          )}
        </div>

        {/* Modal Footer / 确认大模型 */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {apiKey.trim() ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> API-Key 就绪
              </span>
            ) : (
              <span className="text-amber-600">⚠️ 尚未输入 API-Key</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs cursor-pointer transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleConfirmAndSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>已确认并保存</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>确认大模型并保存</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
