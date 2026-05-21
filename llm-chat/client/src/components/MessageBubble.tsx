import type { Message } from "../types";

interface Props { message:Message; isLast?:boolean; isStreaming?:boolean; }

export function MessageBubble({message,isStreaming}:Props) {
  const isUser = message.role==="user";
  return (
    <div style={{...row, ...(isUser?userRow:aiRow)}} className="fadeUp">
      <div style={{...av, ...(isUser?userAv:aiAv)}}>{isUser?"U":"✦"}</div>
      <div style={{...bubble, ...(isUser?userBubble:aiBubble)}}>
        <div style={content}>
          <Markdown text={message.content} isUser={isUser} />
          {isStreaming&&<span style={cursor}/>}
        </div>
        <div style={meta}>
          {message.model&&<span style={modelTag}>{shortModel(message.model)}</span>}
          <span style={{fontSize:10,fontFamily:"JetBrains Mono,monospace",color:isUser?"rgba(255,255,255,.4)":"var(--t3)",marginLeft:"auto"}}>{fmtTime(message.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

function Markdown({text,isUser}:{text:string;isUser:boolean}) {
  return (
    <>
      {text.split("\n").map((line,li,arr)=>{
        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
        return (
          <span key={li}>
            {parts.map((p,pi)=>{
              if(p.startsWith("**")&&p.endsWith("**")) return <strong key={pi}>{p.slice(2,-2)}</strong>;
              if(p.startsWith("`")&&p.endsWith("`"))   return <code key={pi} style={{background:isUser?"rgba(255,255,255,.15)":"rgba(0,0,0,.3)",borderRadius:3,padding:"1px 5px",fontFamily:"JetBrains Mono,monospace",fontSize:12}}>{p.slice(1,-1)}</code>;
              if(p.startsWith("*")&&p.endsWith("*"))   return <em key={pi}>{p.slice(1,-1)}</em>;
              return p;
            })}
            {li<arr.length-1&&<br/>}
          </span>
        );
      })}
    </>
  );
}

const shortModel = (m:string) => {
  if(!m||m==="mock") return "Demo";
  if(m.includes("llama-3.1-8b")) return "Llama 3.1 8B";
  if(m.includes("llama-3.2-3b")) return "Llama 3.2 3B";
  if(m.includes("gemma-2-9b"))   return "Gemma 2 9B";
  if(m.includes("mistral-7b"))   return "Mistral 7B";
  if(m.includes("qwen-2"))       return "Qwen 2 7B";
  if(m.includes("gpt-4o-mini"))  return "GPT-4o mini";
  if(m.includes("gpt-4o"))       return "GPT-4o";
  if(m.includes("haiku"))        return "Claude Haiku";
  if(m.includes("sonnet"))       return "Claude Sonnet";
  if(m.includes("gemini-flash")) return "Gemini Flash";
  return m.split("/").pop()?.split(":")[0] ?? m;
};

const fmtTime = (iso:string) => { try{return new Date(iso).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}catch{return""} };

const row        = {display:"flex",alignItems:"flex-end",gap:10,padding:"3px 20px",maxWidth:840,width:"100%"} as React.CSSProperties;
const aiRow      = {alignSelf:"flex-start"} as React.CSSProperties;
const userRow    = {alignSelf:"flex-end",flexDirection:"row-reverse"} as React.CSSProperties;
const av         = {width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0} as React.CSSProperties;
const aiAv       = {background:"var(--bg4)",border:"1px solid var(--border2)",color:"var(--accent)",fontSize:12} as React.CSSProperties;
const userAv     = {background:"linear-gradient(135deg,var(--accent),#a78bfa)",color:"#fff"} as React.CSSProperties;
const bubble     = {maxWidth:"min(600px,calc(100vw - 180px))",borderRadius:"var(--r2)",padding:"10px 14px 7px"} as React.CSSProperties;
const aiBubble   = {background:"var(--bg3)",border:"1px solid var(--border)",borderBottomLeftRadius:4} as React.CSSProperties;
const userBubble = {background:"var(--accent)",border:"1px solid transparent",borderBottomRightRadius:4} as React.CSSProperties;
const content    = {fontSize:13.5,lineHeight:1.7,color:"var(--t1)",wordBreak:"break-word",whiteSpace:"pre-wrap"} as React.CSSProperties;
const cursor     = {display:"inline-block",width:2,height:13,background:"var(--accent)",marginLeft:2,verticalAlign:"text-bottom",animation:"blink .85s ease infinite"} as React.CSSProperties;
const meta       = {display:"flex",alignItems:"center",gap:6,marginTop:5} as React.CSSProperties;
const modelTag   = {fontSize:10,fontFamily:"JetBrains Mono,monospace",color:"var(--accent)",background:"var(--aBg)",padding:"1px 6px",borderRadius:3} as React.CSSProperties;
