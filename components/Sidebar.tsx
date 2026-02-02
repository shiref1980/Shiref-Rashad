
import React, { useMemo } from 'react';
import { CurrentUser, ChatMessage } from '../types';
import { LayoutDashboard, LogOut, DollarSign, Users, FileText, FileBadge, User, ShieldCheck, Mail, MessageSquare, Building2, PlusCircle, ClipboardCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  currentUser: CurrentUser | null;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  messages?: ChatMessage[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, setCurrentView, currentUser, onLogout, isCollapsed, messages = []
}) => {
  const { t, dir } = useLanguage();
  
  const unreadCount = useMemo(() => {
    if (!currentUser) return 0;
    return messages.filter(m => m.receiverId === currentUser.id && !m.isRead).length;
  }, [messages, currentUser]);

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-[200px]';

  // القائمة الكاملة
  const fullMenuItems = [
    { view: 'DASHBOARD', icon: LayoutDashboard, label: t('dashboard') },
    { view: 'MESSAGES', icon: MessageSquare, label: t('messages'), badge: unreadCount },
    { view: 'CLIENTS', icon: Users, label: t('clients') },
    { view: 'PROJECTS', icon: FileText, label: t('projects_management') },
    { view: 'OFFERS', icon: FileBadge, label: t('price_offers') },
    { view: 'EMPLOYEES', icon: ShieldCheck, label: t('hr_management') },
    { view: 'REPORTS', icon: FileText, label: t('daily_reports') },
    { view: 'CORRESPONDENCE', icon: Mail, label: t('correspondence_system') },
    { view: 'FINANCE', icon: DollarSign, label: t('finance') }
  ];

  // قائمة الإضافة فقط (للموظفين الميدانيين أو مدخلي البيانات)
  const addOnlyMenuItems = [
    { view: 'DASHBOARD', icon: LayoutDashboard, label: t('dashboard') },
    { view: 'MESSAGES', icon: MessageSquare, label: t('messages'), badge: unreadCount },
    { view: 'PROJECTS', icon: ClipboardCheck, label: 'مشاريعك' },
    { view: 'REPORTS', icon: PlusCircle, label: 'إضافة تقرير' },
    { view: 'CORRESPONDENCE', icon: Mail, label: 'المراسلات' }
  ];

  const menuItems = currentUser?.usageMode === 'ADD_ONLY' ? addOnlyMenuItems : fullMenuItems;

  // Admin specific items
  const adminItems = [
      { view: 'COMPANIES', icon: Building2, label: 'إدارة الشركات' }
  ];

  return (
    <aside 
        className={`fixed top-0 bottom-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} bg-slate-950 text-white flex flex-col shadow-2xl transition-all duration-500 ease-in-out border-slate-800 z-[80] ${sidebarWidth} ${dir === 'rtl' ? 'border-l' : 'border-r'}`}
    >
      <div className={`border-b border-slate-800/50 flex flex-col items-center transition-all ${isCollapsed ? 'py-4' : 'p-4'}`}>
        <div className={`bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center text-white shadow-xl border border-white/10 tracking-wider transition-all duration-500 transform hover:rotate-3 cursor-pointer ${isCollapsed ? 'w-10 h-10 text-xs font-black' : 'w-12 h-12 text-lg font-black mb-2'}`}>
          EB
        </div>
        {!isCollapsed && (
            <div className="animate-fade-in text-center">
                <h1 className="text-[10px] font-black leading-tight mt-1 uppercase tracking-tighter text-amber-500 px-1">
                {t('app_name')}
                </h1>
            </div>
        )}
      </div>

      <div className="p-2 overflow-y-auto flex-1 custom-scrollbar space-y-4">
        <div className="pt-2">
           {!isCollapsed && <h2 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-3">{t('navigation')}</h2>}
           <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                    key={item.view}
                    onClick={() => setCurrentView(item.view)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative ${
                        currentView === item.view ? 'bg-white/10 text-white font-black shadow-lg border border-white/5' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                    }`}
                >
                    <item.icon className={`w-4 h-4 transition-all ${currentView === item.view ? 'text-amber-500 scale-110' : 'group-hover:scale-110'}`} />
                    {!isCollapsed && <span className="text-[11px] font-bold">{item.label}</span>}
                    {item.badge && item.badge > 0 && (
                      <span className={`absolute ${isCollapsed ? 'top-1 right-1' : 'top-2.5 left-3'} bg-red-600 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-slate-950 animate-pulse`}>
                        {item.badge}
                      </span>
                    )}
                </button>
              ))}

              {currentUser?.role === 'ADMIN' && currentUser?.usageMode === 'FULL' && (
                  <>
                    {!isCollapsed && <h2 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-6 mb-2 px-3">إدارة النظام</h2>}
                    {adminItems.map((item) => (
                        <button
                            key={item.view}
                            onClick={() => setCurrentView(item.view)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative ${
                                currentView === item.view ? 'bg-amber-500/20 text-amber-500 font-black border border-amber-500/20' : 'text-slate-400 hover:text-amber-400 hover:bg-slate-900'
                            }`}
                        >
                            <item.icon className={`w-4 h-4 transition-all ${currentView === item.view ? 'text-amber-500 scale-110' : 'group-hover:scale-110'}`} />
                            {!isCollapsed && <span className="text-[11px] font-bold">{item.label}</span>}
                        </button>
                    ))}
                  </>
              )}
           </nav>
        </div>
      </div>

      <div className="p-2 mt-auto border-t border-slate-800/50 bg-black/30 space-y-1">
         <button onClick={() => setCurrentView('PROFILE')} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-all group">
           <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
           {!isCollapsed && <span className="text-[11px] font-bold">{t('profile')}</span>}
         </button>
         <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all group">
           <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
           {!isCollapsed && <span className="text-[11px] font-bold">{t('logout')}</span>}
         </button>
      </div>
    </aside>
  );
};
