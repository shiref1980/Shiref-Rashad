
import React, { useState, useMemo } from 'react';
import { CompanyId, Account, Project, PaymentOrder, Company, CurrentUser, Voucher, Custody, CustodyTransaction, Employee, Supplier, Invoice, InvoiceItem, Client, JournalEntry, JournalEntryLine } from '../types';
import { TrendingUp, TrendingDown, Plus, DollarSign, Receipt, Printer, X, Wallet, Truck, AlertTriangle, Landmark, Phone, FileCheck, CheckCircle2, ReceiptText, Eye, QrCode, Search, Save, Calculator, ArrowUpRight, ArrowDownLeft, User, Banknote, Calendar, ClipboardCheck, Trash2, CreditCard, PieChart, Briefcase, HardHat, BookOpen } from 'lucide-react';
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
  
  // Print/Preview States
  const [printView, setPrintView] = useState<'INVOICE' | 'VOUCHER' | null>(null);
  const [selectedItemForPrint, setSelectedItemForPrint] = useState<any>(null);

  // Invoice Form State
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({ date: new Date().toISOString().split('T')[0], items: [] });
  const [newInvoiceItem, setNewInvoiceItem] = useState<Partial<InvoiceItem>>({ quantity: 1, unitPrice: 0 });
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Payment Order Form State
  const [newPaymentOrder, setNewPaymentOrder] = useState<Partial<PaymentOrder>>({ date: new Date().toISOString().split('T')[0], paymentMethod: 'CASH', status: 'DRAFT' });
  const [poProjectId, setPoProjectId] = useState('');
  const [poItemId, setPoItemId] = useState('');

  // Voucher Form State
  const [newVoucher, setNewVoucher] = useState<Partial<Voucher>>({ type: 'RECEIPT', date: new Date().toISOString().split('T')[0] });

  // Custody Form State
  const [newCustody, setNewCustody] = useState<Partial<Custody>>({ date: new Date().toISOString().split('T')[0], amount: 0 });
  const [selectedCustodyId, setSelectedCustodyId] = useState<string | null>(null);
  const [newCustodyTx, setNewCustodyTx] = useState<Partial<CustodyTransaction>>({ date: new Date().toISOString().split('T')[0] });

  // Supplier Form State
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({ type: 'SUPPLIER' });

  // Account Form State
  const [newAccount, setNewAccount] = useState<Partial<Account>>({ type: 'ASSET' });

  // Journal Entry Form State
  const [newJournalEntry, setNewJournalEntry] = useState<Partial<JournalEntry>>({ 
      date: new Date().toISOString().split('T')[0], 
      lines: [
          { id: '1', accountId: '', debit: 0, credit: 0 },
          { id: '2', accountId: '', debit: 0, credit: 0 }
      ] 
  });

  // --- Calculations ---
  const invoiceTotals = useMemo(() => {
    const subtotal = (newInvoice.items || []).reduce((sum, item) => sum + item.total, 0);
    const vat = subtotal * 0.15;
    return { subtotal, vat, total: subtotal + vat };
  }, [newInvoice.items]);

  // Calculate Journal Entry Balance
  const journalBalance = useMemo(() => {
      const totalDebit = newJournalEntry.lines?.reduce((sum, line) => sum + (line.debit || 0), 0) || 0;
      const totalCredit = newJournalEntry.lines?.reduce((sum, line) => sum + (line.credit || 0), 0) || 0;
      return { totalDebit, totalCredit, diff: totalDebit - totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0 };
  }, [newJournalEntry.lines]);

  // Helper for Item Cost Calculations (Budget vs Spent)
  const getItemStats = (projectId: string, itemId: string) => {
      const project = projects.find(p => p.id === projectId);
      const item = project?.items.find(i => i.id === itemId);
      
      // 1. Calculate total spent from Payment Orders (Direct Payments)
      const totalSpentDirect = paymentOrders
          .filter(po => po.projectId === projectId && po.projectItemId === itemId && po.status === 'APPROVED')
          .reduce((sum, po) => sum + po.amount, 0);

      // 2. Calculate total spent from Custody Transactions (Petty Cash/Custody)
      const totalSpentCustody = custody.reduce((sum, c) => {
          const txs = c.transactions?.filter(t => t.projectId === projectId && t.projectItemId === itemId) || [];
          return sum + txs.reduce((s, t) => s + t.amount, 0);
      }, 0);
      
      const totalSpent = totalSpentDirect + totalSpentCustody;

      return { 
          budget: item?.estimatedCost || 0, 
          spent: totalSpent, 
          spentDirect: totalSpentDirect,
          spentCustody: totalSpentCustody,
          remaining: (item?.estimatedCost || 0) - totalSpent 
      };
  };

  const selectedItemStats = useMemo(() => {
      if (!poProjectId || !poItemId) return null;
      return getItemStats(poProjectId, poItemId);
  }, [poProjectId, poItemId, paymentOrders, projects, custody]);

  // For Custody Expense Form Budget Check
  const selectedCustodyItemStats = useMemo(() => {
    if (!newCustodyTx.projectId || !newCustodyTx.projectItemId) return null;
    return getItemStats(newCustodyTx.projectId, newCustodyTx.projectItemId);
  }, [newCustodyTx.projectId, newCustodyTx.projectItemId, paymentOrders, projects, custody]);


  // --- Handlers ---
  const getQrUrl = (data: string) => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;

  const handleAddInvoiceItem = () => {
    if (newInvoiceItem.description && newInvoiceItem.quantity && newInvoiceItem.unitPrice) {
      const item = {
        id: Date.now().toString(),
        description: newInvoiceItem.description,
        quantity: Number(newInvoiceItem.quantity),
        unitPrice: Number(newInvoiceItem.unitPrice),
        total: Number(newInvoiceItem.quantity) * Number(newInvoiceItem.unitPrice)
      };
      setNewInvoice(prev => ({ ...prev, items: [...(prev.items || []), item] }));
      setNewInvoiceItem({ quantity: 1, unitPrice: 0 });
    }
  };

  const handleSaveInvoice = () => {
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project || (newInvoice.items || []).length === 0) return alert(t('fill_required'));

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${company.name.split(' ')[0]}-${String(invoices.length + 1).padStart(4, '0')}`,
      clientId: project.clientId,
      projectId: project.id,
      date: newInvoice.date || '',
      dueDate: newInvoice.dueDate || newInvoice.date || '',
      items: newInvoice.items || [],
      subtotal: invoiceTotals.subtotal,
      vatAmount: invoiceTotals.vat,
      totalAmount: invoiceTotals.total,
      status: 'SENT',
      companyId: company.id
    };

    setInvoices(prev => [invoice, ...prev]);
    setShowInvoiceForm(false);
    setNewInvoice({ date: new Date().toISOString().split('T')[0], items: [] });
  };

  const handleSavePaymentOrder = () => {
      if (newPaymentOrder.recipient && newPaymentOrder.amount && poProjectId && poItemId && newPaymentOrder.paidFromAccountId) {
          const count = paymentOrders.filter(po => po.companyId === companyId).length + 1;
          const code = `PO-${company.name.split(' ')[0]}-${String(count).padStart(4, '0')}`;
          const poId = Date.now().toString();
          
          // Generate Automatic Journal Entry
          const project = projects.find(p => p.id === poProjectId);
          const projectExpenseAccount = accounts.find(a => a.code === '501'); // Assuming '501' is Project Expenses
          
          let linkedJournalId = undefined;

          // If Status is Approved, create JE immediately
          if (projectExpenseAccount) {
              const jeCode = `JE-${new Date().getFullYear()}-${String(journalEntries.length + 1).padStart(4, '0')}`;
              const jeId = `JE-${poId}`;
              
              const journalEntry: JournalEntry = {
                  id: jeId,
                  code: jeCode,
                  date: newPaymentOrder.date || new Date().toISOString().split('T')[0],
                  reference: code,
                  description: `صرف لأمر رقم ${code} - مشروع ${project?.name} - ${newPaymentOrder.description}`,
                  companyId: companyId,
                  status: 'POSTED',
                  lines: [
                      { id: '1', accountId: projectExpenseAccount.id, debit: Number(newPaymentOrder.amount), credit: 0, description: 'Project Expense' },
                      { id: '2', accountId: newPaymentOrder.paidFromAccountId, debit: 0, credit: Number(newPaymentOrder.amount), description: 'Payment Source' }
                  ],
                  totalDebit: Number(newPaymentOrder.amount),
                  totalCredit: Number(newPaymentOrder.amount),
                  relatedEntityId: poId
              };
              setJournalEntries(prev => [journalEntry, ...prev]);
              linkedJournalId = jeId;
              
              // Update Account Balances
              setAccounts(prev => prev.map(acc => {
                  if (acc.id === newPaymentOrder.paidFromAccountId) return { ...acc, balance: acc.balance - Number(newPaymentOrder.amount) };
                  if (acc.id === projectExpenseAccount.id) return { ...acc, balance: acc.balance + Number(newPaymentOrder.amount) };
                  return acc;
              }));
          }

          const order: PaymentOrder = {
              id: poId,
              code,
              companyId,
              projectId: poProjectId,
              projectItemId: poItemId,
              recipient: newPaymentOrder.recipient,
              amount: Number(newPaymentOrder.amount),
              date: newPaymentOrder.date || new Date().toISOString().split('T')[0],
              description: newPaymentOrder.description || '',
              paymentMethod: newPaymentOrder.paymentMethod || 'CASH',
              paidFromAccountId: newPaymentOrder.paidFromAccountId,
              status: 'APPROVED', 
              linkedJournalEntryId: linkedJournalId
          };
          setPaymentOrders(prev => [order, ...prev]);
          setShowPaymentOrderForm(false);
          setNewPaymentOrder({ date: new Date().toISOString().split('T')[0], paymentMethod: 'CASH', status: 'DRAFT' });
          setPoProjectId('');
          setPoItemId('');
      } else {
          alert(t('fill_required'));
      }
  };

  const handleSaveVoucher = () => {
      if(newVoucher.amount && newVoucher.partyName && newVoucher.description) {
          const count = vouchers.filter(v => v.companyId === companyId && v.type === newVoucher.type).length + 1;
          const prefix = newVoucher.type === 'RECEIPT' ? 'RCP' : 'PAY';
          const code = `${prefix}-${company.name.split(' ')[0]}-${String(count).padStart(4, '0')}`;
          
          const voucher: Voucher = {
              id: Date.now().toString(),
              code,
              type: newVoucher.type || 'RECEIPT',
              date: newVoucher.date || new Date().toISOString().split('T')[0],
              amount: Number(newVoucher.amount),
              partyName: newVoucher.partyName,
              description: newVoucher.description,
              accountId: newVoucher.accountId || '',
              companyId
          };
          setVouchers(prev => [voucher, ...prev]);
          setShowVoucherForm(false);
          setNewVoucher({ type: 'RECEIPT', date: new Date().toISOString().split('T')[0] });
      } else {
          alert(t('fill_required'));
      }
  };

  const handleSaveCustody = () => {
      if(newCustody.employeeId && newCustody.amount) {
          const emp = employees.find(e => e.id === newCustody.employeeId);
          const custodyItem: Custody = {
              id: Date.now().toString(),
              companyId,
              employeeId: newCustody.employeeId,
              employeeName: emp?.name || 'Unknown',
              amount: Number(newCustody.amount),
              date: newCustody.date || new Date().toISOString().split('T')[0],
              description: newCustody.description || 'عهدة نقدية مؤقتة',
              projectId: newCustody.projectId, 
              status: 'ACTIVE',
              transactions: []
          };
          setCustody(prev => [custodyItem, ...prev]);
          setShowCustodyForm(false);
          setNewCustody({ date: new Date().toISOString().split('T')[0], amount: 0 });
      } else {
          alert(t('fill_required'));
      }
  };

  const handleReturnCustody = (id: string) => {
      setCustody(prev => prev.map(c => c.id === id ? {...c, status: 'RETURNED', returnDate: new Date().toISOString().split('T')[0]} : c));
  };

  const handleAddCustodyExpense = () => {
    if (selectedCustodyId && newCustodyTx.amount && newCustodyTx.projectId && newCustodyTx.projectItemId) {
        
        // Automatic Journal Entry for Custody Expense (Liquidation)
        // Debit: Project Expense Account | Credit: Employee Custody Account
        const projectExpenseAccount = accounts.find(a => a.code === '501'); 
        const custodyAccount = accounts.find(a => a.code === '105'); // Generic Custody Account
        const project = projects.find(p => p.id === newCustodyTx.projectId);
        
        let linkedJeId = undefined;

        if (projectExpenseAccount && custodyAccount) {
            const jeCode = `JE-CUST-${new Date().getFullYear()}-${String(journalEntries.length + 1).padStart(4, '0')}`;
            const jeId = Date.now().toString() + '_je';
            
            const je: JournalEntry = {
                id: jeId,
                code: jeCode,
                date: newCustodyTx.date || new Date().toISOString().split('T')[0],
                reference: 'CUST-LIQ',
                description: `تصفية عهدة - مشروع ${project?.name} - ${newCustodyTx.description}`,
                companyId: companyId,
                status: 'POSTED',
                lines: [
                    { id: '1', accountId: projectExpenseAccount.id, debit: Number(newCustodyTx.amount), credit: 0 },
                    { id: '2', accountId: custodyAccount.id, debit: 0, credit: Number(newCustodyTx.amount) }
                ],
                totalDebit: Number(newCustodyTx.amount),
                totalCredit: Number(newCustodyTx.amount)
            };
            setJournalEntries(prev => [je, ...prev]);
            linkedJeId = jeId;

            // Update Account Balances
            setAccounts(prev => prev.map(acc => {
                if (acc.id === custodyAccount.id) return { ...acc, balance: acc.balance - Number(newCustodyTx.amount) };
                if (acc.id === projectExpenseAccount.id) return { ...acc, balance: acc.balance + Number(newCustodyTx.amount) };
                return acc;
            }));
        }

        const tx: CustodyTransaction = {
            id: Date.now().toString(),
            date: newCustodyTx.date || new Date().toISOString().split('T')[0],
            amount: Number(newCustodyTx.amount),
            projectId: newCustodyTx.projectId,
            projectItemId: newCustodyTx.projectItemId,
            description: newCustodyTx.description || '',
            linkedJournalEntryId: linkedJeId
        };

        setCustody(prev => prev.map(c => {
            if (c.id === selectedCustodyId) {
                return { ...c, transactions: [tx, ...(c.transactions || [])] };
            }
            return c;
        }));
        setShowCustodyExpenseForm(false);
        setNewCustodyTx({ date: new Date().toISOString().split('T')[0] });
    } else {
        alert(t('fill_required'));
    }
  };

  const openCustodyExpenseForm = (custody: Custody) => {
      setSelectedCustodyId(custody.id);
      // Pre-select project if assigned to custody
      setNewCustodyTx({
          date: new Date().toISOString().split('T')[0],
          projectId: custody.projectId || '' 
      });
      setShowCustodyExpenseForm(true);
  };

  const handleSaveSupplier = () => {
      if (newSupplier.name && newSupplier.phone) {
          const supplier: Supplier = {
              id: Date.now().toString(),
              name: newSupplier.name,
              type: newSupplier.type || 'SUPPLIER',
              phone: newSupplier.phone,
              service: newSupplier.service || '',
              companyId: companyId,
              bankName: newSupplier.bankName,
              iban: newSupplier.iban
          };
          setSuppliers(prev => [...prev, supplier]);
          setShowSupplierForm(false);
          setNewSupplier({ type: 'SUPPLIER' });
      } else {
          alert(t('fill_required'));
      }
  };

  const handleDeleteSupplier = (id: string) => {
      if (window.confirm("Are you sure?")) {
          setSuppliers(prev => prev.filter(s => s.id !== id));
      }
  };

  const handleSaveAccount = () => {
      if (newAccount.name && newAccount.balance !== undefined) {
          const account: Account = {
              id: Date.now().toString(),
              code: String(accounts.length + 100),
              name: newAccount.name,
              type: newAccount.type || 'ASSET',
              balance: Number(newAccount.balance),
              companyId: companyId,
              bankName: newAccount.bankName,
              iban: newAccount.iban
          };
          setAccounts(prev => [...prev, account]);
          setShowAccountForm(false);
          setNewAccount({ type: 'ASSET' });
      } else {
          alert(t('fill_required'));
      }
  };

  const handleDeleteAccount = (id: string) => {
      if (window.confirm("Are you sure?")) {
          setAccounts(prev => prev.filter(a => a.id !== id));
      }
  };

  // Journal Entry Handlers
  const handleAddJournalLine = () => {
      setNewJournalEntry(prev => ({
          ...prev,
          lines: [...(prev.lines || []), { id: Date.now().toString(), accountId: '', debit: 0, credit: 0 }]
      }));
  };

  const handleUpdateJournalLine = (id: string, field: keyof JournalEntryLine, value: any) => {
      setNewJournalEntry(prev => ({
          ...prev,
          lines: prev.lines?.map(l => l.id === id ? { ...l, [field]: value } : l)
      }));
  };

  const handleRemoveJournalLine = (id: string) => {
      setNewJournalEntry(prev => ({
          ...prev,
          lines: prev.lines?.filter(l => l.id !== id)
      }));
  };

  const handleSaveJournalEntry = () => {
      if (!journalBalance.isBalanced) {
          alert("القيد غير متزن. يرجى التأكد من تساوي المدين والدائن.");
          return;
      }
      if (!newJournalEntry.description || (newJournalEntry.lines?.length || 0) < 2) {
          alert("البيانات ناقصة.");
          return;
      }

      const je: JournalEntry = {
          id: Date.now().toString(),
          code: `JE-${new Date().getFullYear()}-${String(journalEntries.length + 1).padStart(4, '0')}`,
          date: newJournalEntry.date!,
          reference: newJournalEntry.reference || '',
          description: newJournalEntry.description!,
          companyId: companyId,
          status: 'POSTED',
          lines: newJournalEntry.lines as JournalEntryLine[],
          totalDebit: journalBalance.totalDebit,
          totalCredit: journalBalance.totalCredit
      };

      // Update Account Balances based on JE
      setAccounts(prev => prev.map(acc => {
          let newBal = acc.balance;
          je.lines.forEach(line => {
              if (line.accountId === acc.id) {
                  // Basic logic: Asset/Expense increases with Debit. Liability/Revenue increases with Credit.
                  // For simplicity in UI display, usually Balance = Debit - Credit for assets.
                  if (['ASSET', 'EXPENSE'].includes(acc.type)) {
                      newBal += (line.debit - line.credit);
                  } else {
                      newBal += (line.credit - line.debit);
                  }
              }
          });
          return { ...acc, balance: newBal };
      }));

      setJournalEntries(prev => [je, ...prev]);
      setShowJournalForm(false);
      setNewJournalEntry({ 
          date: new Date().toISOString().split('T')[0], 
          lines: [
              { id: '1', accountId: '', debit: 0, credit: 0 },
              { id: '2', accountId: '', debit: 0, credit: 0 }
          ] 
      });
  };

  // --- Print Views ---
  if (printView === 'VOUCHER' && selectedItemForPrint) {
      const v = selectedItemForPrint as Voucher;
      const themeColor = v.type === 'RECEIPT' ? 'emerald' : 'rose';
      const typeLabel = v.type === 'RECEIPT' ? t('receipt_voucher') : t('payment_voucher');
      
      return (
          <div className="bg-slate-100 min-h-screen p-10 flex justify-center fixed inset-0 z-[100] overflow-y-auto">
              <div className="bg-white w-[210mm] min-h-[148mm] shadow-2xl p-12 relative print:w-full print:shadow-none print:p-0 flex flex-col justify-between">
                  <div className="absolute top-6 left-[-100px] flex flex-col gap-3 print:hidden">
                      <button onClick={() => window.print()} className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl hover:bg-blue-700 transition"><Printer/></button>
                      <button onClick={() => setPrintView(null)} className="bg-slate-800 text-white p-4 rounded-2xl shadow-xl hover:bg-slate-700 transition"><X/></button>
                  </div>

                  <div className={`border-b-4 border-${themeColor}-600 pb-6 flex justify-between items-center`}>
                     <div>
                         <h1 className="text-3xl font-black text-slate-800 uppercase">{company.fullName}</h1>
                         <p className="text-slate-500 font-bold text-sm mt-1">{t('financial_management')}</p>
                     </div>
                     <div className={`border-4 border-${themeColor}-600 p-4 rounded-xl`}>
                         <h2 className={`text-2xl font-black text-${themeColor}-700 uppercase`}>{typeLabel}</h2>
                     </div>
                     <div className="text-center">
                         <p className="font-mono font-black text-xl">{v.code}</p>
                         <p className="text-sm text-gray-400">{formatDate(v.date)}</p>
                     </div>
                  </div>

                  <div className="flex-1 py-10 space-y-8">
                      <div className="flex justify-between items-end bg-slate-50 p-6 rounded-2xl border">
                           <div className="w-2/3">
                               <p className="text-xs text-slate-400 font-bold uppercase mb-1">{v.type === 'RECEIPT' ? 'استلمنا من السيد/السادة' : 'صرفنا إلى السيد/السادة'}</p>
                               <p className="text-2xl font-black text-slate-800">{v.partyName}</p>
                           </div>
                           <div className="w-1/3 text-end">
                               <p className="text-xs text-slate-400 font-bold uppercase mb-1">{t('amount')}</p>
                               <p className={`text-3xl font-black font-mono text-${themeColor}-600`}>{v.amount.toLocaleString()} <span className="text-sm text-black">SAR</span></p>
                           </div>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-2xl border min-h-[100px]">
                           <p className="text-xs text-slate-400 font-bold uppercase mb-2">{t('description')} / وذلك عن</p>
                           <p className="text-lg font-bold text-slate-700 leading-relaxed">{v.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                          <div>
                              <p className="text-xs text-slate-400 font-bold uppercase mb-1">{t('payment_method')}</p>
                              <div className="flex gap-4 mt-2">
                                  <span className="flex items-center gap-2 font-bold"><div className="w-4 h-4 border-2 border-slate-400 rounded-full"></div> نقداً</span>
                                  <span className="flex items-center gap-2 font-bold"><div className="w-4 h-4 border-2 border-slate-400 rounded-full"></div> شيك</span>
                                  <span className="flex items-center gap-2 font-bold"><div className="w-4 h-4 border-2 border-slate-400 rounded-full"></div> تحويل بنكي</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-3 gap-10 mt-auto pt-10 border-t-2 border-slate-100">
                      <div className="text-center">
                          <p className="font-bold text-slate-400 text-sm mb-8">المحاسب</p>
                          <div className="h-0.5 bg-slate-200 w-2/3 mx-auto"></div>
                      </div>
                      <div className="text-center">
                          <p className="font-bold text-slate-400 text-sm mb-8">المدير المالي</p>
                          <div className="h-0.5 bg-slate-200 w-2/3 mx-auto"></div>
                      </div>
                      <div className="text-center">
                          <p className="font-bold text-slate-400 text-sm mb-8">{v.type === 'RECEIPT' ? 'المستلم' : 'المستفيد'}</p>
                          <div className="h-0.5 bg-slate-200 w-2/3 mx-auto"></div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border dark:border-slate-800 min-h-screen" dir={dir}>
      {/* Dynamic Finance Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 border-b dark:border-slate-800 pb-4 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('OVERVIEW')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'OVERVIEW' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>{t('financial_position')}</button>
        <button onClick={() => setActiveTab('ACCOUNTS')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'ACCOUNTS' ? 'bg-teal-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>{t('bank_accounts')}</button>
        <button onClick={() => setActiveTab('JOURNAL')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'JOURNAL' ? 'bg-slate-700 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>قيود اليومية</button>
        <button onClick={() => setActiveTab('PAYMENT_ORDERS')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'PAYMENT_ORDERS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>{t('payment_orders')}</button>
        <button onClick={() => setActiveTab('INVOICES')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'INVOICES' ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>{t('invoices')}</button>
        <button onClick={() => setActiveTab('VOUCHERS')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'VOUCHERS' ? 'bg-amber-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>{t('vouchers')}</button>
        <button onClick={() => setActiveTab('CUSTODY')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'CUSTODY' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>{t('employee_custody')}</button>
        <button onClick={() => setActiveTab('SUPPLIERS')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'SUPPLIERS' ? 'bg-purple-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>{t('suppliers_contractors')}</button>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-8 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
                    <h3 className="text-[10px] font-black uppercase text-emerald-600 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> {t('revenues')}</h3>
                    <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                      {invoices.filter(i => i.companyId === companyId).reduce((s,i) => s + i.totalAmount, 0).toLocaleString()} <span className="text-xs">SAR</span>
                    </p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-950/20 p-8 rounded-3xl border border-rose-100 dark:border-rose-800/30">
                    <h3 className="text-[10px] font-black uppercase text-rose-600 mb-3 flex items-center gap-2"><TrendingDown className="w-4 h-4"/> {t('expenses')}</h3>
                    <p className="text-3xl font-black text-rose-700 dark:text-rose-400">
                      {paymentOrders.filter(p => p.companyId === companyId && p.status === 'APPROVED').reduce((s,p) => s + p.amount, 0).toLocaleString()} <span className="text-xs">SAR</span>
                    </p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 mb-3 flex items-center gap-2"><Landmark className="w-4 h-4"/> {t('bank_cash')}</h3>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                      {accounts.filter(a => a.companyId === companyId).reduce((s,a) => s + a.balance, 0).toLocaleString()} <span className="text-xs">SAR</span>
                    </p>
                </div>
            </div>
        )}

        {/* ACCOUNTS SECTION */}
        {activeTab === 'ACCOUNTS' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black flex items-center gap-3"><CreditCard className="text-teal-600 w-6 h-6"/> {t('bank_accounts')}</h3>
                    <button onClick={() => setShowAccountForm(true)} className="bg-teal-600 text-white px-6 py-3 rounded-xl font-black text-xs shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all flex items-center gap-2"><Plus className="w-4 h-4"/> {t('add_bank_account')}</button>
                </div>

                {showAccountForm && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border-2 border-teal-100 dark:border-slate-700 animate-slide-down mb-8">
                        <div className="flex justify-between mb-6"><h4 className="font-black text-teal-700 text-sm uppercase tracking-widest">{t('add_bank_account')}</h4><button onClick={() => setShowAccountForm(false)}><X className="text-gray-400"/></button></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('account_name')}</label>
                                <input className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newAccount.name || ''} onChange={e => setNewAccount({...newAccount, name: e.target.value})} placeholder="مثال: البنك الأهلي - جاري" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('bank_name')}</label>
                                <input className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newAccount.bankName || ''} onChange={e => setNewAccount({...newAccount, bankName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('iban')}</label>
                                <input className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm font-mono" value={newAccount.iban || ''} onChange={e => setNewAccount({...newAccount, iban: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('current_balance')}</label>
                                <input type="number" className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newAccount.balance} onChange={e => setNewAccount({...newAccount, balance: Number(e.target.value)})} />
                            </div>
                        </div>
                        <button onClick={handleSaveAccount} className="w-full bg-teal-600 text-white py-3 rounded-xl font-black shadow-xl hover:bg-teal-700 transition text-sm">{t('save')}</button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {accounts.filter(a => a.companyId === companyId).map(a => (
                        <div key={a.id} className="bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm hover:shadow-lg transition relative group">
                            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDeleteAccount(a.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                            </div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                                        <Landmark className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-white leading-tight text-sm">{a.name}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{a.bankName}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t('current_balance')}</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{a.balance.toLocaleString()} <span className="text-xs font-bold text-gray-400">SAR</span></p>
                            </div>
                            {a.iban && (
                                <div className="pt-4 border-t dark:border-slate-800">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t('iban')}</p>
                                    <p className="font-mono text-xs text-slate-600 dark:text-slate-300 break-all">{a.iban}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {accounts.length === 0 && <div className="col-span-full text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">{t('no_documents')}</div>}
                </div>
            </div>
        )}

        {/* JOURNAL TAB */}
        {activeTab === 'JOURNAL' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black flex items-center gap-3"><BookOpen className="text-slate-600 w-6 h-6"/> قيود اليومية العامة</h3>
                    <button onClick={() => setShowJournalForm(true)} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-black text-xs shadow-xl hover:bg-slate-700 transition-all flex items-center gap-2"><Plus className="w-4 h-4"/> قيد جديد</button>
                </div>

                {showJournalForm && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700 animate-slide-down mb-8">
                        <div className="flex justify-between mb-6">
                            <h4 className="font-black text-slate-700 text-sm uppercase tracking-widest">إضافة قيد يومية يدوي</h4>
                            <button onClick={() => setShowJournalForm(false)}><X className="text-gray-400"/></button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('date')}</label>
                                <input type="date" className="w-full p-2 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newJournalEntry.date} onChange={e => setNewJournalEntry({...newJournalEntry, date: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('description')}</label>
                                <input className="w-full p-2 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" placeholder="شرح القيد..." value={newJournalEntry.description || ''} onChange={e => setNewJournalEntry({...newJournalEntry, description: e.target.value})} />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-inner mb-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-400 border-b dark:border-slate-700">
                                        <th className="p-2 text-start w-1/3">الحساب</th>
                                        <th className="p-2 text-start">البيان (اختياري)</th>
                                        <th className="p-2 text-center w-24">مدين</th>
                                        <th className="p-2 text-center w-24">دائن</th>
                                        <th className="p-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {newJournalEntry.lines?.map((line, idx) => (
                                        <tr key={line.id} className="border-b dark:border-slate-800 last:border-none">
                                            <td className="p-2">
                                                <select 
                                                    className="w-full p-1 bg-transparent border rounded"
                                                    value={line.accountId}
                                                    onChange={e => handleUpdateJournalLine(line.id, 'accountId', e.target.value)}
                                                >
                                                    <option value="">-- اختر الحساب --</option>
                                                    {accounts.filter(a => a.companyId === companyId).map(a => <option key={a.id} value={a.id}>{a.name} ({a.balance})</option>)}
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <input className="w-full p-1 bg-transparent border rounded" value={line.description || ''} onChange={e => handleUpdateJournalLine(line.id, 'description', e.target.value)} />
                                            </td>
                                            <td className="p-2">
                                                <input type="number" className="w-full p-1 bg-transparent border rounded text-center" value={line.debit} onChange={e => handleUpdateJournalLine(line.id, 'debit', Number(e.target.value))} />
                                            </td>
                                            <td className="p-2">
                                                <input type="number" className="w-full p-1 bg-transparent border rounded text-center" value={line.credit} onChange={e => handleUpdateJournalLine(line.id, 'credit', Number(e.target.value))} />
                                            </td>
                                            <td className="p-2 text-center">
                                                <button onClick={() => handleRemoveJournalLine(line.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={5} className="p-2 text-center">
                                            <button onClick={handleAddJournalLine} className="text-blue-600 text-xs font-bold hover:underline">+ إضافة طرف</button>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="flex justify-between items-center mb-4 px-4">
                            <div className="flex gap-4 text-sm font-bold">
                                <span className="text-green-600">إجمالي المدين: {journalBalance.totalDebit}</span>
                                <span className="text-red-600">إجمالي الدائن: {journalBalance.totalCredit}</span>
                            </div>
                            <div className={`text-xs font-black px-3 py-1 rounded-full ${journalBalance.isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {journalBalance.isBalanced ? 'متزن' : `غير متزن (الفرق: ${journalBalance.diff})`}
                            </div>
                        </div>

                        <button onClick={handleSaveJournalEntry} className="w-full bg-slate-800 text-white py-3 rounded-xl font-black hover:bg-slate-700 transition" disabled={!journalBalance.isBalanced}>{t('save')}</button>
                    </div>
                )}

                <div className="space-y-4">
                    {journalEntries.filter(j => j.companyId === companyId).map(j => (
                        <div key={j.id} className="bg-white dark:bg-slate-900 border rounded-2xl p-4 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-xs font-mono font-black text-slate-500 bg-slate-100 px-2 py-1 rounded">{j.code}</span>
                                    <h4 className="font-bold text-slate-800 dark:text-white mt-1">{j.description}</h4>
                                </div>
                                <span className="text-xs text-gray-400">{formatDate(j.date)}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-xs">
                                {j.lines.map((line, idx) => {
                                    const accName = accounts.find(a => a.id === line.accountId)?.name || 'Unknown';
                                    return (
                                        <div key={idx} className="flex justify-between border-b dark:border-slate-700 last:border-0 py-1">
                                            <span>{accName}</span>
                                            <div className="flex gap-4 font-mono">
                                                <span className="text-green-600 w-16 text-end">{line.debit > 0 ? line.debit.toLocaleString() : '-'}</span>
                                                <span className="text-red-600 w-16 text-end">{line.credit > 0 ? line.credit.toLocaleString() : '-'}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div className="flex justify-between font-bold border-t dark:border-slate-700 pt-1 mt-1">
                                    <span>الإجمالي</span>
                                    <div className="flex gap-4 font-mono">
                                        <span className="text-green-700 w-16 text-end">{j.totalDebit.toLocaleString()}</span>
                                        <span className="text-red-700 w-16 text-end">{j.totalCredit.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {journalEntries.length === 0 && <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">لا توجد قيود مسجلة</div>}
                </div>
            </div>
        )}

        {/* PAYMENT ORDERS SECTION */}
        {activeTab === 'PAYMENT_ORDERS' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black flex items-center gap-3"><ClipboardCheck className="text-indigo-600 w-6 h-6"/> {t('payment_orders')}</h3>
                    <button onClick={() => setShowPaymentOrderForm(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2"><Plus className="w-4 h-4"/> {t('new_payment_order')}</button>
                </div>

                {showPaymentOrderForm && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border-2 border-indigo-100 dark:border-slate-700 animate-slide-down mb-8">
                        <div className="flex justify-between mb-6"><h4 className="font-black text-indigo-700 text-sm uppercase tracking-widest">{t('new_payment_order')}</h4><button onClick={() => setShowPaymentOrderForm(false)}><X className="text-gray-400"/></button></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('project')}</label>
                                <select className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={poProjectId} onChange={e => setPoProjectId(e.target.value)}>
                                    <option value="">{t('select_project')}</option>
                                    {projects.filter(p => p.companyId === companyId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('item_work')}</label>
                                <select className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={poItemId} onChange={e => setPoItemId(e.target.value)} disabled={!poProjectId}>
                                    <option value="">{t('select_item')}</option>
                                    {projects.find(p => p.id === poProjectId)?.items.map(item => <option key={item.id} value={item.id}>{item.description}</option>)}
                                </select>
                            </div>
                            
                            {/* Budget Status Card */}
                            {selectedItemStats && (
                                <div className="md:col-span-2 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-[9px] text-indigo-400 uppercase font-black">{t('budget_amount')}</p>
                                        <p className="font-bold text-slate-700 dark:text-white">{selectedItemStats.budget.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-orange-400 uppercase font-black">{t('spent_amount')}</p>
                                        <p className="font-bold text-orange-600">{selectedItemStats.spent.toLocaleString()}</p>
                                        <p className="text-[8px] text-gray-400">(Direct: {selectedItemStats.spentDirect.toLocaleString()} + Custody: {selectedItemStats.spentCustody.toLocaleString()})</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-green-400 uppercase font-black">{t('remaining_budget')}</p>
                                        <p className={`font-bold ${selectedItemStats.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>{selectedItemStats.remaining.toLocaleString()}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('recipient_name')}</label>
                                <input className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newPaymentOrder.recipient || ''} onChange={e => setNewPaymentOrder({...newPaymentOrder, recipient: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('amount')}</label>
                                <input type="number" className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newPaymentOrder.amount || ''} onChange={e => setNewPaymentOrder({...newPaymentOrder, amount: Number(e.target.value)})} />
                            </div>
                            
                            {/* Payment Source Selection */}
                            <div className="md:col-span-2 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                                <label className="block text-[10px] font-black text-yellow-800 uppercase mb-2 tracking-widest">حساب الصرف (سيتم إنشاء قيد آلي)</label>
                                <select 
                                    className="w-full p-3 bg-white border rounded-xl font-bold text-sm"
                                    value={newPaymentOrder.paidFromAccountId || ''}
                                    onChange={e => setNewPaymentOrder({...newPaymentOrder, paidFromAccountId: e.target.value})}
                                >
                                    <option value="">-- اختر الحساب (بنك / صندوق) --</option>
                                    {accounts.filter(a => a.companyId === companyId && ['ASSET'].includes(a.type)).map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} (R: {acc.balance})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('date')}</label>
                                <input type="date" className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newPaymentOrder.date} onChange={e => setNewPaymentOrder({...newPaymentOrder, date: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('payment_method')}</label>
                                <select className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newPaymentOrder.paymentMethod} onChange={e => setNewPaymentOrder({...newPaymentOrder, paymentMethod: e.target.value as any})}>
                                    <option value="CASH">Cash</option>
                                    <option value="CHECK">Check</option>
                                    <option value="TRANSFER">Bank Transfer</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('description')}</label>
                                <textarea className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm h-20 resize-none" value={newPaymentOrder.description || ''} onChange={e => setNewPaymentOrder({...newPaymentOrder, description: e.target.value})} />
                            </div>
                        </div>
                        <button onClick={handleSavePaymentOrder} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black shadow-xl hover:bg-indigo-700 transition text-sm">{t('save')}</button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {paymentOrders.filter(po => po.companyId === companyId).map(po => {
                        const project = projects.find(p => p.id === po.projectId);
                        return (
                            <div key={po.id} className="bg-white dark:bg-slate-900 border rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{po.code}</span>
                                        <h4 className="font-bold text-slate-800 dark:text-white">{po.recipient}</h4>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-1">{po.description}</p>
                                    <div className="flex gap-2 text-[10px] text-gray-400 font-bold">
                                        <span className="bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">{project?.name}</span>
                                        <span className="bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">{formatDate(po.date)}</span>
                                        {po.linkedJournalEntryId && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1"><BookOpen className="w-3 h-3"/> قيد آلي</span>}
                                    </div>
                                </div>
                                <div className="text-end">
                                    <p className="text-xl font-black text-slate-800 dark:text-white">{po.amount.toLocaleString()} <span className="text-[10px]">SAR</span></p>
                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">{po.status}</span>
                                </div>
                            </div>
                        );
                    })}
                    {paymentOrders.length === 0 && <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">{t('no_documents')}</div>}
                </div>
            </div>
        )}

        {/* INVOICES SECTION */}
        {activeTab === 'INVOICES' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black flex items-center gap-3"><ReceiptText className="text-emerald-600 w-6 h-6"/> {t('invoices')}</h3>
                    <button onClick={() => setShowInvoiceForm(true)} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2"><Plus className="w-4 h-4"/> {t('create_invoice')}</button>
                </div>

                {showInvoiceForm && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border-2 border-emerald-100 dark:border-slate-700 animate-slide-down mb-8">
                         <div className="flex justify-between mb-8"><h4 className="font-black text-emerald-700 text-sm uppercase tracking-widest">{t('create_invoice')}</h4><button onClick={() => setShowInvoiceForm(false)}><X className="text-gray-400"/></button></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('project')} (إلزامي)</label>
                                <select className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>
                                    <option value="">{t('select_project')}</option>
                                    {projects.filter(p => p.companyId === companyId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('date')}</label>
                                <input type="date" className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newInvoice.date} onChange={e => setNewInvoice({...newInvoice, date: e.target.value})} />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-50 mb-6">
                            <div className="grid grid-cols-12 gap-3 items-end mb-4">
                                <div className="col-span-6"><input placeholder={t('description')} className="w-full p-3 border rounded-xl text-sm" value={newInvoiceItem.description || ''} onChange={e => setNewInvoiceItem({...newInvoiceItem, description: e.target.value})} /></div>
                                <div className="col-span-2"><input type="number" placeholder="Qty" className="w-full p-3 border rounded-xl text-sm" value={newInvoiceItem.quantity} onChange={e => setNewInvoiceItem({...newInvoiceItem, quantity: Number(e.target.value)})} /></div>
                                <div className="col-span-3"><input type="number" placeholder="Price" className="w-full p-3 border rounded-xl text-sm" value={newInvoiceItem.unitPrice} onChange={e => setNewInvoiceItem({...newInvoiceItem, unitPrice: Number(e.target.value)})} /></div>
                                <div className="col-span-1"><button onClick={handleAddInvoiceItem} className="bg-slate-900 text-white p-3 rounded-xl w-full flex justify-center hover:bg-emerald-600 transition"><Plus className="w-4 h-4"/></button></div>
                            </div>
                            {newInvoice.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl mb-2">
                                    <span className="font-bold text-xs">{item.description}</span>
                                    <span className="font-black text-emerald-600">{item.total.toLocaleString()} SAR</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center bg-slate-950 text-white p-6 rounded-2xl mb-6">
                            <div><p className="text-[9px] font-black opacity-50 uppercase tracking-widest">{t('total_with_vat')}</p><p className="text-2xl font-black text-amber-500">{invoiceTotals.total.toLocaleString()} SAR</p></div>
                            <button onClick={handleSaveInvoice} className="bg-emerald-600 px-8 py-3 rounded-xl font-black shadow-lg hover:bg-emerald-500 transition text-sm">{t('save')}</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {invoices.filter(i => i.companyId === companyId).map(inv => (
                        <div key={inv.id} className="bg-white dark:bg-slate-900 border-2 dark:border-slate-800 rounded-3xl p-6 hover:shadow-2xl transition group overflow-hidden relative">
                             <div className="flex justify-between items-start mb-4">
                                <div><p className="font-mono text-emerald-600 font-black text-[10px]">{inv.invoiceNumber}</p><p className="text-[10px] text-slate-400 font-bold">{formatDate(inv.date)}</p></div>
                                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{inv.status}</span>
                            </div>
                            <div className="mb-6">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t('project')}</p>
                                <p className="font-black text-slate-800 dark:text-white truncate text-sm">{projects.find(p => p.id === inv.projectId)?.name || 'Unknown Project'}</p>
                            </div>
                            <div className="flex justify-between items-center border-t dark:border-slate-800 pt-4">
                                <p className="text-xl font-black text-slate-900 dark:text-white">{inv.totalAmount.toLocaleString()} <span className="text-[10px]">SAR</span></p>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 hover:bg-emerald-600 hover:text-white transition"><Eye className="w-4 h-4"/></button>
                                    <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 hover:bg-slate-900 hover:text-white transition"><Printer className="w-4 h-4"/></button>
                                </div>
                            </div>
                            <QrCode className="absolute -bottom-6 -right-6 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* VOUCHERS SECTION */}
        {activeTab === 'VOUCHERS' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black flex items-center gap-3"><Receipt className="text-amber-600 w-6 h-6"/> {t('vouchers')}</h3>
                    <button onClick={() => setShowVoucherForm(true)} className="bg-amber-600 text-white px-6 py-3 rounded-xl font-black text-xs shadow-xl shadow-amber-600/20 hover:bg-amber-700 transition-all flex items-center gap-2"><Plus className="w-4 h-4"/> {t('add')}</button>
                </div>

                {showVoucherForm && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border-2 border-amber-100 dark:border-slate-700 animate-slide-down mb-8">
                        <div className="flex justify-between mb-6"><h4 className="font-black text-amber-700 text-sm uppercase tracking-widest">إنشاء سند جديد</h4><button onClick={() => setShowVoucherForm(false)}><X className="text-gray-400"/></button></div>
                        
                        <div className="flex gap-3 mb-6">
                            <button onClick={() => setNewVoucher({...newVoucher, type: 'RECEIPT'})} className={`flex-1 py-3 rounded-xl font-black transition-all text-sm ${newVoucher.type === 'RECEIPT' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-gray-400'}`}>{t('receipt_voucher')}</button>
                            <button onClick={() => setNewVoucher({...newVoucher, type: 'PAYMENT'})} className={`flex-1 py-3 rounded-xl font-black transition-all text-sm ${newVoucher.type === 'PAYMENT' ? 'bg-rose-600 text-white shadow-lg' : 'bg-white text-gray-400'}`}>{t('payment_voucher')}</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('date')}</label>
                                <input type="date" className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newVoucher.date} onChange={e => setNewVoucher({...newVoucher, date: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('amount')}</label>
                                <input type="number" className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-base" value={newVoucher.amount || ''} onChange={e => setNewVoucher({...newVoucher, amount: Number(e.target.value)})} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">الجهة (العميل/المورد/الموظف)</label>
                                <input className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newVoucher.partyName || ''} onChange={e => setNewVoucher({...newVoucher, partyName: e.target.value})} placeholder="الاسم الكامل" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('description')}</label>
                                <textarea className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold h-20 resize-none text-sm" value={newVoucher.description || ''} onChange={e => setNewVoucher({...newVoucher, description: e.target.value})} placeholder="وذلك عن..." />
                            </div>
                        </div>

                        <button onClick={handleSaveVoucher} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black shadow-xl hover:bg-slate-800 transition text-sm">{t('save')}</button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {vouchers.filter(v => v.companyId === companyId).map(v => (
                        <div key={v.id} className="bg-white dark:bg-slate-900 border rounded-3xl p-5 hover:shadow-lg transition relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-1.5 h-full ${v.type === 'RECEIPT' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                            <div className="flex justify-between items-start mb-3 pl-4">
                                <div>
                                    <p className="font-mono text-slate-400 text-[9px] font-black">{v.code}</p>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-base">{v.partyName}</h4>
                                </div>
                                <div className="text-end">
                                    <p className={`font-black text-lg ${v.type === 'RECEIPT' ? 'text-emerald-600' : 'text-rose-600'}`}>{v.amount.toLocaleString()} <span className="text-[10px] text-black dark:text-gray-400">SAR</span></p>
                                    <p className="text-[9px] text-gray-400">{formatDate(v.date)}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 pl-4 mb-3 line-clamp-1">{v.description}</p>
                            <div className="flex justify-end pl-4">
                                <button onClick={() => { setSelectedItemForPrint(v); setPrintView('VOUCHER'); }} className="flex items-center gap-2 text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-amber-500 hover:text-white transition"><Printer className="w-3 h-3"/> طباعة السند</button>
                            </div>
                        </div>
                    ))}
                    {vouchers.length === 0 && <div className="col-span-full text-center py-8 text-gray-400 border-2 border-dashed rounded-3xl text-sm">لا توجد سندات مسجلة</div>}
                </div>
            </div>
        )}

        {/* CUSTODY SECTION */}
        {activeTab === 'CUSTODY' && (
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black flex items-center gap-3"><Wallet className="text-blue-600 w-6 h-6"/> {t('employee_custody')}</h3>
                    <button onClick={() => setShowCustodyForm(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"><Plus className="w-4 h-4"/> صرف عهدة</button>
                </div>

                {showCustodyForm && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border-2 border-blue-100 dark:border-slate-700 animate-slide-down mb-8">
                         <div className="flex justify-between mb-6"><h4 className="font-black text-blue-700 text-sm uppercase tracking-widest">صرف عهدة نقدية</h4><button onClick={() => setShowCustodyForm(false)}><X className="text-gray-400"/></button></div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                             <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">الموظف المسؤول</label>
                                <select className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newCustody.employeeId} onChange={e => setNewCustody({...newCustody, employeeId: e.target.value})}>
                                    <option value="">اختر الموظف</option>
                                    {employees.filter(e => e.companyId === companyId).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('amount')}</label>
                                <input type="number" className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newCustody.amount || ''} onChange={e => setNewCustody({...newCustody, amount: Number(e.target.value)})} />
                             </div>
                             {/* Project Selection for Custody */}
                             <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">تخصيص لمشروع (اختياري)</label>
                                <select className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newCustody.projectId || ''} onChange={e => setNewCustody({...newCustody, projectId: e.target.value})}>
                                    <option value="">-- عهدة عامة --</option>
                                    {projects.filter(p => p.companyId === companyId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                             </div>
                             <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('description')}</label>
                                <input className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newCustody.description || ''} onChange={e => setNewCustody({...newCustody, description: e.target.value})} placeholder="سبب صرف العهدة" />
                             </div>
                         </div>
                         <button onClick={handleSaveCustody} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black shadow-xl hover:bg-blue-700 transition text-sm">{t('save')}</button>
                    </div>
                )}

                {/* Custody Expense Form */}
                {showCustodyExpenseForm && selectedCustodyId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-8 shadow-2xl border dark:border-slate-800 animate-slide-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">تسجيل مصروف من العهدة</h3>
                                <button onClick={() => setShowCustodyExpenseForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X/></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('project')}</label>
                                    <select 
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-sm"
                                        value={newCustodyTx.projectId || ''}
                                        onChange={e => setNewCustodyTx({...newCustodyTx, projectId: e.target.value, projectItemId: ''})}
                                    >
                                        <option value="">{t('select_project')}</option>
                                        {projects.filter(p => p.companyId === companyId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('item_work')}</label>
                                    <select 
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-sm"
                                        value={newCustodyTx.projectItemId || ''}
                                        onChange={e => setNewCustodyTx({...newCustodyTx, projectItemId: e.target.value})}
                                        disabled={!newCustodyTx.projectId}
                                    >
                                        <option value="">{t('select_item')}</option>
                                        {projects.find(p => p.id === newCustodyTx.projectId)?.items.map(item => (
                                            <option key={item.id} value={item.id}>{item.description}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Item Budget Info */}
                                {selectedCustodyItemStats && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-xs flex justify-between border dark:border-slate-700">
                                        <span className="text-gray-500">الميزانية: <b className="text-slate-800 dark:text-white">{selectedCustodyItemStats.budget.toLocaleString()}</b></span>
                                        <span className="text-gray-500">المصروف: <b className="text-orange-600">{selectedCustodyItemStats.spent.toLocaleString()}</b></span>
                                        <span className="text-gray-500">المتبقي: <b className={selectedCustodyItemStats.remaining < 0 ? 'text-red-500' : 'text-green-500'}>{selectedCustodyItemStats.remaining.toLocaleString()}</b></span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('amount')}</label>
                                    <input type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-sm" value={newCustodyTx.amount || ''} onChange={e => setNewCustodyTx({...newCustodyTx, amount: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('description')}</label>
                                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-sm" value={newCustodyTx.description || ''} onChange={e => setNewCustodyTx({...newCustodyTx, description: e.target.value})} placeholder="تفاصيل المصروف..." />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('date')}</label>
                                    <input type="date" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-sm" value={newCustodyTx.date} onChange={e => setNewCustodyTx({...newCustodyTx, date: e.target.value})} />
                                </div>

                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800 text-xs text-yellow-800 dark:text-yellow-500 text-center">
                                    <BookOpen className="w-4 h-4 inline-block mb-1"/> سيتم إنشاء قيد يومية تلقائي لخصم المبلغ من العهدة وإضافته لمصروفات المشروع.
                                </div>

                                <button onClick={handleAddCustodyExpense} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black shadow-lg hover:bg-blue-700 transition mt-4">{t('save')}</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {custody.filter(c => c.companyId === companyId).map(c => {
                        const spent = c.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
                        const remaining = c.amount - spent;
                        const usagePercent = Math.min(100, Math.round((spent / c.amount) * 100));
                        const assignedProjectName = projects.find(p => p.id === c.projectId)?.name;

                        return (
                            <div key={c.id} className="bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm hover:shadow-lg transition">
                                 <div className="flex justify-between items-start mb-3">
                                     <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">{c.employeeName.charAt(0)}</div>
                                         <div>
                                             <p className="font-bold text-slate-800 dark:text-white text-xs">{c.employeeName}</p>
                                             <p className="text-[9px] text-gray-400">{formatDate(c.date)}</p>
                                         </div>
                                     </div>
                                     <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${c.status === 'ACTIVE' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                         {c.status === 'ACTIVE' ? 'عهدة قائمة' : 'تم الإرجاع'}
                                     </span>
                                 </div>
                                 
                                 <div className="mb-4">
                                     <div className="flex justify-between items-end mb-1">
                                         <p className="text-xl font-black text-slate-800 dark:text-white">{c.amount.toLocaleString()} <span className="text-[10px]">SAR</span></p>
                                         <p className="text-[10px] font-bold text-gray-400">المتبقي: <span className={remaining < 0 ? 'text-red-500' : 'text-green-500'}>{remaining.toLocaleString()}</span></p>
                                     </div>
                                     
                                     {/* Progress Bar */}
                                     <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                                         <div className={`h-full ${usagePercent > 100 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, usagePercent)}%` }}></div>
                                     </div>
                                     
                                     <div className="flex justify-between items-start mt-2">
                                        <p className="text-[10px] text-gray-500 line-clamp-1">{c.description}</p>
                                        {assignedProjectName && <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold truncate max-w-[100px]">{assignedProjectName}</span>}
                                     </div>
                                 </div>

                                 {/* Action Buttons */}
                                 {c.status === 'ACTIVE' && (
                                     <div className="space-y-2">
                                         <button 
                                            onClick={() => openCustodyExpenseForm(c)}
                                            className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] transition flex items-center justify-center gap-2"
                                         >
                                             <PieChart className="w-3 h-3"/> تسجيل مصروف (توزيع التكلفة)
                                         </button>
                                         
                                         <button onClick={() => handleReturnCustody(c.id)} className="w-full py-2.5 rounded-xl bg-green-50 hover:bg-green-600 hover:text-white text-green-700 font-bold text-[10px] transition flex items-center justify-center gap-2">
                                             <CheckCircle2 className="w-3 h-3"/> إخلاء طرف (إغلاق العهدة)
                                         </button>
                                     </div>
                                 )}
                                 
                                 {/* Mini Transaction History */}
                                 {c.transactions && c.transactions.length > 0 && (
                                     <div className="mt-4 pt-4 border-t dark:border-slate-800">
                                         <p className="text-[9px] font-bold text-gray-400 mb-2">آخر المصروفات:</p>
                                         <div className="space-y-1.5">
                                             {c.transactions.slice(0, 3).map((tx, i) => {
                                                 const txProject = projects.find(p => p.id === tx.projectId);
                                                 const txItem = txProject?.items.find(it => it.id === tx.projectItemId);
                                                 return (
                                                     <div key={i} className="flex justify-between items-start text-[9px] text-gray-600 dark:text-gray-400">
                                                         <div>
                                                            <div className="font-bold text-slate-700 dark:text-slate-200">{tx.description}</div>
                                                            <div className="text-[8px] text-gray-400">{txProject?.name} &bull; {txItem?.description}</div>
                                                         </div>
                                                         <span className="font-bold text-red-500 whitespace-nowrap">-{tx.amount.toLocaleString()}</span>
                                                     </div>
                                                 );
                                             })}
                                             {c.transactions.length > 3 && <p className="text-[9px] text-center text-blue-500 cursor-pointer pt-1">عرض المزيد...</p>}
                                         </div>
                                     </div>
                                 )}
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* SUPPLIERS SECTION */}
        {activeTab === 'SUPPLIERS' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black flex items-center gap-3"><Truck className="text-purple-600 w-6 h-6"/> {t('suppliers_contractors')}</h3>
                    <button onClick={() => setShowSupplierForm(true)} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-black text-xs shadow-xl shadow-purple-600/20 hover:bg-purple-700 transition-all flex items-center gap-2"><Plus className="w-4 h-4"/> {t('add_supplier')}</button>
                </div>

                {showSupplierForm && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border-2 border-purple-100 dark:border-slate-700 animate-slide-down mb-8">
                        <div className="flex justify-between mb-6"><h4 className="font-black text-purple-700 text-sm uppercase tracking-widest">{t('add_supplier')}</h4><button onClick={() => setShowSupplierForm(false)}><X className="text-gray-400"/></button></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('supplier_name')}</label>
                                <input className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newSupplier.name || ''} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('phone_number')}</label>
                                <input className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newSupplier.phone || ''} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('supplier_type')}</label>
                                <select className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newSupplier.type} onChange={e => setNewSupplier({...newSupplier, type: e.target.value as any})}>
                                    <option value="SUPPLIER">{t('type_supplier')}</option>
                                    <option value="CONTRACTOR">{t('type_contractor')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('service_product')}</label>
                                <input className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newSupplier.service || ''} onChange={e => setNewSupplier({...newSupplier, service: e.target.value})} placeholder="مثال: توريد خرسانة، أعمال لياسة..." />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('bank_name')}</label>
                                <select className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm" value={newSupplier.bankName || ''} onChange={e => setNewSupplier({...newSupplier, bankName: e.target.value})}>
                                    <option value="">{t('select_bank')}</option>
                                    {SAUDI_BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('iban')}</label>
                                <input className="w-full p-3 bg-white dark:bg-slate-900 border rounded-xl font-bold text-sm font-mono" value={newSupplier.iban || ''} onChange={e => setNewSupplier({...newSupplier, iban: e.target.value})} />
                            </div>
                        </div>
                        <button onClick={handleSaveSupplier} className="w-full bg-purple-600 text-white py-3 rounded-xl font-black shadow-xl hover:bg-purple-700 transition text-sm">{t('save')}</button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {suppliers.filter(s => s.companyId === companyId).map(s => (
                        <div key={s.id} className="bg-white dark:bg-slate-900 border rounded-3xl p-5 hover:shadow-lg transition relative group">
                            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDeleteSupplier(s.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                            </div>
                            <div className="flex items-start gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.type === 'SUPPLIER' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {s.type === 'SUPPLIER' ? <Truck className="w-5 h-5"/> : <HardHat className="w-5 h-5"/>}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white leading-tight text-sm">{s.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{s.service}</p>
                                </div>
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Phone className="w-3 h-3"/> {s.phone}
                                </div>
                                {s.bankName && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Landmark className="w-3 h-3"/> {s.bankName}
                                    </div>
                                )}
                            </div>
                            {s.iban && (
                                <div className="pt-3 border-t dark:border-slate-800">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t('iban')}</p>
                                    <p className="font-mono text-[10px] text-slate-600 dark:text-slate-300 break-all bg-slate-50 dark:bg-slate-800 p-1.5 rounded">{s.iban}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {suppliers.length === 0 && <div className="col-span-full text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">{t('no_documents')}</div>}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
