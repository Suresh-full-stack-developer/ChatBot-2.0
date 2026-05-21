import { v4 as uuid } from "uuid";
import bcrypt          from "bcryptjs";

const users  = new Map();
const convos = new Map();
const msgs   = new Map();

// Seed demo user
const DEMO_ID = uuid();
users.set(DEMO_ID, {
  id: DEMO_ID, username: "demo", email: "demo@example.com",
  passwordHash: bcrypt.hashSync("demo1234", 10),
  createdAt: new Date().toISOString(),
});
console.log("[db] Demo → demo@example.com / demo1234");

// ── Users ──────────────────────────────────────────────
export function createUser({ username, email, password }) {
  if ([...users.values()].find(u => u.email === email.toLowerCase()))
    throw new Error("Email already registered.");
  const u = {
    id: uuid(), username: username.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date().toISOString(),
  };
  users.set(u.id, u);
  return u;
}
export const findByEmail = (e) => [...users.values()].find(u => u.email === e.toLowerCase()) ?? null;
export const findById    = (id) => users.get(id) ?? null;

// ── Conversations ──────────────────────────────────────
export function createConversation(userId, title = "New Chat") {
  const now = new Date().toISOString();
  const c   = { id: uuid(), userId, title, createdAt: now, updatedAt: now };
  convos.set(c.id, c);
  msgs.set(c.id, []);
  return c;
}
export const getConvo     = (id)     => convos.get(id) ?? null;
export const getUserConvos= (userId) =>
  [...convos.values()].filter(c => c.userId === userId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

export function renameConvo(id, title) {
  const c = convos.get(id); if (!c) return null;
  c.title = title.slice(0, 80); c.updatedAt = new Date().toISOString(); return c;
}
export function deleteConvo(id) { convos.delete(id); msgs.delete(id); }

// ── Messages ───────────────────────────────────────────
export function addMessage({ conversationId, role, content, model = null }) {
  const list = msgs.get(conversationId) ?? [];
  const m = { id: uuid(), conversationId, role, content, model, createdAt: new Date().toISOString() };
  list.push(m);
  msgs.set(conversationId, list);
  const c = convos.get(conversationId);
  if (c) c.updatedAt = new Date().toISOString();
  return m;
}
export const getMessages = (cid) => msgs.get(cid) ?? [];
