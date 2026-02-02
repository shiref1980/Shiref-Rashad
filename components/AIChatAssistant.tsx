
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, Loader2, MessageSquareText, Image as ImageIcon, MapPin, ExternalLink } from 'lucide-react';
import { queryAppAssistant, analyzeConstructionImage } from '../services/geminiService';
import { Project, Client, Employee, Expense, Invoice, PaymentOrder, Correspondence, CurrentUser } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
    role: 'user' | 'assistant';
    text: string;
    sources?: any[];
    image?: string;
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
    const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
    useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isOpen]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64 = (ev.target?.result as string).split(',')[1];
                setSelectedImage({ data: base64, mimeType: file.type });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async () => {
        if ((!input.trim() && !selectedImage) || isLoading) return;

        const userMsg = input.trim();
        const currentImage = selectedImage;
        
        setMessages(prev => [...prev, { 
            role: 'user', 
            text: userMsg || "تحليل الصورة المرفقة",
            image: currentImage ? `data:${currentImage.mimeType};base64,${currentImage.data}` : undefined
        }]);
        
        setInput('');
        setSelectedImage(null);
        setIsLoading(true);

        try {
            let responseText = "";
            let sources = undefined;

            if (currentImage) {
                // استخدام gemini-3-pro-preview لتحليل الصورة
                responseText = await analyzeConstructionImage(currentImage.data, currentImage.mimeType, userMsg || "اشرح محتويات هذه الصورة الهندسية");
            } else {
                // استخدام gemini-2.5-flash مع دعم الخرائط
                const result = await queryAppAssistant(userMsg, data, currentUser?.name || 'User');
                responseText = result.text;
                sources = result.sources;
            }

            setMessages(prev => [...prev, { role: 'assistant', text: responseText, sources }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "عذراً، واجهت مشكلة في معالجة طلبك." }]);
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
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-50 w-80 md:w-96 h-[550px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-slide-down`}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <div>
                        <h4 className="font-bold text-sm">مساعد EB الذكي (V4.0)</h4>
                        <p className="text-[10px] opacity-80">يدعم الخرائط وتحليل الصور الهندسية</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50 dark:bg-slate-950/50">
                {messages.length === 0 && (
                    <div className="text-center py-10 space-y-3">
                        <MessageSquareText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 px-6">يمكنك سؤالي عن أماكن الموردين القريبين أو رفع صورة مخطط لتحليلها.</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-bl-none' : 'bg-white dark:bg-slate-800 dark:text-white border dark:border-slate-700 shadow-sm rounded-br-none'}`}>
                            {msg.image && <img src={msg.image} className="w-full rounded-lg mb-2 border border-white/20" alt="Selected" />}
                            {msg.text}
                            {msg.sources && (
                                <div className="mt-3 pt-2 border-t dark:border-slate-700 space-y-1">
                                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1"><MapPin className="w-3 h-3"/> مصادر خرائط جوجل:</p>
                                    {msg.sources.map((chunk, idx) => (
                                        chunk.maps && (
                                            <a key={idx} href={chunk.maps.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-blue-600 transition truncate">
                                                <ExternalLink className="w-2.5 h-2.5"/> {chunk.maps.title || "رابط الموقع"}
                                            </a>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex justify-start"><div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border dark:border-slate-700"><Loader2 className="w-4 h-4 animate-spin text-blue-600" /></div></div>}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                {selectedImage && (
                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2 rounded-xl border border-blue-100 dark:border-blue-800">
                        <span className="text-[10px] font-bold text-blue-600 truncate flex items-center gap-2"><ImageIcon className="w-3 h-3"/> صورة جاهزة للتحليل</span>
                        <button onClick={() => setSelectedImage(null)} className="text-red-500 p-1"><X className="w-3 h-3"/></button>
                    </div>
                )}
                <div className="flex gap-2">
                    <label className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-blue-100 transition shadow-sm">
                        <ImageIcon className="w-5 h-5 text-slate-500" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                    </label>
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="اسألني أو اطلب تحليل صورة..."
                        className="flex-1 bg-slate-100 dark:bg-slate-800 dark:text-white border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button onClick={handleSend} disabled={isLoading || (!input.trim() && !selectedImage)} className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 shadow-md transition-all"><Send className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
};
