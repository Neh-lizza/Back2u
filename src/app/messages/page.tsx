// src/app/messages/page.tsx
"use client";

import { useState } from "react";
import { 
  Search, MoreVertical, Phone, Video, 
  Send, Paperclip, Smile,
  ShieldCheck, CheckCheck, Clock
} from "lucide-react";

// --- MOCK CHAT DATA ---
const CHATS = [
  {
    id: 1,
    name: "Jean-Marc E.",
    avatar: "https://i.pravatar.cc/150?u=jm",
    lastMsg: "I found it near the Marche Central...",
    time: "10:45 AM",
    unread: 2,
    verified: true,
    online: true,
    item: "iPhone 13 Pro"
  },
  {
    id: 2,
    name: "Sali Hubert",
    avatar: "https://i.pravatar.cc/150?u=sh",
    lastMsg: "Is the reward still available?",
    time: "Yesterday",
    unread: 0,
    verified: true,
    online: false,
    item: "Toyota Keys"
  },
  {
    id: 3,
    name: "Marie-Louise",
    avatar: "https://i.pravatar.cc/150?u=ml",
    lastMsg: "Sending the location now.",
    time: "Oct 22",
    unread: 0,
    verified: false,
    online: false,
    item: "National ID"
  }
];

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(CHATS[0]);
  const [message, setMessage] = useState("");

  return (
    <main className="h-[calc(100vh-80px)] bg-white flex overflow-hidden font-satoshi">
      
      {/* --- LEFT SIDEBAR: CHAT LIST --- */}
      <aside className="hidden md:flex w-[400px] flex-col border-r border-slate-100 shrink-0">
        <div className="p-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {CHATS.map((chat) => (
            <button 
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`w-full p-6 flex gap-4 transition-all border-l-4 ${activeChat.id === chat.id ? 'bg-primary/5 border-primary' : 'bg-white border-transparent hover:bg-slate-50'}`}
            >
              <div className="relative shrink-0">
                <img src={chat.avatar} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                {chat.online && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary border-2 border-white rounded-full" />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-black text-sm text-dark truncate flex items-center gap-1">
                    {chat.name} {chat.verified && <ShieldCheck size={14} className="text-primary" />}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{chat.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mb-2">{chat.lastMsg}</p>
                <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black uppercase tracking-tighter text-slate-400">
                  Item: {chat.item}
                </span>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-black text-dark">
                  {chat.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* --- RIGHT CONTENT: DM CHAT --- */}
      <section className="flex-1 flex flex-col relative bg-[#FDFDFD]">
        
        {/* DM Header */}
        <header className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <img src={activeChat.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
            <div>
              <h3 className="font-black text-sm uppercase tracking-tight text-dark">{activeChat.name}</h3>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Active Now
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><Phone size={18}/></button>
            <button className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><Video size={18}/></button>
            <button className="p-3 hover:bg-slate-100 rounded-xl text-dark transition-colors"><MoreVertical size={18}/></button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 no-scrollbar">
          
          <div className="flex justify-center">
              <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl flex items-center gap-3">
                  <Clock size={14} className="text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Meeting scheduled: Tomorrow at 2:00 PM</p>
              </div>
          </div>

          {/* Sender Message */}
          <div className="flex gap-4 max-w-[85%] md:max-w-[70%]">
            <img src={activeChat.avatar} className="w-8 h-8 rounded-lg self-end shrink-0" alt="" />
            <div className="bg-white border border-slate-100 p-5 rounded-3xl rounded-bl-none shadow-sm">
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                I found the {activeChat.item} near the central market entrance. It matches your description perfectly.
              </p>
              <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">10:45 AM</p>
            </div>
          </div>

          {/* User Message */}
          <div className="flex flex-row-reverse gap-4 max-w-[85%] md:max-w-[70%] ml-auto">
            <div className="bg-dark p-5 rounded-3xl rounded-br-none shadow-xl shadow-dark/10">
              <p className="text-sm font-medium text-primary leading-relaxed">
                That is amazing! Thank you so much. Can we meet at the Douala Grand Mall safe zone tomorrow?
              </p>
              <div className="flex justify-end items-center gap-1 mt-2">
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">10:48 AM</p>
                  <CheckCheck size={12} className="text-primary" />
              </div>
            </div>
          </div>

          {/* Location Share Card */}
          <div className="flex gap-4 max-w-[85%] md:max-w-[70%]">
            <img src={activeChat.avatar} className="w-8 h-8 rounded-lg self-end shrink-0" alt="" />
            <div className="bg-white border-2 border-slate-100 p-2 rounded-[2rem] shadow-sm overflow-hidden w-64">
              <div className="h-32 bg-slate-200 rounded-[1.5rem] mb-3 bg-[url('https://api.maptiler.com/maps/streets-v2/static/9.7,4.0,14/400x300.png?key=YOUR_KEY')] bg-cover" />
              <div className="px-4 pb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-dark mb-1">Proposed Safe Zone</p>
                  <p className="text-[11px] font-medium text-slate-500 mb-4">Gendarmerie Akwa, Douala</p>
                  <button className="w-full py-2 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-dark transition-colors">View Directions</button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <footer className="p-6 md:p-8 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50 border border-slate-200 p-2 rounded-[2.5rem]">
            <div className="flex items-center">
              <button className="p-3 text-slate-400 hover:text-dark transition-colors"><Paperclip size={20}/></button>
              <button className="p-3 text-slate-400 hover:text-dark transition-colors"><Smile size={20}/></button>
            </div>
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message ${activeChat.name.split(' ')[0]}...`} 
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium px-2 text-dark"
            />
            <button className="bg-dark text-primary p-4 rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-dark/20">
              <Send size={18} strokeWidth={3} />
            </button>
          </div>
        </footer>

      </section>
    </main>
  );
}