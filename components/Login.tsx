
import React, { useState } from 'react';
import { Lock, User, ArrowRight, Languages, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t, dir, language, setLanguage } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // محاكاة تأخير التحقق لزيادة الأمان
    setTimeout(async () => {
        const success = await onLogin(username, password);
        if (!success) {
            setError(language === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid login credentials');
            setLoading(false);
        }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-950 font-cairo" dir={dir}>
      {/* Background Architectural Overlay */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover grayscale brightness-50"
            alt="architecture"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
      </div>

      {/* Language Switcher Floating */}
      <div className={`absolute top-8 ${dir === 'rtl' ? 'left-8' : 'right-8'} z-20`}>
          <button 
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-2xl flex items-center gap-3 hover:bg-amber-600 transition-all font-black text-sm shadow-2xl"
          >
            <Languages className="w-5 h-5 text-amber-500"/>
            {language === 'ar' ? 'English' : 'العربية'}
          </button>
      </div>

      <div className="w-full max-w-lg z-10 p-4">
        <div className="bg-slate-900/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden group">
            {/* Animated border line */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>
            
            <div className="text-center mb-10">
                <div className="w-20 h-20 bg-amber-500 mx-auto mb-6 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-amber-500/20 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                    <span className="text-4xl font-black text-slate-950">EB</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-2">
                    {t('login_title')}
                </h2>
                <div className="flex items-center justify-center gap-2">
                    <div className="h-[1px] w-8 bg-amber-500/50"></div>
                    <p className="text-amber-500 text-xs font-black uppercase tracking-[0.3em]">{t('login_subtitle')}</p>
                    <div className="h-[1px] w-8 bg-amber-500/50"></div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t('username')}</label>
                    <div className="relative group/input">
                        <User className={`absolute top-3.5 w-5 h-5 text-slate-500 group-focus-within/input:text-amber-500 transition-colors ${dir === 'rtl' ? 'right-4' : 'left-4'}`} />
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                            className={`w-full py-3.5 bg-slate-950/50 border border-white/10 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition text-white font-black text-sm ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t('password')}</label>
                    <div className="relative group/input">
                        <Lock className={`absolute top-3.5 w-5 h-5 text-slate-500 group-focus-within/input:text-amber-500 transition-colors ${dir === 'rtl' ? 'right-4' : 'left-4'}`} />
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full py-3.5 bg-slate-950/50 border border-white/10 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition text-white font-black text-sm ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-500 text-xs p-4 rounded-2xl text-center border border-red-500/20 font-black animate-shake flex items-center justify-center gap-2">
                        <ShieldCheck className="w-4 h-4"/> {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-amber-500 text-slate-950 py-4 rounded-[1.5rem] font-black hover:bg-amber-400 hover:shadow-[0_10px_40px_rgba(245,158,11,0.3)] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 group/btn text-sm"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-4 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                         {t('login_button')} 
                         <ArrowRight className={`w-5 h-5 group-hover/btn:translate-x-1 transition-transform ${dir === 'rtl' ? 'rotate-180 group-hover/btn:-translate-x-1' : ''}`} />
                        </>
                    )}
                </button>
            </form>
            
            <div className="mt-8 text-center">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{t('copyright')}</p>
            </div>
        </div>
      </div>
    </div>
  );
};
