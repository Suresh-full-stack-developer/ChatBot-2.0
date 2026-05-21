import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { login, register } from "../utils/api";

export function AuthPage() {
  const [mode,setMode]     = useState<"login"|"register">("login");
  const [form,setForm]     = useState({username:"",email:"",password:""});
  const [error,setError]   = useState("");
  const [loading,setLoading] = useState(false);
  const doLogin = useAuthStore(s=>s.login);

  const upd = (k:string) => (e:React.ChangeEvent<HTMLInputElement>) => setForm(f=>({...f,[k]:e.target.value}));

  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const d = mode==="login"
        ? await login(form.email,form.password)
        : await register(form.username,form.email,form.password);
      doLogin(d.user,d.token);
    } catch(err:any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={pg}>
      <div style={card}>
        {/* Brand */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28}}>
          <div style={logoBox}>✦</div>
          <span style={{fontSize:20,fontWeight:700,letterSpacing:"-0.02em"}}>LLM Chat</span>
        </div>

        <h1 style={{fontSize:22,fontWeight:700,letterSpacing:"-0.02em",marginBottom:6}}>
          {mode==="login"?"Welcome back":"Create account"}
        </h1>
        <p style={{fontSize:12,color:"var(--t3)",marginBottom:20,fontFamily:"JetBrains Mono,monospace"}}>
          Powered by OpenRouter · 200+ AI models
        </p>

        {/* Demo hint */}
        <div style={demoBox}>
          <span style={demoTag}>DEMO</span>
          demo@example.com &nbsp;/&nbsp; demo1234
        </div>

        <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:13}}>
          {mode==="register" && <Field label="Username" type="text"  value={form.username} onChange={upd("username")} placeholder="yourname" />}
          <Field label="Email"    type="email"    value={form.email}    onChange={upd("email")}    placeholder="you@example.com" />
          <Field label="Password" type="password" value={form.password} onChange={upd("password")} placeholder="••••••••" />

          {error && <div style={errBox}>{error}</div>}

          <button type="submit" style={btn} disabled={loading}>
            {loading && <span style={spinner}/>}
            {loading ? "Please wait…" : mode==="login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button style={toggle} onClick={()=>{setMode(m=>m==="login"?"register":"login");setError("");}}>
          {mode==="login" ? "No account? Register →" : "Have an account? Sign in →"}
        </button>
      </div>
    </div>
  );
}

function Field({label,...props}:{label:string}&React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      <label style={{fontSize:10.5,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",color:"var(--t2)"}}>{label}</label>
      <input style={{background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:"var(--r1)",padding:"10px 13px",fontSize:13,color:"var(--t1)",width:"100%",transition:"border-color .15s"}}
        onFocus={e=>e.currentTarget.style.borderColor="var(--accent)"}
        onBlur={e=>e.currentTarget.style.borderColor="var(--border2)"}
        {...props} />
    </div>
  );
}

// Styles
const pg      = {minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",padding:24} as React.CSSProperties;
const card    = {width:"100%",maxWidth:400,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r4)",padding:"40px 36px 32px",animation:"fadeUp .3s ease"} as React.CSSProperties;
const logoBox = {width:36,height:36,background:"linear-gradient(135deg,var(--accent),#a78bfa)",borderRadius:"var(--r1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#fff"} as React.CSSProperties;
const demoBox = {display:"flex",alignItems:"center",gap:8,background:"var(--aBg)",border:"1px solid var(--aBorder)",borderRadius:"var(--r1)",padding:"9px 13px",fontSize:11.5,color:"var(--t2)",fontFamily:"JetBrains Mono,monospace",marginBottom:22} as React.CSSProperties;
const demoTag = {background:"var(--accent)",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:3,letterSpacing:"0.06em"} as React.CSSProperties;
const errBox  = {background:"rgba(248,113,113,.1)",border:"1px solid var(--red)",borderRadius:"var(--r1)",padding:"9px 13px",fontSize:12,color:"var(--red)"} as React.CSSProperties;
const btn     = {background:"var(--accent)",color:"#fff",border:"none",borderRadius:"var(--r1)",padding:12,fontSize:13.5,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4,cursor:"pointer",transition:"background .15s",opacity:1} as React.CSSProperties;
const spinner = {width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"} as React.CSSProperties;
const toggle  = {background:"none",border:"none",color:"var(--t3)",fontSize:12,marginTop:18,width:"100%",textAlign:"center",cursor:"pointer",transition:"color .15s"} as React.CSSProperties;
