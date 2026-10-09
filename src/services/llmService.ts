export type LlmModelType = 'gemini 3 flash' | 'deepseek-v4-pro';

export interface LlmConfig {
  model: LlmModelType;
  apiKey: string;
  customEndpoint?: string;
  isConfirmed: boolean;
}

const STORAGE_KEY = 'r_io_lab_llm_settings';

export const DEFAULT_LLM_CONFIG: LlmConfig = {
  model: 'gemini 3 flash',
  apiKey: '',
  customEndpoint: '',
  isConfirmed: false
};

export function getStoredLlmConfig(): LlmConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        model: parsed.model === 'deepseek-v4-pro' ? 'deepseek-v4-pro' : 'gemini 3 flash',
        apiKey: parsed.apiKey || '',
        customEndpoint: parsed.customEndpoint || '',
        isConfirmed: Boolean(parsed.isConfirmed && parsed.apiKey)
      };
    }
  } catch (e) {
    console.error('Failed to parse LLM settings from localStorage', e);
  }
  return DEFAULT_LLM_CONFIG;
}

export function saveStoredLlmConfig(config: LlmConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save LLM settings to localStorage', e);
  }
}

export function hasConfiguredApiKey(): boolean {
  const cfg = getStoredLlmConfig();
  return Boolean(cfg.apiKey && cfg.apiKey.trim().length > 0 && cfg.isConfirmed);
}

export interface LlmResponse {
  success: boolean;
  content: string;
  model: string;
  error?: string;
}

/**
 * Direct browser call for GitHub static deployment and client-side usage.
 * Strictly requires the API-Key to be provided by the user.
 */
export async function executeLlmCall(
  prompt: string,
  systemInstruction?: string,
  configOverride?: LlmConfig
): Promise<LlmResponse> {
  const config = configOverride || getStoredLlmConfig();

  if (!config.apiKey || !config.apiKey.trim()) {
    throw new Error('API_KEY_REQUIRED');
  }

  const cleanKey = config.apiKey.trim();

  // 1. Model: gemini 3 flash
  if (config.model === 'gemini 3 flash') {
    try {
      // First try browser-direct Google GenAI API endpoint
      // Using gemini-2.5-flash as the standard CORS-enabled browser endpoint
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(cleanKey)}`;
      
      const payload: any = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3
        }
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `Google API 请求失败 (状态码: ${res.status})`;
        throw new Error(errMsg);
      }

      const data = await res.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('大模型未返回有效候选内容。');
      }

      return {
        success: true,
        content: generatedText,
        model: 'gemini 3 flash'
      };
    } catch (err: any) {
      console.warn('Gemini 浏览器直调失败，尝试备用通道:', err);
      // If direct browser call had CORS or network issue, fallback to backend proxy if present
      try {
        const serverRes = await fetch('/api/ai/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customError: prompt,
            userCode: prompt,
            apiKey: cleanKey,
            model: 'gemini 3 flash'
          })
        });
        const serverData = await serverRes.json();
        if (serverData.success && serverData.data?.content) {
          return {
            success: true,
            content: serverData.data.content,
            model: 'gemini 3 flash'
          };
        }
      } catch (proxyErr) {
        // Ignore and throw original error
      }
      throw err;
    }
  }

  // 2. Model: deepseek-v4-pro
  if (config.model === 'deepseek-v4-pro') {
    const defaultEndpoint = 'https://api.deepseek.com/chat/completions';
    const endpoint = config.customEndpoint?.trim() || defaultEndpoint;

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.3
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errMsg = errorData.error?.message || `DeepSeek API 请求失败 (状态码: ${res.status})`;
      throw new Error(errMsg);
    }

    const data = await res.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error('DeepSeek 大模型未返回有效内容。');
    }

    return {
      success: true,
      content: generatedText,
      model: 'deepseek-v4-pro'
    };
  }

  throw new Error(`未识别的大模型类型: ${config.model}`);
}
