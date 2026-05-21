import "dotenv/config";
import express          from "express";
import { createServer } from "http";
import { Server }       from "socket.io";
import cors             from "cors";
import helmet           from "helmet";
import { rateLimit }    from "express-rate-limit";
import { authRouter }         from "./routes/auth.js";
import { conversationRouter } from "./routes/conversations.js";
import { authenticateSocket } from "./middleware/auth.js";
import { registerChatEvents } from "./socket/chatEvents.js";

const app        = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors:        { origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true },
  transports:  ["websocket", "polling"],
  pingTimeout: 60000,
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.use("/api/auth",          authRouter);
app.use("/api/conversations", conversationRouter);
app.get("/health", (_req, res) => res.json({ status: "ok" }));

io.use(authenticateSocket);
io.on("connection", (socket) => {
  console.log(`[ws] + user=${socket.data.username}`);
  socket.join(`user:${socket.data.userId}`);
  registerChatEvents(socket);
  socket.on("disconnect", (r) => console.log(`[ws] - user=${socket.data.username} (${r})`));
});

const PORT = Number(process.env.PORT) || 4000;
httpServer.listen(PORT, () => {
  const key = process.env.OPENROUTER_API_KEY;
  console.log(`\n🚀  Server  →  http://localhost:${PORT}`);
  console.log(`   OpenRouter: ${key ? "✅ key loaded" : "❌ OPENROUTER_API_KEY not set in .env"}\n`);
});
