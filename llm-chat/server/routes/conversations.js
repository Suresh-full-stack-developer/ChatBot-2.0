import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { createConversation, getUserConvos, getConvo, renameConvo, deleteConvo } from "../db/store.js";

export const conversationRouter = express.Router();
conversationRouter.use(requireAuth);

conversationRouter.get("/",    (req, res) => res.json({ conversations: getUserConvos(req.user.userId) }));
conversationRouter.post("/",   (req, res) => res.status(201).json({ conversation: createConversation(req.user.userId, req.body?.title) }));
conversationRouter.patch("/:id", (req, res) => {
  const c = getConvo(req.params.id);
  if (!c || c.userId !== req.user.userId) return res.status(404).json({ error: "Not found." });
  res.json({ conversation: renameConvo(req.params.id, req.body?.title || c.title) });
});
conversationRouter.delete("/:id", (req, res) => {
  const c = getConvo(req.params.id);
  if (!c || c.userId !== req.user.userId) return res.status(404).json({ error: "Not found." });
  deleteConvo(req.params.id);
  res.json({ success: true });
});
