
import React, { useState, useMemo } from 'react';
import { CompanyId, Account, Project, PaymentOrder, Company, CurrentUser, Voucher, Custody, CustodyTransaction, Employee, Supplier, Invoice, InvoiceItem, Client, JournalEntry, JournalEntryLine } from '../types';
import { TrendingUp, TrendingDown, Plus, DollarSign, Receipt, Printer, X, Wallet, Truck, Landmark, Phone, ReceiptText, Eye, QrCode, Save, BookOpen, Trash2, CreditCard, PieChart, HardHat, Building2, MapPin, Edit } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useDate } from '../contexts/DateContext';

interface Props {
  companyId: CompanyId;
  company: Company;
  currentUser: CurrentUser | null;
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  paymentOrders: PaymentOrder[];
  setPaymentOrders: React.Dispatch<React.SetStateAction<PaymentOrder[]>>;
  projects: Project[];
  clients: Client[];
  vouchers: Voucher[];
  setVouchers: React.Dispatch<React.SetStateAction<Voucher[]>>;
  custody: Custody[];
  setCustody: React.Dispatch<React.SetStateAction<Custody[]>>;
  employees: Employee[];
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  journalEntries: JournalEntry[];
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
}

const SAUDI_BANKS = [
    'البنك الأهلي السعودي (SNB)',
    'مصرف الراجحي',
    'بنك الرياض',
    'البنك السعودي الأول (SAB)',
    'البنك العربي الوطني (ANB)',
    'مصرف الإنماء',
    'بنك البلاد',
    'البنك السعودي للاستثمار (SAIB)',
    'بنك الجزيرة',
    'بنك الخليج الدولي (GIB)',
    'البنك السعودي الفرنسي'
];

export const FinanceModule: React.FC<Props> = ({ 
  companyId, company, currentUser, accounts, setAccounts, invoices, setInvoices,
  paymentOrders, setPaymentOrders, projects, clients, vouchers, setVouchers, custody, setCustody, employees, suppliers, setSuppliers, setEmployees, journalEntries, setJournalEntries
}) => {
  const { t, dir } = useLanguage();
  const { formatDate } = useDate();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ACCOUNTS' | 'INVOICES' | 'PAYMENT_ORDERS' | 'VOUCHERS' | 'CUSTODY' | 'SUPPLIERS' | 'JOURNAL'>('OVERVIEW');
  
  // Forms Visibility
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [showCustodyForm, setShowCustodyForm] = useState(false);
  const [showPaymentOrderForm, setShowPaymentOrderForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showCustodyExpenseForm, setShowCustodyExpenseForm] = useState(false);
  const [showJournalForm, setShowJournalForm] = useState(false);
  
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({ type: 'SUPPLIER' });
  const [newAccount, setNewAccount] = useState<Partial<Account>>({ type: 'ASSET', balance: 0 });

  const companyAccounts = useMemo(() => accounts.filter(a => a.companyId === companyId), [accounts, companyId]);

  const handleSaveAccount = () => {
      if (newAccount.name) {
          const account: Account = {
              id: 'ACC-' + Date.now(),
              code: String(100 + companyAccounts.length + 1),
              name: newAccount.name,
              type: newAccount.type || 'ASSET',
              balance: Number(newAccount.balance) || 0,
              companyId: companyId,
              bankName: newAccount.bankName,
              iban: newAccount.iban
          };
          setAccounts(prev => [...prev, account]);
          setShowAccountForm(false);
          setNewAccount({ type: 'ASSET', balance: 0 });
      } else {
          alert("يرجى إدخال اسم الحساب.");
      }
  };

  const handleSaveSupplier = () => {
    if (newSupplier.name && newSupplier.phone) {
        if (editingSupplierId) {
            setSuppliers(prev => prev.map(s => s.id === editingSupplierId ? { ...s, ...newSupplier } as Supplier : s));
        } else {
            const supplier: Supplier = {
                id: 'SUP-' + Date.now(),
                name: newSupplier.name!,
                phone: newSupplier.phone!,
                service: newSupplier.service || '',
                type: newSupplier.type || 'SUPPLIER',
                companyId: companyId,
                bankName: newSupplier.bankName,
                iban: newSupplier.iban
            };
            setSuppliers(prev => [...prev, supplier]);
        }
        setShowSupplierForm(false);
        setEditingSupplierId(null);
        setNewSupplier({ type: 'SUPPLIER' });
    } else {
        alert("يرجى تعبئة الحقول الأساسية (الاسم والجوال).");
    }
  };

  const handleDeleteAccount = (id: string, name: string) => {
      if (window.confirm(`هل أنت متأكد من حذف حساب "${name}"؟`)) {
          setAccounts(prev => prev.filter(a => a.id !== id));
      }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 shadow-sm border dark:border-slate-800 min-h-screen" dir={dir}>
      
      {/* Finance Navigation */}
      <div className="flex flex-wrap gap-2 mb-10 border-b dark:border-slate-800 pb-6 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('OVERVIEW')} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'OVERVIEW' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>نظرة عامة</button>
        <button onClick={() => setActiveTab('ACCOUNTS')} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'ACCOUNTS' ? 'bg-teal-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>الحسابات البنكية</button>
        <button onClick={() => setActiveTab('PAYMENT_ORDERS')} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'PAYMENT_ORDERS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>أوامر الصرف</button>
        <button onClick={() => setActiveTab('INVOICES')} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'INVOICES' ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>الفواتير</button>
        <button onClick={() => setActiveTab('SUPPLIERS')} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'SUPPLIERS' ? 'bg-purple-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>الموردين</button>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-8 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30 group hover:shadow-xl transition-all">
                    <h3 className="text-[10px] font-black uppercase text-emerald-600 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> إجمالي الإيرادات</h3>
                    <p className="text-4xl font-black text-emerald-700 dark:text-emerald-400">
                      {invoices.filter(i => i.companyId === companyId).reduce((s,i) => s + i.totalAmount, 0).toLocaleString()} <span className="text-sm">SAR</span>
                    </p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-950/20 p-8 rounded-[2rem] border border-rose-100 dark:border-rose-800/30 group hover:shadow-xl transition-all">
                    <h3 className="text-[10px] font-black uppercase text-rose-600 mb-3 flex items-center gap-2"><TrendingDown className="w-4 h-4"/> إجمالي المصروفات</h3>
                    <p className="text-4xl font-black text-rose-700 dark:text-rose-400">
                      {paymentOrders.filter(p => p.companyId === companyId && p.status === 'APPROVED').reduce((s,p) => s + p.amount, 0).toLocaleString()} <span className="text-sm">SAR</span>
                    </p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 group hover:shadow-xl transition-all">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 mb-3 flex items-center gap-2"><Landmark className="w-4 h-4"/> السيولة المتوفرة</h3>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">
                      {companyAccounts.reduce((s,a) => s + a.balance, 0).toLocaleString()} <span className="text-sm">SAR</span>
                    </p>
                </div>
            </div>
        )}

        {/* ACCOUNTS SECTION */}
        {activeTab === 'ACCOUNTS' && (
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black flex items-center gap-3"><CreditCard className="text-teal-600 w-8 h-8"/> الحسابات البنكية</h3>
                    <button onClick={() => setShowAccountForm(true)} className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-teal-700 transition flex items-center gap-2"><Plus className="w-5 h-5"/> إضافة حساب</button>
                </div>

                {showAccountForm && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2.5rem] border-2 dark:border-slate-700 animate-slide-down mb-10 shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="lg:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">مسمى الحساب</label>
                                <input className="w-full p-4 bg-white dark:bg-slate-900 border-2 dark:border-slate-700 rounded-2xl font-black text-sm" value={newAccount.name || ''} onChange={e => setNewAccount({...newAccount, name: e.target.value})} placeholder="مثال: البنك الأهلي - المقاولات" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">اسم البنك</label>
                                <select className="w-full p-4 bg-white dark:bg-slate-900 border-2 dark:border-slate-700 rounded-2xl font-black text-sm" value={newAccount.bankName || ''} onChange={e => setNewAccount({...newAccount, bankName: e.target.value})}>
                                    <option value="">-- اختر البنك --</option>
                                    {SAUDI_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="lg:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">رقم الآيبان IBAN</label>
                                <input className="w-full p-4 bg-white dark:bg-slate-900 border-2 dark:border-slate-700 rounded-2xl font-black text-sm font-mono" value={newAccount.iban || ''} onChange={e => setNewAccount({...newAccount, iban: e.target.value})} placeholder="SA..." />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">الرصيد الافتتاحي</label>
                                <input type="number" className="w-full p-4 bg-white dark:bg-slate-900 border-2 dark:border-slate-700 rounded-2xl font-black text-lg text-teal-600" value={newAccount.balance} onChange={e => setNewAccount({...newAccount, balance: Number(e.target.value)})} />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handleSaveAccount} className="flex-1 bg-teal-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-teal-700 transition flex items-center justify-center gap-3"><Save className="w-6 h-6"/> حفظ الحساب</button>
                            <button onClick={() => setShowAccountForm(false)} className="px-10 py-4 bg-slate-200 dark:bg-slate-700 rounded-2xl font-black text-xs">إلغاء</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companyAccounts.map(a => (
                        <div key={a.id} className="bg-white dark:bg-slate-900 border-2 dark:border-slate-800 rounded-[2rem] p-8 relative group overflow-hidden shadow-sm hover:shadow-xl transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-teal-50 dark:bg-teal-900/30 rounded-2xl text-teal-600"><Landmark className="w-6 h-6"/></div>
                                <button onClick={() => handleDeleteAccount(a.id, a.name)} className="p-2 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                            </div>
                            <h4 className="font-black text-slate-800 dark:text-white text-lg">{a.name}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{a.bankName || 'صندوق نقدي'}</p>
                            <div className="mt-6 mb-4">
                                <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{a.balance.toLocaleString()} <span className="text-xs">SAR</span></p>
                            </div>
                            {a.iban && <p className="text-[9px] font-mono text-teal-600 bg-teal-50 dark:bg-teal-900/10 p-2 rounded-lg break-all border border-teal-100 dark:border-teal-900">{a.iban}</p>}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* SUPPLIERS SECTION */}
        {activeTab === 'SUPPLIERS' && (
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black flex items-center gap-3"><Truck className="text-purple-600 w-8 h-8"/> الموردين ومقاولي الباطن</h3>
                    <button onClick={() => { setNewSupplier({ type: 'SUPPLIER' }); setEditingSupplierId(null); setShowSupplierForm(true); }} className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-purple-700 transition flex items-center gap-2"><Plus className="w-5 h-5"/> إضافة مورد</button>
                </div>

                {showSupplierForm && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2.5rem] border-2 dark:border-slate-700 animate-slide-down mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">اسم المورد / المقاول</label>
                                <input className="w-full p-4 bg-white dark:bg-slate-900 border-2 dark:border-slate-700 rounded-2xl font-black text-sm" value={newSupplier.name || ''} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} placeholder="الاسم الكامل" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">نوع التصنيف</label>
                                <select className="w-full p-4 bg-white dark:bg-slate-900 border-2 dark:border-slate-700 rounded-2xl font-black text-sm" value={newSupplier.type} onChange={e => setNewSupplier({...newSupplier, type: e.target.value as any})}>
                                    <option value="SUPPLIER">مورد خامات</option>
                                    <option value="CONTRACTOR">مقاول باطن</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">رقم الجوال</label>
                                <input className="w-full p-4 bg-white dark:bg-slate-900 border-2 dark:border-slate-700 rounded-2xl font-black text-sm font-mono" value={newSupplier.phone || ''} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} placeholder="05XXXXXXXX" />
                            </div>
                            <div className="lg:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">الخدمة / المادة الموردة</label>
                                <input className="w-full p-4 bg-white dark:bg-slate-900 border-2 dark:border-slate-700 rounded-2xl font-black text-sm" value={newSupplier.service || ''} onChange={e => setNewSupplier({...newSupplier, service: e.target.value})} placeholder="مثال: توريد حديد سابك" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">اسم بنك المورد</label>
                                <select className="w-full p-4 bg-white dark:bg-slate-900 border-2 dark:border-slate-700 rounded-2xl font-black text-sm" value={newSupplier.bankName || ''} onChange={e => setNewSupplier({...newSupplier, bankName: e.target.value})}>
                                    <option value="">-- اختر البنك --</option>
                                    {SAUDI_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="lg:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">رقم آيبان المورد (IBAN)</label>
                                <input className="w-full p-4 bg-white dark:bg-slate-900 border-2 dark:border-slate-700 rounded-2xl font-black text-sm font-mono" value={newSupplier.iban || ''} onChange={e => setNewSupplier({...newSupplier, iban: e.target.value})} placeholder="SA..." />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handleSaveSupplier} className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-purple-700 transition flex items-center justify-center gap-3"><Save className="w-6 h-6"/> حفظ بيانات المورد</button>
                            <button onClick={() => setShowSupplierForm(false)} className="px-10 py-4 bg-slate-200 dark:bg-slate-700 rounded-2xl font-black text-xs">إلغاء</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suppliers.map(s => (
                        <div key={s.id} className="bg-white dark:bg-slate-900 border-2 dark:border-slate-800 rounded-[2.5rem] p-8 hover:shadow-2xl transition group relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-2 h-full ${s.type === 'CONTRACTOR' ? 'bg-amber-500' : 'bg-purple-500'}`}></div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-purple-600 transition-colors"><Building2 className="w-6 h-6"/></div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setNewSupplier(s); setEditingSupplierId(s.id); setShowSupplierForm(true); }} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition"><Edit className="w-4 h-4"/></button>
                                    <button onClick={() => setSuppliers(prev => prev.filter(x => x.id !== s.id))} className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            </div>
                            <h4 className="font-black text-lg leading-tight mb-2">{s.name}</h4>
                            <div className="flex items-center gap-2 mb-6">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${s.type === 'CONTRACTOR' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {s.type === 'CONTRACTOR' ? 'مقاول باطن' : 'مورد خامات'}
                                </span>
                                <span className="text-gray-400 font-bold text-[10px] flex items-center gap-1"><Phone className="w-3 h-3"/> {s.phone}</span>
                            </div>
                            <div className="space-y-4 pt-6 border-t dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <HardHat className="w-4 h-4 text-slate-300"/>
                                    <p className="text-[10px] font-bold text-slate-500 truncate">{s.service || 'لم يحدد النشاط'}</p>
                                </div>
                                {s.bankName && (
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border dark:border-slate-700">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Landmark className="w-3 h-3"/> بيانات التحويل البنكي</p>
                                        <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 mb-2">{s.bankName}</p>
                                        <p className="text-[9px] font-mono text-blue-600 dark:text-blue-400 break-all">{s.iban || 'آيبان غير مسجل'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* ... Rest of the tabs remain (Payment Orders, Invoices, etc.) ... */}
      </div>
    </div>
  );
};
