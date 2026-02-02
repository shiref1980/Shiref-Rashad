
import React, { useState, useMemo } from 'react';
import { Company, Client, CurrentUser, PriceOffer, PriceOfferItem, CompanyId } from '../types';
import { Plus, Trash2, Printer, CheckCircle, FileText, X, ArrowLeft, Eye, ShieldCheck, MapPin, Hash, Calculator, Save } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useDate } from '../contexts/DateContext';

interface Props {
  company: Company;
  clients: Client[];
  offers: PriceOffer[];
  setOffers: React.Dispatch<React.SetStateAction<PriceOffer[]>>;
  currentUser: CurrentUser | null;
}

export const PriceOfferManager: React.FC<Props> = ({ company, clients, offers, setOffers, currentUser }) => {
  const { t, dir } = useLanguage();
  const { formatDate } = useDate();
  const [view, setView] = useState<'LIST' | 'FORM' | 'PREVIEW'>('LIST');
  const [selectedOffer, setSelectedOffer] = useState<PriceOffer | null>(null);

  const [offerDate, setOfferDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [validDays, setValidDays] = useState<number>(15);
  const [offerItems, setOfferItems] = useState<PriceOfferItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<PriceOfferItem>>({ quantity: 1, unitPrice: 0 });
  const [offerNotes, setOfferNotes] = useState('');

  const totals = useMemo(() => {
      const subtotal = offerItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
      const vat = subtotal * 0.15;
      return { subtotal, vat, total: subtotal + vat };
  }, [offerItems]);

  const handleAddItem = () => {
    if (newItem.description && newItem.unit && Number(newItem.quantity) > 0) {
        const item: PriceOfferItem = {
            id: Date.now().toString(),
            description: newItem.description,
            unit: newItem.unit,
            quantity: Number(newItem.quantity),
            unitPrice: Number(newItem.unitPrice),
            total: Number(newItem.quantity) * Number(newItem.unitPrice)
        };
        setOfferItems([...offerItems, item]);
        setNewItem({ quantity: 1, unitPrice: 0 });
    }
  };

  const handleSaveOffer = () => {
      if (!selectedClientId || offerItems.length === 0) {
          alert(t('fill_required'));
          return;
      }

      const count = offers.filter(o => o.companyId === company.id).length + 1;
      const code = `QT-${company.name.split(' ')[0]}-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

      const offer: PriceOffer = {
          id: Date.now().toString(),
          code,
          companyId: company.id,
          clientId: selectedClientId,
          date: offerDate,
          validDays,
          items: offerItems,
          subtotal: totals.subtotal,
          vatAmount: totals.vat,
          vatRate: 0.15,
          totalAmount: totals.total,
          notes: offerNotes,
          status: 'PENDING',
          createdBy: currentUser?.name || 'Unknown'
      };

      setOffers([offer, ...offers]);
      setView('LIST');
      resetForm();
  };

  const resetForm = () => {
      setSelectedClientId('');
      setOfferItems([]);
      setOfferNotes('');
      setNewItem({ quantity: 1, unitPrice: 0 });
      setOfferDate(new Date().toISOString().split('T')[0]);
      setValidDays(15);
  };

  const renderCompanyLogo = (id: string) => {
      const isMMT = id === CompanyId.MMT;
      const isDesign = id === CompanyId.EB_DESIGN;
      const color = isMMT ? 'blue-800' : isDesign ? 'purple-700' : 'orange-600';
      const label = isMMT ? 'MMT' : isDesign ? 'EB' : 'EB';
      const subLabel = isMMT ? 'CONTRACTING' : isDesign ? 'DESIGN' : 'CONCEPT';

      return (
          <div className={`border-4 border-${color} text-${color} w-24 h-24 flex items-center justify-center rounded-2xl bg-white shadow-lg`}>
              <div className="text-center leading-none">
                  <span className="block text-4xl font-black">{label}</span>
                  <span className="block text-[8px] font-bold tracking-[0.2em] mt-1">{subLabel}</span>
              </div>
          </div>
      );
  };

  if (view === 'PREVIEW' && selectedOffer) {
      const client = clients.find(c => c.id === selectedOffer.clientId);
      const validUntil = new Date(selectedOffer.date);
      validUntil.setDate(validUntil.getDate() + selectedOffer.validDays);

      return (
          <div className="bg-slate-100 dark:bg-slate-950 min-h-screen p-4 md:p-10 flex justify-center fixed inset-0 z-50 overflow-y-auto">
              <div className="bg-white text-slate-900 w-[210mm] min-h-[297mm] shadow-2xl p-10 relative print:w-full print:h-auto print:shadow-none print:m-0 print:p-0 flex flex-col">
                  <div className="absolute top-6 left-[-60px] md:left-[-150px] flex flex-col gap-3 print:hidden">
                      <button onClick={() => window.print()} className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl hover:bg-blue-700 transition"><Printer/></button>
                      <button onClick={() => setView('LIST')} className="bg-slate-800 text-white p-4 rounded-2xl shadow-xl hover:bg-slate-700 transition"><ArrowLeft/></button>
                  </div>

                  <div className={`border-b-8 border-${company.color}-600 pb-8 mb-10 flex justify-between items-start`}>
                      <div className="max-w-[60%]">
                          <h1 className={`text-3xl font-black text-slate-800 uppercase`}>{company.fullName}</h1>
                          <div className="mt-4 space-y-1 text-slate-500 font-bold text-sm">
                              <p className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {company.address || company.description}</p>
                              {company.commercialRegister && <p>C.R: {company.commercialRegister}</p>}
                              {company.taxNumber && <p>VAT: {company.taxNumber}</p>}
                          </div>
                      </div>
                      <div className="flex flex-col items-center gap-4">
                          {renderCompanyLogo(company.id)}
                          <div className="text-center">
                              <h2 className="text-xl font-black text-slate-800 tracking-widest">{t('price_offers')}</h2>
                              <p className="font-mono text-red-600 font-black text-xl">{selectedOffer.code}</p>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10 mb-10 bg-slate-50 p-6 rounded-3xl border shadow-inner">
                      <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{t('client')}</p>
                          <p className="text-xl font-black text-slate-800">{client?.name}</p>
                          <p className="text-sm font-bold text-slate-500">{client?.phone}</p>
                      </div>
                      <div className="text-left" dir="ltr">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{t('valid_until')}</p>
                          <p className="text-xl font-black text-slate-800">{formatDate(validUntil.toISOString())}</p>
                      </div>
                  </div>

                  <div className="flex-1">
                      <table className="w-full border-collapse mb-10 text-sm">
                          <thead>
                              <tr className="bg-slate-900 text-white">
                                  <th className="p-4 text-center w-12 border-b-2">#</th>
                                  <th className="p-4 text-start border-b-2">{t('item_description')}</th>
                                  <th className="p-4 text-center w-24 border-b-2">{t('unit')}</th>
                                  <th className="p-4 text-center w-24 border-b-2">{t('quantity')}</th>
                                  <th className="p-4 text-center w-32 border-b-2">{t('unit_price')}</th>
                                  <th className="p-4 text-center w-32 border-b-2 font-black">{t('total')}</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y-2 divide-slate-100">
                              {selectedOffer.items.map((item, idx) => (
                                  <tr key={idx}>
                                      <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                                      <td className="p-4 font-bold text-slate-800">{item.description}</td>
                                      <td className="p-4 text-center">{item.unit}</td>
                                      <td className="p-4 text-center font-mono">{item.quantity}</td>
                                      <td className="p-4 text-center font-mono">{item.unitPrice.toLocaleString()}</td>
                                      <td className="p-4 text-center font-black bg-slate-50 font-mono text-blue-700">{item.total.toLocaleString()}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>

                  <div className="grid grid-cols-2 gap-10 mt-auto border-t pt-10">
                      <div className="bg-yellow-50 border p-6 rounded-3xl">
                          <h3 className="font-black text-xs text-yellow-800 uppercase mb-2">{t('notes')}</h3>
                          <p className="text-xs text-slate-600 leading-relaxed italic">{selectedOffer.notes || 'No specific terms provided.'}</p>
                      </div>
                      <div className="space-y-3">
                          <div className="flex justify-between text-sm px-4">
                              <span className="font-bold text-slate-400">{t('subtotal')}</span>
                              <span className="font-black font-mono">{selectedOffer.subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm px-4">
                              <span className="font-bold text-slate-400">{t('vat')}</span>
                              <span className="font-black font-mono">{selectedOffer.vatAmount.toLocaleString()}</span>
                          </div>
                          <div className={`flex justify-between items-center p-6 rounded-3xl bg-slate-900 text-white shadow-2xl`}>
                              <span className="font-black uppercase tracking-widest text-xs">{t('grand_total')}</span>
                              <span className="text-2xl font-black font-mono">{selectedOffer.totalAmount.toLocaleString()} <span className="text-xs">SAR</span></span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-4 md:p-8 animate-fade-in min-h-screen border dark:border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <Calculator className="w-8 h-8 text-purple-600"/> {t('price_offers')}
          </h2>
          <button 
              onClick={() => { resetForm(); setView('FORM'); }}
              className="bg-purple-600 text-white px-8 py-3.5 rounded-2xl shadow-xl hover:bg-purple-700 transition-all flex items-center gap-2 font-black w-full md:w-auto justify-center"
          >
              <Plus className="w-5 h-5"/> {t('create_offer')}
          </button>
      </div>

      {view === 'FORM' && (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border dark:border-slate-800 mb-10 animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase mb-1">{t('client')}</label>
                    <select className="w-full p-3 border dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white rounded-xl font-bold" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
                        <option value="">{t('select_client')}</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-1">{t('date')}</label>
                    <input type="date" className="w-full p-3 border dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white rounded-xl font-mono" value={offerDate} onChange={e => setOfferDate(e.target.value)} />
                  </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border dark:border-slate-800 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b dark:border-slate-800 pb-6 mb-6">
                      <div className="md:col-span-5">
                          <input placeholder={t('item_description')} className="w-full p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm" value={newItem.description || ''} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                          <input placeholder={t('unit')} className="w-full p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm" value={newItem.unit || ''} onChange={e => setNewItem({...newItem, unit: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                          <input type="number" placeholder={t('quantity')} className="w-full p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} />
                      </div>
                      <div className="md:col-span-2">
                          <input type="number" placeholder={t('unit_price')} className="w-full p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm" value={newItem.unitPrice} onChange={e => setNewItem({...newItem, unitPrice: Number(e.target.value)})} />
                      </div>
                      <div className="md:col-span-1">
                          <button onClick={handleAddItem} className="w-full bg-blue-600 text-white p-3.5 rounded-xl hover:bg-blue-700 transition flex items-center justify-center shadow-lg"><Plus/></button>
                      </div>
                  </div>

                  <div className="space-y-3">
                      {offerItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border group">
                              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">{idx + 1}</span>
                              <div className="flex-1 font-bold">{item.description}</div>
                              <div className="text-xs font-bold text-slate-400">{item.quantity} {item.unit} x {item.unitPrice.toLocaleString()}</div>
                              <div className="font-black text-blue-600">{item.total.toLocaleString()} SAR</div>
                              <button onClick={() => setOfferItems(offerItems.filter((_, i) => i !== idx))} className="p-2 text-red-400 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <textarea 
                    className="w-full p-4 border dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white rounded-3xl h-32 resize-none text-sm shadow-inner" 
                    placeholder={t('offer_notes_placeholder')}
                    value={offerNotes}
                    onChange={e => setOfferNotes(e.target.value)}
                  ></textarea>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm space-y-3">
                      <div className="flex justify-between font-bold text-slate-400"><span className="text-xs uppercase">{t('subtotal')}</span> <span className="font-mono">{totals.subtotal.toLocaleString()}</span></div>
                      <div className="flex justify-between font-bold text-slate-400"><span className="text-xs uppercase">{t('vat')} (15%)</span> <span className="font-mono">{totals.vat.toLocaleString()}</span></div>
                      <div className="flex justify-between font-black text-blue-600 pt-3 border-t text-xl dark:text-blue-400"><span>{t('grand_total')}</span> <span className="font-mono">{totals.total.toLocaleString()} SAR</span></div>
                  </div>
              </div>

              <div className="flex gap-4">
                  <button onClick={handleSaveOffer} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black hover:bg-green-700 transition shadow-xl flex items-center justify-center gap-2"><Save className="w-5 h-5"/> {t('save')}</button>
                  <button onClick={() => setView('LIST')} className="px-10 py-4 border-2 dark:border-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-gray-100 transition">{t('cancel')}</button>
              </div>
          </div>
      )}

      <div className="border-2 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
           <table className="w-full text-start">
               <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                   <tr>
                       <th className="p-5 text-start">{t('offer_code')}</th>
                       <th className="p-5 text-start">{t('date')}</th>
                       <th className="p-5 text-start">{t('client')}</th>
                       <th className="p-5 text-start">{t('grand_total')}</th>
                       <th className="p-5 text-center">{t('status')}</th>
                       <th className="p-5 text-center">{t('actions')}</th>
                   </tr>
               </thead>
               <tbody className="divide-y-2 divide-slate-50 dark:divide-slate-800 text-sm">
                   {offers.map(offer => (
                       <tr key={offer.id} className="hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition group">
                           <td className="p-5 font-mono font-black text-purple-600 dark:text-purple-400">{offer.code}</td>
                           <td className="p-5 text-slate-400 font-bold">{formatDate(offer.date)}</td>
                           <td className="p-5 font-black">{clients.find(c => c.id === offer.clientId)?.name || 'Unknown'}</td>
                           <td className="p-5 font-black">{offer.totalAmount.toLocaleString()} SAR</td>
                           <td className="p-5 text-center">
                               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${offer.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                   {t(offer.status.toLowerCase())}
                               </span>
                           </td>
                           <td className="p-5 flex justify-center gap-2">
                               <button onClick={() => { setSelectedOffer(offer); setView('PREVIEW'); }} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-purple-600 hover:text-white transition group-hover:scale-110">
                                   <Eye className="w-4 h-4"/>
                               </button>
                           </td>
                       </tr>
                   ))}
                   {offers.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-slate-400 font-bold">{t('none')}</td></tr>}
               </tbody>
           </table>
      </div>
    </div>
  );
};
