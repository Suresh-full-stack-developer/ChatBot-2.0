import { useState, useRef } from "react";

interface Props { onSend:(t:string)=>void; disabled?:boolean; }

export function ChatInput({onSend,disabled}:Props) {
  const [val,setVal] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const send = () => {
    const v = val.trim(); if(!v||disabled) return;
    onSend(v); setVal("");
    if(ref.current) ref.current.style.height="auto";
  };

  const onKey = (e:React.KeyboardEvent) => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} };

  const onChange = (e:React.ChangeEvent<HTMLTextAreaElement>) => {
    setVal(e.target.value);
    const el=e.target; el.style.height="auto"; el.style.height=Math.min(el.scrollHeight,180)+"px";
  };

  return (
    <div style={{padding:"13px 20px 10px",background:"var(--bg2)",borderTop:"1px solid var(--border)",flexShrink:0}}>
      <div style={{...box, borderColor:disabled?"var(--border)":"var(--border2)"}}>
        <textarea ref={ref} style={ta} value={val} onChange={onChange} onKeyDown={onKey}
          placeholder={disabled?"Responding…":"Message… (Enter to send, Shift+Enter for newline)"}
          rows={1} disabled={disabled} aria-label="Message input"
          onFocus={e=>{ (e.currentTarget.parentElement as HTMLDivElement).style.borderColor="var(--accent)"; }}
          onBlur={e=>{  (e.currentTarget.parentElement as HTMLDivElement).style.borderColor="var(--border2)"; }}
        />
        <button style={{...sendBtn,opacity:disabled||!val.trim()?0.4:1}} onClick={send} disabled={disabled||!val.trim()}>
          {disabled ? <span style={spin}/> : <SendIcon/>}
        </button>
      </div>
      <p style={{fontSize:10,color:"var(--t3)",fontFamily:"JetBrains Mono,monospace",textAlign:"center",marginTop:6}}>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
  </svg>
);

const box     = {display:"flex",alignItems:"flex-end",gap:10,background:"var(--bg3)",border:"1px solid",borderRadius:"var(--r2)",padding:"9px 12px",transition:"border-color .15s"} as React.CSSProperties;
const ta      = {flex:1,background:"none",border:"none",color:"var(--t1)",fontSize:13.5,lineHeight:1.55,resize:"none",minHeight:22,maxHeight:180,overflowY:"auto",fontFamily:"inherit"} as React.CSSProperties;
const sendBtn = {width:34,height:34,borderRadius:"var(--r1)",border:"none",background:"var(--accent)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",transition:"background .15s,opacity .15s"} as React.CSSProperties;
const spin    = {width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"} as React.CSSProperties;
