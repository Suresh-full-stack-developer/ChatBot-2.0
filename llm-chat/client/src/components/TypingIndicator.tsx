export function TypingIndicator() {
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:10,padding:"3px 20px"}} role="status" aria-label="Assistant is typing">
      <div style={{width:28,height:28,borderRadius:"50%",background:"var(--bg4)",border:"1px solid var(--border2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"var(--accent)",flexShrink:0}}>✦</div>
      <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r2)",borderBottomLeftRadius:4,padding:"13px 16px",display:"flex",alignItems:"center",gap:5}}>
        {[0,160,320].map(delay=>(
          <span key={delay} style={{width:6,height:6,borderRadius:"50%",background:"var(--t3)",display:"inline-block",animation:`bounce 1.2s ease ${delay}ms infinite`}}/>
        ))}
      </div>
    </div>
  );
}
