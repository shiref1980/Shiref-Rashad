
import React, { useState } from 'react';
import { Company, Project, Employee, Client, ProjectItem, CompanyId, CurrentUser, ProjectDocuments, DailyReport, PlanDelivery, PlanDeliveryItem, Notification, Correspondence, CorrespondenceType, ProjectPayment, Expense, DocumentItem, DocumentCategory, PaymentOrder, Custody } from '../types';
import { Plus, Calendar, DollarSign, ListChecks, Briefcase, Trash2, Users, FileText, Upload, Paperclip, Eye, Clock, BarChart3, CheckCircle2, Camera, X, Paintbrush, Printer, ScrollText, ArrowLeft, Mail, Search, AlertCircle, Coins, Wallet, TrendingDown, TrendingUp, CheckSquare, ArrowUpRight, ArrowDownLeft, Filter, Send, ExternalLink, PenTool, LayoutTemplate, File, StickyNote, Calculator } from 'lucide-react';
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
  correspondence: Correspondence[];
  setCorrespondence: React.Dispatch<React.SetStateAction<Correspondence[]>>;
  expenses: Expense[];
  custody: Custody[];
  paymentOrders: PaymentOrder[];
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ 
    company, projects, setProjects, employees, setEmployees, clients, onDeleteProject, currentUser,
    correspondence, setCorrespondence, expenses, custody, paymentOrders
}) => {
  const { t, dir } = useLanguage();
  const { formatDate } = useDate();

  // Project Form State
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({ items: [], assignedEmployeeIds: [], documents: {}, payments: [], extraDocuments: [] });
  const [newItem, setNewItem] = useState<Partial<ProjectItem>>({});
  const [tempItems, setTempItems] = useState<ProjectItem[]>([]);
  
  // Payment Form State
  const [newPayment, setNewPayment] = useState<Partial<ProjectPayment>>({ status: 'PENDING' });
  const [tempPayments, setTempPayments] = useState<ProjectPayment[]>([]);

  // Initial Documents Form State
  const [newProjectDocs, setNewProjectDocs] = useState<DocumentItem[]>([]);
  const [tempDocName, setTempDocName] = useState('');
  const [tempDocCategory, setTempDocCategory] = useState<DocumentCategory>('OTHER');

  // Detailed View State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeProjectTab, setActiveProjectTab] = useState<'OVERVIEW' | 'CORRESPONDENCE' | 'DOCUMENTS' | 'FINANCIALS'>('OVERVIEW');
  
  // Document State (Existing Project)
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('OTHER');

  // Project Correspondence State
  const [corrSearch, setCorrSearch] = useState('');
  const [showCorrForm, setShowCorrForm] = useState(false);
  const [newCorr, setNewCorr] = useState<Partial<Correspondence>>({ 
      type: 'INCOMING', 
      date: new Date().toISOString().split('T')[0],
      attachments: []
  });

  const docCategories: DocumentCategory[] = [
      'CONTRACT', 
      'ARCHITECTURAL', 
      'STRUCTURAL', 
      'MECHANICAL', 
      'ELECTRICAL', 
      'INTERIOR',
      'EXTERIOR',
      'PLAN', 
      'LETTER', 
      'OTHER'
  ];

  const resetForm = () => {
      setNewProject({ 
          items: [], 
          assignedEmployeeIds: [], 
          documents: {}, 
          payments: [], 
          extraDocuments: [],
          companyId: company.id 
      });
      setTempItems([]);
      setTempPayments([]);
      setNewProjectDocs([]);
      setShowProjectForm(false);
  };

  // --- Handlers ---

  const handleAddItem = () => {
      if (newItem.description && newItem.estimatedCost) {
          const item: ProjectItem = {
              id: Date.now().toString(),
              description: newItem.description,
              durationDays: Number(newItem.durationDays) || 0,
              startDate: newItem.startDate, 
              estimatedCost: Number(newItem.estimatedCost) || 0,
              status: 'PENDING',
              progress: 0
          };
          setTempItems([...tempItems, item]);
          setNewItem({});
      }
  };

  const handleAddPayment = () => {
      if (newPayment.name && newPayment.amount && newPayment.dueDate) {
          const payment: ProjectPayment = {
              id: Date.now().toString(),
              name: newPayment.name,
              amount: Number(newPayment.amount),
              dueDate: newPayment.dueDate,
              status: newPayment.status || 'PENDING'
          };
          setTempPayments([...tempPayments, payment]);
          setNewPayment({ status: 'PENDING' });
      }
  };

  const handleTempDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && tempDocName) {
          const file = e.target.files[0];
          const url = URL.createObjectURL(file);
          const type = file.type.includes('pdf') ? 'pdf' : 'image';
          
          const newDoc: DocumentItem = {
              id: Date.now().toString(),
              name: tempDocName,
              url,
              type,
              category: tempDocCategory,
              date: new Date().toISOString().split('T')[0]
          };

          setNewProjectDocs([...newProjectDocs, newDoc]);
          setTempDocName('');
      } else {
          alert("Please enter document name first");
      }
  };

  const handleDeleteTempDoc = (docId: string) => {
      setNewProjectDocs(newProjectDocs.filter(d => d.id !== docId));
  };

  const handleSaveProject = () => {
      if (newProject.name && newProject.clientId && newProject.contractValue) {
          const project: Project = {
              id: Date.now().toString(),
              companyId: company.id,
              name: newProject.name,
              clientId: newProject.clientId,
              startDate: newProject.startDate || new Date().toISOString().split('T')[0],
              endDate: newProject.endDate || '',
              contractValue: Number(newProject.contractValue),
              items: tempItems,
              payments: tempPayments,
              assignedEmployeeIds: newProject.assignedEmployeeIds || [],
              documents: newProject.documents || {},
              extraDocuments: newProjectDocs, // Save documents here
              status: 'IN_PROGRESS'
          } as any; 

          setProjects(prev => [...prev, project]);
          resetForm();
      } else {
          alert(t('fill_required'));
      }
  };

  const handleDeleteItem = (idx: number) => {
      setTempItems(tempItems.filter((_, i) => i !== idx));
  };

  const handleDeletePayment = (idx: number) => {
      setTempPayments(tempPayments.filter((_, i) => i !== idx));
  };

  const confirmPayment = (project: Project, paymentId: string) => {
      if (!window.confirm("Are you sure you want to mark this as PAID?")) return;

      const updatedProjects = projects.map(p => {
          if (p.id === project.id) {
              return {
                  ...p,
                  payments: p.payments?.map(pay => 
                      pay.id === paymentId ? { ...pay, status: 'PAID' as const, paidDate: new Date().toISOString().split('T')[0], confirmedBy: currentUser?.name } : pay
                  )
              };
          }
          return p;
      });
      setProjects(updatedProjects);
      
      // Update selected project view
      const updatedProject = updatedProjects.find(p => p.id === project.id);
      setSelectedProject(updatedProject || null);

      // Notify Project Manager / Admin
      const payment = project.payments?.find(p => p.id === paymentId);
      if (payment) {
          const notif: Notification = {
              id: Date.now().toString(),
              message: `تم تأكيد استلام دفعة "${payment.name}" لمشروع ${project.name}`,
              date: new Date().toISOString().split('T')[0],
              isRead: false,
              projectId: project.id,
              relatedId: paymentId
          };
          
          setEmployees(prev => prev.map(emp => {
              // Notify admins and project assigned employees
              if (emp.permissionRole === 'ADMIN' || project.assignedEmployeeIds?.includes(emp.id)) {
                  return { ...emp, notifications: [notif, ...(emp.notifications || [])] };
              }
              return emp;
          }));
      }
  };

  const handleProjectDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && docName && selectedProject) {
          const file = e.target.files[0];
          const url = URL.createObjectURL(file);
          const type = file.type.includes('pdf') ? 'pdf' : 'image';
          
          const newDoc: DocumentItem = {
              id: Date.now().toString(),
              name: docName,
              url,
              type,
              category: docCategory,
              date: new Date().toISOString().split('T')[0]
          };

          const updatedProjects = projects.map(p => {
              if (p.id === selectedProject.id) {
                  return { ...p, extraDocuments: [...(p.extraDocuments || []), newDoc] };
              }
              return p;
          });
          
          setProjects(updatedProjects);
          setSelectedProject(prev => prev ? ({ ...prev, extraDocuments: [...(prev.extraDocuments || []), newDoc] }) : null);
          setDocName('');
      } else {
          alert("Please enter document name first");
      }
  };

  const handleDeleteProjectDoc = (docId: string) => {
      if(selectedProject) {
          const updatedProjects = projects.map(p => {
              if (p.id === selectedProject.id) {
                  return { ...p, extraDocuments: p.extraDocuments?.filter(d => d.id !== docId) };
              }
              return p;
          });
          setProjects(updatedProjects);
          setSelectedProject(prev => prev ? ({ ...prev, extraDocuments: prev.extraDocuments?.filter(d => d.id !== docId) }) : null);
      }
  };

  // --- Correspondence Handlers ---
  const handleAddCorrespondence = () => {
      if (newCorr.subject && newCorr.senderOrRecipient && selectedProject) {
          const prefix = newCorr.type === 'INCOMING' ? 'IN' : 'OUT';
          const year = new Date().getFullYear();
          const count = correspondence.filter(c => 
              c.type === newCorr.type && 
              c.companyId === company.id && 
              c.date.startsWith(year.toString())
          ).length + 1;
          
          const ref = `${prefix}-${company.name.split(' ')[0]}-${year}-${String(count).padStart(3, '0')}`;

          const item: Correspondence = {
              id: Date.now().toString(),
              companyId: company.id,
              projectId: selectedProject.id,
              referenceNumber: ref,
              type: newCorr.type || 'INCOMING',
              date: newCorr.date!,
              subject: newCorr.subject!,
              senderOrRecipient: newCorr.senderOrRecipient!,
              content: newCorr.content,
              attachments: newCorr.attachments || [],
              status: 'ARCHIVED'
          };

          setCorrespondence(prev => [item, ...prev]);
          setShowCorrForm(false);
          setNewCorr({ 
              type: 'INCOMING', 
              date: new Date().toISOString().split('T')[0],
              attachments: [] 
          });
      } else {
          alert(t('fill_required'));
      }
  };

  const handleCorrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const url = URL.createObjectURL(e.target.files[0]);
          setNewCorr(prev => ({ ...prev, attachments: [...(prev.attachments || []), url] }));
      }
  };

  // --- Render ---

  if (selectedProject) {
      // Detailed View of a Project
      const client = clients.find(c => c.id === selectedProject.clientId);
      const totalCollected = selectedProject.payments?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0) || 0;
      const progress = selectedProject.contractValue > 0 ? Math.round((totalCollected / selectedProject.contractValue) * 100) : 0;

      // Filter Correspondence
      const projectCorrespondence = correspondence.filter(c => 
          c.projectId === selectedProject.id &&
          (c.subject.toLowerCase().includes(corrSearch.toLowerCase()) || 
           c.referenceNumber.toLowerCase().includes(corrSearch.toLowerCase()) ||
           c.senderOrRecipient.toLowerCase().includes(corrSearch.toLowerCase()))
      ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Helper function for grouping documents
      const groupedDocs = selectedProject.extraDocuments?.reduce((acc, doc) => {
          const cat = doc.category || 'OTHER';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(doc);
          return acc;
      }, {} as Record<string, DocumentItem[]>) || {};

      // Financial Calculations
      const estimatedCost = selectedProject.items.reduce((s, i) => s + i.estimatedCost, 0);
      const directExpenses = paymentOrders.filter(p => p.projectId === selectedProject.id && p.status === 'APPROVED').reduce((sum, p) => sum + p.amount, 0);
      const custodyExpenses = custody.flatMap(c => c.transactions || []).filter(t => t.projectId === selectedProject.id).reduce((sum, t) => sum + t.amount, 0);
      const totalActualCost = directExpenses + custodyExpenses;
      const remainingBudget = estimatedCost - totalActualCost;
      const profitMargin = selectedProject.contractValue - totalActualCost;

      return (
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                  <button onClick={() => setSelectedProject(null)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition">
                      <ArrowLeft className="w-4 h-4"/> {t('back')}
                  </button>
                  
                  {/* Tabs */}
                  <div className="flex bg-gray-100 p-1 rounded-lg flex-wrap">
                      <button 
                          onClick={() => setActiveProjectTab('OVERVIEW')} 
                          className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${activeProjectTab === 'OVERVIEW' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                          {t('dashboard')}
                      </button>
                      <button 
                          onClick={() => setActiveProjectTab('FINANCIALS')} 
                          className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${activeProjectTab === 'FINANCIALS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                          المالية والتكاليف
                      </button>
                      <button 
                          onClick={() => setActiveProjectTab('DOCUMENTS')} 
                          className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${activeProjectTab === 'DOCUMENTS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                          {t('project_documents')}
                      </button>
                      <button 
                          onClick={() => setActiveProjectTab('CORRESPONDENCE')} 
                          className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${activeProjectTab === 'CORRESPONDENCE' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                          {t('correspondence')}
                      </button>
                  </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b pb-4 gap-4">
                  <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{selectedProject.name}</h2>
                      <p className="text-slate-500">{client?.name}</p>
                  </div>
                  <div className="text-end self-end md:self-auto">
                      <p className="text-2xl font-bold text-blue-600">{selectedProject.contractValue.toLocaleString()} SAR</p>
                      <p className="text-sm text-gray-400">{formatDate(selectedProject.startDate)} - {formatDate(selectedProject.endDate)}</p>
                  </div>
              </div>

              {activeProjectTab === 'OVERVIEW' && (
                  <div className="animate-fade-in">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                              <p className="text-xs font-bold text-blue-500 uppercase">{t('collected_amount')}</p>
                              <p className="text-lg md:text-xl font-bold text-blue-900">{totalCollected.toLocaleString()}</p>
                          </div>
                          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                              <p className="text-xs font-bold text-orange-500 uppercase">{t('remaining_amount')}</p>
                              <p className="text-lg md:text-xl font-bold text-orange-900">{(selectedProject.contractValue - totalCollected).toLocaleString()}</p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                              <p className="text-xs font-bold text-purple-500 uppercase">{t('items_count')}</p>
                              <p className="text-lg md:text-xl font-bold text-purple-900">{selectedProject.items.length}</p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                              <p className="text-xs font-bold text-green-500 uppercase">{t('collection_rate')}</p>
                              <p className="text-lg md:text-xl font-bold text-green-900">{progress}%</p>
                          </div>
                      </div>

                      {/* Project Schedule (Gantt Chart) */}
                      <div className="mb-8 border rounded-xl p-6 bg-white dark:bg-slate-900 dark:border-slate-800 overflow-hidden shadow-sm">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="font-bold text-lg flex items-center gap-2 text-slate-700 dark:text-white">
                                  <BarChart3 className="w-5 h-5 text-blue-600"/> {t('time_schedule')}
                              </h3>
                              <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                  <span>{t('start_date')}: {formatDate(selectedProject.startDate)}</span>
                                  <span>{t('end_date')}: {formatDate(selectedProject.endDate)}</span>
                              </div>
                          </div>
                          
                          <div className="relative border-t dark:border-slate-800 pt-10" dir="ltr">
                              {/* Grid Lines & Date Markers */}
                              <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex justify-between text-[10px] text-gray-400 font-mono">
                                   {(() => {
                                       const s = new Date(selectedProject.startDate).getTime();
                                       const e = selectedProject.endDate ? new Date(selectedProject.endDate).getTime() : s + (30*24*60*60*1000);
                                       const duration = e - s;
                                       return [0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                                           <div key={i} className="h-full border-l border-dashed border-gray-200 dark:border-slate-800 relative" style={{ left: i === 0 ? 0 : 'auto' }}>
                                               <span className="absolute -top-6 -left-6 w-12 text-center whitespace-nowrap">{formatDate(new Date(s + duration * pct).toISOString())}</span>
                                           </div>
                                       ));
                                   })()}
                              </div>

                              {/* Items */}
                              <div className="space-y-4 relative z-10 min-h-[100px]">
                                  {selectedProject.items.map((item, idx) => {
                                      const projectStart = new Date(selectedProject.startDate).getTime();
                                      const projectEnd = selectedProject.endDate ? new Date(selectedProject.endDate).getTime() : new Date().getTime() + (30*24*60*60*1000);
                                      const totalDuration = projectEnd - projectStart;
                                      
                                      let left = 0;
                                      let width = 0;

                                      if (item.startDate && totalDuration > 0) {
                                          const itemStart = new Date(item.startDate).getTime();
                                          const diff = itemStart - projectStart;
                                          left = (diff / totalDuration) * 100;
                                          
                                          const durationMs = item.durationDays * 24 * 60 * 60 * 1000;
                                          width = (durationMs / totalDuration) * 100;
                                      }

                                      return (
                                          <div key={idx} className="flex items-center gap-4 group hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 rounded-lg transition-colors">
                                              <div className="w-32 text-xs font-bold text-slate-700 dark:text-slate-300 truncate text-end" title={item.description}>
                                                  {item.description}
                                              </div>
                                              <div className="flex-1 relative h-7 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                  {width > 0 ? (
                                                      <div 
                                                          className="absolute top-0 bottom-0 bg-blue-500 rounded-full shadow-sm flex items-center px-2 transition-all duration-500 group-hover:bg-blue-600 cursor-help"
                                                          style={{ left: `${Math.max(0, left)}%`, width: `${Math.min(100, width)}%` }}
                                                          title={`${item.description} (${item.durationDays} days) - Start: ${formatDate(item.startDate || '')}`}
                                                      >
                                                          {width > 10 && <span className="text-[9px] text-white font-bold truncate mx-auto drop-shadow-md">{item.durationDays}d</span>}
                                                      </div>
                                                  ) : (
                                                      <span className="text-[8px] text-gray-300 w-full text-center block pt-1.5 opacity-50">Not Scheduled</span>
                                                  )}
                                              </div>
                                          </div>
                                      );
                                  })}
                                  {selectedProject.items.length === 0 && <p className="text-center text-gray-400 text-xs italic py-4">No work items defined.</p>}
                              </div>
                          </div>
                      </div>

                      {/* Payments Table */}
                      <div className="mb-8">
                          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Coins className="w-5 h-5 text-yellow-500"/> {t('payment_schedule')}</h3>
                          <div className="border rounded-lg overflow-x-auto">
                              <table className="w-full text-sm text-start min-w-[600px]">
                                  <thead className="bg-slate-50">
                                      <tr>
                                          <th className="p-3 text-start">{t('payment_name')}</th>
                                          <th className="p-3 text-start">{t('due_date')}</th>
                                          <th className="p-3 text-start">{t('amount')}</th>
                                          <th className="p-3 text-start">{t('status')}</th>
                                          <th className="p-3 text-center">{t('actions')}</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y">
                                      {selectedProject.payments?.map(pay => (
                                          <tr key={pay.id}>
                                              <td className="p-3">{pay.name}</td>
                                              <td className="p-3">{formatDate(pay.dueDate)}</td>
                                              <td className="p-3 font-bold">{pay.amount.toLocaleString()}</td>
                                              <td className="p-3">
                                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                      pay.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                                                      pay.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                  }`}>
                                                      {pay.status}
                                                  </span>
                                              </td>
                                              <td className="p-3 text-center">
                                                  {pay.status !== 'PAID' && (
                                                      <button 
                                                          onClick={() => confirmPayment(selectedProject, pay.id)}
                                                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 flex items-center gap-1 mx-auto"
                                                      >
                                                          <CheckCircle2 className="w-3 h-3"/> Confirm
                                                      </button>
                                                  )}
                                                  {pay.status === 'PAID' && pay.confirmedBy && (
                                                      <span className="text-[10px] text-gray-400">By: {pay.confirmedBy}</span>
                                          )}
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
              )}

              {activeProjectTab === 'FINANCIALS' && (
                  <div className="animate-fade-in">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <div className="bg-slate-50 p-6 rounded-2xl border">
                              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t('budget_amount')} (التقديرية)</h3>
                              <p className="text-2xl font-black text-slate-800">{estimatedCost.toLocaleString()} <span className="text-xs">SAR</span></p>
                              <div className="mt-4 pt-4 border-t flex justify-between text-xs font-bold">
                                  <span className="text-slate-500">{t('remaining_budget')}</span>
                                  <span className={remainingBudget < 0 ? 'text-red-500' : 'text-green-500'}>{remainingBudget.toLocaleString()}</span>
                              </div>
                          </div>

                          <div className="bg-white p-6 rounded-2xl border-2 border-red-50">
                              <h3 className="text-xs font-black text-red-400 uppercase tracking-widest mb-2">التكلفة الفعلية (Direct + Custody)</h3>
                              <p className="text-2xl font-black text-red-600">{totalActualCost.toLocaleString()} <span className="text-xs">SAR</span></p>
                              <div className="mt-4 pt-4 border-t flex justify-between text-xs font-bold">
                                  <span className="text-slate-500">مباشرة: {directExpenses.toLocaleString()}</span>
                                  <span className="text-slate-500">عهد: {custodyExpenses.toLocaleString()}</span>
                              </div>
                          </div>

                          <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                              <h3 className="text-xs font-black text-green-600 uppercase tracking-widest mb-2">الربح المتوقع (الهامش)</h3>
                              <p className="text-2xl font-black text-green-700">{profitMargin.toLocaleString()} <span className="text-xs">SAR</span></p>
                              <div className="mt-4 pt-4 border-t flex justify-between text-xs font-bold">
                                  <span className="text-green-800">قيمة العقد: {selectedProject.contractValue.toLocaleString()}</span>
                              </div>
                          </div>
                      </div>

                      <div className="bg-white rounded-xl border overflow-hidden">
                          <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                              <h3 className="font-bold text-sm text-slate-700">سجل المصروفات (Expenses Log)</h3>
                              <span className="text-xs bg-slate-200 px-2 py-1 rounded font-bold text-slate-600">شامل العهد والمصروفات المباشرة</span>
                          </div>
                          <table className="w-full text-sm">
                              <thead className="bg-slate-100 text-slate-500 text-xs uppercase">
                                  <tr>
                                      <th className="p-3 text-start">التاريخ</th>
                                      <th className="p-3 text-start">البيان / الوصف</th>
                                      <th className="p-3 text-start">النوع</th>
                                      <th className="p-3 text-end">المبلغ</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y">
                                  {/* Combine and Sort Expenses */}
                                  {[
                                      ...paymentOrders.filter(p => p.projectId === selectedProject.id && p.status === 'APPROVED').map(p => ({
                                          id: p.id, date: p.date, desc: p.description || `Payment Order to ${p.recipient}`, type: 'DIRECT', amount: p.amount
                                      })),
                                      ...custody.flatMap(c => c.transactions || []).filter(t => t.projectId === selectedProject.id).map(t => ({
                                          id: t.id, date: t.date, desc: t.description || 'Custody Expense', type: 'CUSTODY', amount: t.amount
                                      }))
                                  ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50">
                                          <td className="p-3">{formatDate(item.date)}</td>
                                          <td className="p-3 font-bold text-slate-700">{item.desc}</td>
                                          <td className="p-3">
                                              <span className={`text-[10px] px-2 py-1 rounded font-black ${item.type === 'DIRECT' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                  {item.type === 'DIRECT' ? 'صرف مباشر' : 'عهدة'}
                                              </span>
                                          </td>
                                          <td className="p-3 text-end font-mono font-bold">{item.amount.toLocaleString()}</td>
                                      </tr>
                                  ))}
                                  {(directExpenses + custodyExpenses) === 0 && (
                                      <tr><td colSpan={4} className="p-8 text-center text-gray-400">لا توجد مصروفات مسجلة لهذا المشروع حتى الآن.</td></tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {activeProjectTab === 'DOCUMENTS' && (
                  <div className="animate-fade-in">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500"/> {t('project_documents')}</h3>
                      </div>
                      
                      <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 mb-8">
                          <div className="flex gap-4 items-end">
                              <div className="flex-1">
                                  <label className="block text-xs font-bold text-gray-500 mb-1">{t('document_name')}</label>
                                  <input 
                                    className="w-full p-2 rounded border"
                                    value={docName}
                                    onChange={e => setDocName(e.target.value)}
                                  />
                              </div>
                              <div className="w-1/4">
                                  <label className="block text-xs font-bold text-gray-500 mb-1">{t('doc_category')}</label>
                                  <select 
                                    className="w-full p-2 rounded border bg-white text-sm"
                                    value={docCategory}
                                    onChange={e => setDocCategory(e.target.value as DocumentCategory)}
                                  >
                                      {docCategories.map(cat => <option key={cat} value={cat}>{t(`cat_${cat}`)}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="flex items-center gap-2 cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                                      <Upload className="w-4 h-4"/> {t('upload_document')}
                                      <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleProjectDocUpload} />
                                  </label>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-8">
                          {docCategories.map(category => {
                              const docs = groupedDocs[category] || [];
                              // Only show category if it has docs
                              if (docs.length === 0) return null;

                              let icon = <File className="w-5 h-5"/>;
                              let title = t(`cat_${category}`);
                              let color = "text-gray-600";
                              let bg = "bg-gray-50";

                              if (category === 'CONTRACT') { icon = <PenTool className="w-5 h-5"/>; color = "text-purple-600"; bg = "bg-purple-50"; }
                              if (['PLAN', 'ARCHITECTURAL', 'STRUCTURAL', 'MECHANICAL', 'ELECTRICAL'].includes(category)) { icon = <LayoutTemplate className="w-5 h-5"/>; color = "text-blue-600"; bg = "bg-blue-50"; }
                              if (category === 'LETTER') { icon = <StickyNote className="w-5 h-5"/>; color = "text-yellow-600"; bg = "bg-yellow-50"; }
                              if (['INTERIOR', 'EXTERIOR'].includes(category)) { icon = <Paintbrush className="w-5 h-5"/>; color = "text-pink-600"; bg = "bg-pink-50"; }

                              return (
                                  <div key={category}>
                                      <h4 className={`font-bold text-sm mb-4 flex items-center gap-2 ${color} uppercase tracking-wider`}>
                                          {icon} {title} ({docs.length})
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {docs.map(doc => (
                                              <div key={doc.id} className="bg-white border rounded-xl p-4 hover:shadow-md transition group flex flex-col justify-between h-full">
                                                  <div className="flex justify-between items-start mb-2">
                                                      <div className={`${bg} p-2 rounded-lg ${color}`}>
                                                          {doc.type === 'pdf' ? <FileText className="w-6 h-6"/> : <Camera className="w-6 h-6"/>}
                                                      </div>
                                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                          <a href={doc.url} target="_blank" rel="noreferrer" className="p-1.5 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded"><ExternalLink className="w-4 h-4"/></a>
                                                          <button onClick={() => handleDeleteProjectDoc(doc.id)} className="p-1.5 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded"><Trash2 className="w-4 h-4"/></button>
                                                      </div>
                                                  </div>
                                                  <div>
                                                      <h4 className="font-bold text-gray-800 truncate text-sm" title={doc.name}>{doc.name}</h4>
                                                      <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                                                          <span className="uppercase font-bold">{doc.type}</span>
                                                          <span>{formatDate(doc.date)}</span>
                                                      </div>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              );
                          })}
                          
                          {(!selectedProject.extraDocuments || selectedProject.extraDocuments.length === 0) && (
                              <div className="col-span-full text-center py-10 text-gray-400">
                                  {t('no_documents')}
                              </div>
                          )}
                      </div>
                  </div>
              )}

              {activeProjectTab === 'CORRESPONDENCE' && (
                  <div className="animate-fade-in">
                      {/* Correspondence List Logic (Kept mostly same, just checking layout) */}
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold text-lg flex items-center gap-2"><Mail className="w-5 h-5 text-yellow-500"/> {t('correspondence')}</h3>
                          <button 
                              onClick={() => setShowCorrForm(!showCorrForm)} 
                              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 text-sm"
                          >
                              <Plus className="w-4 h-4"/> {t('add')}
                          </button>
                      </div>

                      {/* Search */}
                      <div className="relative mb-6">
                          <Search className="absolute top-2.5 left-3 w-4 h-4 text-gray-400"/>
                          <input 
                              className={`w-full p-2 border rounded-lg text-sm ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} 
                              placeholder={t('search')} 
                              value={corrSearch} 
                              onChange={e => setCorrSearch(e.target.value)} 
                          />
                      </div>

                      {/* Add Form */}
                      {showCorrForm && (
                          <div className="bg-gray-50 p-4 rounded-xl border border-blue-100 mb-6 animate-slide-down">
                              <div className="flex justify-between mb-4">
                                  <h4 className="font-bold text-blue-800">{t('add_correspondence')}</h4>
                                  <button onClick={() => setShowCorrForm(false)}><X className="w-4 h-4 text-gray-400 hover:text-gray-600"/></button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div className="flex gap-2">
                                      <button 
                                          onClick={() => setNewCorr({...newCorr, type: 'INCOMING'})}
                                          className={`flex-1 py-1.5 rounded text-sm font-bold border ${newCorr.type === 'INCOMING' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-gray-200'}`}
                                      >
                                          {t('incoming')}
                                      </button>
                                      <button 
                                          onClick={() => setNewCorr({...newCorr, type: 'OUTGOING'})}
                                          className={`flex-1 py-1.5 rounded text-sm font-bold border ${newCorr.type === 'OUTGOING' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-200'}`}
                                      >
                                          {t('outgoing')}
                                      </button>
                                  </div>
                                  <input type="date" className="p-2 border rounded text-sm" value={newCorr.date} onChange={e => setNewCorr({...newCorr, date: e.target.value})} />
                                  <input className="p-2 border rounded text-sm md:col-span-2" placeholder={t('subject')} value={newCorr.subject || ''} onChange={e => setNewCorr({...newCorr, subject: e.target.value})} />
                                  <input className="p-2 border rounded text-sm md:col-span-2" placeholder={newCorr.type === 'INCOMING' ? t('sender') : t('recipient_to')} value={newCorr.senderOrRecipient || ''} onChange={e => setNewCorr({...newCorr, senderOrRecipient: e.target.value})} />
                                  <textarea className="p-2 border rounded text-sm md:col-span-2 h-20 resize-none" placeholder={t('content')} value={newCorr.content || ''} onChange={e => setNewCorr({...newCorr, content: e.target.value})}></textarea>
                                  
                                  <div className="md:col-span-2">
                                      <label className="flex items-center gap-2 cursor-pointer p-2 border border-dashed rounded bg-white hover:bg-gray-50 text-xs text-gray-500 justify-center">
                                          <Upload className="w-3 h-3"/> {t('click_to_upload')}
                                          <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleCorrFileUpload} />
                                      </label>
                                      {newCorr.attachments && newCorr.attachments.length > 0 && (
                                          <div className="flex gap-2 mt-2">
                                              {newCorr.attachments.map((url, i) => (
                                                  <div key={i} className="w-10 h-10 border rounded overflow-hidden">
                                                      <img src={url} className="w-full h-full object-cover"/>
                                                  </div>
                                              ))}
                                          </div>
                                      )}
                                  </div>
                              </div>
                              <button onClick={handleAddCorrespondence} className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 text-sm">{t('save')}</button>
                          </div>
                      )}

                      {/* List */}
                      <div className="space-y-3">
                          {projectCorrespondence.map(c => (
                              <div key={c.id} className="bg-white border rounded-lg p-3 hover:shadow-sm transition flex gap-3 items-start">
                                  <div className={`p-2 rounded-full mt-1 ${c.type === 'INCOMING' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                      {c.type === 'INCOMING' ? <ArrowDownLeft className="w-4 h-4"/> : <ArrowUpRight className="w-4 h-4"/>}
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex justify-between">
                                          <span className="font-bold text-slate-800 text-sm">{c.subject}</span>
                                          <span className="text-xs text-gray-400">{formatDate(c.date)}</span>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-0.5">{c.referenceNumber}</p>
                                      <p className="text-xs text-gray-600 mt-1">{c.type === 'INCOMING' ? t('sender') : t('recipient_to')}: {c.senderOrRecipient}</p>
                                      {c.attachments.length > 0 && (
                                          <div className="flex gap-1 mt-2">
                                              {c.attachments.map((_, i) => (
                                                  <div key={i} className="bg-gray-100 p-1 rounded text-gray-500">
                                                      <Paperclip className="w-3 h-3"/>
                                                  </div>
                                              ))}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                          {projectCorrespondence.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">No correspondence found for this project.</p>}
                      </div>
                  </div>
              )}
          </div>
      );
  }

  return (
    <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-slate-800 hidden md:block">{t('projects_management')}</h3>
            {!showProjectForm && (
                <button 
                    onClick={() => setShowProjectForm(true)} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-md w-full md:w-auto justify-center"
                >
                    <Plus className="w-4 h-4" /> {t('add_project')}
                </button>
            )}
        </div>

        {showProjectForm && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-8 animate-slide-down">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h4 className="font-bold text-blue-800">{t('add_project')}</h4>
                    <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X/></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('project_name')}</label>
                        <input className="w-full p-2 border rounded" value={newProject.name || ''} onChange={e => setNewProject({...newProject, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('client')}</label>
                        <select className="w-full p-2 border rounded" value={newProject.clientId || ''} onChange={e => setNewProject({...newProject, clientId: e.target.value})}>
                            <option value="">{t('select')}</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('contract_value')}</label>
                        <input 
                            type="number" 
                            className="w-full p-2 border rounded" 
                            value={newProject.contractValue ?? ''} 
                            onChange={e => setNewProject({...newProject, contractValue: e.target.value as any})} 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('start_date')}</label>
                        <input type="date" className="w-full p-2 border rounded" value={newProject.startDate || ''} onChange={e => setNewProject({...newProject, startDate: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('end_date')}</label>
                        <input type="date" className="w-full p-2 border rounded" value={newProject.endDate || ''} onChange={e => setNewProject({...newProject, endDate: e.target.value})} />
                    </div>
                </div>

                {/* Items & Payments Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Items */}
                    <div className="bg-slate-50 p-4 rounded-lg border">
                        <h5 className="font-bold text-sm mb-2">{t('work_items')}</h5>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            <input className="col-span-3 p-1 border rounded text-sm" placeholder="Description" value={newItem.description || ''} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                            <input type="number" className="p-1 border rounded text-sm" placeholder="Cost" value={newItem.estimatedCost ?? ''} onChange={e => setNewItem({...newItem, estimatedCost: e.target.value as any})} />
                            <input type="number" className="p-1 border rounded text-sm" placeholder="Days" value={newItem.durationDays ?? ''} onChange={e => setNewItem({...newItem, durationDays: e.target.value as any})} />
                            <input type="date" className="p-1 border rounded text-sm" placeholder="Start" value={newItem.startDate || ''} onChange={e => setNewItem({...newItem, startDate: e.target.value})} />
                        </div>
                        <button onClick={handleAddItem} className="bg-slate-800 text-white p-1 rounded w-full mb-2 flex justify-center"><Plus className="w-4 h-4"/></button>
                        
                        <ul className="space-y-1 max-h-32 overflow-y-auto">
                            {tempItems.map((item, idx) => (
                                <li key={idx} className="text-xs flex justify-between bg-white p-1 rounded border">
                                    <span>{item.description} ({item.durationDays}d)</span>
                                    <div className="flex gap-2">
                                        <span>{item.estimatedCost}</span>
                                        <button onClick={() => handleDeleteItem(idx)} className="text-red-500"><Trash2 className="w-3 h-3"/></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Payments */}
                    <div className="bg-slate-50 p-4 rounded-lg border">
                        <h5 className="font-bold text-sm mb-2">{t('payment_schedule')}</h5>
                        <div className="flex gap-2 mb-2">
                            <input className="flex-1 p-1 border rounded text-sm" placeholder="Title" value={newPayment.name || ''} onChange={e => setNewPayment({...newPayment, name: e.target.value})} />
                            <input type="number" className="w-20 p-1 border rounded text-sm" placeholder="Amt" value={newPayment.amount ?? ''} onChange={e => setNewPayment({...newPayment, amount: e.target.value as any})} />
                            <input type="date" className="w-24 p-1 border rounded text-sm" value={newPayment.dueDate || ''} onChange={e => setNewPayment({...newPayment, dueDate: e.target.value})} />
                            <button onClick={handleAddPayment} className="bg-slate-800 text-white p-1 rounded"><Plus className="w-4 h-4"/></button>
                        </div>
                        <ul className="space-y-1 max-h-32 overflow-y-auto">
                            {tempPayments.map((pay, idx) => (
                                <li key={idx} className="text-xs flex justify-between bg-white p-1 rounded border">
                                    <span>{pay.name} ({formatDate(pay.dueDate)})</span>
                                    <div className="flex gap-2">
                                        <span>{pay.amount}</span>
                                        <button onClick={() => handleDeletePayment(idx)} className="text-red-500"><Trash2 className="w-3 h-3"/></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Documents Upload Section */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                    <h5 className="font-bold text-sm mb-3 flex items-center gap-2 text-blue-800"><FileText className="w-4 h-4"/> {t('project_documents')}</h5>
                    <div className="flex gap-2 mb-3">
                        <input 
                            className="flex-1 p-2 border rounded text-sm" 
                            placeholder={t('document_name')}
                            value={tempDocName}
                            onChange={(e) => setTempDocName(e.target.value)}
                        />
                        <select 
                            className="w-1/3 p-2 border rounded text-sm bg-white"
                            value={tempDocCategory}
                            onChange={(e) => setTempDocCategory(e.target.value as DocumentCategory)}
                        >
                            {docCategories.map(cat => <option key={cat} value={cat}>{t(`cat_${cat}`)}</option>)}
                        </select>
                        <label className="flex items-center gap-2 cursor-pointer bg-blue-600 text-white px-3 py-2 rounded text-sm font-bold hover:bg-blue-700 transition">
                            <Upload className="w-4 h-4"/>
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleTempDocUpload} />
                        </label>
                    </div>
                    {newProjectDocs.length > 0 && (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {newProjectDocs.map((doc) => (
                                <div key={doc.id} className="flex justify-between items-center bg-white p-2 rounded border text-xs">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-500"/>
                                        <span className="font-bold">{doc.name}</span>
                                        <span className="text-gray-500">({t(`cat_${doc.category}`)})</span>
                                    </div>
                                    <button onClick={() => handleDeleteTempDoc(doc.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3"/></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                    <button onClick={resetForm} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded transition">{t('cancel')}</button>
                    <button onClick={handleSaveProject} className="bg-blue-600 text-white px-8 py-2 rounded font-bold hover:bg-blue-700 shadow-md transition">{t('save')}</button>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.map(project => {
                const client = clients.find(c => c.id === project.clientId);
                return (
                    <div key={project.id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition group relative">
                        <div className="absolute top-4 left-4 flex gap-2">
                            <button onClick={() => setSelectedProject(project)} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100" title={t('view_file')}><Eye className="w-4 h-4"/></button>
                            <button onClick={() => onDeleteProject(project.id)} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100" title={t('delete')}><Trash2 className="w-4 h-4"/></button>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-2">
                            <div>
                                <h4 className="font-bold text-lg text-gray-800">{project.name}</h4>
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full mt-1 inline-block">{client?.name || 'Unknown Client'}</span>
                            </div>
                            <div className="text-start md:text-right">
                                <span className="font-bold text-gray-700">{project.contractValue.toLocaleString()}</span>
                                <p className="text-xs text-gray-400">{t('contract_value')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4 border-t pt-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4 text-gray-400"/>
                                <span>{formatDate(project.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ListChecks className="w-4 h-4 text-gray-400"/>
                                <span>{project.items.length} {t('items_count')}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
            {projects.length === 0 && !showProjectForm && (
                <div className="col-span-full text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">
                    <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                    <p>{t('active_projects')}: 0</p>
                </div>
            )}
        </div>
    </div>
  );
};
