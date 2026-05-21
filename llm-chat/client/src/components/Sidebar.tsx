import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import type { SocketStatus } from "../types";

interface Props { status:SocketStatus; onSelect:(id:string)=>void; emit:(e:string,d?:unknown)=>void; }

const dotColor = (s:SocketStatus) => s==="connected"?"var(--green)":s==="connecting"?"var(--amber)":"var(--red)";

export function Sidebar({status,onSelect,emit}:Props) {
  const user    = useAuthStore(s=>s.user);
  const logout  = useAuthStore(s=>s.logout);
  const convos  = useChatStore(s=>s.conversations);
  const models  = useChatStore(s=>s.models);
  const selModel= useChatStore(s=>s.selectedModel);
  const setModel= useChatStore(s=>s.setSelectedModel);
  const activeId= useChatStore(s=>s.activeId);
  const setId   = useChatStore(s=>s.setActiveId);
  const remove  = useChatStore(s=>s.removeConversation);

  const del = (e:React.MouseEvent,id:string) => {
    e.stopPropagation();
    if(!confirm("Delete this conversation?")) return;
    emit("conversation:delete",{conversationId:id}); remove(id);
  };

  return (
    <aside style={sb}>
      {/* Header */}
      <div style={hdr}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={logo}>✦</div>
          <span style={{fontSize:15,fontWeight:700,letterSpacing:"-0.02em"}}>LLM Chat</span>
        </div>
        <div style={{...dot,background:dotColor(status)}} title={status}/>
      </div>

      {/* Model selector */}
      <div style={{padding:"10px 12px 4px"}}>
        <label style={mlabel}>Model</label>
        <select value={selModel} onChange={e=>setModel(e.target.value)} style={msel}>
          {models.map(m=>(
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* New chat */}
      <div style={{padding:"8px 12px 4px"}}>
        <button style={newBtn} onClick={()=>setId("new")}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="var(--accent)";(e.currentTarget as HTMLButtonElement).style.color="#fff";}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="var(--aBg)";(e.currentTarget as HTMLButtonElement).style.color="var(--accent)";}}>
          ＋ New Chat
        </button>
      </div>

      {/* Conversation list */}
      <nav style={{flex:1,overflowY:"auto",padding:"4px 8px"}}>
        {convos.length===0 && <p style={{fontSize:11.5,color:"var(--t3)",textAlign:"center",padding:"20px 12px",fontFamily:"JetBrains Mono,monospace"}}>No chats yet</p>}
        {convos.map(c=>(
          <div key={c.id} style={{...item, background:activeId===c.id?"var(--aBg)":"transparent", border:`1px solid ${activeId===c.id?"var(--aBorder)":"transparent"}`}}
            onClick={()=>onSelect(c.id)}
            onMouseEnter={e=>{ if(activeId!==c.id)(e.currentTarget as HTMLDivElement).style.background="var(--bg3)"; }}
            onMouseLeave={e=>{ if(activeId!==c.id)(e.currentTarget as HTMLDivElement).style.background="transparent"; }}>
            <span style={{fontSize:12}}>💬</span>
            <span style={{flex:1,fontSize:12.5,color:activeId===c.id?"var(--t1)":"var(--t2)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.title||"New Chat"}</span>
            <button style={delBtn} onClick={e=>del(e,c.id)}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color="var(--red)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color="var(--t3)";}}>✕</button>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={footer}>
        <div style={avatar}>{user?.username?.[0]?.toUpperCase()}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12.5,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user?.username}</div>
          <div style={{fontSize:10.5,color:"var(--t3)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user?.email}</div>
        </div>
        <button style={logoutBtn} onClick={logout} title="Log out"
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="var(--red)";(e.currentTarget as HTMLButtonElement).style.color="var(--red)";}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="var(--border2)";(e.currentTarget as HTMLButtonElement).style.color="var(--t3)";}}>
          ⏻
        </button>
      </div>
    </aside>
  );
}

const sb      = {width:260,minWidth:260,background:"var(--bg2)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",height:"100vh"} as React.CSSProperties;
const hdr     = {display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 16px 12px",borderBottom:"1px solid var(--border)"} as React.CSSProperties;
const logo    = {width:32,height:32,background:"linear-gradient(135deg,var(--accent),#a78bfa)",borderRadius:"var(--r1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff"} as React.CSSProperties;
const dot     = {width:8,height:8,borderRadius:"50%",boxShadow:"0 0 6px currentColor",transition:"background .3s"} as React.CSSProperties;
const mlabel  = {display:"block",fontSize:10,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",color:"var(--t3)",marginBottom:5} as React.CSSProperties;
const msel    = {width:"100%",background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:"var(--r1)",color:"var(--t1)",fontSize:12,padding:"7px 10px",cursor:"pointer",fontFamily:"JetBrains Mono,monospace"} as React.CSSProperties;
const newBtn  = {width:"100%",background:"var(--aBg)",border:"1px dashed var(--aBorder)",borderRadius:"var(--r1)",color:"var(--accent)",padding:"8px 12px",fontSize:12.5,fontWeight:600,display:"flex",alignItems:"center",gap:6,transition:"background .15s,color .15s"} as React.CSSProperties;
const item    = {display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:"var(--r1)",cursor:"pointer",transition:"background .12s",marginBottom:2} as React.CSSProperties;
const delBtn  = {background:"none",border:"none",color:"var(--t3)",fontSize:10,padding:"2px 5px",borderRadius:3,flexShrink:0,cursor:"pointer",transition:"color .15s"} as React.CSSProperties;
const footer  = {borderTop:"1px solid var(--border)",padding:"12px 14px",display:"flex",alignItems:"center",gap:10} as React.CSSProperties;
const avatar  = {width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,var(--accent),#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0} as React.CSSProperties;
const logoutBtn={background:"none",border:"1px solid var(--border2)",borderRadius:"var(--r1)",color:"var(--t3)",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,cursor:"pointer",transition:"border-color .15s,color .15s"} as React.CSSProperties;
