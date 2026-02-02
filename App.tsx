
import React, { useState, useEffect, useMemo } from 'react';
import { CompanyId, Company, Client, Project, Employee, CurrentUser, Account, JournalEntry, InventoryItem, PurchaseOrder, Invoice, Expense, DailyReport, PaymentOrder, PriceOffer, Correspondence, Voucher, Custody, Notification, Supplier } from './types';
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
import { UserProfile } from './components/UserProfile';
import { Login } from './components/Login';
import { AIChatAssistant } from './components/AIChatAssistant'; 
import { Bell, Search, Languages, CalendarDays, PanelLeftClose, PanelRightClose, AlertCircle, Sun, Moon, X, Building2, Save, ChevronDown, Megaphone, Heart } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import { useDate } from './contexts/DateContext';
import { useTheme } from './contexts/ThemeContext';
import { checkSystemReadiness } from './services/config';

// تم تفريغ البيانات الافتراضية للشركات لتكون جاهزة للإدخال الحقيقي
const INITIAL_COMPANIES: Company[] = [
  { 
    id: CompanyId.EB_GROUP, 
    name: "EB GROUP", 
    fullName: "إدارة المجموعة (حدود الإعمار)", 
    description: "الإدارة العليا والرقابة الإدارية والمالية لكافة قطاعات المجموعة.",
    color: "slate",
    commercialRegister: "",
    taxNumber: "",
    address: "الرياض - الإدارة العامة",
    phone: "",
    poBox: ""
  },
  { 
    id: CompanyId.MMT, 
    name: "MMT", 
    fullName: "شركة منسوب التعمير للمقاولات العامة", 
    description: "متخصصون في البناء والتشييد والترميم بأعلى معايير الجودة والهندسة.",
    color: "blue",
    commercialRegister: "",
    taxNumber: "",
    address: "الرياض",
    phone: "",
    poBox: ""
  },
  { 
    id: CompanyId.EB_DESIGN, 
    name: "EB DESIGN", 
    fullName: "حدود الإعمار للتصميم الهندسي", 
    description: "الإبداع المعماري والتصميم الداخلي المبتكر، وتقديم الاستشارات الهندسية.",
    color: "purple",
    commercialRegister: "",
    taxNumber: "",
    address: "الرياض",
    phone: "",
    poBox: ""
  },
  { 
    id: CompanyId.EB_CONCEPT, 
    name: "EB CONCEPT", 
    fullName: "إي بي كونسبت للتجهيزات والديكور", 
    description: "تنفيذ الديكورات الراقية والأثاث المخصص بأرقى اللمسات الفنية.",
    color: "orange",
    commercialRegister: "",
    taxNumber: "",
    address: "الرياض",
    phone: "",
    poBox: ""
  }
];

const INITIAL_EMPLOYEES: Employee[] = [
    {
        id: '1',
        name: 'المهندس شريف رشاد زكي',
        employeeCode: 'EB-GM-001',
        idNumber: '', // بانتظار الإدخال
        phone: '',
        email: 'sherif@mmt.sa',
        role: 'مدير المجموعة', 
        department: 'الإدارة العليا',
        salary: 0,
        loanBalance: 0,
        vacationBalance: 30,
        companyId: CompanyId.MMT, 
        username: 'admin', 
        password: '123',
        permissionRole: 'ADMIN', 
        permissions: ['VIEW_DASHBOARD', 'VIEW_CLIENTS', 'MANAGE_CLIENTS', 'VIEW_PROJECTS', 'MANAGE_PROJECTS', 'VIEW_FINANCE', 'VIEW_EMPLOYEES', 'MANAGE_REPORTS', 'MANAGE_FINANCE']
    }
];

// الحسابات الافتراضية لضمان عمل النظام المالي
const INITIAL_ACCOUNTS: Account[] = [
    { id: 'acc-cash-1', code: '101', name: 'الصندوق الرئيسي', type: 'ASSET', balance: 50000, companyId: CompanyId.MMT },
    { id: 'acc-bank-1', code: '102', name: 'البنك الأهلي - جاري', type: 'ASSET', balance: 150000, companyId: CompanyId.MMT, bankName: 'SNB', iban: 'SA000000000000' },
    { id: 'acc-custody-1', code: '105', name: 'عهد الموظفين', type: 'ASSET', balance: 0, companyId: CompanyId.MMT },
    { id: 'acc-exp-proj', code: '501', name: 'مصروفات المشاريع', type: 'EXPENSE', balance: 0, companyId: CompanyId.MMT },
    { id: 'acc-rev-proj', code: '401', name: 'إيرادات المشاريع', type: 'REVENUE', balance: 0, companyId: CompanyId.MMT }
];

const ATHKAR = [
    "سبحان الله وبحمده، سبحان الله العظيم",
    "لا إله إلا الله محمد رسول الله",
    "استغفر الله العظيم وأتوب إليه",
    "اللهم صل وسلم على نبينا محمد",
    "لاحول ولا قوة إلا بالله العلي العظيم",
    "الحمد لله على كل حال",
    "سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر"
];

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

  // Run system check on mount
  useEffect(() => {
    checkSystemReadiness();
  }, []);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [companies, setCompanies] = useLocalStorage<Company[]>('eb_companies_v4', INITIAL_COMPANIES);
  const [activeCompanyId, setActiveCompanyId] = useState<string>(CompanyId.EB_GROUP);
  const [currentView, setCurrentView] = useState('DASHBOARD');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

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
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('eb_inventory', []);
  const [purchaseOrders, setPurchaseOrders] = useLocalStorage<PurchaseOrder[]>('eb_purchase_orders', []);
  const [paymentOrders, setPaymentOrders] = useLocalStorage<PaymentOrder[]>('eb_payment_orders', []);
  const [vouchers, setVouchers] = useLocalStorage<Voucher[]>('eb_vouchers', []);
  const [custody, setCustody] = useLocalStorage<Custody[]>('eb_custody', []);

  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0];
  const filteredProjects = projects.filter(p => p.companyId === activeCompanyId);
  const filteredEmployees = employees.filter(e => e.companyId === activeCompanyId);

  const hrAlerts = useMemo(() => {
    const list: string[] = [];
    employees.forEach(emp => {
      if (emp.idExpiryDate) {
        const diff = Math.ceil((new Date(emp.idExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 30) list.push(`${t('id_expiry')} - ${emp.name}`);
      }
    });
    return list;
  }, [employees, t]);

  const topTickerMessages = useMemo(() => {
      const messages = ["مرحباً بكم في نظام مجموعة حدود الإعمار - الإصدار الرابع", ...hrAlerts];
      if (projects.length > 0) messages.push(`عدد المشاريع النشطة: ${projects.length}`);
      return messages;
  }, [hrAlerts, projects]);

  const handleLogin = async (username: string, pass: string): Promise<boolean> => {
    const user = employees.find(e => e.username === username && e.password === pass);
    if (user) {
        setCurrentUser({ id: user.id, name: user.name, role: user.permissionRole, username: user.username || '', companyId: user.companyId, avatar: user.personalPhoto, permissions: user.permissions || [] });
        return true;
    }
    return false;
  };

  const handleSaveCompanyEdit = () => {
    if (editingCompany) {
      setCompanies(prev => prev.map(c => c.id === editingCompany.id ? editingCompany : c));
      setEditingCompany(null);
    }
  };

  const handleCompanyChange = (id: string) => {
    setActiveCompanyId(id);
    setCurrentView('DASHBOARD'); // Auto navigate to dashboard on company change
  };

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard company={activeCompany} projects={filteredProjects} setProjects={setProjects} employees={filteredEmployees} setEmployees={setEmployees} clients={clients} onDeleteProject={(id) => setProjects(prev => prev.filter(p => p.id !== id))} currentUser={currentUser} correspondence={correspondence} setCorrespondence={setCorrespondence} expenses={expenses} onEditCompany={(id) => setEditingCompany(activeCompany)} />;
      case 'CLIENTS': return <ClientProjectManager companyId={activeCompanyId as CompanyId} clients={clients} setClients={setClients} projects={projects} setProjects={setProjects} />;
      case 'OFFERS': return <PriceOfferManager company={activeCompany} clients={clients} offers={priceOffers.filter(o => o.companyId === activeCompanyId)} setOffers={setPriceOffers} currentUser={currentUser} />;
      case 'INVOICES': return <InvoiceManager company={activeCompany} clients={clients} projects={filteredProjects} invoices={invoices} setInvoices={setInvoices} currentUser={currentUser} />;
      case 'PROJECTS': return <ProjectManager company={activeCompany} projects={filteredProjects} setProjects={setProjects} employees={filteredEmployees} setEmployees={setEmployees} clients={clients} onDeleteProject={(id) => setProjects(prev => prev.filter(p => p.id !== id))} currentUser={currentUser} correspondence={correspondence} setCorrespondence={setCorrespondence} expenses={expenses} custody={custody} paymentOrders={paymentOrders} />;
      case 'EMPLOYEES': return <HRManager companyId={activeCompanyId as CompanyId} employees={employees} setEmployees={setEmployees} currentUserRole={currentUser?.role} />;
      case 'FINANCE': return <FinanceModule companyId={activeCompanyId as CompanyId} company={activeCompany} currentUser={currentUser} accounts={accounts} setAccounts={setAccounts} journalEntries={journalEntries} setJournalEntries={setJournalEntries} invoices={invoices} setInvoices={setInvoices} expenses={expenses} setExpenses={setExpenses} inventory={inventory} setInventory={setInventory} purchaseOrders={purchaseOrders} setPurchaseOrders={setPurchaseOrders} paymentOrders={paymentOrders} setPaymentOrders={setPaymentOrders} vouchers={vouchers} setVouchers={setVouchers} custody={custody} setCustody={setCustody} projects={projects} clients={clients} employees={filteredEmployees} suppliers={suppliers} setSuppliers={setSuppliers} setEmployees={setEmployees} />;
      case 'REPORTS': return <DailyReportManager company={activeCompany} projects={filteredProjects} reports={dailyReports.filter(r => filteredProjects.map(p => p.id).includes(r.projectId))} setReports={setDailyReports} currentUser={currentUser} clients={clients} />;
      case 'CORRESPONDENCE': return <CorrespondenceManager company={activeCompany} projects={filteredProjects} correspondence={correspondence.filter(c => c.companyId === activeCompanyId)} setCorrespondence={setCorrespondence} currentUser={currentUser} />;
      case 'PROFILE': return <UserProfile currentUser={currentUser!} employees={employees} companies={companies} onUpdateProfile={(u) => setEmployees(prev => prev.map(e => e.id === currentUser?.id ? {...e, ...u} : e))} onUpdatePassword={() => true} />;
      default: return <div>Loading...</div>;
    }
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  // Adjusted margin calculation for smaller sidebar
  const sidebarWidth = isSidebarCollapsed ? 80 : 200;

  return (
    <div className={`min-h-screen font-cairo flex flex-col transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`} dir={dir}>
      
      {/* Top Ticker */}
      <div className="bg-slate-900 text-white text-xs py-1 overflow-hidden relative z-50 border-b border-slate-700">
          <div className="flex items-center absolute top-0 bottom-0 right-0 z-10 bg-slate-900 px-2 shadow-lg">
              <Megaphone className="w-4 h-4 text-amber-500 animate-pulse"/>
          </div>
          <div className="whitespace-nowrap animate-marquee flex gap-10">
              {topTickerMessages.concat(topTickerMessages).map((msg, i) => (
                  <span key={i} className="mx-8 font-bold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      {msg}
                  </span>
              ))}
          </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
            currentView={currentView} setCurrentView={setCurrentView} currentUser={currentUser} 
            onLogout={() => setCurrentUser(null)} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} 
        />

        <main 
            className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto transition-all duration-500 ease-in-out h-full pb-10"
            style={{ 
                [dir === 'rtl' ? 'marginRight' : 'marginLeft']: `${sidebarWidth}px`,
                width: `calc(100% - ${sidebarWidth}px)`
            }}
        >
            {/* Header code continues... */}
            {/* ... rest of the App component ... */}
            
            {/* Company Edit Modal */}
            {editingCompany && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-2xl border dark:border-slate-800 overflow-hidden animate-slide-down">
                    <div className="bg-slate-950 text-white p-6 flex justify-between items-center border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="bg-amber-500 p-2 rounded-xl text-white">
                                <Building2 className="w-5 h-5"/>
                            </div>
                            <h3 className="font-bold text-lg tracking-tight">{t('edit_company_data')}</h3>
                        </div>
                        <button onClick={() => setEditingCompany(null)} className="hover:bg-white/10 p-2 rounded-full transition"><X/></button>
                    </div>
                    {/* ... modal content ... */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {/* Fields ... */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">{t('full_name_company')}</label>
                            <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-bold shadow-inner" value={editingCompany.fullName} onChange={e => setEditingCompany({...editingCompany, fullName: e.target.value})} />
                        </div>
                        {/* ... other fields ... */}
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-800 flex justify-end gap-4">
                        <button onClick={() => setEditingCompany(null)} className="px-6 py-2 font-bold text-slate-500 hover:text-slate-700 transition">{t('cancel')}</button>
                        <button onClick={handleSaveCompanyEdit} className="bg-amber-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg hover:bg-amber-700 transition flex items-center gap-2"><Save className="w-4 h-4"/> {t('save_changes')}</button>
                    </div>
                </div>
            </div>
            )}

            <header className="sticky top-0 z-40 flex justify-between items-center mb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-4 rounded-2xl shadow-xl border border-white/20 dark:border-slate-800">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm">
                    {isSidebarCollapsed ? (dir === 'rtl' ? <PanelRightClose className="w-5 h-5"/> : <PanelLeftClose className="w-5 h-5"/>) : (dir === 'rtl' ? <PanelLeftClose className="w-5 h-5"/> : <PanelRightClose className="w-5 h-5"/>)}
                </button>
                
                {/* New Company Dropdown in Header */}
                <div className="relative group">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl border dark:border-slate-700 cursor-pointer min-w-[200px]">
                        <div className="bg-amber-500 p-1.5 rounded-lg text-white">
                            <Building2 className="w-4 h-4"/>
                        </div>
                        <select 
                            className="bg-transparent border-none outline-none text-sm font-black text-slate-700 dark:text-slate-200 w-full appearance-none cursor-pointer"
                            value={activeCompanyId}
                            onChange={(e) => handleCompanyChange(e.target.value)}
                        >
                            {companies.map(c => (
                                <option key={c.id} value={c.id} className="text-slate-900 bg-white dark:bg-slate-900">{c.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3 left-auto rtl:left-3 rtl:right-auto"/>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center relative group">
                    <Search className={`absolute top-3 w-4 h-4 text-gray-400 ${dir === 'rtl' ? 'right-4' : 'left-4'}`} />
                    <input className={`bg-slate-100 dark:bg-slate-800 rounded-xl py-2.5 text-xs w-56 border-none focus:ring-2 focus:ring-amber-500/50 transition-all font-bold ${dir === 'rtl' ? 'pr-10' : 'pl-10'}`} placeholder={t('search')} />
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border dark:border-slate-700">
                    <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="px-3 py-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-amber-700 dark:text-amber-400 font-black text-xs flex items-center gap-2">
                    <Languages className="w-4 h-4"/>
                    </button>
                    <div className="w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <button onClick={toggleCalendarSystem} className={`p-1.5 rounded-lg transition-all ${calendarSystem === 'hijri' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-amber-500'}`}>
                    <CalendarDays className="w-4 h-4"/>
                    </button>
                    <button onClick={toggleTheme} className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-amber-500 transition-colors">
                    {theme === 'light' ? <Moon className="w-4 h-4"/> : <Sun className="w-4 h-4"/>}
                    </button>
                </div>

                <div className="relative">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-700 relative transition-all group">
                        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-amber-600" />
                        {hrAlerts.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>}
                    </button>
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

      {/* Bottom Ticker (Athkar) */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md text-white text-[10px] py-1 border-t border-slate-700 z-50 overflow-hidden">
          <div className="whitespace-nowrap animate-marquee-reverse flex gap-20">
              {ATHKAR.concat(ATHKAR).map((thikr, i) => (
                  <span key={i} className="mx-8 font-medium opacity-80 flex items-center gap-2">
                      <Heart className="w-3 h-3 text-amber-500 fill-amber-500"/>
                      {thikr}
                  </span>
              ))}
          </div>
      </div>
    </div>
  );
}
