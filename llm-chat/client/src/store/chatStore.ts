import { create } from "zustand";
import type { Conversation, Message, LLMModel } from "../types";

interface S {
  conversations:      Conversation[];
  activeId:           string|null;
  messages:           Record<string,Message[]>;
  streamBuffer:       string;
  isStreaming:        boolean;
  models:             LLMModel[];
  selectedModel:      string;

  setConversations:   (c:Conversation[])=>void;
  upsertConversation: (c:Conversation)=>void;
  removeConversation: (id:string)=>void;
  setActiveId:        (id:string|null)=>void;
  setMessages:        (id:string,m:Message[])=>void;
  pushMessage:        (m:Message)=>void;
  appendChunk:        (chunk:string)=>void;
  setStreaming:       (v:boolean)=>void;
  clearBuffer:        ()=>void;
  setModels:          (m:LLMModel[])=>void;
  setSelectedModel:   (id:string)=>void;
}

export const useChatStore = create<S>((set) => ({
  conversations:[],activeId:null,messages:{},streamBuffer:"",isStreaming:false,models:[],selectedModel:"",

  setConversations: (conversations) => set({ conversations }),

  upsertConversation: (conv) => set(s => ({
    conversations: s.conversations.find(c=>c.id===conv.id)
      ? s.conversations.map(c=>c.id===conv.id?conv:c)
      : [conv,...s.conversations],
  })),

  removeConversation: (id) => set(s => ({
    conversations: s.conversations.filter(c=>c.id!==id),
    activeId: s.activeId===id ? null : s.activeId,
  })),

  setActiveId:      (activeId)    => set({ activeId }),
  setMessages:      (id,msgs)     => set(s=>({ messages:{...s.messages,[id]:msgs} })),
  pushMessage:      (msg)         => set(s=>({ messages:{...s.messages,[msg.conversationId]:[...(s.messages[msg.conversationId]??[]),msg]} })),
  appendChunk:      (chunk)       => set(s=>({ streamBuffer:s.streamBuffer+chunk })),
  setStreaming:     (isStreaming)  => set({ isStreaming }),
  clearBuffer:      ()            => set({ streamBuffer:"" }),
  setModels:        (models)      => set({ models, selectedModel: models[0]?.id ?? "" }),
  setSelectedModel: (selectedModel)=> set({ selectedModel }),
}));
