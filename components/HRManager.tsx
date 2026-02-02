
import React, { useState, useMemo } from 'react';
import { Employee, CompanyId, UserRole, AttendanceRecord, CurrentUser, CompanyHRSettings } from '../types';
import { Users, UserPlus, Trash2, FileText, Lock, Image as ImageIcon, Briefcase, Mail, CreditCard, Shield, Edit, Save, X, Phone, Bell, Calendar, Wallet, TrendingDown, AlertTriangle, CheckCircle2, Clock, LogIn, LogOut, Coffee, BarChart3, Settings2, Timer, Award, UserCheck, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useDate } from '../contexts/DateContext';

interface Props {
  companyId: CompanyId;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  currentUserRole?: UserRole;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  currentUser: CurrentUser | null;
  hrConfigs: CompanyHRSettings[];
  setHrConfigs: React.Dispatch<React.SetStateAction<CompanyHRSettings[]>>;
}

const AVAILABLE_PERMISSIONS_KEYS = [
    'VIEW_DASHBOARD', 'VIEW_CLIENTS', 'MANAGE_CLIENTS', 'SEND_EMAILS', 'VIEW_PROJECTS', 'MANAGE_PROJECTS', 'DELETE_PROJECTS', 'VIEW_REPORTS', 'ADD_REPORT', 'PRINT_REPORT', 'SHARE_WHATSAPP', 'MANAGE_REPORTS', 'VIEW_FINANCE', 'ADD_PAYMENT_ORDER', 'MANAGE_FINANCE', 'VIEW_EMPLOYEES', 'MANAGE_EMPLOYEES', 'VIEW_SALARIES', 'MANAGE_CONTRACTS'
];

export const HRManager: React.FC<Props> = ({ companyId, employees, setEmployees, currentUserRole, attendance, setAttendance, currentUser, hrConfigs, setHrConfigs }) => {
  const { t, dir } = useLanguage();
  const { formatDate } = useDate();
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'ATTENDANCE' | 'PAYROLL' | 'DOCS' | 'SETTINGS'>('DIRECTORY');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const activeConfig = hrConfigs.find(c => c.companyId === companyId) || { companyId, workStartTime: "08:00", workEndTime: "16:00", allowedDelayMinutes: 15, delayPenaltyAmount: 50, absencePenaltyRate: 1.0 };

  const initialFormState: Partial<Employee> = {
    companyId: companyId,
    permissionRole: 'EMPLOYEE',
    salary: 0,
    loanBalance: 0,
    vacationBalance: 21,
    permissions: ['VIEW_DASHBOARD', 'VIEW_PROJECTS', 'VIEW_REPORTS', 'ADD_REPORT']
  };

  const [formData, setFormData] = useState<Partial<Employee>>(initialFormState);

  // منطق الحضور والانصراف لليوم
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find(a => a.employeeId === currentUser?.id && a.date === todayStr);

  const handleClockIn = () => {
    if (!currentUser) return;
    const now = new Date();
    
    // حساب التأخير بناءً على الإعدادات
    const [startH, startM] = activeConfig.workStartTime.split(':').map(Number);
    const limitTime = new Date();
    limitTime.setHours(startH, startM + activeConfig.allowedDelayMinutes, 0);
    
    const isLate = now > limitTime; 
    
    const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        employeeId: currentUser.id,
        date: todayStr,
        checkIn: now.toISOString(),
        status: isLate ? 'LATE' : 'PRESENT'
    };
    setAttendance([...attendance, newRecord]);
  };

  const handleClockOut = () => {
    if (!todayRecord) return;
    const now = new Date().toISOString();
    setAttendance(attendance.map(a => a.id === todayRecord.id ? { ...a, checkOut: now } : a));
  };

  const updateHrSettings = (field: keyof CompanyHRSettings, value: any) => {
      setHrConfigs(prev => {
          const exists = prev.find(c => c.companyId === companyId);
          if (exists) {
              return prev.map(c => c.companyId === companyId ? { ...c, [field]: value } : c);
          }
          return [...prev, { ...activeConfig, [field]: value }];
      });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (emp: Employee) => {
    if (currentUserRole === 'EMPLOYEE' && emp.id !== currentUser?.id) {
        alert("لا تملك صلاحية تعديل بيانات الموظفين الآخرين.");
        return;
    }
    setFormData(emp);
    setEditingId(emp.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePermission = (permKey: string) => {
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
          case 'ADMIN': 
              role = 'مدير المجموعة'; permissionRole = 'ADMIN'; defaultPerms = AVAILABLE_PERMISSIONS_KEYS; break;
          case 'COMPANY_MANAGER': 
              role = 'مدير شركة'; permissionRole = 'COMPANY_MANAGER'; defaultPerms = AVAILABLE_PERMISSIONS_KEYS.filter(p => !p.includes('DELETE')); break;
          case 'DEPT_MANAGER': 
              role = 'مدير إدارة / قسم'; permissionRole = 'DEPT_MANAGER'; defaultPerms = ['VIEW_DASHBOARD', 'VIEW_PROJECTS', 'MANAGE_PROJECTS', 'VIEW_REPORTS', 'MANAGE_REPORTS', 'VIEW_EMPLOYEES', 'VIEW_SALARIES']; break;
          case 'ENGINEER': 
              role = 'مهندس'; permissionRole = 'EMPLOYEE'; defaultPerms = ['VIEW_DASHBOARD', 'VIEW_PROJECTS', 'VIEW_REPORTS', 'ADD_REPORT', 'PRINT_REPORT']; break;
          case 'EMPLOYEE': 
              role = 'موظف'; permissionRole = 'EMPLOYEE'; break;
          default: role = 'موظف';
      }

      setFormData(prev => ({ ...prev, role, permissionRole, permissions: defaultPerms }));
  };

  const handleSaveEmployee = () => {
    if (formData.name && formData.idNumber && formData.username) {
      if (editingId) {
        setEmployees(prev => prev.map(e => e.id === editingId ? { ...e, ...formData } as Employee : e));
      } else {
        const employee: Employee = { 
          id: Date.now().toString(), 
          employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`, 
          ...initialFormState, 
          ...formData 
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
    const todayDate = new Date();
    const expiry = new Date(dateStr);
    const diff = Math.ceil((expiry.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'bg-red-100 text-red-600 border-red-200';
    if (diff < 30) return 'bg-orange-100 text-orange-600 border-orange-200';
    return 'bg-green-100 text-green-600 border-green-200';
  };

  const canEditManagement = currentUserRole === 'ADMIN';
  const canEditAnyEmployee = currentUserRole === 'ADMIN' || currentUserRole === 'COMPANY_MANAGER' || currentUserRole === 'DEPT_MANAGER';

  const renderAttendance = () => {
    const currentMonthRecords = attendance.filter(a => a.employeeId === currentUser?.id);
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Clock-in UI */}
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full -ml-20 -mt-20"></div>
                <div className="relative z-10 text-center">
                    <h3 className="text-4xl font-black mb-2">{new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</h3>
                    <p className="text-slate-400 font-bold mb-8 uppercase tracking-widest">{formatDate(new Date().toISOString())}</p>
                    
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                        {!todayRecord ? (
                            <button onClick={handleClockIn} className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-6 rounded-3xl font-black text-xl shadow-2xl shadow-blue-600/40 transition-all active:scale-95 flex items-center gap-3 group">
                                <LogIn className="w-8 h-8 group-hover:translate-x-1 transition-transform"/> {t('clock_in')}
                            </button>
                        ) : !todayRecord.checkOut ? (
                            <div className="flex flex-col gap-4">
                                <div className="bg-green-500/20 text-green-400 px-8 py-4 rounded-2xl border border-green-500/30 font-black text-lg">
                                    <CheckCircle2 className="w-6 h-6 inline-block ml-2 mb-1"/> تم تسجيل الحضور: {new Date(todayRecord.checkIn!).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <button onClick={handleClockOut} className="bg-red-600 hover:bg-red-500 text-white px-12 py-6 rounded-3xl font-black text-xl shadow-2xl shadow-red-600/40 transition-all active:scale-95 flex items-center gap-3 group">
                                    <LogOut className="w-8 h-8 group-hover:-translate-x-1 transition-transform"/> {t('clock_out')}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-slate-800 text-green-500 px-12 py-6 rounded-3xl font-black text-xl border border-slate-700 flex items-center gap-3 shadow-inner">
                                <CheckCircle2 className="w-8 h-8"/> تم اكتمال دوام اليوم بنجاح
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Attendance History */}
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h4 className="font-black text-slate-800 dark:text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-600"/> سجل الحضور الشخصي</h4>
                    <div className="flex gap-2">
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">{currentMonthRecords.filter(r => r.status === 'PRESENT').length} حضور</span>
                        <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold">{currentMonthRecords.filter(r => r.status === 'LATE').length} تأخير</span>
                    </div>
                </div>
                <table className="w-full text-start">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <tr>
                            <th className="p-4 text-start">{t('date')}</th>
                            <th className="p-4 text-center">{t('clock_in')}</th>
                            <th className="p-4 text-center">{t('clock_out')}</th>
                            <th className="p-4 text-center">{t('status')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-800 text-sm font-bold">
                        {currentMonthRecords.sort((a,b) => b.date.localeCompare(a.date)).map(rec => (
                            <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="p-4">{formatDate(rec.date)}</td>
                                <td className="p-4 text-center font-mono text-blue-600">{rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                <td className="p-4 text-center font-mono text-red-600">{rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                <td className="p-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        rec.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 
                                        rec.status === 'LATE' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {rec.status === 'PRESENT' ? 'حاضر' : rec.status === 'LATE' ? 'تأخير' : 'غائب'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {currentMonthRecords.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-gray-400">لا يوجد سجلات حضور لهذا الشهر</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  const renderPayroll = () => {
    return (
        <div className="space-y-6 animate-fade-in" dir={dir}>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-8 border-b dark:border-slate-800 pb-4">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3"><Wallet className="text-blue-600 w-6 h-6"/> {t('attendance_and_payroll')}</h3>
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-600">الشهر: {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {employees.filter(e => e.companyId === companyId).map(emp => {
                        const daysAttended = attendance.filter(a => a.employeeId === emp.id && (a.status === 'PRESENT' || a.status === 'LATE')).length;
                        const lateDays = attendance.filter(a => a.employeeId === emp.id && a.status === 'LATE').length;
                        
                        // حساب افتراضي: 22 يوم عمل شهرياً
                        const dailyRate = emp.salary / 22;
                        const delayPenalty = lateDays * activeConfig.delayPenaltyAmount;
                        const netSalary = (dailyRate * daysAttended) - delayPenalty;

                        return (
                            <div key={emp.id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border dark:border-slate-700 group hover:shadow-xl transition-all relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-slate-700 flex items-center justify-center font-black text-blue-600 shadow-sm">{emp.name.charAt(0)}</div>
                                    <div>
                                        <p className="font-black text-sm text-slate-800 dark:text-white">{emp.name}</p>
                                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{emp.role}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3 text-xs mb-8">
                                    <div className="flex justify-between text-gray-500 font-bold"><span>الأيام الفعلية:</span> <span className="text-slate-800 dark:text-slate-200">{daysAttended} / 22 يوم</span></div>
                                    <div className="flex justify-between text-gray-500 font-bold"><span>التأخيرات المسجلة:</span> <span className="text-orange-600">{lateDays} مرة</span></div>
                                    <div className="flex justify-between text-gray-400 border-t dark:border-slate-700 pt-3"><span>الراتب الأساسي:</span> <span>{emp.salary.toLocaleString()} SAR</span></div>
                                    <div className="flex justify-between text-red-500 font-black"><span>إجمالي الجزاءات:</span> <span>-{delayPenalty.toLocaleString()} SAR</span></div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-inner border dark:border-slate-700 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">صافي المستحق</p>
                                        <p className="text-2xl font-black text-green-600">{Math.max(0, Math.round(netSalary)).toLocaleString()} <span className="text-[10px]">SAR</span></p>
                                    </div>
                                    <CreditCard className="w-8 h-8 text-slate-100 dark:text-slate-800"/>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
  };

  // وظيفة عرض مستندات الموظفين ومدى صلاحيتها
  const renderDocsExpiry = () => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center mb-8 border-b dark:border-slate-800 pb-4">
            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3"><FileText className="text-amber-600 w-6 h-6"/> {t('employee_docs')}</h3>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> منتهي / Expired</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> قريباً / Soon</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> ساري / Active</div>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-start">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                        <th className="p-4 text-start">{t('full_name')}</th>
                        <th className="p-4 text-center">{t('id_expiry')}</th>
                        <th className="p-4 text-center">{t('insurance_expiry')}</th>
                        <th className="p-4 text-center">{t('contract_expiry')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800 text-sm font-bold">
                    {employees.filter(e => e.companyId === companyId).map(emp => (
                        <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-4">
                                <div className="text-slate-800 dark:text-slate-200">{emp.name}</div>
                                <div className="text-[10px] text-gray-400 font-mono">{emp.employeeCode}</div>
                            </td>
                            <td className="p-4 text-center">
                                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black border ${getExpiryStatus(emp.idExpiryDate)}`}>
                                    {emp.idExpiryDate ? formatDate(emp.idExpiryDate) : t('none')}
                                </div>
                            </td>
                            <td className="p-4 text-center">
                                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black border ${getExpiryStatus(emp.insuranceExpiryDate)}`}>
                                    {emp.insuranceExpiryDate ? formatDate(emp.insuranceExpiryDate) : t('none')}
                                </div>
                            </td>
                            <td className="p-4 text-center">
                                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black border ${getExpiryStatus(emp.contractExpiryDate)}`}>
                                    {emp.contractExpiryDate ? formatDate(emp.contractExpiryDate) : t('none')}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {employees.filter(e => e.companyId === companyId).length === 0 && (
                        <tr><td colSpan={4} className="p-10 text-center text-gray-400">{t('no_employees')}</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderSettings = () => (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm animate-fade-in">
          <div className="flex items-center gap-4 mb-10 border-b dark:border-slate-800 pb-6">
              <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/20"><Settings2 className="w-8 h-8"/></div>
              <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white">سياسات الدوام والخصومات</h3>
                  <p className="text-slate-500 text-sm font-bold">ضبط المواعيد الرسمية وقواعد الجزاءات لشركة {activeConfig.companyId}</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
              <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600"/> موعد بداية الدوام</label>
                  <input 
                      type="time" 
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 dark:border-slate-700 rounded-2xl font-black text-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      value={activeConfig.workStartTime}
                      onChange={(e) => updateHrSettings('workStartTime', e.target.value)}
                  />
              </div>

              <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><LogOut className="w-4 h-4 text-red-600"/> موعد نهاية الدوام</label>
                  <input 
                      type="time" 
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 dark:border-slate-700 rounded-2xl font-black text-xl focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                      value={activeConfig.workEndTime}
                      onChange={(e) => updateHrSettings('workEndTime', e.target.value)}
                  />
              </div>

              <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Timer className="w-4 h-4 text-orange-600"/> فترة السماح (دقائق)</label>
                  <div className="relative">
                      <input 
                          type="number" 
                          className={`w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 dark:border-slate-700 rounded-2xl font-black text-xl focus:ring-4 focus:ring-orange-500/10 transition-all outline-none ${dir === 'rtl' ? 'pr-12' : 'pl-12'}`}
                          value={activeConfig.allowedDelayMinutes}
                          onChange={(e) => updateHrSettings('allowedDelayMinutes', Number(e.target.value))}
                      />
                      <div className={`absolute top-4 ${dir === 'rtl' ? 'right-4' : 'left-4'} font-black text-slate-400 text-sm`}>MIN</div>
                  </div>
              </div>

              <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><TrendingDown className="w-4 h-4 text-rose-600"/> غرامة التأخير الواحد (SAR)</label>
                  <input 
                      type="number" 
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 dark:border-slate-700 rounded-2xl font-black text-xl focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
                      value={activeConfig.delayPenaltyAmount}
                      onChange={(e) => updateHrSettings('delayPenaltyAmount', Number(e.target.value))}
                  />
              </div>
          </div>

          <div className="p-8 bg-yellow-50 dark:bg-yellow-900/10 rounded-[2rem] border-2 border-yellow-200 dark:border-yellow-900/30 flex items-start gap-5 shadow-inner">
              <AlertTriangle className="w-10 h-10 text-yellow-600 flex-shrink-0 animate-pulse"/>
              <div className="space-y-2">
                  <h4 className="font-black text-yellow-800 dark:text-yellow-500 text-lg">ملاحظة هامة للنظام</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-600 font-bold leading-relaxed">
                      يتم احتساب الحالة "متأخر" تلقائياً إذا سجل الموظف حضوره بعد الساعة ({activeConfig.workStartTime}) مضافاً إليها ({activeConfig.allowedDelayMinutes}) دقيقة سماح. 
                      سيتم خصم مبلغ ({activeConfig.delayPenaltyAmount} SAR) عن كل عملية تأخير من الراتب الشهري عند إصدار المسير.
                  </p>
              </div>
          </div>
      </div>
  );

  const renderDirectory = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" dir={dir}>
        {employees.filter(e => e.companyId === companyId).map(emp => (
            <div key={emp.id} className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 opacity-10 rounded-full ${
                    emp.permissionRole === 'ADMIN' ? 'bg-red-500' : emp.permissionRole === 'COMPANY_MANAGER' ? 'bg-amber-500' : 'bg-blue-500'
                }`}></div>
                
                <div className="flex items-center gap-5 mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border-4 border-white dark:border-slate-700 overflow-hidden shadow-lg flex items-center justify-center relative">
                        {emp.personalPhoto ? (
                            <img src={emp.personalPhoto} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-3xl font-black text-blue-300">{emp.name.charAt(0)}</div>
                        )}
                        {emp.permissionRole === 'ADMIN' && <div className="absolute -top-1 -right-1 bg-red-600 text-white p-1 rounded-md shadow-md"><Award className="w-3 h-3"/></div>}
                        {emp.permissionRole === 'COMPANY_MANAGER' && <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-1 rounded-md shadow-md"><Star className="w-3 h-3"/></div>}
                    </div>
                    <div>
                        <h4 className="font-black text-slate-800 dark:text-white text-lg leading-tight">{emp.name}</h4>
                        <p className="text-xs text-blue-600 font-black mt-1 uppercase tracking-tighter">{emp.role}</p>
                    </div>
                </div>

                <div className="space-y-2 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl shadow-inner">
                    <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-400 uppercase tracking-widest">{t('job_code')}</span>
                        <span className="font-mono dark:text-slate-300">{emp.employeeCode}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-400 uppercase tracking-widest">رقم الهوية</span>
                        <span className="dark:text-slate-300">{emp.idNumber}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t dark:border-slate-800 pt-5">
                    <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-black mb-1 uppercase">الراتب</p>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200">{emp.salary.toLocaleString()}</p>
                    </div>
                    <div className="text-center border-x dark:border-slate-800">
                        <p className="text-[10px] text-gray-400 font-black mb-1 uppercase">السلف</p>
                        <p className={`text-xs font-black ${emp.loanBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>{emp.loanBalance.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-black mb-1 uppercase">الإجازات</p>
                        <p className="text-xs font-black text-blue-600">{emp.vacationBalance} ي</p>
                    </div>
                </div>

                <div className="mt-6 flex gap-2">
                    <button onClick={() => handleEditClick(emp)} className="flex-1 bg-slate-100 dark:bg-slate-800 dark:text-white py-3 rounded-xl hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-2 text-xs font-black shadow-sm group-hover:shadow-lg"><Edit className="w-4 h-4"/> تعديل</button>
                    <button 
                        onClick={() => window.open(`https://wa.me/${emp.phone?.replace(/\s+/g, '')}`, '_blank')}
                        className="bg-green-100 text-green-600 p-3 rounded-xl hover:bg-green-600 hover:text-white transition shadow-sm"
                        title="WhatsApp"
                    >
                        <Phone className="w-4 h-4"/>
                    </button>
                    <button 
                        onClick={() => window.location.href = `mailto:${emp.email}`}
                        className="bg-blue-100 text-blue-600 p-3 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm"
                        title="Email"
                    >
                        <Mail className="w-4 h-4"/>
                    </button>
                    {canEditAnyEmployee && emp.id !== currentUser?.id && (
                        <button className="bg-slate-100 dark:bg-slate-800 text-gray-400 p-3 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"><Trash2 className="w-4 h-4"/></button>
                    )}
                </div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm">
        <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3"><Users className="w-8 h-8 text-blue-600"/> {t('hr_management')}</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 font-bold">إدارة الهيكل التنظيمي، الحضور، والرواتب</p>
        </div>
        <div className="flex gap-2">
            {canEditAnyEmployee && (
                <button onClick={() => {resetForm(); setShowForm(true);}} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl shadow-xl hover:bg-blue-700 transition flex items-center gap-2 font-black text-sm"><UserPlus className="w-5 h-5"/> إضافة كادر جديد</button>
            )}
        </div>
      </div>

      <div className="flex flex-wrap bg-white dark:bg-slate-900 p-1.5 rounded-2xl border dark:border-slate-800 w-fit gap-1 shadow-sm">
          <button onClick={() => setActiveTab('DIRECTORY')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'DIRECTORY' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>دليل الموظفين</button>
          <button onClick={() => setActiveTab('ATTENDANCE')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'ATTENDANCE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>لوحة الحضور</button>
          {canEditAnyEmployee && (
            <button onClick={() => setActiveTab('PAYROLL')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'PAYROLL' ? 'bg-teal-600 text-white shadow-lg' : 'text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>الرواتب والمسيرات</button>
          )}
          <button onClick={() => setActiveTab('DOCS')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'DOCS' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>الوثائق والمستندات</button>
          {(currentUserRole === 'ADMIN' || currentUserRole === 'COMPANY_MANAGER') && (
              <button onClick={() => setActiveTab('SETTINGS')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'SETTINGS' ? 'bg-slate-800 text-white shadow-lg' : 'text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>إعدادات الدوام</button>
          )}
      </div>

      {showForm && (
          <div className="bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-slate-800 p-8 rounded-[3rem] shadow-2xl animate-slide-down relative">
              <button onClick={resetForm} className={`absolute top-8 ${dir === 'rtl' ? 'left-8' : 'right-8'} text-gray-400 hover:text-red-500 transition`}><X className="w-8 h-8"/></button>
              <h3 className={`text-2xl font-black text-slate-800 dark:text-white mb-10 border-blue-600 ${dir === 'rtl' ? 'border-r-8 pr-6' : 'border-l-8 pl-6'}`}>{editingId ? 'تعديل بيانات الكادر' : 'تسجيل كادر جديد بالنظام'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b dark:border-slate-800 pb-3">1. البيانات التعريفية</h4>
                      <div className="space-y-4">
                        <input placeholder="الاسم الرباعي" className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-sm font-black focus:border-blue-500 outline-none transition" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                        <input placeholder="رقم الهوية / الإقامة" className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-sm font-black font-mono focus:border-blue-500 outline-none transition" value={formData.idNumber || ''} onChange={e => setFormData({...formData, idNumber: e.target.value})} />
                        <div>
                            <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">تاريخ انتهاء الهوية</label>
                            <input type="date" className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-sm font-black focus:border-blue-500 outline-none transition" value={formData.idExpiryDate || ''} onChange={e => setFormData({...formData, idExpiryDate: e.target.value})} />
                        </div>
                        <input placeholder="رقم الجوال" className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-sm font-black focus:border-blue-500 outline-none transition" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        <input placeholder="البريد الإلكتروني" className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-sm font-black focus:border-blue-500 outline-none transition" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                      </div>
                  </div>

                  <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b dark:border-slate-800 pb-3">2. التوصيف الوظيفي والصلاحيات</h4>
                      
                      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border-2 border-blue-100 dark:border-blue-900/30">
                           <label className="block text-[10px] font-black text-blue-800 dark:text-blue-500 mb-2 uppercase tracking-widest">المستوى الإداري</label>
                           <select className="w-full p-2 border-none bg-transparent font-black text-sm outline-none dark:text-white cursor-pointer" value={formData.permissionRole || 'EMPLOYEE'} onChange={(e) => handleJobLevelChange(e.target.value)}>
                               <option value="EMPLOYEE">{t('role_employee')}</option>
                               <option value="ENGINEER">{t('role_engineer')}</option>
                               <option value="DEPT_MANAGER">مدير إدارة / قسم</option>
                               <option value="COMPANY_MANAGER">مدير شركة</option>
                               {canEditManagement && <option value="ADMIN">مدير المجموعة (Admin)</option>}
                           </select>
                       </div>

                      <div className="space-y-4">
                        <input placeholder="المسمى الوظيفي" className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-sm font-black focus:border-blue-500 outline-none transition" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} />
                        <input placeholder="القسم / الإدارة" className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-sm font-black focus:border-blue-500 outline-none transition" value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 mb-2 block">الراتب الأساسي</label>
                                <input type="number" className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-sm font-black text-blue-600 focus:border-blue-500 outline-none transition" value={formData.salary || ''} onChange={e => setFormData({...formData, salary: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 mb-2 block">رصيد الإجازات</label>
                                <input type="number" className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-sm font-black focus:border-blue-500 outline-none transition" value={formData.vacationBalance || 21} onChange={e => setFormData({...formData, vacationBalance: Number(e.target.value)})} />
                            </div>
                        </div>
                      </div>
                  </div>

                  <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b dark:border-slate-800 pb-3">3. الحساب والوصول</h4>
                      <div className="space-y-4">
                        <input placeholder="اسم المستخدم" className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-sm font-black focus:border-blue-500 outline-none transition" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} />
                        <input type="password" placeholder="كلمة المرور" className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-sm font-black focus:border-blue-500 outline-none transition" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
                        
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border-2 dark:border-slate-700">
                            <h5 className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">تخصيص الصلاحيات الفردية</h5>
                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                {AVAILABLE_PERMISSIONS_KEYS.map(permKey => (
                                    <label key={permKey} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition group">
                                        <input type="checkbox" checked={formData.permissions?.includes(permKey)} onChange={() => togglePermission(permKey)} className="w-5 h-5 rounded-md text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                        <span className="text-[10px] font-black text-slate-600 dark:text-gray-300 group-hover:text-blue-600 transition-colors uppercase">{t(`perm_${permKey}`)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        
                        <label className="flex items-center gap-4 p-4 border-2 border-dashed dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition">
                           <ImageIcon className="w-8 h-8 text-blue-400"/>
                           <div className="text-start">
                              <p className="text-xs font-black text-slate-800 dark:text-white">الصورة الشخصية</p>
                              <p className="text-[10px] text-slate-400">تظهر في دليل الموظفين</p>
                           </div>
                           <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                             if(e.target.files?.[0]) {
                               const url = URL.createObjectURL(e.target.files[0]);
                               setFormData({...formData, personalPhoto: url});
                             }
                           }} />
                        </label>
                      </div>
                  </div>
              </div>

              <div className="mt-12 pt-8 border-t dark:border-slate-800 flex justify-end gap-4">
                  <button onClick={resetForm} className="px-10 py-4 text-slate-500 font-black hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition">إلغاء الأمر</button>
                  <button onClick={handleSaveEmployee} className="bg-green-600 text-white px-16 py-4 rounded-2xl shadow-2xl shadow-green-600/20 hover:bg-green-700 hover:-translate-y-1 transition-all font-black flex items-center gap-3"><Save className="w-6 h-6"/> إتمام الحفظ</button>
              </div>
          </div>
      )}

      {activeTab === 'DIRECTORY' && renderDirectory()}
      {activeTab === 'ATTENDANCE' && renderAttendance()}
      {activeTab === 'PAYROLL' && renderPayroll()}
      {activeTab === 'DOCS' && renderDocsExpiry()}
      {activeTab === 'SETTINGS' && renderSettings()}
    </div>
  );
};
