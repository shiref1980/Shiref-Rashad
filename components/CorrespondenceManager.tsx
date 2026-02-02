
import React, { useState } from 'react';
import { Correspondence, CorrespondenceType, Project, Company, CurrentUser, CompanyId } from '../types';
import { Mail, Search, Plus, Filter, ArrowLeft, Printer, Paperclip, FileText, Trash2, Eye, X, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useDate } from '../contexts/DateContext';

interface Props {
  company: Company;
  projects: Project[];
  correspondence: Correspondence[];
  setCorrespondence: React.Dispatch<React.SetStateAction<Correspondence[]>>;
  currentUser: CurrentUser | null;
}

export const CorrespondenceManager: React.FC<Props> = ({ company, projects, correspondence, setCorrespondence, currentUser }) => {
  const { t, dir } = useLanguage();
  const { formatDate } = useDate();
  const [activeTab, setActiveTab] = useState<CorrespondenceType>('INCOMING');
  const [view, setView] = useState<'LIST' | 'FORM' | 'PREVIEW'>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');

  // Form State
  const [formData, setFormData] = useState<Partial<Correspondence>>({ 
      date: new Date().toISOString().split('T')[0],
      attachments: []
  });
  const [selectedLetter, setSelectedLetter] = useState<Correspondence | null>(null);

  const filteredList = correspondence.filter(c => {
      const matchType = c.type === activeTab;
      const matchProject = projectFilter === 'ALL' || c.projectId === projectFilter;
      const matchSearch = 
        c.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.senderOrRecipient.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchType && matchProject && matchSearch;
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const generateReference = (type: CorrespondenceType) => {
      const prefix = type === 'INCOMING' ? 'IN' : 'OUT';
      const year = new Date().getFullYear();
      // Count items of this type for this company this year
      const count = correspondence.filter(c => 
          c.type === type && 
          c.companyId === company.id && 
          c.date.startsWith(year.toString())
      ).length + 1;
      
      return `${prefix}-${company.name.split(' ')[0]}-${year}-${String(count).padStart(3, '0')}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const url = URL.createObjectURL(e.target.files[0]);
          setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), url] }));
      }
  };

  const handleSave = () => {
      if (formData.subject && formData.date && formData.senderOrRecipient) {
          const newRef = generateReference(activeTab);
          const newLetter: Correspondence = {
              id: Date.now().toString(),
              companyId: company.id,
              type: activeTab,
              referenceNumber: newRef,
              date: formData.date!,
              subject: formData.subject!,
              projectId: formData.projectId,
              senderOrRecipient: formData.senderOrRecipient!,
              content: formData.content,
              attachments: formData.attachments || [],
              status: 'ARCHIVED'
          };
          setCorrespondence(prev => [newLetter, ...prev]);
          setView('LIST');
          setFormData({ date: new Date().toISOString().split('T')[0], attachments: [] });
      } else {
          alert(t('fill_required'));
      }
  };

  const openPreview = (letter: Correspondence) => {
      setSelectedLetter(letter);
      setView('PREVIEW');
  };

  const renderCompanyLogo = () => {
      if (company.id === CompanyId.MMT) {
          return (
              <div className="border-4 border-blue-800 text-blue-800 w-24 h-24 flex items-center justify-center rounded-xl bg-white shadow-sm">
                  <div className="text-center">
                      <span className="block text-3xl font-black tracking-tighter">MMT</span>
                      <span className="block text-[8px] font-bold tracking-widest">CONTRACTING</span>
                  </div>
              </div>
          );
      } else if (company.id === CompanyId.EB_DESIGN) {
          return (
              <div className="border-4 border-purple-700 text-purple-700 w-24 h-24 flex items-center justify-center rounded-xl bg-white shadow-sm">
                  <div className="text-center leading-tight">
                      <span className="block text-3xl font-black">EB</span>
                      <span className="block text-[10px] font-bold">DESIGN</span>
                  </div>
              </div>
          );
      } else {
          // EB CONCEPT
          return (
              <div className="border-4 border-orange-600 text-orange-600 w-24 h-24 flex items-center justify-center rounded-xl bg-white shadow-sm">
                  <div className="text-center leading-tight">
                      <span className="block text-3xl font-black">EB</span>
                      <span className="block text-[8px] font-bold">CONCEPT</span>
                  </div>
              </div>
          );
      }
  };

  // --- Render Views ---

  if (view === 'PREVIEW' && selectedLetter) {
      const project = projects.find(p => p.id === selectedLetter.projectId);
      const themeColor = company.color === 'purple' ? 'purple' : company.color === 'orange' ? 'orange' : 'blue';
      const borderClass = `border-${themeColor}-600`;
      const textClass = `text-${themeColor}-800`;

      return (
          <div className="bg-gray-100 min-h-screen p-8 flex justify-center fixed inset-0 z-50 overflow-y-auto">
              <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-10 relative print:w-full print:h-auto print:shadow-none print:m-0 print:p-0">
                  <div className="absolute top-4 left-[-150px] flex flex-col gap-2 print:hidden">
                      <button onClick={() => window.print()} className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"><Printer/></button>
                      <button onClick={() => setView('LIST')} className="bg-gray-600 text-white p-3 rounded-full shadow-lg hover:bg-gray-700"><ArrowLeft/></button>
                  </div>

                  {/* COMPANY HEADER */}
                  <div className={`flex justify-between items-center border-b-4 ${borderClass} pb-6 mb-8`}>
                      <div className="text-right">
                          <h1 className={`text-2xl font-bold ${textClass} uppercase`}>{company.fullName}</h1>
                          <p className="text-slate-500 mt-1 text-sm font-medium">{company.description}</p>
                          <div className="mt-1 space-y-0.5">
                            {company.commercialRegister && (
                                <p className="text-slate-400 text-[10px] font-mono">
                                    <span className="font-bold">{t('commercial_register')}:</span> {company.commercialRegister}
                                </p>
                            )}
                            {company.taxNumber && (
                                <p className="text-slate-400 text-[10px] font-mono">
                                    <span className="font-bold">{t('tax_number')}:</span> {company.taxNumber}
                                </p>
                            )}
                          </div>
                      </div>
                      <div className="text-center">
                          {renderCompanyLogo()}
                      </div>
                      <div className="text-left font-mono text-sm text-slate-600">
                          <p><span className="font-bold">{t('date')}:</span> {formatDate(selectedLetter.date)}</p>
                          <p className="mt-1 font-bold text-red-600 text-lg">{selectedLetter.referenceNumber}</p>
                      </div>
                  </div>

                  <h2 className="text-2xl font-bold text-center mb-8 underline decoration-double decoration-slate-300">
                      {t(selectedLetter.type === 'INCOMING' ? 'incoming' : 'outgoing')} - {selectedLetter.subject}
                  </h2>

                  <div className="mb-8 space-y-4 text-lg">
                      <div className="flex gap-4">
                          <span className="font-bold w-32">{selectedLetter.type === 'INCOMING' ? t('sender') : t('recipient_to')}:</span>
                          <span className="border-b border-dotted border-gray-400 flex-1">{selectedLetter.senderOrRecipient}</span>
                      </div>
                      <div className="flex gap-4">
                          <span className="font-bold w-32">{t('project')}:</span>
                          <span className="border-b border-dotted border-gray-400 flex-1">{project ? project.name : t('general_correspondence')}</span>
                      </div>
                  </div>

                  <div className="border rounded-xl p-6 min-h-[300px] mb-8 bg-slate-50">
                      <h3 className="font-bold mb-4 border-b pb-2 text-slate-500 text-sm">{t('content')}</h3>
                      <p className="whitespace-pre-wrap leading-relaxed">{selectedLetter.content}</p>
                  </div>

                  {selectedLetter.attachments.length > 0 && (
                      <div className="mb-8">
                          <h3 className="font-bold mb-4 flex items-center gap-2"><Paperclip className="w-5 h-5"/> {t('attachments')}</h3>
                          <div className="grid grid-cols-3 gap-4">
                              {selectedLetter.attachments.map((url, i) => (
                                  <div key={i} className="border p-2 rounded flex items-center justify-center bg-gray-50 h-32">
                                      <img src={url} alt="attachment" className="max-h-full max-w-full object-contain"/>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="mt-auto pt-10 border-t-2 border-slate-200 flex justify-between items-end">
                      <div className="text-center w-1/3">
                          <p className="mb-12 font-bold">{t('project_manager')}</p>
                          <p className="border-t pt-2 w-3/4 mx-auto font-mono">________________</p>
                      </div>
                      <div className="text-center w-1/3">
                           <p className="mb-12 font-bold">مدير عام المجموعة</p>
                           <p className="border-t pt-2 w-3/4 mx-auto font-mono">________________</p>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  if (view === 'FORM') {
      return (
          <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in max-w-3xl mx-auto my-10">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Plus className="w-6 h-6 text-blue-600"/> {t('add_correspondence')}</h3>
                  <button onClick={() => setView('LIST')} className="text-gray-500 hover:bg-gray-100 p-2 rounded"><X/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="md:col-span-2 flex gap-4 bg-gray-50 p-2 rounded-lg">
                      <button 
                        onClick={() => setActiveTab('INCOMING')}
                        className={`flex-1 py-2 rounded-md font-bold transition ${activeTab === 'INCOMING' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                      >
                          {t('incoming')}
                      </button>
                      <button 
                        onClick={() => setActiveTab('OUTGOING')}
                        className={`flex-1 py-2 rounded-md font-bold transition ${activeTab === 'OUTGOING' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                      >
                          {t('outgoing')}
                      </button>
                  </div>

                  <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1">{t('subject')}</label>
                      <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" value={formData.subject || ''} onChange={e => setFormData({...formData, subject: e.target.value})} />
                  </div>

                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">{activeTab === 'INCOMING' ? t('sender') : t('recipient_to')}</label>
                      <input className="w-full p-2 border rounded-lg" value={formData.senderOrRecipient || ''} onChange={e => setFormData({...formData, senderOrRecipient: e.target.value})} />
                  </div>

                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">{t('date')}</label>
                      <input type="date" className="w-full p-2 border rounded-lg" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>

                  <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1">{t('project')} (Optional)</label>
                      <select className="w-full p-2 border rounded-lg" value={formData.projectId || ''} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                          <option value="">{t('general_correspondence')}</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                  </div>

                  <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1">{t('content')}</label>
                      <textarea className="w-full p-2 border rounded-lg h-32 resize-none" value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})}></textarea>
                  </div>

                  <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">{t('attachments')}</label>
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                          <Upload className="w-6 h-6 text-gray-400 mb-1"/>
                          <span className="text-xs text-gray-500">{t('click_to_upload')}</span>
                          <input type="file" className="hidden" accept="image/*,.pdf" multiple onChange={handleFileUpload} />
                      </label>
                      
                      {formData.attachments && formData.attachments.length > 0 && (
                          <div className="flex gap-2 mt-2">
                              {formData.attachments.map((url, i) => (
                                  <div key={i} className="w-16 h-16 border rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                                      <img src={url} alt="attachment" className="object-cover w-full h-full"/>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>

              <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">{t('save')}</button>
          </div>
      );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Mail className="text-yellow-500"/> {t('correspondence_system')}
              </h2>
              <p className="text-slate-500 text-sm mt-1">{company.fullName}</p>
          </div>
          
          <div className="flex gap-3">
             <div className="relative">
                 <Search className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                 <input 
                    placeholder={t('search')} 
                    className={`pl-10 pr-4 py-2 border rounded-lg text-sm w-64 ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
             </div>
             
             <button 
                 onClick={() => { setView('FORM'); setFormData({ date: new Date().toISOString().split('T')[0], attachments: [] }); }}
                 className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-bold shadow-md"
             >
                 <Plus className="w-4 h-4"/> {t('add')}
             </button>
          </div>
      </div>

      <div className="flex gap-4 border-b mb-6">
          <button 
            onClick={() => setActiveTab('INCOMING')} 
            className={`px-6 py-3 font-bold border-b-2 transition ${activeTab === 'INCOMING' ? 'border-green-500 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
              {t('incoming')}
          </button>
          <button 
            onClick={() => setActiveTab('OUTGOING')} 
            className={`px-6 py-3 font-bold border-b-2 transition ${activeTab === 'OUTGOING' ? 'border-blue-500 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
              {t('outgoing')}
          </button>

          <div className="ml-auto flex items-center gap-2">
               <Filter className="w-4 h-4 text-gray-400"/>
               <select 
                  className="bg-transparent text-sm text-gray-600 outline-none cursor-pointer"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
               >
                   <option value="ALL">All Projects</option>
                   {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
               </select>
          </div>
      </div>

      <div className="border rounded-xl overflow-hidden shadow-sm">
           <table className="w-full text-start">
               <thead className="bg-slate-50 text-slate-700 text-sm">
                   <tr>
                       <th className="p-4 text-start">{t('ref_no')}</th>
                       <th className="p-4 text-start">{t('date')}</th>
                       <th className="p-4 text-start">{t('subject')}</th>
                       <th className="p-4 text-start">{activeTab === 'INCOMING' ? t('sender') : t('recipient_to')}</th>
                       <th className="p-4 text-start">{t('project')}</th>
                       <th className="p-4 text-center">{t('attachments')}</th>
                       <th className="p-4 text-center">{t('actions')}</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 text-sm">
                   {filteredList.length === 0 ? (
                       <tr><td colSpan={7} className="p-8 text-center text-gray-400">No correspondence found.</td></tr>
                   ) : (
                       filteredList.map(letter => (
                           <tr key={letter.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => openPreview(letter)}>
                               <td className="p-4 font-mono font-bold text-slate-600">{letter.referenceNumber}</td>
                               <td className="p-4 text-gray-500 text-xs">{formatDate(letter.date)}</td>
                               <td className="p-4 font-bold text-slate-800">{letter.subject}</td>
                               <td className="p-4 text-gray-600">{letter.senderOrRecipient}</td>
                               <td className="p-4">
                                   {projects.find(p => p.id === letter.projectId)?.name || <span className="text-gray-400 italic">General</span>}
                               </td>
                               <td className="p-4 text-center">
                                   {letter.attachments.length > 0 ? <Paperclip className="w-4 h-4 mx-auto text-blue-500"/> : '-'}
                               </td>
                               <td className="p-4 flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                   <button 
                                      onClick={() => openPreview(letter)}
                                      className="text-slate-400 hover:text-blue-600 transition"
                                   >
                                       <Eye className="w-5 h-5"/>
                                   </button>
                               </td>
                           </tr>
                       ))
                   )}
               </tbody>
           </table>
      </div>
    </div>
  );
};
