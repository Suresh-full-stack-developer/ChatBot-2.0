import { useAuthStore } from "./store/authStore";
import { AuthPage }     from "./pages/AuthPage";
import { ChatPage }     from "./pages/ChatPage";

export default function App() {
  return useAuthStore(s=>s.isAuthenticated) ? <ChatPage /> : <AuthPage />;
}
