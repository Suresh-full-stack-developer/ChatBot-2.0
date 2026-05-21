import { create } from "zustand";
import type { User } from "../types";

interface S {
  user: User|null; token:string|null; isAuthenticated:boolean;
  login:(user:User,token:string)=>void; logout:()=>void;
}

export const useAuthStore = create<S>((set) => ({
  user:            JSON.parse(localStorage.getItem("cu")||"null"),
  token:           localStorage.getItem("ct"),
  isAuthenticated: !!localStorage.getItem("ct"),
  login: (user,token) => { localStorage.setItem("ct",token); localStorage.setItem("cu",JSON.stringify(user)); set({user,token,isAuthenticated:true}); },
  logout: () => { localStorage.removeItem("ct"); localStorage.removeItem("cu"); set({user:null,token:null,isAuthenticated:false}); },
}));
