import { useEffect }       from "react";
import { useSocket }       from "../hooks/useSocket";
import { useAuthStore }    from "../store/authStore";
import { useChatStore }    from "../store/chatStore";
import { fetchConversations } from "../utils/api";
import { Sidebar }         from "../components/Sidebar";
import { ChatWindow }      from "../components/ChatWindow";

export function ChatPage() {
  const { status, emit } = useSocket();
  const token            = useAuthStore(s=>s.token);
  const activeId         = useChatStore(s=>s.activeId);
  const setConvs         = useChatStore(s=>s.setConversations);
  const setActiveId      = useChatStore(s=>s.setActiveId);

  useEffect(()=>{
    if(!token) return;
    fetchConversations(token).then(setConvs).catch(console.error);
  },[token]);

  const onSelect = (id:string) => { setActiveId(id); emit("conversation:load",{conversationId:id}); };

  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:"var(--bg)"}}>
      <Sidebar status={status} onSelect={onSelect} emit={emit} />
      <main style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {activeId
          ? <ChatWindow conversationId={activeId} emit={emit} />
          : <Empty onNew={()=>setActiveId("new")} />
        }
      </main>
    </div>
  );
}

function Empty({onNew}:{onNew:()=>void}) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,color:"var(--t3)",padding:40,textAlign:"center"}}>
      <div style={{fontSize:56,opacity:.15}}>✦</div>
      <h2 style={{fontSize:20,fontWeight:700,color:"var(--t2)",letterSpacing:"-0.02em"}}>Start a conversation</h2>
      <p style={{fontSize:13,maxWidth:280}}>Pick a model from the sidebar and send your first message.</p>
      <button onClick={onNew} style={{marginTop:8,background:"var(--accent)",color:"#fff",border:"none",borderRadius:"var(--r1)",padding:"10px 28px",fontSize:13,fontWeight:600}}>
        New Chat
      </button>
    </div>
  );
}
