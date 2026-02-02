
import React, { useState, useMemo } from 'react';
import { Company, Project, Employee, Client, ProjectItem, CompanyId, CurrentUser, DocumentItem, DocumentCategory, PaymentOrder, Custody } from '../types';
import { Plus, Calendar, DollarSign, Briefcase, Trash2, FileText, ListChecks, Eye, Clock, BarChart3, X, ArrowLeft, TrendingDown, TrendingUp, Save, Wallet, Timer, AlertCircle, CheckCircle2, ChevronRight, Activity, Upload, Image as ImageIcon, ShieldCheck, FileKey, UserCheck, FileBadge, Palette, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useDate } from '../contexts/DateContext';

interface ProjectManagerProps {
  company: Company;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  clients: Client[];
  onDeleteProject: (id: string) => void;
  currentUser: CurrentUser | null;
  correspondence: any[];
  setCorrespondence: any;
  expenses: any[];
  custody: Custody[];
  paymentOrders: PaymentOrder[];
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ 
    company, projects, setProjects, employees, setEmployees, clients, onDeleteProject, currentUser,
    custody, paymentOrders
}) => {
  const { t, dir } = useLanguage();
  const { formatDate } = useDate();

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({ 
      items: [], 
      assignedEmployeeIds: [], 
      status: 'IN_PROGRESS',
      startDate: new Date().toISOString().split('T')[0]
  });

  const [tempItems, setTempItems] = useState<ProjectItem[]>([]);
  const [tempExtraDocs, setTempExtraDocs] = useState<DocumentItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<ProjectItem>>({
      description: '', durationDays: 30, estimatedCost: 0, progress: 0, status: 'PENDING', startDate: new Date().toISOString().split('T')[0]
  });

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeProjectTab, setActiveProjectTab] = useState<'OVERVIEW' | 'TIMELINE' | 'FINANCIALS'>('OVERVIEW');

  const handleFileUpload = (category: DocumentCategory, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newDoc: DocumentItem = {
          id: `DOC-${Date.now()}-${category}`,
          name: `${t(`cat_${category}`)} - ${file.name}`,
          url: url,
          type: file.type.includes('pdf') ? 'pdf' : 'image',
          category: category,
          date: new Date().toISOString().split('T')[0]
        };
        setTempExtraDocs(prev => [...prev, newDoc]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
      if (newItem.description && newItem.estimatedCost && newItem.startDate) {
          const start = new Date(newItem.startDate);
          const end = new Date(start);
          end.setDate(start.getDate() + (newItem.durationDays || 0));
          const item: ProjectItem = {
              id: 'ITEM-' + Date.now(),
              description: newItem.description,
              durationDays: newItem.durationDays || 0,
              startDate: newItem.startDate,
              endDate: end.toISOString().split('T')[0],
              estimatedCost: Number(newItem.estimatedCost),
              progress: 0,
              status: 'PENDING'
          };
          setTempItems([...tempItems, item]);
          setNewItem({ ...newItem, description: '', estimatedCost: 0 });
      }
  };

  const handleSaveProject = () => {
      if (newProject.name && newProject.clientId && newProject.contractValue) {
          const project: Project = {
              id: 'PRJ-' + Date.now(),
              companyId: company.id,
              name: newProject.name,
              clientId: newProject.clientId,
              startDate: newProject.startDate || new Date().toISOString().split('T')[0],
              endDate: newProject.endDate || '',
              contractValue: Number(newProject.contractValue),
              items: tempItems,
              status: 'IN_PROGRESS',
              assignedEmployeeIds: [],
              payments: [],
              extraDocuments: tempExtraDocs
          }; 
          setProjects(prev => [...prev, project]);
          setShowProjectForm(false);
          setNewProject({ status: 'IN_PROGRESS', startDate: new Date().toISOString().split('T')[0] });
          setTempItems([]);
          setTempExtraDocs([]);
      } else {
          alert("يرجى تعبئة كافة الحقول الأساسية.");
      }
  };

  const calculateProjectActualCost = (projectId: string) => {
      const orders = paymentOrders.filter(p => p.projectId === projectId && p.status === 'APPROVED');
      const ordersTotal = orders.reduce((sum, o) => sum + o.amount, 0);
      const custodyTrans = custody.flatMap(c => c.transactions || []).filter(t => t.projectId === projectId);
      return ordersTotal + custodyTrans.reduce((sum, t) => sum + t.amount, 0);
  };

  const renderGanttChart = (project: Project) => {
      const projectStart = new Date(project.startDate).getTime();
      let latestEnd = project.endDate ? new Date(project.endDate).getTime() : 0;
      project.items.forEach(item => { const itemEnd = new Date(item.endDate).getTime(); if (itemEnd > latestEnd) latestEnd = itemEnd; });
      if (latestEnd === 0) latestEnd = projectStart + (90 * 24 * 60 * 60 * 1000);
      const totalDuration = latestEnd - projectStart;
      const today = new Date().getTime();

      return (
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 overflow-x-auto shadow-inner min-w-full">
              <div className="flex justify-between items-center mb-6">
                 <h4 className="font-black text-slate-800 dark:text-white flex items-center gap-2"><Timer className="w-5 h-5 text-blue-500"/> الجدول الزمني التفصيلي</h4>
              </div>
              <div className="relative pt-6" style={{ minWidth: '800px' }}>
                  <div className="flex border-b dark:border-slate-800 pb-2 mb-4 text-[8px] font-black text-slate-400">
                     <div className="w-48 sticky right-0 bg-white dark:bg-slate-900 z-10">بند العمل</div>
                     <div className="flex-1 flex justify-between relative px-2">
                         <span>{formatDate(new Date(projectStart).toISOString())}</span>
                         <span>{formatDate(new Date(latestEnd).toISOString())}</span>
                     </div>
                  </div>
                  {today >= projectStart && today <= latestEnd && (
                      <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20" style={{ right: `calc(12rem + ${((today - projectStart) / totalDuration) * 100}%)` }}></div>
                  )}
                  <div className="space-y-4">
                      {project.items.map(item => {
                          const itemStart = new Date(item.startDate).getTime();
                          const widthPos = ((new Date(item.endDate).getTime() - itemStart) / totalDuration) * 100;
                          return (
                              <div key={item.id} className="flex items-center group">
                                  <div className="w-48 text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate pr-2 sticky right-0 bg-white dark:bg-slate-900 z-10">{item.description}</div>
                                  <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden">
                                      <div className="absolute top-0 bottom-0 bg-blue-500/20 rounded-full border border-blue-500/30" style={{ right: `${((itemStart - projectStart) / totalDuration) * 100}%`, width: `${widthPos}%` }}>
                                          <div className="h-full bg-blue-500 rounded-full flex items-center justify-center" style={{ width: `${item.progress}%` }}>
                                              {item.progress > 20 && <span className="text-[8px] font-black text-white">{item.progress}%</span>}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      );
  };

  const projectDocCategories: {cat: DocumentCategory, label: string, icon: any}[] = [
    { cat: 'ARCHITECTURAL', label: 'مخطط معماري', icon: ImageIcon },
    { cat: 'STRUCTURAL', label: 'مخطط إنشائي', icon: FileText },
    { cat: 'ELECTRICAL', label: 'مخطط كهربائي', icon: Activity },
    { cat: 'INTERIOR', label: 'تصميم داخلي', icon: Palette },
    { cat: 'EXTERIOR', label: 'تصميم خارجي', icon: MapPin },
    { cat: 'LICENSE', label: 'رخصة بناء', icon: FileBadge },
    { cat: 'DEED', label: 'صك الملكية', icon: FileKey },
    { cat: 'INSURANCE', label: 'وثيقة تأمين', icon: ShieldCheck },
    { cat: 'DELEGATION', label: 'تفاويض', icon: UserCheck },
    { cat: 'ACKNOWLEDGMENT', label: 'إقرارات', icon: ListChecks }
  ];

  if (selectedProject) {
      const client = clients.find(c => c.id === selectedProject.clientId);
      const actualCost = calculateProjectActualCost(selectedProject.id);
      return (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-6 md:p-10 animate-fade-in border dark:border-slate-800 relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                  <div>
                      <button onClick={() => setSelectedProject(null)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition font-black text-[10px] uppercase tracking-widest mb-4"><ArrowLeft className="w-4 h-4"/> عودة</button>
                      <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{selectedProject.name}</h2>
                      <p className="text-blue-600 font-bold mt-1 text-xs">العميل: {client?.name}</p>
                  </div>
                  <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border dark:border-slate-700">
                      <button onClick={() => setActiveProjectTab('OVERVIEW')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeProjectTab === 'OVERVIEW' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}>نظرة عامة</button>
                      <button onClick={() => setActiveProjectTab('TIMELINE')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeProjectTab === 'TIMELINE' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}>الجدول الزمني</button>
                      <button onClick={() => setActiveProjectTab('FINANCIALS')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeProjectTab === 'FINANCIALS' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}>المالية</button>
                  </div>
              </div>
              {activeProjectTab === 'OVERVIEW' && (
                  <div className="space-y-8 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                         <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                            <p className="text-[10px] font-black text-blue-400 uppercase mb-2">قيمة العقد</p>
                            <p className="text-xl font-black text-blue-700 dark:text-blue-400">{selectedProject.contractValue.toLocaleString()} <span className="text-[10px]">SAR</span></p>
                         </div>
                         <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                            <p className="text-[10px] font-black text-amber-400 uppercase mb-2">التكلفة الفعلية</p>
                            <p className="text-xl font-black text-amber-700 dark:text-amber-400">{actualCost.toLocaleString()} <span className="text-[10px]">SAR</span></p>
                         </div>
                      </div>
                      
                      {/* عرض المخططات والوثائق المرفقة */}
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border dark:border-slate-800">
                         <h4 className="font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2 text-xs"><FileText className="w-4 h-4 text-blue-500"/> المستندات والوثائق الفنية والقانونية</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedProject.extraDocuments?.map(doc => {
                                const categoryInfo = projectDocCategories.find(c => c.cat === doc.category);
                                const IconComp = categoryInfo?.icon || FileText;
                                return (
                                    <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-700 hover:shadow-md transition group">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <IconComp className="w-4 h-4"/>
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black text-slate-800 dark:text-white truncate">{doc.name}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">{categoryInfo?.label || doc.category}</p>
                                        </div>
                                    </a>
                                );
                            })}
                            {(!selectedProject.extraDocuments || selectedProject.extraDocuments.length === 0) && <p className="text-[10px] text-gray-400 col-span-full py-4 text-center">لا توجد وثائق مرفقة لهذا المشروع</p>}
                         </div>
                      </div>
                  </div>
              )}
              {activeProjectTab === 'TIMELINE' && renderGanttChart(selectedProject)}
              {activeProjectTab === 'FINANCIALS' && <div className="p-10 text-center text-slate-400">تحليل المصروفات قيد العرض...</div>}
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm">
            <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3"><Briefcase className="w-8 h-8 text-blue-600"/> إدارة المشاريع</h3>
                <p className="text-[10px] text-gray-500 font-bold mt-1">تأسيس المخططات والجدولة الزمنية</p>
            </div>
            {!showProjectForm && (
                <button onClick={() => setShowProjectForm(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl hover:bg-blue-700 transition flex items-center gap-3 text-xs">
                    <Plus className="w-5 h-5"/> إضافة مشروع جديد
                </button>
            )}
        </div>

        {showProjectForm && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border-4 border-blue-50 dark:border-slate-800 animate-slide-down relative">
                <button onClick={() => setShowProjectForm(false)} className="absolute top-8 left-8 p-3 bg-slate-50 dark:bg-slate-800 rounded-full hover:text-red-500 transition"><X/></button>
                <h4 className="text-xl font-black text-blue-800 dark:text-blue-400 mb-10 border-r-8 border-blue-600 pr-6">تأسيس مشروع متكامل</h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="space-y-6">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">1. معلومات العقد</h5>
                        <div className="space-y-4">
                            <input className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-[11px] font-black" placeholder="اسم المشروع" value={newProject.name || ''} onChange={e => setNewProject({...newProject, name: e.target.value})} />
                            <select className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-[11px] font-black" value={newProject.clientId || ''} onChange={e => setNewProject({...newProject, clientId: e.target.value})}>
                                <option value="">-- اختر العميل --</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <input type="number" className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-lg font-black text-blue-600" placeholder="قيمة العقد" value={newProject.contractValue || ''} onChange={e => setNewProject({...newProject, contractValue: Number(e.target.value)})} />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="date" className="w-full p-3 border-2 dark:border-slate-700 bg-slate-50 rounded-xl text-[10px] font-black" value={newProject.startDate || ''} onChange={e => setNewProject({...newProject, startDate: e.target.value})} />
                                <input type="date" className="w-full p-3 border-2 dark:border-slate-700 bg-slate-50 rounded-xl text-[10px] font-black" value={newProject.endDate || ''} onChange={e => setNewProject({...newProject, endDate: e.target.value})} />
                            </div>
                        </div>

                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 pt-4">2. الوثائق والمخططات (اختياري)</h5>
                        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                            {projectDocCategories.map(plan => (
                                <label key={plan.cat} className="flex items-center justify-between p-3 border-2 border-dashed dark:border-slate-700 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <plan.icon className="w-3 h-3"/>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{plan.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {tempExtraDocs.filter(d => d.category === plan.cat).length > 0 && (
                                            <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">
                                                {tempExtraDocs.filter(d => d.category === plan.cat).length}
                                            </span>
                                        )}
                                        <Upload className="w-3 h-3 text-slate-300 group-hover:text-blue-500"/>
                                    </div>
                                    <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileUpload(plan.cat, e)} />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">3. بنود التنفيذ والجدولة</h5>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border dark:border-slate-700">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
                                <div className="md:col-span-2">
                                    <label className="text-[8px] font-black text-slate-400 mb-1 block">وصف البند</label>
                                    <input className="w-full p-3 border-2 dark:border-slate-700 rounded-xl text-[10px] font-bold" value={newItem.description || ''} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="مثال: أعمال القواعد" />
                                </div>
                                <div>
                                    <label className="text-[8px] font-black text-slate-400 mb-1 block">تاريخ البدء</label>
                                    <input type="date" className="w-full p-3 border-2 dark:border-slate-700 rounded-xl text-[10px] font-bold" value={newItem.startDate || ''} onChange={e => setNewItem({...newItem, startDate: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[8px] font-black text-slate-400 mb-1 block">المدة (يوم)</label>
                                    <input type="number" className="w-full p-3 border-2 dark:border-slate-700 rounded-xl text-[10px] font-bold" value={newItem.durationDays || ''} onChange={e => setNewItem({...newItem, durationDays: Number(e.target.value)})} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[8px] font-black text-slate-400 mb-1 block">التكلفة التقديرية</label>
                                    <input type="number" className="w-full p-3 border-2 dark:border-slate-700 rounded-xl text-[10px] font-bold text-blue-600" value={newItem.estimatedCost || ''} onChange={e => setNewItem({...newItem, estimatedCost: Number(e.target.value)})} />
                                </div>
                                <div className="md:col-span-2"><button onClick={handleAddItem} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg"><Plus className="w-4 h-4"/> إضافة بند</button></div>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                {tempItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border dark:border-slate-700 group shadow-sm">
                                        <div><p className="font-bold text-[10px]">{item.description}</p><p className="text-[8px] text-slate-400">{item.startDate} ({item.durationDays} يوم)</p></div>
                                        <div className="flex items-center gap-4"><span className="text-[10px] font-black text-blue-600">{item.estimatedCost.toLocaleString()} SAR</span><button onClick={() => setTempItems(tempItems.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500 transition"><Trash2 className="w-3 h-3"/></button></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t dark:border-slate-800 flex justify-end gap-4">
                    <button onClick={() => setShowProjectForm(false)} className="px-10 py-4 text-slate-500 font-black hover:bg-slate-100 rounded-2xl transition text-xs">إلغاء</button>
                    <button onClick={handleSaveProject} className="bg-blue-600 text-white px-16 py-4 rounded-2xl shadow-2xl hover:bg-blue-700 transition font-black flex items-center gap-3 text-xs"><Save className="w-6 h-6"/> حفظ المشروع والبيانات</button>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.filter(p => p.companyId === company.id).map(p => (
                <div key={p.id} className="bg-white dark:bg-slate-900 border-2 dark:border-slate-800 rounded-[2.5rem] p-8 hover:shadow-2xl transition group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-blue-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 border-2 border-blue-100 dark:border-blue-900 shadow-sm"><Briefcase className="w-6 h-6"/></div>
                            <div><h4 className="font-black text-slate-800 dark:text-white text-sm leading-tight">{p.name}</h4><p className="text-[10px] text-blue-600 font-black mt-1 uppercase tracking-tighter">{clients.find(c => c.id === p.clientId)?.name}</p></div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setSelectedProject(p)} className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm"><ChevronRight className="w-5 h-5"/></button>
                            <button onClick={() => onDeleteProject(p.id)} className="p-3 bg-slate-50 dark:bg-slate-800 text-gray-400 hover:text-red-500 rounded-xl transition shadow-sm"><Trash2 className="w-5 h-5"/></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">القيمة التعاقدية</p>
                            <p className="text-sm font-black text-slate-800 dark:text-white">{p.contractValue.toLocaleString()} <span className="text-[8px]">SAR</span></p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">تقدم الأعمال</p>
                            <p className="text-sm font-black text-blue-600">{p.items.length > 0 ? Math.round(p.items.reduce((s,i) => s+i.progress, 0) / p.items.length) : 0}%</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
