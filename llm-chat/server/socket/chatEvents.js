import {
  createConversation, getConvo, addMessage,
  getMessages, deleteConvo, renameConvo,
} from "../db/store.js";
import { streamLLMResponse, getAvailableModels } from "../llm/orchestrator.js";

export function registerChatEvents(socket) {
  const { userId } = socket.data;

  // ── Get models ─────────────────────────────────────
  socket.on("models:get", () => {
    socket.emit("models:list", { models: getAvailableModels() });
  });

  // ── Load conversation history ──────────────────────
  socket.on("conversation:load", ({ conversationId }) => {
    const conv = getConvo(conversationId);
    if (!conv || conv.userId !== userId)
      return socket.emit("error:chat", { message: "Conversation not found." });
    socket.emit("conversation:history", { conversationId, messages: getMessages(conversationId) });
  });

  // ── Send message + stream response ────────────────
  socket.on("message:send", async ({ conversationId, content, model }) => {
    if (!content?.trim()) return;

    let convId = conversationId;

    try {
      // Create new conversation if needed
      if (!convId || convId === "new" || !getConvo(convId)) {
        const conv = createConversation(userId);
        convId = conv.id;
        socket.emit("conversation:created", { conversation: conv });
      }

      // 1. Save user message
      const userMsg = addMessage({ conversationId: convId, role: "user", content });
      socket.emit("message:saved", { message: userMsg });

      // 2. Show typing indicator
      socket.emit("assistant:typing", { conversationId: convId });

      // 3. Build history (all messages except the one just saved)
      const allMsgs    = getMessages(convId);
      const history    = allMsgs.slice(0, allMsgs.length - 1);
      const activeModel = model || getAvailableModels()[0].id;

      // 4. Stream response
      let fullText = "";
      for await (const chunk of streamLLMResponse({ model: activeModel, history, content })) {
        fullText += chunk;
        socket.emit("assistant:chunk", { conversationId: convId, chunk });
      }

      if (!fullText.trim()) fullText = "⚠️ Empty response from model. Please try again.";

      // 5. Save + confirm done
      const assistantMsg = addMessage({
        conversationId: convId,
        role:  "assistant",
        content: fullText,
        model: activeModel,
      });
      socket.emit("assistant:done", { conversationId: convId, message: assistantMsg });

      // 6. Auto-title conversation from first message
      const conv = getConvo(convId);
      if (conv?.title === "New Chat") {
        const title = content.length > 45 ? content.slice(0, 45) + "…" : content;
        renameConvo(convId, title);
        socket.emit("conversation:updated", { conversation: getConvo(convId) });
      }

    } catch (err) {
      console.error("[socket] message:send error →", err.message);
      // Show error as assistant message so spinner clears
      const errMsg = addMessage({
        conversationId: convId,
        role: "assistant",
        content: `⚠️ **Error:** ${err.message}`,
        model: null,
      });
      socket.emit("assistant:done", { conversationId: convId, message: errMsg });
    }
  });

  // ── Delete conversation ────────────────────────────
  socket.on("conversation:delete", ({ conversationId }) => {
    const conv = getConvo(conversationId);
    if (!conv || conv.userId !== userId) return;
    deleteConvo(conversationId);
    socket.emit("conversation:deleted", { conversationId });
  });

  // ── Rename conversation ────────────────────────────
  socket.on("conversation:rename", ({ conversationId, title }) => {
    const conv = getConvo(conversationId);
    if (!conv || conv.userId !== userId) return;
    socket.emit("conversation:updated", { conversation: renameConvo(conversationId, title) });
  });
}
