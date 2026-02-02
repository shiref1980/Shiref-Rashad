
import React, { useState, useEffect, useMemo } from 'react';
import { CompanyId, Company, Client, Project, Employee, CurrentUser, Account, JournalEntry, InventoryItem, PurchaseOrder, Invoice, Expense, DailyReport, PaymentOrder, PriceOffer, Correspondence, Voucher, Custody, Notification, Supplier, AttendanceRecord, CompanyHRSettings, ChatMessage } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ClientProjectManager } from './components/ClientProjectManager';
import { HRManager } from './components/HRManager';
import { FinanceModule } from './components/FinanceModule';
import { DailyReportManager } from './components/DailyReportManager';
import { PriceOfferManager } from './components/PriceOfferManager';
import { InvoiceManager } from './components/InvoiceManager';
import { ProjectManager } from './components/ProjectManager';
import { CorrespondenceManager } from './components/CorrespondenceManager';
import { MessagingSystem } from './components/MessagingSystem';
import { CompaniesManager } from './components/CompaniesManager';
import { UserProfile } from './components/UserProfile';
import { Login } from './components/Login';
import { AIChatAssistant } from './components/AIChatAssistant'; 
import { Bell, Search, Languages, CalendarDays, PanelLeftClose, PanelRightClose, AlertCircle, Sun, Moon, X, Building2, Save, ChevronDown, Megaphone, Heart, Clock, LogIn, LogOut, ShieldAlert } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import { useDate } from './contexts/DateContext';
import { useTheme } from './contexts/ThemeContext';
import { checkSystemReadiness } from './services/config';

const INITIAL_COMPANIES: Company[] = [
  { id: CompanyId.EB_GROUP, name: "EB GROUP", fullName: "إدارة المجموعة (حدود الإعمار)", description: "الإدارة العليا والرقابة الإدارية والمالية لكافة قطاعات المجموعة.", color: "slate" },
  { id: CompanyId.MMT, name: "MMT", fullName: "شركة منسوب التعمير للمقاولات العامة", description: "متخصصون في البناء والتشييد والترميم بأعلى معايير الجودة والهندسة.", color: "blue" },
  { id: CompanyId.EB_DESIGN, name: "EB DESIGN", fullName: "حدود الإعمار للتصميم الهندسي", description: "الإبداع المعماري والتصميم الداخلي المبتكر، وتقديم الاستشارات الهندسية.", color: "purple" },
  { id: CompanyId.EB_CONCEPT, name: "EB CONCEPT", fullName: "إي بي كونسبت للتجهيزات والديكور", description: "تنفيذ الديكورات الراقية والأثاث المخصص بأرقى اللمسات الفنية.", color: "orange" }
];

const DEFAULT_HR_SETTINGS = (cid: string): CompanyHRSettings => ({
    companyId: cid,
    workStartTime: "08:00",
    workEndTime: "16:00",
    allowedDelayMinutes: 15,
    delayPenaltyAmount: 50,
    absencePenaltyRate: 1.0
});

const INITIAL_EMPLOYEES: Employee[] = [
    {
        id: '1', name: 'المهندس شريف رشاد زكي', employeeCode: 'EB-GM-001', idNumber: '100000000', phone: '0500000000', email: 'sherif@mmt.sa', role: 'مدير المجموعة', department: 'الإدارة العليا', salary: 25000, loanBalance: 0, vacationBalance: 30, companyId: CompanyId.MMT, username: 'admin', password: '123', permissionRole: 'ADMIN', permissions: ['VIEW_DASHBOARD', 'VIEW_CLIENTS', 'MANAGE_CLIENTS', 'VIEW_PROJECTS', 'MANAGE_PROJECTS', 'VIEW_FINANCE', 'VIEW_EMPLOYEES', 'MANAGE_REPORTS', 'MANAGE_FINANCE'], canLogin: true, usageMode: 'FULL'
    }
];

const INITIAL_ACCOUNTS: Account[] = [
    { id: 'acc-cash-1', code: '101', name: 'الصندوق الرئيسي', type: 'ASSET', balance: 50000, companyId: CompanyId.MMT },
    { id: 'acc-bank-1', code: '102', name: 'البنك الأهلي - جاري', type: 'ASSET', balance: 150000, companyId: CompanyId.MMT, bankName: 'SNB', iban: 'SA000000000000' }
];

const ATHKAR = ["سبحان الله وبحمده، سبحان الله العظيم", "لا إله إلا الله محمد رسول الله", "استغفر الله العظيم وأتوب إليه", "اللهم صل وسلم على نبينا محمد", "لاحول ولا قوة إلا بالله العلي العظيم", "الحمد لله على كل حال", "سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر"];

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) { return initialValue; }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {}
  };
  return [storedValue, setValue] as const;
}

export default function App() {
  const { t, language, setLanguage, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { calendarSystem, toggleCalendarSystem } = useDate();

  useEffect(() => { checkSystemReadiness(); }, []);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [companies, setCompanies] = useLocalStorage<Company[]>('eb_companies_v5', INITIAL_COMPANIES);
  const [hrConfigs, setHrConfigs] = useLocalStorage<CompanyHRSettings[]>('eb_hr_configs_v2', INITIAL_COMPANIES.map(c => DEFAULT_HR_SETTINGS(c.id)));
  const [activeCompanyId, setActiveCompanyId] = useState<string>(CompanyId.EB_GROUP);
  const [currentView, setCurrentView] = useState('DASHBOARD');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // State Management
  const [clients, setClients] = useLocalStorage<Client[]>('eb_clients', []); 
  const [projects, setProjects] = useLocalStorage<Project[]>('eb_projects', []); 
  const [employees, setEmployees] = useLocalStorage<Employee[]>('eb_employees', INITIAL_EMPLOYEES);
  const [dailyReports, setDailyReports] = useLocalStorage<DailyReport[]>('eb_daily_reports', []); 
  const [priceOffers, setPriceOffers] = useLocalStorage<PriceOffer[]>('eb_price_offers', []);
  const [correspondence, setCorrespondence] = useLocalStorage<Correspondence[]>('eb_correspondence', []);
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('eb_suppliers', []);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('eb_invoices', []);
  const [accounts, setAccounts] = useLocalStorage<Account[]>('eb_accounts', INITIAL_ACCOUNTS);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('eb_journal_entries', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('eb_expenses', []);
  const [paymentOrders, setPaymentOrders] = useLocalStorage<PaymentOrder[]>('eb_payment_orders', []);
  const [vouchers, setVouchers] = useLocalStorage<Voucher[]>('eb_vouchers', []);
  const [custody, setCustody] = useLocalStorage<Custody[]>('eb_custody', []);
  const [attendance, setAttendance] = useLocalStorage<AttendanceRecord[]>('eb_attendance', []);
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('eb_internal_messages', []);

  // Sync Logic
  useEffect(() => {
    if (!companies.find(c => c.id === activeCompanyId)) {
        setActiveCompanyId(companies[0]?.id || '');
    }
  }, [companies, activeCompanyId]);

  const activeCompany = useMemo(() => 
    companies.find(c => c.id === activeCompanyId) || companies[0], 
  [companies, activeCompanyId]);

  const filteredProjects = projects.filter(p => p.companyId === activeCompanyId);
  const filteredEmployees = employees.filter(e => e.companyId === activeCompanyId);

  // Attendance Alert Logic
  const attendanceAlert = useMemo(() => {
    if (!currentUser) return null;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = attendance.find(a => a.employeeId === currentUser.id && a.date === todayStr);
    const userCompanyConfig = hrConfigs.find(c => c.companyId === (currentUser.companyId || activeCompanyId)) || DEFAULT_HR_SETTINGS(activeCompanyId);

    const now = new Date();
    const [startH, startM] = userCompanyConfig.workStartTime.split(':').map(Number);
    const [endH, endM] = userCompanyConfig.workEndTime.split(':').map(Number);
    
    const startTimeDate = new Date(); startTimeDate.setHours(startH, startM, 0);
    const endTimeDate = new Date(); endTimeDate.setHours(endH, endM, 0);

    if (!todayRecord) {
        const reminderStart = new Date(startTimeDate); reminderStart.setMinutes(reminderStart.getMinutes() - 30);
        if (now >= reminderStart) return { type: 'IN', message: t('attendance_reminder') };
    }
    
    if (todayRecord && todayRecord.checkIn && !todayRecord.checkOut) {
        const checkOutReminderStart = new Date(endTimeDate); checkOutReminderStart.setMinutes(checkOutReminderStart.getMinutes() - 30);
        if (now >= checkOutReminderStart) return { type: 'OUT', message: t('checkout_reminder') };
    }
    return null;
  }, [attendance, currentUser, hrConfigs, activeCompanyId, t]);

  const topTickerMessages = useMemo(() => {
      const alerts = [];
      employees.forEach(emp => {
          if (emp.idExpiryDate) {
              const diff = Math.ceil((new Date(emp.idExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              if (diff < 30) alerts.push(`${t('id_expiry')} - ${emp.name}`);
          }
      });
      const msgs = ["مرحباً بكم في نظام مجموعة حدود الإعمار", ...alerts];
      if (attendanceAlert) msgs.unshift(attendanceAlert.message);
      return msgs;
  }, [employees, t, attendanceAlert]);

  const handleLogin = async (username: string, pass: string): Promise<boolean> => {
    const user = employees.find(e => e.username === username && e.password === pass);
    if (user) {
        if (!user.canLogin) {
           alert(t('access_denied_login'));
           return false;
        }
        setCurrentUser({ 
          id: user.id, 
          name: user.name, 
          role: user.permissionRole, 
          username: user.username || '', 
          companyId: user.companyId, 
          avatar: user.personalPhoto, 
          permissions: user.permissions || [],
          usageMode: user.usageMode
        });
        return true;
    }
    return false;
  };

  const handleCompanyChange = (id: string) => {
    setActiveCompanyId(id);
    setCurrentView('DASHBOARD');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard company={activeCompany} projects={filteredProjects} setProjects={setProjects} employees={filteredEmployees} setEmployees={setEmployees} clients={clients} onDeleteProject={(id) => setProjects(prev => prev.filter(p => p.id !== id))} currentUser={currentUser} correspondence={correspondence} setCorrespondence={setCorrespondence} expenses={expenses} onEditCompany={() => setCurrentView('COMPANIES')} />;
      case 'MESSAGES': return <MessagingSystem employees={employees} currentUser={currentUser} messages={messages} setMessages={setMessages} />;
      case 'CLIENTS': return <ClientProjectManager companyId={activeCompanyId as CompanyId} clients={clients} setClients={setClients} projects={projects} setProjects={setProjects} />;
      case 'OFFERS': return <PriceOfferManager company={activeCompany} clients={clients} offers={priceOffers.filter(o => o.companyId === activeCompanyId)} setOffers={setPriceOffers} currentUser={currentUser} />;
      case 'INVOICES': return <InvoiceManager company={activeCompany} clients={clients} projects={filteredProjects} invoices={invoices} setInvoices={setInvoices} currentUser={currentUser} />;
      case 'PROJECTS': return <ProjectManager company={activeCompany} projects={filteredProjects} setProjects={setProjects} employees={filteredEmployees} setEmployees={setEmployees} clients={clients} onDeleteProject={(id) => setProjects(prev => prev.filter(p => p.id !== id))} currentUser={currentUser} correspondence={correspondence} setCorrespondence={setCorrespondence} expenses={expenses} custody={custody} paymentOrders={paymentOrders} />;
      case 'EMPLOYEES': return <HRManager companyId={activeCompanyId as CompanyId} employees={employees} setEmployees={setEmployees} currentUserRole={currentUser?.role} attendance={attendance} setAttendance={setAttendance} currentUser={currentUser} hrConfigs={hrConfigs} setHrConfigs={setHrConfigs} />;
      case 'FINANCE': return <FinanceModule companyId={activeCompanyId as CompanyId} company={activeCompany} currentUser={currentUser} accounts={accounts} setAccounts={setAccounts} journalEntries={journalEntries} setJournalEntries={setJournalEntries} invoices={invoices} setInvoices={setInvoices} paymentOrders={paymentOrders} setPaymentOrders={setPaymentOrders} vouchers={vouchers} setVouchers={setVouchers} custody={custody} setCustody={setCustody} projects={projects} clients={clients} employees={filteredEmployees} suppliers={suppliers} setSuppliers={setSuppliers} setEmployees={setEmployees} />;
      case 'REPORTS': return <DailyReportManager company={activeCompany} projects={filteredProjects} reports={dailyReports.filter(r => filteredProjects.map(p => p.id).includes(r.projectId))} setReports={setDailyReports} currentUser={currentUser} clients={clients} />;
      case 'CORRESPONDENCE': return <CorrespondenceManager company={activeCompany} projects={filteredProjects} correspondence={correspondence.filter(c => c.companyId === activeCompanyId)} setCorrespondence={setCorrespondence} currentUser={currentUser} />;
      case 'COMPANIES': return <CompaniesManager companies={companies} setCompanies={setCompanies} currentUser={currentUser} setHrConfigs={setHrConfigs} />;
      case 'PROFILE': return <UserProfile currentUser={currentUser!} employees={employees} companies={companies} onUpdateProfile={(u) => setEmployees(prev => prev.map(e => e.id === currentUser?.id ? {...e, ...u} : e))} onUpdatePassword={() => true} />;
      default: return <div className="p-10 text-center text-gray-400">View under construction...</div>;
    }
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  const sidebarWidth = isSidebarCollapsed ? 80 : 200;

  return (
    <div className={`min-h-screen font-cairo flex flex-col transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`} dir={dir}>
      
      {/* Top Ticker */}
      <div className={`text-white text-xs py-1.5 overflow-hidden relative z-[70] border-b transition-colors ${attendanceAlert ? 'bg-red-600 shadow-lg' : 'bg-slate-900 border-slate-700'}`}>
          <div className="flex items-center absolute top-0 bottom-0 right-0 z-10 bg-inherit px-2 shadow-lg">
              {attendanceAlert ? <AlertCircle className="w-4 h-4 text-white animate-pulse"/> : <Megaphone className="w-4 h-4 text-amber-500"/>}
          </div>
          <div className="whitespace-nowrap animate-marquee flex gap-10">
              {topTickerMessages.concat(topTickerMessages).map((msg, i) => (
                  <span key={i} className={`mx-8 font-black flex items-center gap-2 ${attendanceAlert?.message === msg ? 'text-white' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${attendanceAlert?.message === msg ? 'bg-white' : 'bg-amber-500'}`}></span>
                      {msg}
                  </span>
              ))}
          </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} currentUser={currentUser} onLogout={() => setCurrentUser(null)} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} messages={messages} />

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto transition-all duration-500 ease-in-out h-full pb-10" style={{ [dir === 'rtl' ? 'marginRight' : 'marginLeft']: `${sidebarWidth}px`, width: `calc(100% - ${sidebarWidth}px)` }}>
            {currentUser.usageMode === 'ADD_ONLY' && (
               <div className="mb-4 bg-amber-500 text-slate-900 px-6 py-3 rounded-2xl flex items-center gap-3 font-black shadow-lg">
                  <ShieldAlert className="w-6 h-6"/>
                  <span>أنت تعمل الآن في وضع "الإضافة فقط" - يمكنك تسجيل البيانات لكن لا يمكنك استعراض كافة أقسام النظام.</span>
               </div>
            )}

            {attendanceAlert && (
                <div className="mb-4 bg-white dark:bg-slate-900 border-2 border-red-500 dark:border-red-600 p-4 rounded-2xl flex justify-between items-center animate-pulse shadow-2xl sticky top-2 z-[45]">
                    <div className="flex items-center gap-3 text-red-600 dark:text-red-400 font-black">
                        <Clock className="w-6 h-6"/>
                        <span className="text-sm md:text-base">{attendanceAlert.message}</span>
                    </div>
                    <button onClick={() => setCurrentView('EMPLOYEES')} className="bg-red-600 text-white px-6 py-2 rounded-xl font-black text-xs hover:bg-red-700 transition flex items-center gap-2 whitespace-nowrap">
                        {attendanceAlert.type === 'IN' ? <LogIn className="w-4 h-4"/> : <LogOut className="w-4 h-4"/>}
                        {attendanceAlert.type === 'IN' ? t('clock_in') : t('clock_out')}
                    </button>
                </div>
            )}

            <header className="sticky top-0 z-40 flex justify-between items-center mb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-4 rounded-2xl shadow-xl border border-white/20 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm">
                        {isSidebarCollapsed ? (dir === 'rtl' ? <PanelRightClose className="w-5 h-5"/> : <PanelLeftClose className="w-5 h-5"/>) : (dir === 'rtl' ? <PanelLeftClose className="w-5 h-5"/> : <PanelRightClose className="w-5 h-5"/>)}
                    </button>
                    <div className="relative group">
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl border dark:border-slate-700 cursor-pointer min-w-[220px]">
                            <div className="bg-amber-500 p-1.5 rounded-lg text-white"><Building2 className="w-4 h-4"/></div>
                            <select className="bg-transparent border-none outline-none text-sm font-black text-slate-700 dark:text-slate-200 w-full appearance-none cursor-pointer" value={activeCompanyId} onChange={(e) => handleCompanyChange(e.target.value)}>
                                {companies.map(c => <option key={c.id} value={c.id} className="text-slate-900 bg-white dark:bg-slate-900">{c.name}</option>)}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3 left-auto rtl:left-3 rtl:right-auto"/>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border dark:border-slate-700">
                        <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="px-3 py-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-amber-700 dark:text-amber-400 font-black text-xs flex items-center gap-2"><Languages className="w-4 h-4"/></button>
                        <button onClick={toggleCalendarSystem} className={`p-1.5 rounded-lg transition-all ${calendarSystem === 'hijri' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-amber-500'}`}><CalendarDays className="w-4 h-4"/></button>
                        <button onClick={toggleTheme} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 transition-colors">{theme === 'light' ? <Moon className="w-4 h-4"/> : <Sun className="w-4 h-4"/>}</button>
                    </div>
                    <button onClick={() => setCurrentView('PROFILE')} className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white font-black text-sm shadow-lg">{currentUser.name.charAt(0)}</div>
                        <div className="hidden md:block text-start pr-1">
                            <p className="text-[9px] font-black text-amber-600 leading-none mb-0.5 uppercase tracking-tighter">{currentUser.role}</p>
                            <p className="text-xs font-black truncate max-w-[80px]">{currentUser.name.split(' ')[0]}</p>
                        </div>
                    </button>
                </div>
            </header>

            <div className="animate-fade-in">{renderContent()}</div>
            <AIChatAssistant currentUser={currentUser} data={{projects, clients, employees, expenses, invoices, paymentOrders, correspondence}} />
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md text-white text-[10px] py-1 border-t border-slate-700 z-[65] overflow-hidden">
          <div className="whitespace-nowrap animate-marquee-reverse flex gap-20">
              {ATHKAR.concat(ATHKAR).map((thikr, i) => (
                  <span key={i} className="mx-8 font-medium opacity-80 flex items-center gap-2"><Heart className="w-3 h-3 text-amber-500 fill-amber-500"/>{thikr}</span>
              ))}
          </div>
      </div>
    </div>
  );
}
