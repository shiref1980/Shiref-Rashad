
import React, { useState, useMemo } from 'react';
import { Project, DailyReport, ReportItem, Company, CurrentUser, Client, CompanyId } from '../types';
import { Camera, FileText, Plus, Trash2, Printer, Eye, Calendar, Archive, X, Check, ArrowLeft, Share2, Filter, Download, UserCheck, MapPin, Phone, Inbox, QrCode, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useDate } from '../contexts/DateContext';

interface Props {
  company: Company;
  projects: Project[];
  reports: DailyReport[];
  setReports: React.Dispatch<React.SetStateAction<DailyReport[]>>;
  currentUser: CurrentUser | null;
  clients: Client[];
}

export const DailyReportManager: React.FC<Props> = ({ company, projects, reports, setReports, currentUser, clients }) => {
  const { t } = useLanguage();
  const { formatDate } = useDate();
  const [view, setView] = useState<'LIST' | 'FORM' | 'PREVIEW'>('LIST');
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [projectFilter, setProjectFilter] = useState<string>('ALL');

  // Form State
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [reportItems, setReportItems] = useState<ReportItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<ReportItem>>({});
  const [reportImages, setReportImages] = useState<string[]>([]);
  const [reportNotes, setReportNotes] = useState('');

  const filteredReports = useMemo(() => {
    let result = reports;
    if (projectFilter !== 'ALL') {
      result = result.filter(r => r.projectId === projectFilter);
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reports, projectFilter]);

  const generateReportCode = (date: string) => {
    const dateStr = date.replace(/-/g, '');
    const count = reports.filter(r => r.date === date).length + 1;
    return `RPT-${company.name.split(' ')[0]}-${dateStr}-${String(count).padStart(3, '0')}`;
  };

  const handleSaveReport = () => {
      const project = projects.find(p => p.id === selectedProjectId);
      if (project && reportItems.length > 0) {
          const report: DailyReport = {
              id: Date.now().toString(),
              code: generateReportCode(reportDate),
              companyId: company.id,
              projectId: project.id,
              date: reportDate,
              engineerName: currentUser?.name || 'Unknown',
              items: reportItems,
              images: reportImages,
              notes: reportNotes,
              status: 'DRAFT'
          };
          setReports(prev => [report, ...prev]);
          setView('LIST');
          resetForm();
      }
  };

  const resetForm = () => {
    setSelectedProjectId(''); setReportItems([]); setReportImages([]); setReportNotes(''); setReportDate(new Date().toISOString().split('T')[0]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file as any));
          setReportImages(prev => [...prev, ...newImages]);
      }
  };

  const removeImage = (index: number) => {
      setReportImages(prev => prev.filter((_, i) => i !== index));
  };

  const getQrUrl = (data: string) => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;

  if (view === 'PREVIEW' && selectedReport) {
      const project = projects.find(p => p.id === selectedReport.projectId);
      return (
          <div className="bg-gray-100 min-h-screen p-8 flex justify-center fixed inset-0 z-50 overflow-y-auto">
              <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-10 relative print:w-full print:p-0">
                  <div className="absolute top-4 left-[-150px] flex flex-col gap-2 print:hidden">
                      <button onClick={() => window.print()} className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"><Printer/></button>
                      <button onClick={() => setView('LIST')} className="bg-gray-600 text-white p-3 rounded-full shadow-lg hover:bg-gray-700"><ArrowLeft/></button>
                  </div>

                  <div className="flex justify-between items-center border-b-4 border-slate-800 pb-6 mb-8">
                      <div>
                          <h1 className="text-2xl font-black text-slate-800">{company.fullName}</h1>
                          <p className="text-slate-500 mt-1 text-xs font-bold uppercase tracking-widest">{t('daily_work_report')}</p>
                      </div>
                      <img src={getQrUrl(`EB-REPORT:${selectedReport.code}`)} className="w-20 h-20 border-2 p-1 rounded-lg shadow-sm" alt="QR" />
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="bg-slate-50 p-4 rounded-xl border">
                          <p className="text-[10px] text-gray-400 font-black uppercase mb-1">{t('project')}</p>
                          <p className="font-bold">{project?.name}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border">
                          <p className="text-[10px] text-gray-400 font-black uppercase mb-1">{t('date')}</p>
                          <p className="font-bold">{formatDate(selectedReport.date)}</p>
                      </div>
                  </div>

                  <table className="w-full border-collapse mb-8 text-sm">
                      <thead>
                          <tr className="bg-slate-800 text-white">
                              <th className="p-3 text-start">{t('item_work')}</th>
                              <th className="p-3 text-center">{t('progress_percent')}</th>
                              <th className="p-3 text-start">{t('notes')}</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y border">
                          {selectedReport.items.map((item, i) => (
                              <tr key={i}>
                                  <td className="p-3 font-bold">{item.description}</td>
                                  <td className="p-3 text-center font-black text-blue-600">{item.progressPercentage}%</td>
                                  <td className="p-3 text-gray-500 italic">{item.notes}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  
                  {selectedReport.notes && (
                      <div className="mb-8 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                          <p className="text-xs font-black text-yellow-800 mb-2">{t('general_notes')}</p>
                          <p className="text-sm italic">{selectedReport.notes}</p>
                      </div>
                  )}

                  {selectedReport.images && selectedReport.images.length > 0 && (
                      <div className="mb-8">
                          <p className="text-xs font-black text-slate-800 mb-4 border-b pb-2">{t('images')}</p>
                          <div className="grid grid-cols-3 gap-4">
                              {selectedReport.images.map((img, idx) => (
                                  <div key={idx} className="h-32 border rounded-lg overflow-hidden">
                                      <img src={img} className="w-full h-full object-cover" alt={`Report Image ${idx}`} />
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="mt-auto pt-10 flex justify-between items-center text-xs font-bold text-gray-400">
                      <p>المسؤول: {selectedReport.engineerName}</p>
                      <p>EB Group ERP v3.1 Secure Link</p>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border dark:border-slate-800 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3"><FileText className="w-8 h-8 text-teal-600"/> {t('daily_reports')}</h2>
                <p className="text-gray-500 text-sm mt-1">أرشفة ومتابعة التقارير اليومية للمواقع والمشاريع.</p>
            </div>
            <button onClick={() => setView('FORM')} className="bg-teal-600 text-white px-8 py-3.5 rounded-2xl shadow-xl hover:bg-teal-700 transition flex items-center gap-2 font-black"><Plus className="w-5 h-5"/> {t('new_report')}</button>
        </div>

        {view === 'FORM' && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border dark:border-slate-800 mb-10 animate-slide-down">
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <select className="w-full p-3 border dark:border-slate-700 rounded-xl font-bold bg-white dark:bg-slate-900 dark:text-white" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>
                        <option value="">{t('select_project')}</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="date" className="w-full p-3 border dark:border-slate-700 rounded-xl font-bold bg-white dark:bg-slate-900 dark:text-white" value={reportDate} onChange={e => setReportDate(e.target.value)} />
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-inner mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-6">
                        <div className="md:col-span-8"><input placeholder={t('description')} className="w-full p-3 border dark:border-slate-700 rounded-xl text-sm" value={newItem.description || ''} onChange={e => setNewItem({...newItem, description: e.target.value})} /></div>
                        <div className="md:col-span-3"><input type="number" placeholder="%" className="w-full p-3 border dark:border-slate-700 rounded-xl text-sm" value={newItem.progressPercentage} onChange={e => setNewItem({...newItem, progressPercentage: Number(e.target.value)})} /></div>
                        <div className="md:col-span-1"><button onClick={() => {if(newItem.description) {setReportItems([...reportItems, {id: Date.now().toString(), ...newItem} as ReportItem]); setNewItem({progressPercentage: 0});}}} className="bg-blue-600 text-white p-3.5 rounded-xl transition w-full flex justify-center"><Plus/></button></div>
                    </div>
                    {reportItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl mb-2">
                            <span className="font-bold text-xs">{item.description}</span>
                            <span className="font-black text-blue-600">{item.progressPercentage}%</span>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-inner mb-6">
                    <h5 className="font-bold text-slate-700 dark:text-white mb-3 flex items-center gap-2"><Camera className="w-5 h-5 text-teal-600"/> {t('images')}</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {reportImages.map((img, idx) => (
                            <div key={idx} className="relative h-24 rounded-xl overflow-hidden group border dark:border-slate-700">
                                <img src={img} alt="Report" className="w-full h-full object-cover" />
                                <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"><X className="w-3 h-3"/></button>
                            </div>
                        ))}
                        
                        {/* Camera Button */}
                        <label className="h-24 border-2 border-dashed border-teal-300 dark:border-teal-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/20 transition bg-teal-50/50">
                            <Camera className="w-6 h-6 text-teal-600 mb-1"/>
                            <span className="text-[10px] text-teal-700 font-bold">{t('use_camera')}</span>
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                        </label>

                        {/* Gallery Upload Button */}
                        <label className="h-24 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                            <ImageIcon className="w-6 h-6 text-gray-400 mb-1"/>
                            <span className="text-[10px] text-gray-500 font-bold">{t('upload_images')}</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>
                    <textarea 
                        className="w-full p-3 border dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50" 
                        placeholder={t('general_notes')}
                        value={reportNotes}
                        onChange={e => setReportNotes(e.target.value)}
                    />
                </div>

                <button onClick={handleSaveReport} className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-teal-700 transition flex items-center justify-center gap-2"><Save className="w-5 h-5"/> {t('save')}</button>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map(rpt => (
                <div key={rpt.id} className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 hover:shadow-xl transition group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <p className="font-mono text-[10px] font-black text-blue-600">{rpt.code}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{formatDate(rpt.date)}</p>
                    </div>
                    <h4 className="font-black text-slate-800 dark:text-white mb-4 truncate">{projects.find(p => p.id === rpt.projectId)?.name}</h4>
                    <div className="flex justify-between items-center pt-4 border-t dark:border-slate-800">
                        <div className="flex gap-2">
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-bold text-gray-500">{rpt.items.length} {t('work_items')}</span>
                            {rpt.images && rpt.images.length > 0 && <span className="text-[10px] bg-teal-50 dark:bg-teal-900/30 text-teal-600 px-2 py-1 rounded font-bold">{rpt.images.length} 📷</span>}
                        </div>
                        <button onClick={() => { setSelectedReport(rpt); setView('PREVIEW'); }} className="p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-xl hover:bg-teal-600 hover:text-white transition"><Eye className="w-5 h-5"/></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
