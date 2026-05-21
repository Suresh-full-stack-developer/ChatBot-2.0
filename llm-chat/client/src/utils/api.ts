const B = "/api";
async function post(path:string, body:unknown) {
  const r = await fetch(B+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const d = await r.json(); if(!r.ok) throw new Error(d.error||"Request failed"); return d;
}
export const login    = (email:string,password:string) => post("/auth/login",{email,password});
export const register = (username:string,email:string,password:string) => post("/auth/register",{username,email,password});
export async function fetchConversations(token:string) {
  const r = await fetch(`${B}/conversations`,{headers:{Authorization:`Bearer ${token}`}});
  const d = await r.json(); if(!r.ok) throw new Error(d.error); return d.conversations;
}
