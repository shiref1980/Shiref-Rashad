
import React, { useState, useEffect } from 'react';
import { Employee, CompanyId, UserRole } from '../types';
import { Users, UserPlus, Trash2, FileText, Lock, Image as ImageIcon, Briefcase, Mail, CreditCard, Shield, Edit, Save, X, Phone, Bell, CheckSquare, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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

export const EmployeeManager: React.FC<Props> = ({ companyId, employees, setEmployees, currentUserRole }) => {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notificationInputs, setNotificationInputs] = useState<{[key: string]: string}>({});
  
  const initialFormState: Partial<Employee> = {
    companyId: companyId,
    permissionRole: 'EMPLOYEE',
    permissions: ['VIEW_DASHBOARD', 'VIEW_PROJECTS', 'VIEW_REPORTS', 'ADD_REPORT'] // Default permissions
  };

  const [formData, setFormData] = useState<Partial<Employee>>(initialFormState);

  // Effect to auto-generate employee code when Company or Department changes
  useEffect(() => {
    if (!editingId && formData.companyId) {
        generateEmployeeCode();
    }
  }, [formData.companyId, formData.department]);

  const generateEmployeeCode = () => {
      let prefix = '';
      switch(formData.companyId) {
          case CompanyId.MMT: prefix = 'MMT'; break;
          case CompanyId.EB_DESIGN: prefix = 'DES'; break;
          case CompanyId.EB_CONCEPT: prefix = 'CON'; break;
          case CompanyId.EB_GROUP: prefix = 'HQ'; break;
          default: prefix = 'EMP';
      }

      const deptCode = formData.department ? formData.department.substring(0, 3).toUpperCase() : 'GEN';
      const randomNum = Math.floor(100 + Math.random() * 900);
      
      const newCode = `${prefix}-${deptCode}-${randomNum}`;
      setFormData(prev => ({ ...prev, employeeCode: newCode }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (emp: Employee) => {
    // Security check: Company Manager can only edit their own company employees
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
      // Robust Check: Company Managers can only edit permissions for their own company's employees
      if (currentUserRole === 'COMPANY_MANAGER' && formData.companyId !== companyId) {
          return; // Do nothing (UI should also be disabled)
      }

      const currentPerms = formData.permissions || [];
      if (currentPerms.includes(permKey)) {
          setFormData({ ...formData, permissions: currentPerms.filter(p => p !== permKey) });
      } else {
          setFormData({ ...formData, permissions: [...currentPerms, permKey] });
      }
  };

  // Helper to set role and permissions based on selected level
  const handleJobLevelChange = (level: string) => {
      let role = '';
      let permissionRole: UserRole = 'EMPLOYEE';
      let defaultPerms: string[] = ['VIEW_DASHBOARD', 'VIEW_PROJECTS', 'VIEW_REPORTS', 'ADD_REPORT'];

      switch(level) {
          case 'GROUP_MANAGER':
              role = 'مدير المجموعة';
              permissionRole = 'ADMIN';
              defaultPerms = AVAILABLE_PERMISSIONS_KEYS; // All permissions
              break;
          case 'COMPANY_MANAGER':
              role = 'مدير شركة';
              permissionRole = 'COMPANY_MANAGER';
              defaultPerms = AVAILABLE_PERMISSIONS_KEYS.filter(p => !p.includes('DELETE')); // Most permissions
              break;
          case 'DEPT_MANAGER':
              role = 'مدير قسم';
              permissionRole = 'EMPLOYEE';
              defaultPerms = ['VIEW_DASHBOARD', 'VIEW_PROJECTS', 'MANAGE_PROJECTS', 'VIEW_REPORTS', 'MANAGE_REPORTS', 'VIEW_EMPLOYEES'];
              break;
          case 'ENGINEER':
              role = 'مهندس';
              permissionRole = 'EMPLOYEE';
              defaultPerms = ['VIEW_DASHBOARD', 'VIEW_PROJECTS', 'VIEW_REPORTS', 'ADD_REPORT', 'PRINT_REPORT'];
              break;
          case 'EMPLOYEE':
              role = 'موظف';
              permissionRole = 'EMPLOYEE';
              defaultPerms = ['VIEW_DASHBOARD', 'VIEW_PROJECTS', 'VIEW_REPORTS', 'ADD_REPORT'];
              break;
          default:
              role = 'موظف';
      }

      setFormData(prev => ({
          ...prev,
          role,
          permissionRole,
          permissions: defaultPerms
      }));
  };

  const handleSaveEmployee = () => {
    if (formData.name && formData.employeeCode && formData.idNumber && formData.username && formData.password) {
      
      // Enforce company ID for non-admins to prevent tampering
      const finalCompanyId = currentUserRole === 'ADMIN' ? (formData.companyId || companyId) : companyId;

      if (editingId) {
        setEmployees(prev => prev.map(e => e.id === editingId ? { ...e, ...formData, companyId: finalCompanyId } as Employee : e));
      } else {
        const employee: Employee = {
          id: Date.now().toString(),
          companyId: finalCompanyId,
          name: formData.name!,
          employeeCode: formData.employeeCode!,
          idNumber: formData.idNumber!,
          phone: formData.phone || '',
          email: formData.email || '',
          role: formData.role || 'Employee',
          department: formData.department || 'General',
          salary: Number(formData.salary) || 0,
          loanBalance: 0,
          vacationBalance: 21,
          username: formData.username,
          password: formData.password,
          permissionRole: formData.permissionRole || 'EMPLOYEE',
          permissions: formData.permissions || [],
          personalPhoto: formData.personalPhoto,
          degreeDocument: formData.degreeDocument,
          contractDocument: formData.contractDocument,
          notifications: []
        };
        setEmployees(prev => [...prev, employee]);
      }
      
      resetForm();
    } else {
      alert(t('fill_basic_fields'));
    }
  };

  const handleDeleteEmployee = (id: string, name: string, empCompanyId: string) => {
    if (currentUserRole === 'COMPANY_MANAGER' && empCompanyId !== companyId) {
         alert("You do not have permission to delete employees from other companies.");
         return;
    }
    if (window.confirm(`${t('confirm_delete_employee')} "${name}"?`)) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleSendEmail = (email: string) => {
      if (email) {
          window.location.href = `mailto:${email}`;
      } else {
          alert('No email address provided for this employee.');
      }
  };

  const handleFileUpload = (field: keyof Employee, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setFormData(prev => ({ ...prev, [field]: url }));
    }
  };

  const handleNotificationInputChange = (id: string, value: string) => {
    setNotificationInputs(prev => ({...prev, [id]: value}));
  };

  const handleAddNotification = (id: string) => {
    const message = notificationInputs[id];
    if (message && message.trim()) {
        const newNotification = {
            id: Date.now().toString(),
            message: message,
            date: new Date().toISOString().split('T')[0],
            isRead: false
        };
        
        setEmployees(prev => prev.map(emp => {
            if (emp.id === id) {
                return {
                    ...emp,
                    notifications: [newNotification, ...(emp.notifications || [])]
                };
            }
            return emp;
        }));
        
        setNotificationInputs(prev => ({...prev, [id]: ''}));
    }
  };

  const handleDeleteNotification = (empId: string, notifId: string) => {
      setEmployees(prev => prev.map(emp => {
          if (emp.id === empId) {
              return {
                  ...emp,
                  notifications: emp.notifications?.filter(n => n.id !== notifId)
              };
          }
          return emp;
      }));
  };

  // Determine if current user can edit permissions for the currently selected form data
  const canEditPermissions = currentUserRole === 'ADMIN' || (currentUserRole === 'COMPANY_MANAGER' && formData.companyId === companyId);

  // Map role string to a selection value if editing
  const getCurrentLevelValue = () => {
      if (!formData.role) return '';
      if (formData.role.includes('مدير المجموعة')) return 'GROUP_MANAGER';
      if (formData.role.includes('مدير شركة')) return 'COMPANY_MANAGER';
      if (formData.role.includes('مدير قسم')) return 'DEPT_MANAGER';
      if (formData.role.includes('مهندس')) return 'ENGINEER';
      return 'EMPLOYEE';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
          <Users className="w-5 h-5" /> {t('manage_employees_permissions')}
        </h3>
        {!showForm && (
            <button 
            onClick={() => { resetForm(); setShowForm(true); }} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
            >
            <UserPlus className="w-4 h-4" /> {t('add_new_employee')}
            </button>
        )}
      </div>

      {showForm && (
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl mb-8 shadow-inner relative">
          <div className="absolute top-4 left-4">
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
          </div>
          <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">
            {editingId ? t('edit_employee') : t('register_employee')}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            {/* Basic Info */}
            <div className="space-y-3">
               <h5 className="text-xs font-bold text-blue-600 uppercase">{t('personal_data')}</h5>
               <div className="relative">
                 <Users className="w-4 h-4 absolute top-3 right-3 text-gray-400"/>
                 <input placeholder={t('full_name')} className="w-full p-2 pr-9 border rounded text-sm" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div className="relative">
                 <CreditCard className="w-4 h-4 absolute top-3 right-3 text-gray-400"/>
                 <input placeholder={t('id_residence')} className="w-full p-2 pr-9 border rounded text-sm" value={formData.idNumber || ''} onChange={e => setFormData({...formData, idNumber: e.target.value})} />
               </div>
               <div className="relative">
                 <Phone className="w-4 h-4 absolute top-3 right-3 text-gray-400"/>
                 <input placeholder={t('phone_number')} className="w-full p-2 pr-9 border rounded text-sm" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
               </div>
               <div className="relative">
                 <Mail className="w-4 h-4 absolute top-3 right-3 text-gray-400"/>
                 <input placeholder={t('email')} className="w-full p-2 pr-9 border rounded text-sm" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
               </div>
            </div>

            {/* Job Info */}
            <div className="space-y-3">
               <h5 className="text-xs font-bold text-blue-600 uppercase">{t('job_data')}</h5>
               
               {/* Company Selection for Admin */}
               {currentUserRole === 'ADMIN' && (
                   <select 
                       className="w-full p-2 border rounded text-sm bg-white"
                       value={formData.companyId}
                       onChange={e => setFormData({...formData, companyId: e.target.value})}
                   >
                       {Object.values(CompanyId).map(id => <option key={id} value={id}>{id}</option>)}
                   </select>
               )}

               {/* New Job Level Selection */}
               <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                   <label className="block text-xs font-bold text-yellow-800 mb-1">{t('job_level')}</label>
                   <select 
                       className="w-full p-2 border rounded text-sm bg-white font-bold"
                       value={getCurrentLevelValue()}
                       onChange={(e) => handleJobLevelChange(e.target.value)}
                   >
                       <option value="EMPLOYEE">{t('role_employee')}</option>
                       <option value="ENGINEER">{t('role_engineer')}</option>
                       <option value="DEPT_MANAGER">{t('role_dept_manager')}</option>
                       <option value="COMPANY_MANAGER">{t('role_company_manager')}</option>
                       {currentUserRole === 'ADMIN' && <option value="GROUP_MANAGER">{t('role_group_manager')}</option>}
                   </select>
               </div>

               <div className="grid grid-cols-2 gap-2">
                 <input placeholder={t('department')} className="w-full p-2 border rounded text-sm" value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} />
                 <input placeholder={t('job_title')} className="w-full p-2 border rounded text-sm" value={formData.role || ''} readOnly />
               </div>

               <div className="relative">
                 <Briefcase className="w-4 h-4 absolute top-3 right-3 text-gray-400"/>
                 <input placeholder={t('job_code')} className="w-full p-2 pr-9 border rounded text-sm bg-gray-100" value={formData.employeeCode || ''} readOnly />
               </div>

               <input type="number" placeholder={t('basic_salary')} className="w-full p-2 border rounded text-sm" value={formData.salary || ''} onChange={e => setFormData({...formData, salary: Number(e.target.value)})} />
               <div className="grid grid-cols-2 gap-2 mt-2">
                 <div className="relative">
                    <Shield className="w-4 h-4 absolute top-3 right-3 text-gray-400"/>
                    <input placeholder={t('username')} className="w-full p-2 pr-9 border rounded text-sm" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} />
                 </div>
                 <div className="relative">
                    <Lock className="w-4 h-4 absolute top-3 right-3 text-gray-400"/>
                    <input type="text" placeholder={t('password')} className="w-full p-2 pr-9 border rounded text-sm" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
                 </div>
               </div>
            </div>

            {/* Permissions */}
            <div className={`space-y-3 bg-white p-4 rounded border border-gray-200 ${!canEditPermissions ? 'opacity-60 pointer-events-none' : ''}`}>
               <div className="flex justify-between items-center">
                   <h5 className="text-xs font-bold text-blue-600 uppercase flex items-center gap-2"><CheckSquare className="w-4 h-4"/> {t('detailed_permissions')}</h5>
                   {!canEditPermissions && <span className="text-[10px] text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Read Only</span>}
               </div>
               
               <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                   {AVAILABLE_PERMISSIONS_KEYS.map(permKey => (
                       <label key={permKey} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-50 rounded">
                           <input 
                              type="checkbox" 
                              checked={formData.permissions?.includes(permKey)}
                              onChange={() => togglePermission(permKey)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                              disabled={!canEditPermissions}
                           />
                           <span className="text-xs text-gray-700">{t(`perm_${permKey}`)}</span>
                       </label>
                   ))}
               </div>
               
               <div className="mt-2 pt-2 border-t">
                 <label className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 hover:bg-gray-100 rounded border border-dashed text-xs">
                    <ImageIcon className="w-4 h-4 text-gray-500"/>
                    <span>{t('upload_photo')}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('personalPhoto', e)} />
                 </label>
               </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 border-t pt-4">
            <button onClick={handleSaveEmployee} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md transition flex items-center gap-2">
                <Save className="w-4 h-4" /> {editingId ? t('save_changes') : t('save_employee')}
            </button>
            <button onClick={resetForm} className="text-gray-500 px-4 py-2 hover:text-gray-700">{t('cancel')}</button>
          </div>
        </div>
      )}

      {/* Employees List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
             {t('no_employees')}
          </div>
        ) : (
          employees.map(emp => (
            <div key={emp.id} className="group relative bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 overflow-hidden">
               <div className={`absolute top-0 left-0 w-1 h-full ${
                   emp.role.includes('مدير المجموعة') || emp.permissionRole === 'ADMIN' ? 'bg-red-500' : 
                   emp.role.includes('مدير شركة') ? 'bg-purple-500' : 'bg-blue-500'
               }`}></div>
               
               <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden relative">
                        {emp.personalPhoto ? (
                          <img src={emp.personalPhoto} alt={emp.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-slate-400">{emp.name.charAt(0)}</span>
                        )}
                     </div>
                     <div>
                        <h4 className="font-bold text-slate-800">{emp.name}</h4>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{emp.role}</span>
                     </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                        onClick={() => handleSendEmail(emp.email)} 
                        className="text-gray-300 hover:text-green-500 transition-colors p-1"
                        title={t('send_email')}
                    >
                        <Mail className="w-4 h-4" />
                    </button>
                    {/* Check for permission to edit this specific employee */}
                    {(currentUserRole === 'ADMIN' || (currentUserRole === 'COMPANY_MANAGER' && emp.companyId === companyId)) && (
                        <button 
                            onClick={() => handleEditClick(emp)} 
                            className="text-gray-300 hover:text-blue-500 transition-colors p-1"
                            title={t('edit')}
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    {/* Prevent deleting yourself and enforce company check */}
                    {emp.username !== 'admin' && (currentUserRole === 'ADMIN' || (currentUserRole === 'COMPANY_MANAGER' && emp.companyId === companyId)) && (
                        <button 
                            onClick={() => handleDeleteEmployee(emp.id, emp.name, emp.companyId)} 
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            title={t('delete')}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                  </div>
               </div>

               <div className="space-y-2 text-sm text-gray-600 bg-slate-50 p-3 rounded-lg mb-3">
                  <div className="flex justify-between">
                     <span className="text-xs text-gray-400">{t('job_number')}:</span>
                     <span className="font-mono font-bold text-slate-700">{emp.employeeCode}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-xs text-gray-400">{t('department')}:</span>
                     <span className="font-bold text-slate-700">{emp.department}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs text-gray-400">{t('permissions_count')}:</span>
                     <span className="bg-gray-200 text-gray-700 text-[10px] px-2 rounded-full">{emp.permissions?.length || 0}</span>
                  </div>
               </div>

               {/* Notifications Section */}
               <div className="mt-4 border-t pt-3">
                   <h5 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><Bell className="w-3 h-3"/> {t('notifications_tasks')}</h5>
                   
                   <div className="space-y-2 max-h-32 overflow-y-auto mb-2 custom-scrollbar">
                       {emp.notifications?.map(note => (
                           <div key={note.id} className="bg-yellow-50 p-2 rounded border border-yellow-100 text-xs flex justify-between items-start">
                               <div>
                                   <p className="text-slate-700">{note.message}</p>
                                   <span className="text-[10px] text-slate-400">{note.date}</span>
                               </div>
                               <button onClick={() => handleDeleteNotification(emp.id, note.id)} className="text-red-300 hover:text-red-500"><X className="w-3 h-3"/></button>
                           </div>
                       ))}
                       {(!emp.notifications || emp.notifications.length === 0) && <p className="text-center text-[10px] text-gray-400">{t('no_notifications')}</p>}
                   </div>

                   <div className="flex gap-1">
                       <input 
                           className="flex-1 p-1.5 border rounded text-xs" 
                           placeholder={t('write_task')}
                           value={notificationInputs[emp.id] || ''}
                           onChange={(e) => handleNotificationInputChange(emp.id, e.target.value)}
                       />
                       <button onClick={() => handleAddNotification(emp.id)} className="bg-slate-800 text-white px-2 rounded text-xs hover:bg-slate-700">{t('send')}</button>
                   </div>
               </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};
