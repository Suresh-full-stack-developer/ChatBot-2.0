export interface User         { id:string; username:string; email:string }
export interface Message      { id:string; conversationId:string; role:"user"|"assistant"; content:string; model?:string|null; createdAt:string }
export interface Conversation { id:string; userId:string; title:string; createdAt:string; updatedAt:string }
export interface LLMModel     { id:string; label:string; provider:string; free:boolean }
export type     SocketStatus  = "connecting"|"connected"|"disconnected"|"error"
