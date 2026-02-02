
import React, { useState, useMemo } from 'react';
import { Project, Client, Company, CurrentUser, Invoice, InvoiceItem, CompanyId } from '../types';
import { Plus, Trash2, Printer, CheckCircle, FileText, X, ArrowLeft, Eye, ShieldCheck, MapPin, Hash, Calculator, Save, QrCode } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useDate } from '../contexts/DateContext';

interface Props {
  company: Company;
  clients: Client[];
  projects: Project[];
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  currentUser: CurrentUser | null;
}

export const InvoiceManager: React.FC<Props> = ({ company, clients, projects, invoices, setInvoices, currentUser }) => {
  const { t, dir } = useLanguage();
  const { formatDate } = useDate();
  const [view, setView] = useState<'LIST' | 'FORM' | 'PREVIEW'>('LIST');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<InvoiceItem>>({ quantity: 1, unitPrice: 0 });

  const totals = useMemo(() => {
      const subtotal = invoiceItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
      const vat = subtotal * 0.15;
      return { subtotal, vat, total: subtotal + vat };
  }, [invoiceItems]);

  const handleAddItem = () => {
    if (newItem.description && newItem.quantity && newItem.unitPrice) {
        setInvoiceItems([...invoiceItems, {
            id: Date.now().toString(),
            description: newItem.description,
            quantity: Number(newItem.quantity),
            unitPrice: Number(newItem.unitPrice),
            total: Number(newItem.quantity) * Number(newItem.unitPrice)
        }]);
        setNewItem({ quantity: 1, unitPrice: 0 });
    }
  };

  const handleSaveInvoice = () => {
      const project = projects.find(p => p.id === selectedProjectId);
      if (!project || invoiceItems.length === 0) {
          alert(t('fill_required'));
          return;
      }

      const count = invoices.filter(i => i.companyId === company.id).length + 1;
      const invoiceNumber = `INV-${company.name.split(' ')[0]}-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

      // توليد بيانات الـ QR للبحث السريع (يمكن استخدام API خارجي للـ QR Image)
      const qrData = `EB-INVOICE:${invoiceNumber}:${totals.total}:${company.taxNumber}`;

      const newInvoice: Invoice = {
          id: Date.now().toString(),
          invoiceNumber,
          clientId: project.clientId,
          projectId: project.id,
          date: invoiceDate,
          dueDate: dueDate || invoiceDate,
          items: invoiceItems,
          subtotal: totals.subtotal,
          vatAmount: totals.vat,
          totalAmount: totals.total,
          status: 'SENT',
          companyId: company.id,
          qrData
      };

      setInvoices([newInvoice, ...invoices]);
      setView('LIST');
      resetForm();
  };

  const resetForm = () => {
      setSelectedProjectId('');
      setInvoiceItems([]);
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setDueDate('');
  };

  // وظيفة للحصول على رابط صورة الـ QR
  const getQrUrl = (data: string) => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;

  if (view === 'PREVIEW' && selectedInvoice) {
      const client = clients.find(c => c.id === selectedInvoice.clientId);
      const project = projects.find(p => p.id === selectedInvoice.projectId);

      return (
          <div className="bg-slate-100 min-h-screen p-10 flex justify-center fixed inset-0 z-50 overflow-y-auto">
              <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-12 relative print:w-full print:shadow-none print:p-0">
                  <div className="absolute top-6 left-[-100px] flex flex-col gap-3 print:hidden">
                      <button onClick={() => window.print()} className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl hover:bg-blue-700 transition"><Printer/></button>
                      <button onClick={() => setView('LIST')} className="bg-slate-800 text-white p-4 rounded-2xl shadow-xl hover:bg-slate-700 transition"><ArrowLeft/></button>
                  </div>

                  {/* Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-10">
                      <div>
                          <h1 className="text-3xl font-black text-slate-800 mb-2">{company.fullName}</h1>
                          <p className="text-sm font-bold text-slate-500">VAT: {company.taxNumber}</p>
                          <p className="text-xs text-slate-400 mt-1">{company.address}</p>
                      </div>
                      <div className="text-center">
                          <img src={getQrUrl(selectedInvoice.qrData || selectedInvoice.id)} className="w-24 h-24 mb-2 mx-auto border-2 p-1 rounded-lg" alt="QR Code" />
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">EB SECURE INVOICE</p>
                      </div>
                  </div>

                  <div className="flex justify-between mb-12">
                      <div className="bg-slate-50 p-6 rounded-2xl flex-1 ml-10 border">
                          <h2 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">{t('client')}</h2>
                          <p className="text-xl font-black text-slate-800 mb-1">{client?.name}</p>
                          <p className="text-sm font-bold text-slate-500">{client?.phone}</p>
                      </div>
                      <div className="text-left flex-1 border-r-4 border-slate-900 pr-10">
                          <h2 className="text-2xl font-black text-slate-800 mb-4">{t('invoices_management')}</h2>
                          <div className="space-y-2 text-sm">
                              <div className="flex justify-between"><span className="text-slate-400">{t('invoice_number')}:</span> <span className="font-mono font-bold text-blue-600">{selectedInvoice.invoiceNumber}</span></div>
                              <div className="flex justify-between"><span className="text-slate-400">{t('invoice_date')}:</span> <span className="font-bold">{formatDate(selectedInvoice.date)}</span></div>
                              <div className="flex justify-between"><span className="text-slate-400">{t('project')}:</span> <span className="font-bold">{project?.name}</span></div>
                          </div>
                      </div>
                  </div>

                  <table className="w-full border-collapse mb-10 text-sm">
                      <thead className="bg-slate-900 text-white">
                          <tr>
                              <th className="p-4 text-start rounded-tr-lg">#</th>
                              <th className="p-4 text-start">{t('description')}</th>
                              <th className="p-4 text-center">{t('quantity')}</th>
                              <th className="p-4 text-center">{t('unit_price')}</th>
                              <th className="p-4 text-center rounded-tl-lg">{t('total')}</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y border-x border-b">
                          {selectedInvoice.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition">
                                  <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                                  <td className="p-4 font-bold text-slate-800">{item.description}</td>
                                  <td className="p-4 text-center font-mono">{item.quantity}</td>
                                  <td className="p-4 text-center font-mono">{item.unitPrice.toLocaleString()}</td>
                                  <td className="p-4 text-center font-black text-blue-700">{item.total.toLocaleString()}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>

                  <div className="flex justify-end mt-10">
                      <div className="w-64 space-y-3 bg-slate-900 p-6 rounded-3xl text-white shadow-2xl">
                          <div className="flex justify-between text-xs font-bold opacity-60"><span>{t('subtotal')}</span> <span>{selectedInvoice.subtotal.toLocaleString()}</span></div>
                          <div className="flex justify-between text-xs font-bold opacity-60"><span>{t('vat_15')}</span> <span>{selectedInvoice.vatAmount.toLocaleString()}</span></div>
                          <div className="border-t border-white/20 pt-3 flex justify-between items-center">
                              <span className="text-xs font-black uppercase tracking-widest">{t('total_with_vat')}</span>
                              <span className="text-xl font-black">{selectedInvoice.totalAmount.toLocaleString()}</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border dark:border-slate-800 animate-fade-in min-h-screen">
      <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3"><FileText className="w-8 h-8 text-blue-600"/> {t('invoices_management')}</h2>
          <button onClick={() => setView('FORM')} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl shadow-xl hover:bg-blue-700 transition flex items-center gap-2 font-black"><Plus className="w-5 h-5"/> {t('create_invoice')}</button>
      </div>

      {view === 'FORM' && (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border dark:border-slate-800 mb-10 animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{t('project')}</label>
                    <select className="w-full p-3 border dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white rounded-xl font-bold" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>
                        <option value="">{t('select_project')}</option>
                        {projects.filter(p => p.companyId === company.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{t('invoice_date')}</label>
                    <input type="date" className="w-full p-3 border dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white rounded-xl font-bold" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{t('due_date')}</label>
                    <input type="date" className="w-full p-3 border dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white rounded-xl font-bold" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                  </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 mb-8 shadow-inner">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-6">
                      <div className="md:col-span-6"><input placeholder={t('description')} className="w-full p-3 border dark:border-slate-700 rounded-xl text-sm" value={newItem.description || ''} onChange={e => setNewItem({...newItem, description: e.target.value})} /></div>
                      <div className="md:col-span-2"><input type="number" placeholder={t('quantity')} className="w-full p-3 border dark:border-slate-700 rounded-xl text-sm" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} /></div>
                      <div className="md:col-span-3"><input type="number" placeholder={t('unit_price')} className="w-full p-3 border dark:border-slate-700 rounded-xl text-sm" value={newItem.unitPrice} onChange={e => setNewItem({...newItem, unitPrice: Number(e.target.value)})} /></div>
                      <div className="md:col-span-1"><button onClick={handleAddItem} className="bg-blue-600 text-white p-3.5 rounded-xl hover:bg-blue-700 transition w-full flex justify-center"><Plus/></button></div>
                  </div>
                  <div className="space-y-3">
                      {invoiceItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700">
                              <span className="font-bold text-slate-800 dark:text-white flex-1">{item.description}</span>
                              <span className="text-xs text-gray-400 px-6">{item.quantity} x {item.unitPrice.toLocaleString()}</span>
                              <span className="font-black text-blue-600">{item.total.toLocaleString()} SAR</span>
                              <button onClick={() => setInvoiceItems(invoiceItems.filter((_,i) => i !== idx))} className="text-red-500 ml-4"><Trash2 className="w-4 h-4"/></button>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex justify-between items-center">
                      <div>
                          <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{t('total_with_vat')}</p>
                          <p className="text-4xl font-black mt-1">{totals.total.toLocaleString()} <span className="text-sm font-normal">SAR</span></p>
                      </div>
                      <Calculator className="w-12 h-12 opacity-20" />
                  </div>
                  <div className="flex gap-3 items-end">
                      <button onClick={handleSaveInvoice} className="bg-green-600 text-white px-10 py-4 rounded-2xl shadow-xl hover:bg-green-700 transition font-black flex items-center gap-2"><Save className="w-5 h-5"/> {t('save')}</button>
                      <button onClick={() => setView('LIST')} className="px-8 py-4 border-2 dark:border-slate-700 dark:text-white rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition">{t('cancel')}</button>
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invoices.filter(i => i.companyId === company.id).map(inv => (
              <div key={inv.id} className="bg-white dark:bg-slate-900 border-2 dark:border-slate-800 rounded-3xl p-6 hover:shadow-2xl transition group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <p className="font-mono text-blue-600 font-black text-xs">{inv.invoiceNumber}</p>
                          <p className="text-xs text-slate-400 font-bold mt-1">{formatDate(inv.date)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{inv.status}</span>
                  </div>
                  
                  <div className="mb-6">
                      <p className="text-xs text-gray-400 mb-1">{t('client')}</p>
                      <p className="font-black text-slate-800 dark:text-white truncate">{clients.find(c => c.id === inv.clientId)?.name || 'Unknown'}</p>
                  </div>

                  <div className="flex justify-between items-end border-t dark:border-slate-800 pt-6">
                      <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{t('amount')}</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white">{inv.totalAmount.toLocaleString()} <span className="text-[10px]">SAR</span></p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedInvoice(inv); setView('PREVIEW'); }} className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition"><Eye className="w-5 h-5"/></button>
                        <button className="p-3 bg-slate-50 dark:bg-slate-800 text-gray-400 rounded-xl hover:bg-slate-900 hover:text-white transition"><Printer className="w-5 h-5"/></button>
                      </div>
                  </div>
                  
                  {/* Decorative QR Background */}
                  <QrCode className="absolute -bottom-4 -right-4 w-20 h-20 opacity-[0.03] rotate-12 dark:opacity-[0.01]" />
              </div>
          ))}
          {invoices.filter(i => i.companyId === company.id).length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-400 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed dark:border-slate-800">
                  <QrCode className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p className="font-bold">لا يوجد فواتير مسجلة حالياً.</p>
              </div>
          )}
      </div>
    </div>
  );
};
