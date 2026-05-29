/* ============================================================
   Flow Writer — AI Writing Assistant
   Pluggable AI backend with local fallback patterns.
   API keys are stored in memory only, never persisted.
   ============================================================ */

// ── AI Configuration (stored in memory, never persisted to disk) ──
let _config = {
  enabled: true,
  endpoint: '',        // e.g. "https://api.openai.com/v1/chat/completions"
  apiKey: '',          // user's API key (session only)
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 256,
};

// ── Local fallback patterns when no API is configured ──
const FALLBACK_SUGGESTIONS = {
  'he looked': 'He looked around, taking in the silence that had settled over the room.',
  'she looked': 'She looked toward the window, where the light was beginning to fade.',
  'the door': 'The door creaked open on hinges that hadn\'t been used in years.',
  'the room': 'The room held its breath, as if waiting for someone to speak.',
  'suddenly': 'Without warning,',
  'default': '',  // no suggestion
};

// ── Streaming state ──
let _abortController = null;

// ═══════════════════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize AI assistant from any available settings.
 * (Currently a no-op since config is memory-only.)
 */
export function initAIAssistant() {
  // Config stays at defaults — never persisted.
  // Could be extended to load from a non-persisted settings source.
}

/** Get a shallow copy of current AI config. */
export function getAIConfig() {
  return { ..._config };
}

/** Merge new config values into the current config. */
export function setAIConfig(newConfig) {
  _config = { ..._config, ...newConfig };
}

// ── Inline ghost-text suggestion ──

/**
 * Get an inline continuation suggestion for the given context.
 * Uses API if configured, otherwise falls back to pattern matching.
 * @param {string} contextText — text before the cursor (last 500 chars used)
 * @returns {Promise<string>} — the suggested continuation (empty if none)
 */
export async function getInlineSuggestion(contextText) {
  if (!_config.enabled) return '';

  // If no API configured, use fallback
  if (!_config.endpoint || !_config.apiKey) {
    return getFallbackSuggestion(contextText);
  }

  // Otherwise call the AI API
  return await callAIForContinuation(contextText);
}

// ── Rewrite selected text ──

/**
 * Rewrite the selected text with the given style and tone.
 * @param {string} selectedText — text to rewrite
 * @param {string} style — 'more concise' | 'more vivid' | 'fix grammar' | 'expand'
 * @param {string} tone — 'dramatic' | 'casual' | 'formal' | 'poetic'
 * @returns {Promise<{result: string, note: string}>}
 */
export async function rewriteText(selectedText, style, tone) {
  if (!_config.enabled) {
    return { result: selectedText, note: 'AI assistant is disabled' };
  }

  if (!_config.endpoint || !_config.apiKey) {
    return { result: selectedText, note: 'Configure AI endpoint in Settings to use rewrite' };
  }

  return await callAIForRewrite(selectedText, style, tone);
}

// ── Continuity check ──

/**
 * Check continuity of the full text, looking for inconsistencies.
 * @param {string} fullText — the full document text
 * @param {string[]} characterList — list of character names
 * @returns {Promise<Array<{type: string, message: string, position?: number}>>}
 */
export async function checkContinuity(fullText, characterList) {
  if (!_config.enabled) return [];

  if (!_config.endpoint || !_config.apiKey) {
    return []; // no issues found when no API (fallback: silent)
  }

  return await callAIForContinuity(fullText, characterList);
}

// ═══════════════════════════════════════════════════════════════
//  INTERNAL
// ═══════════════════════════════════════════════════════════════

function getFallbackSuggestion(context) {
  const lower = context.toLowerCase();
  for (const [trigger, suggestion] of Object.entries(FALLBACK_SUGGESTIONS)) {
    if (lower.endsWith(trigger) && suggestion) return suggestion;
  }
  return '';
}

async function callAIForContinuation(contextText) {
  const messages = [
    {
      role: 'system',
      content:
        'You are a writing assistant. Continue the text naturally with 1-2 sentences. ' +
        'Match the style and tone. Output ONLY the continuation, no quotes or explanations.',
    },
    {
      role: 'user',
      content: contextText.slice(-500),
    },
  ];
  return await streamAIResponse(messages, null);
}

async function callAIForRewrite(text, style, tone) {
  const messages = [
    {
      role: 'system',
      content: `Rewrite the following text. Style: ${style}. Tone: ${tone}. Output ONLY the rewritten text.`,
    },
    {
      role: 'user',
      content: text,
    },
  ];
  const result = await streamAIResponse(messages, null);
  return { result, note: '' };
}

async function callAIForContinuity(fullText, characterList) {
  const messages = [
    {
      role: 'system',
      content:
        'You are a story continuity checker. Look for: timeline inconsistencies, ' +
        'character voice shifts, contradictions in descriptions, and unresolved plot threads. ' +
        'Output a JSON array of issues, each with {type, message}. If no issues, output [].',
    },
    {
      role: 'user',
      content:
        `Characters: ${characterList.join(', ') || 'None provided'}\n\n` +
        `Text:\n${fullText.slice(-4000)}`,
    },
  ];

  try {
    const raw = await streamAIResponse(messages, null);
    if (!raw || !raw.trim()) return [];
    // Try to parse JSON; if it fails, return empty
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

/**
 * Generic OpenAI-compatible API caller.
 * @param {Array<{role:string, content:string}>} messages
 * @param {function(string)|null} onChunk — optional streaming callback
 * @returns {Promise<string>}
 */
async function streamAIResponse(messages, onChunk = null) {
  _abortController = new AbortController();

  try {
    const useStream = !!onChunk;
    const res = await fetch(_config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${_config.apiKey}`,
      },
      body: JSON.stringify({
        model: _config.model,
        messages,
        max_tokens: _config.maxTokens,
        temperature: _config.temperature,
        stream: useStream,
      }),
      signal: _abortController.signal,
    });

    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);

    // Streaming mode
    if (useStream && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line === 'data: [DONE]') continue;
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              const delta = json.choices?.[0]?.delta?.content || '';
              if (delta) {
                fullText += delta;
                onChunk(fullText);
              }
            } catch {
              // skip unparseable lines
            }
          }
        }
      }
      return fullText;
    }

    // Non-streaming mode
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('[AI] Request aborted');
      return '';
    }
    console.error('[AI] API error:', err.message);
    return '';
  } finally {
    _abortController = null;
  }
}

/** Abort any in-flight AI request. */
export function abortAIRequest() {
  if (_abortController) {
    _abortController.abort();
    _abortController = null;
  }
}
