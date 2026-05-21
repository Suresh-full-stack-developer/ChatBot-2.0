import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuthStore }    from "../store/authStore";
import { useChatStore }    from "../store/chatStore";
import type { SocketStatus } from "../types";

export function useSocket() {
  const token   = useAuthStore(s=>s.token);
  const [status,setStatus] = useState<SocketStatus>("disconnected");
  const ref     = useRef<Socket|null>(null);
  const store   = useChatStore.getState;

  useEffect(()=>{
    if(!token) return;
    const socket = io("http://localhost:4000",{
      auth:{token}, transports:["websocket","polling"],
      reconnection:true, reconnectionDelay:1500, reconnectionAttempts:10,
    });
    ref.current = socket;
    setStatus("connecting");

    socket.on("connect",       ()=>{ setStatus("connected"); socket.emit("models:get"); });
    socket.on("connect_error", ()=>setStatus("error"));
    socket.on("disconnect",    ()=>setStatus("disconnected"));

    socket.on("models:list",          ({models})                   => store().setModels(models));
    socket.on("conversation:created", ({conversation})             => { store().upsertConversation(conversation); store().setActiveId(conversation.id); });
    socket.on("conversation:updated", ({conversation})             => store().upsertConversation(conversation));
    socket.on("conversation:deleted", ({conversationId})           => store().removeConversation(conversationId));
    socket.on("conversation:history", ({conversationId,messages})  => store().setMessages(conversationId,messages));
    socket.on("message:saved",        ({message})                  => store().pushMessage(message));
    socket.on("assistant:typing",     ()                           =>{ store().setStreaming(true); store().clearBuffer(); });
    socket.on("assistant:chunk",      ({chunk})                    => store().appendChunk(chunk));
    socket.on("assistant:done",       ({message})                  =>{ store().setStreaming(false); store().clearBuffer(); store().pushMessage(message); });
    socket.on("error:chat",           ({message})                  => console.error("[socket]",message));

    return ()=>{ socket.disconnect(); ref.current=null; };
  },[token]);

  const emit = useCallback((event:string,data?:unknown)=>{ ref.current?.emit(event,data); },[]);
  return { status, emit };
}
