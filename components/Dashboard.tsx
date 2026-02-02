
import React, { useState } from 'react';
import { Company, Project, Employee, Client, CurrentUser, Correspondence, Expense } from '../types';
import { generateExecutiveSummary } from '../services/geminiService';
import { BrainCircuit, Loader2, Sparkles, Building2, Hash, FileText, Edit, MapPin, Phone, Inbox, LayoutGrid, Briefcase, DollarSign } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ProjectManager } from './ProjectManager';

interface DashboardProps {
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
  onEditCompany: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    company, projects, employees, currentUser, setProjects, setEmployees, clients, onDeleteProject,
    correspondence, setCorrespondence, expenses, onEditCompany
}) => {
  const { t } = useLanguage();
  const [summary, setSummary] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';

  const handleAIAnalysis = async () => {
    if (projects.length === 0) return;
    setLoadingAI(true);
    const result = await generateExecutiveSummary(company.fullName, projects);
    setSummary(result);
    setLoadingAI(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Active Company Luxury Header */}
      <div className={`bg-slate-900 text-white rounded-3xl shadow-xl border-r-8 border-amber-500 p-6 relative overflow-hidden group`}>
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500 opacity-5 rounded-full -ml-32 -mt-32 group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2.5 bg-amber-500 rounded-xl text-slate-950 shadow-lg shadow-amber-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg md:text-xl font-black tracking-tighter">{company.fullName}</h2>
                  {isAdmin && (
                      <button 
                        onClick={() => onEditCompany(company.id)}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 text-amber-500 rounded-lg transition flex items-center gap-2 text-[10px] font-bold"
                        title={t('edit_company_data')}
                      >
                        <Edit className="w-3 h-3" /> تعديل البيانات
                      </button>
                  )}
                </div>
                <p className="text-slate-400 font-bold mt-1 text-[10px] tracking-wide uppercase">{company.description}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4">
              {company.commercialRegister && (
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <Hash className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] font-black font-mono text-slate-200">{company.commercialRegister}</span>
                </div>
              )}
              {company.taxNumber && (
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <FileText className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] font-black font-mono text-slate-200">{company.taxNumber}</span>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleAIAnalysis}
            disabled={loadingAI || projects.length === 0}
            className="flex items-center gap-2 bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-black shadow-xl shadow-amber-500/20 hover:bg-amber-400 transition-all hover:-translate-y-1 disabled:opacity-50 text-xs"
          >
            {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {t('ai_analysis')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border dark:border-slate-800 flex justify-between items-center group overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                  <LayoutGrid className="w-24 h-24" />
              </div>
              <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{t('active_projects')}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{projects.length}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl text-blue-600">
                  <Briefcase className="w-6 h-6" />
              </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border dark:border-slate-800 flex justify-between items-center group overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-24 h-24" />
              </div>
              <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{t('total_contracts')}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{projects.reduce((a,b) => a + b.contractValue, 0).toLocaleString()} <span className="text-xs font-bold text-slate-400">SAR</span></p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-2xl text-amber-600">
                  <DollarSign className="w-6 h-6" />
              </div>
          </div>
      </div>

      {summary && (
          <div className="bg-amber-50 dark:bg-slate-800/50 border-2 border-amber-200 dark:border-slate-700 p-6 rounded-3xl shadow-inner relative overflow-hidden animate-slide-up">
              <h3 className="font-black text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-4 text-base">
                  <BrainCircuit className="w-5 h-5" /> AI STRATEGIC ANALYSIS
              </h3>
              <div className="prose prose-slate dark:prose-invert max-w-none text-xs text-slate-800 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-bold">
                  {summary}
              </div>
          </div>
      )}

      <div className="mt-8">
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-3 px-2">
              <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
              {t('projects_management')}
          </h3>
          <ProjectManager 
              company={company}
              projects={projects}
              setProjects={setProjects}
              employees={employees}
              setEmployees={setEmployees}
              clients={clients}
              onDeleteProject={onDeleteProject}
              currentUser={currentUser}
              correspondence={correspondence}
              setCorrespondence={setCorrespondence}
              expenses={expenses}
              custody={[]}
              paymentOrders={[]}
          />
      </div>
    </div>
  );
};
