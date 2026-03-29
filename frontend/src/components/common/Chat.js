import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Send, User, MessageSquare, ShieldCheck, Mail, Clock, Search } from "lucide-react";

export default function Chat() {
  const { token, currentUser, getAuthHeaders, setUnreadCount } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // ================= FETCH CONTACTS =================
  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/chat/contacts`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (err) {
      console.error("Contacts error:", err);
    }
  };

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 60000); // 1 minute to save on costs
    return () => clearInterval(interval);
  }, [token]);

  // ================= SELECT CONTACT & MARK READ =================
  const handleSelectContact = async (contact) => {
    setSelectedContact(contact);
    try {
      // Mark messages as read
      await fetch(`${API_URL}/auth/chat/read/${contact.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });
      // Refresh contacts to clear the badge locally
      fetchContacts();
      // Recalculate global unread count
      const countRes = await fetch(`${API_URL}/auth/chat/unread-total`, {
        headers: getAuthHeaders()
      });
      if (countRes.ok) {
        const countData = await countRes.json();
        setUnreadCount(countData.unread_count || 0);
      }
    } catch (e) { console.error(e); }
  };

  // ================= FETCH HISTORY =================
  useEffect(() => {
    if (!selectedContact) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/chat/history/${selectedContact.id}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) setMessages(await res.json());
      } catch (err) {
        console.error("History error:", err);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, [selectedContact, token]);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ================= SEND MESSAGE =================
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      const res = await fetch(`${API_URL}/auth/chat/send`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient_id: selectedContact.id,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage("");
        const sentMsg = await res.json();
        setMessages([...messages, sentMsg]);
        fetchContacts(); // Re-sort contacts list
      }
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  const filteredContacts = contacts.filter(c => {
    const term = searchTerm.toLowerCase();
    const username = (c.username || "").toLowerCase();
    const fullName = (c.full_name || "").toLowerCase();
    return username.includes(term) || fullName.includes(term);
  });

  return (
    <div className="flex h-[calc(100vh-140px)] gap-8 animate-fade-in font-sans">
      
      {/* CONTACT LIST */}
      <div className="w-96 bg-white border border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden">
        <div className="p-8 border-b border-slate-50 space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Messaging</h2>
             <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <MessageSquare size={20} />
             </div>
          </div>
          <div className="relative group">
             <Search size={18} className="absolute left-4 top-3 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
             <input
               type="text"
               placeholder="Search contacts..."
               className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-widest focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-slate-900 placeholder-slate-300 shadow-inner"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => handleSelectContact(contact)}
              className={`p-5 rounded-[2rem] cursor-pointer transition-all border flex items-center gap-4 relative group ${
                selectedContact?.id === contact.id
                  ? "bg-indigo-600 text-white border-transparent shadow-xl shadow-indigo-600/30 translate-x-1"
                  : "bg-white border-transparent hover:bg-slate-50 text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-sm ${
                 selectedContact?.id === contact.id ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
              }`}>
                {contact.username[0].toUpperCase()}
              </div>
              <div className="truncate flex-1">
                <div className="flex items-center justify-between mb-1">
                   <p className="font-extrabold text-sm truncate uppercase tracking-tight italic leading-none">
                     {contact.full_name || contact.username.split('@')[0]}
                   </p>
                   {contact.unread_count > 0 && selectedContact?.id !== contact.id && (
                     <span className="flex items-center justify-center w-5 h-5 bg-indigo-600 text-white text-[10px] font-black rounded-full shadow-lg border-2 border-white ring-1 ring-indigo-200 animate-bounce">
                        {contact.unread_count}
                     </span>
                   )}
                </div>
                <p className={`text-[10px] font-bold truncate tracking-wide ${selectedContact?.id === contact.id ? "text-indigo-100" : "text-slate-400"}`}>
                   {contact.last_message_content || "Direct Messaging Active"}
                </p>
              </div>
              {contact.last_message_at && (
                <div className={`absolute top-4 right-4 text-[8px] font-black uppercase tracking-tighter ${selectedContact?.id === contact.id ? "text-indigo-200" : "text-slate-300"}`}>
                   {new Date(contact.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className="flex-1 bg-white border border-slate-100 rounded-[3.5rem] shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden relative">
        {selectedContact ? (
          <>
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/20">
                     {(selectedContact.full_name?.[0] || selectedContact.username[0]).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2 uppercase">
                      {selectedContact.full_name || selectedContact.username.split('@')[0]}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Authorized Secure Channel
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:text-indigo-600 transition-colors cursor-pointer"><Clock size={20}/></div>
                  <div className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:text-indigo-600 transition-colors cursor-pointer"><Mail size={20}/></div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-slate-50/30">
              {messages.map((m, idx) => {
                const isMe = m.sender_id === currentUser?.id;
                return (
                  <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}>
                     <div className={`max-w-[75%] space-y-2`}>
                        <div className={`p-6 rounded-[2rem] text-sm font-bold leading-relaxed shadow-sm ${
                          isMe 
                            ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/10" 
                            : "bg-white text-slate-900 rounded-tl-none border border-slate-100 shadow-slate-200/50"
                        }`}>
                          {m.content}
                        </div>
                        <p className={`text-[9px] font-black uppercase tracking-widest px-2 italic ${isMe ? "text-right text-indigo-300" : "text-left text-slate-300"}`}>
                           {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                     </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-8 bg-white border-t border-slate-50 shrink-0">
               <div className="relative flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Compose private message..."
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-5 text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/30 hover:bg-slate-900 transition-all active:scale-90 shrink-0">
                    <Send size={24} />
                  </button>
               </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-8 bg-slate-50/10">
             <div className="w-32 h-32 bg-indigo-50 border border-indigo-100 rounded-[3rem] flex items-center justify-center text-indigo-400 shadow-inner">
                <MessageSquare size={56} />
             </div>
             <div className="space-y-4">
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">Access Secure Chat</h3>
                <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.2em] max-w-sm leading-loose italic">Select an authorized clinician to establish a direct end-to-end communication node.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
