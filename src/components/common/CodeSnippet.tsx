import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeSnippetProps {
  code: string;
  language?: string;
  title?: string;
  badge?: string;
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({
  code,
  language = 'R',
  title,
  badge
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-slate-200/80 bg-slate-900 text-slate-100 shadow-sm font-mono text-xs">
      {(title || badge) && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="font-semibold text-slate-200">{title || `${language} 代码`}</span>
            {badge && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-sans border border-slate-700">
                {badge}
              </span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-slate-800"
            title="复制代码"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>复制</span>
              </>
            )}
          </button>
        </div>
      )}
      <div className="relative p-3.5 overflow-x-auto max-h-[420px] leading-relaxed scrollbar-thin">
        {!title && !badge && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-[10px]"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? '已复制' : '复制'}
          </button>
        )}
        <pre className="text-slate-200 font-mono text-[12.5px] whitespace-pre selection:bg-indigo-900 selection:text-white">
          {code}
        </pre>
      </div>
    </div>
  );
};
