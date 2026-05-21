import { useEffect, useRef } from "react";
import { useChatStore }      from "../store/chatStore";
import { MessageBubble }     from "./MessageBubble";
import { TypingIndicator }   from "./TypingIndicator";
import { ChatInput }         from "./ChatInput";

interface Props { conversationId:string; emit:(e:string,d?:unknown)=>void; }

export function ChatWindow({conversationId,emit}:Props) {
  const messages     = useChatStore(s=>s.messages[conversationId]??[]);
  const streamBuffer = useChatStore(s=>s.streamBuffer);
  const isStreaming  = useChatStore(s=>s.isStreaming);
  const selectedModel= useChatStore(s=>s.selectedModel);
  const conversations= useChatStore(s=>s.conversations);
  const bottomRef    = useRef<HTMLDivElement>(null);

  const conv  = conversations.find(c=>c.id===conversationId);
  const title = conversationId==="new"?"New Chat":(conv?.title??"Chat");

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages.length,streamBuffer]);

  const send = (content:string) => {
    if(!content.trim()||isStreaming) return;
    emit("message:send",{conversationId,content,model:selectedModel});
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:"var(--bg)"}}>
      {/* Header */}
      <div style={hdr}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:15}}>💬</span>
          <span style={{fontSize:14,fontWeight:600,letterSpacing:"-0.01em",maxWidth:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{title}</span>
        </div>
        {isStreaming && (
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11.5,color:"var(--accent)"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",display:"inline-block",animation:"pulse 1s ease infinite"}}/>
            Generating…
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"20px 0 8px",display:"flex",flexDirection:"column",gap:2}} role="log" aria-live="polite">
        {messages.length===0&&!isStreaming&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,color:"var(--t3)"}}>
            <div style={{fontSize:38,opacity:.2}}>✦</div>
            <p style={{fontSize:13}}>Send a message to start</p>
          </div>
        )}
        {messages.map((msg,i)=>(
          <MessageBubble key={msg.id} message={msg} isLast={i===messages.length-1} />
        ))}
        {isStreaming&&streamBuffer&&(
          <MessageBubble isStreaming message={{id:"__stream",conversationId,role:"assistant",content:streamBuffer,createdAt:new Date().toISOString()}} />
        )}
        {isStreaming&&!streamBuffer&&<TypingIndicator/>}
        <div ref={bottomRef} style={{height:1}}/>
      </div>

      <ChatInput onSend={send} disabled={isStreaming} />
    </div>
  );
}

const hdr = {display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:"1px solid var(--border)",background:"var(--bg2)",flexShrink:0} as React.CSSProperties;
