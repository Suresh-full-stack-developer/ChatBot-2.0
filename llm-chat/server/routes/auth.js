import express from "express";
import bcrypt   from "bcryptjs";
import jwt      from "jsonwebtoken";
import { createUser, findByEmail } from "../db/store.js";

export const authRouter = express.Router();
const sign = (u) => jwt.sign(
  { userId: u.id, username: u.username },
  process.env.JWT_SECRET || "dev-secret",
  { expiresIn: "7d" }
);

authRouter.post("/register", (req, res) => {
  const { username, email, password } = req.body ?? {};
  if (!username || !email || !password)
    return res.status(400).json({ error: "All fields required." });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  try {
    const u = createUser({ username, email, password });
    res.status(201).json({ token: sign(u), user: { id: u.id, username: u.username, email: u.email } });
  } catch (e) { res.status(409).json({ error: e.message }); }
});

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });
  const u = findByEmail(email);
  if (!u || !bcrypt.compareSync(password, u.passwordHash))
    return res.status(401).json({ error: "Invalid email or password." });
  res.json({ token: sign(u), user: { id: u.id, username: u.username, email: u.email } });
});
