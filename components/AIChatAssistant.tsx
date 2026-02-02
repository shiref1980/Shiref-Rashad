
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, Loader2, MessageSquareText } from 'lucide-react';
import { queryAppAssistant } from '../services/geminiService';
import { Project, Client, Employee, Expense, Invoice, PaymentOrder, Correspondence, CurrentUser } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

interface AIChatAssistantProps {
    currentUser: CurrentUser | null;
    data: {
        projects: Project[],
        clients: Client[],
        employees: Employee[],
        expenses: Expense[],
        invoices: Invoice[],
        paymentOrders: PaymentOrder[],
        correspondence: Correspondence[]
    };
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ currentUser, data }) => {
    const { t, dir } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await queryAppAssistant(userMsg, data, currentUser?.name || 'User');
            setMessages(prev => [...prev, { role: 'assistant', text: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "عذراً، واجهت مشكلة في الاتصال بالخادم الذكي." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-50 bg-gradient-to-tr from-blue-600 to-indigo-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 animate-bounce group`}
            >
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span className={`absolute ${dir === 'rtl' ? 'right-14' : 'left-14'} top-3 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity`}>المساعد الذكي</span>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-50 w-80 md:w-96 h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-slide-down`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <div>
                        <h4 className="font-bold text-sm">مساعد EB الذكي</h4>
                        <p className="text-[10px] opacity-80">ابحث في المشاريع، المالية، والعملاء</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50 dark:bg-slate-950/50">
                {messages.length === 0 && (
                    <div className="text-center py-10 space-y-3">
                        <MessageSquareText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 px-6">أهلاً بك! يمكنك سؤالي عن أي شيء في النظام. مثلاً: "كم إجمالي العقود النشطة؟" أو "ما هي آخر المصروفات؟"</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                            msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-bl-none' 
                            : 'bg-white dark:bg-slate-800 dark:text-white border dark:border-slate-700 shadow-sm rounded-br-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border dark:border-slate-700">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex gap-2">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="اسألني عن أي شيء..."
                        className="flex-1 bg-slate-100 dark:bg-slate-800 dark:text-white border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
