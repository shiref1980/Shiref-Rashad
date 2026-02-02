
import React, { useState, useMemo } from 'react';
import { Employee, CompanyId, UserRole } from '../types';
import { Users, UserPlus, Trash2, FileText, Lock, Image as ImageIcon, Briefcase, Mail, CreditCard, Shield, Edit, Save, X, Phone, Bell, Calendar, Wallet, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useDate } from '../contexts/DateContext';

interface Props {
  companyId: CompanyId;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  currentUserRole?: UserRole;
}

// Definition of available permissions keys
const AVAILABLE_PERMISSIONS_KEYS = [
    'VIEW_DASHBOARD',
    'VIEW_CLIENTS',
    'MANAGE_CLIENTS',
    'SEND_EMAILS',
    'VIEW_PROJECTS',
    'MANAGE_PROJECTS',
    'DELETE_PROJECTS',
    'VIEW_REPORTS',
    'ADD_REPORT',
    'PRINT_REPORT',
    'SHARE_WHATSAPP',
    'MANAGE_REPORTS',
    'VIEW_FINANCE',
    'ADD_PAYMENT_ORDER',
    'MANAGE_FINANCE',
    'VIEW_EMPLOYEES',
    'MANAGE_EMPLOYEES',
    'VIEW_SALARIES',
    'MANAGE_CONTRACTS'
];

export const HRManager: React.FC<Props> = ({ companyId, employees, setEmployees, currentUserRole }) => {
  const { t, dir } = useLanguage();
  const { formatDate } = useDate();
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'PAYROLL' | 'DOCS'>('DIRECTORY');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormState: Partial<Employee> = {
    companyId: companyId,
    permissionRole: 'EMPLOYEE',
    salary: 0,
    loanBalance: 0,
    vacationBalance: 21,
    permissions: ['VIEW_DASHBOARD', 'VIEW_PROJECTS', 'VIEW_REPORTS', 'ADD_REPORT']
  };

  const [formData, setFormData] = useState<Partial<Employee>>(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (emp: Employee) => {
    if (currentUserRole === 'COMPANY_MANAGER' && emp.companyId !== companyId) {
        alert("You do not have permission to edit employees from other companies.");
        return;
    }
    setFormData(emp);
    setEditingId(emp.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePermission = (permKey: string) => {
      if (currentUserRole === 'COMPANY_MANAGER' && formData.companyId !== companyId) {
          return;
      }
      const currentPerms = formData.permissions || [];
      if (currentPerms.includes(permKey)) {
          setFormData({ ...formData, permissions: currentPerms.filter(p => p !== permKey) });
      } else {
          setFormData({ ...formData, permissions: [...currentPerms, permKey] });
      }
  };

  const handleJobLevelChange = (level: string) => {
      let role = '';
      let permissionRole: UserRole = 'EMPLOYEE';
      let defaultPerms: string[] = ['VIEW_DASHBOARD', 'VIEW_PROJECTS', 'VIEW_REPORTS', 'ADD_REPORT'];

      switch(level) {
          case 'GROUP_MANAGER':
              role = t('role_group_manager');
              permissionRole = 'ADMIN';
              defaultPerms = AVAILABLE_PERMISSIONS_KEYS; 
              break;
          case 'COMPANY_MANAGER':
              role = t('role_company_manager');
              permissionRole = 'COMPANY_MANAGER';
              defaultPerms = AVAILABLE_PERMISSIONS_KEYS.filter(p => !p.includes('DELETE')); 
              break;
          case 'DEPT_MANAGER':
              role = t('role_dept_manager');
              permissionRole = 'EMPLOYEE';
              defaultPerms = ['VIEW_DASHBOARD', 'VIEW_PROJECTS', 'MANAGE_PROJECTS', 'VIEW_REPORTS', 'MANAGE_REPORTS', 'VIEW_EMPLOYEES'];
              break;
          case 'ENGINEER':
              role = t('role_engineer');
              permissionRole = 'EMPLOYEE';
              defaultPerms = ['VIEW_DASHBOARD', 'VIEW_PROJECTS', 'VIEW_REPORTS', 'ADD_REPORT', 'PRINT_REPORT'];
              break;
          case 'SUPERVISOR':
              role = t('role_supervisor');
              permissionRole = 'EMPLOYEE';
              defaultPerms = ['VIEW_DASHBOARD', 'VIEW_PROJECTS', 'VIEW_REPORTS', 'ADD_REPORT'];
              break;
          case 'EMPLOYEE':
              role = t('role_employee');
              permissionRole = 'EMPLOYEE';
              defaultPerms = ['VIEW_DASHBOARD', 'VIEW_PROJECTS', 'VIEW_REPORTS', 'ADD_REPORT'];
              break;
          case 'TECHNICIAN':
              role = t('role_technician');
              permissionRole = 'EMPLOYEE';
              defaultPerms = ['VIEW_DASHBOARD', 'ADD_REPORT'];
              break;
          default:
              role = t('role_employee');
      }

      setFormData(prev => ({
          ...prev,
          role,
          permissionRole,
          permissions: defaultPerms
      }));
  };

  const handleSaveEmployee = () => {
    if (formData.name && formData.idNumber && formData.username) {
      if (editingId) {
        setEmployees(prev => prev.map(e => e.id === editingId ? { ...e, ...formData } as Employee : e));
      } else {
        const employee: Employee = {
          id: Date.now().toString(),
          employeeCode: `EMP-${Math.floor(Math.random() * 1000)}`,
          ...initialFormState,
          ...formData,
        } as Employee;
        setEmployees(prev => [...prev, employee]);
      }
      resetForm();
    } else {
      alert(t('fill_required'));
    }
  };

  const getExpiryStatus = (dateStr?: string) => {
    if (!dateStr) return 'bg-gray-100 text-gray-400';
    const today = new Date();
    const expiry = new Date(dateStr);
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'bg-red-100 text-red-600 border-red-200';
    if (diff < 30) return 'bg-orange-100 text-orange-600 border-orange-200';
    return 'bg-green-100 text-green-600 border-green-200';
  };

  // Helper to map current role to select value
  const getCurrentLevelValue = () => {
      const r = formData.role || '';
      if (r === t('role_group_manager')) return 'GROUP_MANAGER';
      if (r === t('role_company_manager')) return 'COMPANY_MANAGER';
      if (r === t('role_dept_manager')) return 'DEPT_MANAGER';
      if (r === t('role_engineer')) return 'ENGINEER';
      if (r === t('role_supervisor')) return 'SUPERVISOR';
      if (r === t('role_technician')) return 'TECHNICIAN';
      return 'EMPLOYEE';
  };

  const canEditPermissions = currentUserRole === 'ADMIN' || (currentUserRole === 'COMPANY_MANAGER' && formData.companyId === companyId);

  const renderDirectory = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" dir={dir}>
        {employees.filter(e => e.companyId === companyId).map(emp => (
            <div key={emp.id} className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-lg transition group">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border-2 border-white dark:border-slate-700 overflow-hidden shadow-sm flex items-center justify-center">
                        {emp.personalPhoto ? (
                            <img src={emp.personalPhoto} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-2xl font-black text-blue-300">{emp.name.charAt(0)}</div>
                        )}
                    </div>
                    <div>
                        <h4 className="font-black text-slate-800 dark:text-white text-lg leading-tight">{emp.name}</h4>
                        <p className="text-xs text-blue-600 font-bold mt-1">{emp.role} - {emp.department}</p>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400 font-bold">{t('job_code')}</span>
                        <span className="font-mono font-bold dark:text-slate-300">{emp.employeeCode}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400 font-bold">{t('id_residence')}</span>
                        <span className="font-bold dark:text-slate-300">{emp.idNumber}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t dark:border-slate-800 pt-4">
                    <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-bold mb-1">{t('salary')}</p>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200">{emp.salary.toLocaleString()}</p>
                    </div>
                    <div className="text-center border-x dark:border-slate-800">
                        <p className="text-[10px] text-gray-400 font-bold mb-1">{t('loan_balance')}</p>
                        <p className={`text-xs font-black ${emp.loanBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>{emp.loanBalance.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-bold mb-1">{t('vacation_balance')}</p>
                        <p className="text-xs font-black text-blue-600">{emp.vacationBalance} {t('days')}</p>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <button onClick={() => handleEditClick(emp)} className="flex-1 bg-slate-100 dark:bg-slate-800 dark:text-white p-2 rounded-xl hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-2 text-xs font-bold"><Edit className="w-3 h-3"/> {t('edit')}</button>
                    <button className="bg-slate-100 dark:bg-slate-800 text-gray-400 p-2 rounded-xl hover:bg-red-500 hover:text-white transition"><Trash2 className="w-3 h-3"/></button>
                </div>
            </div>
        ))}
    </div>
  );

  const renderDocsExpiry = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 overflow-hidden animate-fade-in" dir={dir}>
        <table className="w-full text-start">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <tr>
                    <th className={`p-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t('full_name')}</th>
                    <th className="p-4 text-center">{t('id_expiry')}</th>
                    <th className="p-4 text-center">{t('insurance_expiry')}</th>
                    <th className="p-4 text-center">{t('contract_expiry')}</th>
                    <th className="p-4 text-center">{t('status')}</th>
                </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800 text-sm">
                {employees.filter(e => e.companyId === companyId).map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-4">
                            <p className="font-bold text-slate-800 dark:text-white">{emp.name}</p>
                            <p className="text-[10px] text-gray-400">{emp.employeeCode}</p>
                        </td>
                        <td className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getExpiryStatus(emp.idExpiryDate)}`}>
                                {emp.idExpiryDate ? formatDate(emp.idExpiryDate) : '-'}
                            </span>
                        </td>
                        <td className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getExpiryStatus(emp.insuranceExpiryDate)}`}>
                                {emp.insuranceExpiryDate ? formatDate(emp.insuranceExpiryDate) : '-'}
                            </span>
                        </td>
                        <td className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getExpiryStatus(emp.contractExpiryDate)}`}>
                                {emp.contractExpiryDate ? formatDate(emp.contractExpiryDate) : '-'}
                            </span>
                        </td>
                        <td className="p-4 text-center">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm">
        <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3"><Users className="w-8 h-8 text-blue-600"/> {t('hr_management')}</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{t('login_subtitle')}</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => {resetForm(); setShowForm(true);}} className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-xl hover:bg-blue-700 transition flex items-center gap-2 font-black text-sm"><UserPlus className="w-4 h-4"/> {t('add_new_employee')}</button>
        </div>
      </div>

      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border dark:border-slate-800 w-fit">
          <button onClick={() => setActiveTab('DIRECTORY')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'DIRECTORY' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{t('employee_directory')}</button>
          <button onClick={() => setActiveTab('PAYROLL')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'PAYROLL' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{t('loans')}</button>
          <button onClick={() => setActiveTab('DOCS')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'DOCS' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{t('employee_docs')}</button>
      </div>

      {showForm && (
          <div className="bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-slate-800 p-8 rounded-3xl shadow-2xl animate-slide-down relative">
              <button onClick={resetForm} className={`absolute top-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} text-gray-400 hover:text-red-500 transition`}><X className="w-6 h-6"/></button>
              <h3 className={`text-xl font-black text-slate-800 dark:text-white mb-8 border-blue-600 ${dir === 'rtl' ? 'border-r-4 pr-4' : 'border-l-4 pl-4'}`}>{editingId ? t('edit_employee') : t('register_employee')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b pb-2">{t('personal_data')}</h4>
                      <input placeholder={t('full_name')} className="w-full p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm font-bold" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                      <input placeholder={t('id_residence')} className="w-full p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm font-bold font-mono" value={formData.idNumber || ''} onChange={e => setFormData({...formData, idNumber: e.target.value})} />
                      <div>
                        <label className="text-[10px] font-black text-gray-400 mb-1 block">{t('id_expiry')}</label>
                        <input type="date" className="w-full p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm font-bold" value={formData.idExpiryDate || ''} onChange={e => setFormData({...formData, idExpiryDate: e.target.value})} />
                      </div>
                      <input placeholder={t('phone_number')} className="w-full p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm font-bold" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>

                  <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b pb-2">{t('job_data')}</h4>
                      
                      {/* New Job Level Selection */}
                      <div className="bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
                           <label className="block text-[10px] font-bold text-yellow-800 dark:text-yellow-500 mb-1">{t('job_level')}</label>
                           <select 
                               className="w-full p-2 border-none bg-transparent font-bold text-sm outline-none dark:text-white"
                               value={getCurrentLevelValue()}
                               onChange={(e) => handleJobLevelChange(e.target.value)}
                           >
                               <option value="EMPLOYEE">{t('role_employee')}</option>
                               <option value="TECHNICIAN">{t('role_technician')}</option>
                               <option value="SUPERVISOR">{t('role_supervisor')}</option>
                               <option value="ENGINEER">{t('role_engineer')}</option>
                               <option value="DEPT_MANAGER">{t('role_dept_manager')}</option>
                               <option value="COMPANY_MANAGER">{t('role_company_manager')}</option>
                               {currentUserRole === 'ADMIN' && <option value="GROUP_MANAGER">{t('role_group_manager')}</option>}
                           </select>
                       </div>

                      <input placeholder={t('job_title')} className="w-full p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm font-bold" value={formData.role || ''} readOnly />
                      <input placeholder={t('department')} className="w-full p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm font-bold" value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                           <label className="text-[10px] font-black text-gray-400 mb-1 block">{t('basic_salary')}</label>
                           <input type="number" className="w-full p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm font-black text-blue-600" value={formData.salary || ''} onChange={e => setFormData({...formData, salary: Number(e.target.value)})} />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-gray-400 mb-1 block">{t('loan_balance')}</label>
                           <input type="number" className="w-full p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm font-black text-red-600" value={formData.loanBalance || ''} onChange={e => setFormData({...formData, loanBalance: Number(e.target.value)})} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 mb-1 block">{t('contract_expiry')}</label>
                        <input type="date" className="w-full p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm font-bold" value={formData.contractExpiryDate || ''} onChange={e => setFormData({...formData, contractExpiryDate: e.target.value})} />
                      </div>
                  </div>

                  <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b pb-2">{t('detailed_permissions')}</h4>
                      <input placeholder={t('username')} className="w-full p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm font-bold" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} />
                      <input type="password" placeholder={t('password')} className="w-full p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm font-bold" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
                      
                      <div className={`space-y-2 max-h-40 overflow-y-auto custom-scrollbar p-2 bg-slate-50 dark:bg-slate-800 rounded-xl ${!canEditPermissions ? 'opacity-50 pointer-events-none' : ''}`}>
                           {AVAILABLE_PERMISSIONS_KEYS.map(permKey => (
                               <label key={permKey} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition">
                                   <input 
                                      type="checkbox" 
                                      checked={formData.permissions?.includes(permKey)}
                                      onChange={() => togglePermission(permKey)}
                                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                   />
                                   <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{t(`perm_${permKey}`)}</span>
                               </label>
                           ))}
                      </div>

                      <div>
                         <label className="text-[10px] font-black text-gray-400 mb-1 block">{t('insurance_expiry')}</label>
                         <input type="date" className="w-full p-3 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm font-bold" value={formData.insuranceExpiryDate || ''} onChange={e => setFormData({...formData, insuranceExpiryDate: e.target.value})} />
                      </div>
                  </div>
              </div>

              <div className="mt-10 pt-6 border-t dark:border-slate-800 flex justify-end gap-3">
                  <button onClick={resetForm} className="px-8 py-3 text-gray-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition">{t('cancel')}</button>
                  <button onClick={handleSaveEmployee} className="bg-green-600 text-white px-12 py-3 rounded-2xl shadow-xl hover:bg-green-700 transition font-black flex items-center gap-2"><Save className="w-5 h-5"/> {t('save_employee')}</button>
              </div>
          </div>
      )}

      {activeTab === 'DIRECTORY' && renderDirectory()}
      {activeTab === 'DOCS' && renderDocsExpiry()}
      {activeTab === 'PAYROLL' && (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border dark:border-slate-800 text-gray-400">
              <Wallet className="w-16 h-16 mx-auto mb-4 opacity-20"/>
              <p className="font-bold text-lg">{t('payroll_system')}</p>
              <p className="text-sm">{t('payroll_msg')}</p>
          </div>
      )}
    </div>
  );
};
