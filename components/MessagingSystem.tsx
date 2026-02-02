
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Employee, ChatMessage, CurrentUser } from '../types';
import { Search, Send, User, MessageSquare, Check, CheckCheck, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  employees: Employee[];
  currentUser: CurrentUser | null;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const MessagingSystem: React.FC<Props> = ({ employees, currentUser, messages, setMessages }) => {
  const { t, dir } = useLanguage();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedEmployee = useMemo(() => 
    employees.find(e => e.id === selectedEmployeeId), 
  [employees, selectedEmployeeId]);

  const filteredEmployees = useMemo(() => 
    employees.filter(e => 
      e.id !== currentUser?.id && 
      e.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  [employees, currentUser, searchQuery]);

  const activeChatMessages = useMemo(() => {
    if (!selectedEmployeeId || !currentUser) return [];
    return messages.filter(m => 
      (m.senderId === currentUser.id && m.receiverId === selectedEmployeeId) ||
      (m.senderId === selectedEmployeeId && m.receiverId === currentUser.id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, selectedEmployeeId, currentUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark as read
    if (selectedEmployeeId && currentUser) {
      const hasUnread = messages.some(m => m.senderId === selectedEmployeeId && m.receiverId === currentUser.id && !m.isRead);
      if (hasUnread) {
        setMessages(prev => prev.map(m => 
          (m.senderId === selectedEmployeeId && m.receiverId === currentUser.id) ? { ...m, isRead: true } : m
        ));
      }
    }
  }, [activeChatMessages, selectedEmployeeId]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedEmployeeId || !currentUser) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: selectedEmployeeId,
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border dark:border-slate-800 flex flex-col md:flex-row h-[700px] overflow-hidden animate-fade-in" dir={dir}>
      
      {/* Employees Sidebar */}
      <div className={`w-full md:w-80 border-e dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/50 ${selectedEmployeeId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b dark:border-slate-800 bg-white dark:bg-slate-900">
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="text-blue-600 w-5 h-5"/> {t('messages')}
          </h3>
          <div className="relative group">
            <Search className={`absolute top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
            <input 
              className={`w-full py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition ${dir === 'rtl' ? 'pr-10' : 'pl-10'}`} 
              placeholder={t('search')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredEmployees.map(emp => {
            const lastMsg = messages.filter(m => (m.senderId === emp.id && m.receiverId === currentUser?.id) || (m.senderId === currentUser?.id && m.receiverId === emp.id)).pop();
            const unread = messages.filter(m => m.senderId === emp.id && m.receiverId === currentUser?.id && !m.isRead).length;

            return (
              <button 
                key={emp.id} 
                onClick={() => setSelectedEmployeeId(emp.id)}
                className={`w-full p-4 rounded-2xl transition-all flex items-center gap-4 group relative ${selectedEmployeeId === emp.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-white dark:hover:bg-slate-800'}`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm">
                    {emp.personalPhoto ? <img src={emp.personalPhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 font-black"><User/></div>}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                </div>
                
                <div className="flex-1 text-start overflow-hidden">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className={`font-black text-xs truncate ${selectedEmployeeId === emp.id ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{emp.name}</p>
                    {lastMsg && <span className={`text-[9px] ${selectedEmployeeId === emp.id ? 'text-blue-100' : 'text-slate-400'}`}>{new Date(lastMsg.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                  <p className={`text-[10px] truncate font-bold ${selectedEmployeeId === emp.id ? 'text-blue-50' : 'text-slate-500'}`}>
                    {lastMsg ? lastMsg.content : emp.role}
                  </p>
                </div>

                {unread > 0 && selectedEmployeeId !== emp.id && (
                  <span className="absolute top-4 right-4 bg-red-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 ${!selectedEmployeeId ? 'hidden md:flex' : 'flex'}`}>
        {selectedEmployee ? (
          <>
            {/* Header */}
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedEmployeeId(null)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition">
                  <Clock className="w-5 h-5"/>
                </button>
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {selectedEmployee.personalPhoto ? <img src={selectedEmployee.personalPhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 font-black"><User/></div>}
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-800 dark:text-white leading-tight">{selectedEmployee.name}</h4>
                  <p className="text-[10px] text-green-500 font-bold tracking-widest uppercase">Online</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/20">
              {activeChatMessages.map((msg, i) => {
                const isMe = msg.senderId === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                    <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`p-4 rounded-2xl text-sm font-bold shadow-sm leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-br-none shadow-blue-500/20' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-bl-none border dark:border-slate-700'}`}>
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[9px] text-slate-400 font-bold">{new Date(msg.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && (
                          msg.isRead ? <CheckCheck className="w-3 h-3 text-blue-500"/> : <Check className="w-3 h-3 text-slate-300"/>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t dark:border-slate-800">
              <div className="flex gap-4">
                <input 
                  className="flex-1 bg-slate-100 dark:bg-slate-800 dark:text-white border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                  placeholder={t('type_message')}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50"
                >
                  <Send className={`w-6 h-6 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-6 animate-pulse">
              <MessageSquare className="w-10 h-10 text-slate-300"/>
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{t('messages')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold max-w-xs">{t('no_chat_selected')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
