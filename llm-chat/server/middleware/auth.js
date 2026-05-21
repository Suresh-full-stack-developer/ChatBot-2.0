import jwt from "jsonwebtoken";

const SECRET = () => process.env.JWT_SECRET || "dev-secret";

export function authenticateSocket(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("AUTH_REQUIRED"));
  try {
    const p = jwt.verify(token, SECRET());
    socket.data.userId   = p.userId;
    socket.data.username = p.username;
    next();
  } catch {
    next(new Error("AUTH_INVALID"));
  }
}

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "").trim();
  if (!token) return res.status(401).json({ error: "No token." });
  try {
    req.user = jwt.verify(token, SECRET());
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}
