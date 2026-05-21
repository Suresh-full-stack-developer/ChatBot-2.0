/**
 * OpenRouter LLM Orchestrator
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses OpenRouter's OpenAI-compatible API with native fetch + SSE streaming.
 * OpenRouter gives access to 200+ models including free ones.
 *
 * Free models on OpenRouter (no credits needed):
 *   meta-llama/llama-3.1-8b-instruct:free
 *   meta-llama/llama-3.2-3b-instruct:free
 *   google/gemma-2-9b-it:free
 *   mistralai/mistral-7b-instruct:free
 *   qwen/qwen-2-7b-instruct:free
 */

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

// ── Available models ──────────────────────────────────
export function getAvailableModels() {
  return [
    // Free models (no credits needed)
    { id: "meta-llama/llama-3.1-8b-instruct:free",  label: "Llama 3.1 8B (Free)",   provider: "openrouter", free: true },
    { id: "meta-llama/llama-3.2-3b-instruct:free",  label: "Llama 3.2 3B (Free)",   provider: "openrouter", free: true },
    { id: "google/gemma-2-9b-it:free",              label: "Gemma 2 9B (Free)",      provider: "openrouter", free: true },
    { id: "mistralai/mistral-7b-instruct:free",     label: "Mistral 7B (Free)",      provider: "openrouter", free: true },
    { id: "qwen/qwen-2-7b-instruct:free",           label: "Qwen 2 7B (Free)",       provider: "openrouter", free: true },
    // Paid models (uses your OpenRouter credits)
    { id: "openai/gpt-4o-mini",                     label: "GPT-4o Mini",            provider: "openrouter", free: false },
    { id: "openai/gpt-4o",                          label: "GPT-4o",                 provider: "openrouter", free: false },
    { id: "anthropic/claude-haiku-4-5",             label: "Claude Haiku 4.5",       provider: "openrouter", free: false },
    { id: "anthropic/claude-sonnet-4-5",            label: "Claude Sonnet 4.5",      provider: "openrouter", free: false },
    { id: "google/gemini-flash-1.5",                label: "Gemini Flash 1.5",       provider: "openrouter", free: false },
  ];
}

/**
 * Stream LLM response via OpenRouter using fetch + SSE (Server-Sent Events).
 * Yields text chunks as they arrive.
 *
 * @param {string} model   - OpenRouter model ID
 * @param {Array}  history - Prior messages [{role, content}] NOT including current
 * @param {string} content - Current user message
 * @yields {string} text chunks
 */
export async function* streamLLMResponse({ model, history, content }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set in server/.env");

  // Build messages array
  const messages = [
    { role: "system", content: "You are a helpful, friendly, and concise AI assistant." },
    ...history
      .filter(m => m.role === "user" || m.role === "assistant")
      .map(m => ({ role: m.role, content: String(m.content) })),
    { role: "user", content: String(content) },
  ];

  console.log(`[llm] model=${model}  turns=${messages.length}  prompt="${content.slice(0, 70)}"`);

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization":        `Bearer ${apiKey}`,
      "Content-Type":         "application/json",
      "HTTP-Referer":         process.env.OPENROUTER_SITE_URL || "http://localhost:5173",
      "X-Title":              process.env.OPENROUTER_SITE_NAME || "LLM Chat App",
    },
    body: JSON.stringify({
      model,
      messages,
      stream:     true,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMsg = `OpenRouter API error ${response.status}`;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson?.error?.message || errMsg;
    } catch {}
    console.error("[llm] OpenRouter error:", errMsg);
    throw new Error(errMsg);
  }

  // Parse SSE stream
  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = "";
  let   chunks  = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // keep incomplete line in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;

      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") {
        console.log(`[llm] OpenRouter done  model=${model}  chunks=${chunks}`);
        return;
      }

      try {
        const parsed = JSON.parse(data);
        const text   = parsed.choices?.[0]?.delta?.content;
        if (text) { chunks++; yield text; }
      } catch {
        // Ignore malformed SSE lines
      }
    }
  }

  console.log(`[llm] OpenRouter stream ended  chunks=${chunks}`);
}
