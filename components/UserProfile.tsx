
import React, { useState } from 'react';
import { CurrentUser, Employee, Company, CompanyId } from '../types';
import { Camera, Lock, User, Mail, Briefcase, Bell, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  currentUser: CurrentUser;
  employees: Employee[];
  companies: Company[];
  onUpdateProfile: (updates: Partial<Employee>) => void;
  onUpdatePassword: (oldPass: string, newPass: string) => boolean;
}

export const UserProfile: React.FC<Props> = ({ currentUser, employees, companies, onUpdateProfile, onUpdatePassword }) => {
  const { t } = useLanguage();
  
  // Find full employee data to get things like phone, email which might not be in CurrentUser
  const employeeData = employees.find(e => e.id === currentUser.id);
  const company = companies.find(c => c.id === currentUser.companyId);

  // Password State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      onUpdateProfile({ personalPhoto: url });
    }
  };

  const handleChangePassword = () => {
    setPassMessage(null);
    if (newPass !== confirmPass) {
        setPassMessage({ type: 'error', text: t('password_mismatch') });
        return;
    }
    const success = onUpdatePassword(currentPass, newPass);
    if (success) {
        setPassMessage({ type: 'success', text: t('password_changed') });
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
    } else {
        setPassMessage({ type: 'error', text: t('incorrect_current_password') });
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      {/* Header / Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-10"></div>
         
         {/* Avatar */}
         <div className="relative group">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-3xl font-bold text-slate-300">{currentUser.name.charAt(0)}</span>
                )}
            </div>
            <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition border group-hover:scale-110">
                <Camera className="w-4 h-4 text-blue-600" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
         </div>

         <div className="text-center md:text-start z-10">
             <h2 className="text-xl font-bold text-slate-800">{currentUser.name}</h2>
             <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                 <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-semibold">{currentUser.role}</span>
                 {company && (
                     <span className={`px-3 py-1 bg-${company.color}-50 text-${company.color}-700 rounded-full text-[10px] font-semibold flex items-center gap-1`}>
                         <Building2 className="w-3 h-3"/> {company.name}
                     </span>
                 )}
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Details Column */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-slate-700">
                  <User className="w-5 h-5"/> {t('personal_data')}
              </h3>
              <div className="space-y-4">
                  <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold">{t('username')}</label>
                      <div className="p-3 bg-gray-50 rounded border mt-1 font-mono text-[11px] text-gray-700">{currentUser.username}</div>
                  </div>
                  <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold">{t('email')}</label>
                      <div className="p-3 bg-gray-50 rounded border mt-1 text-[11px] text-gray-700 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400"/> {employeeData?.email || '-'}
                      </div>
                  </div>
                  <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold">{t('phone_number')}</label>
                      <div className="p-3 bg-gray-50 rounded border mt-1 text-[11px] text-gray-700">{employeeData?.phone || '-'}</div>
                  </div>
                  <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold">{t('assigned_company')}</label>
                      <div className="p-3 bg-gray-50 rounded border mt-1 text-[11px] text-gray-700">{company?.fullName || '-'}</div>
                  </div>
              </div>
          </div>

          {/* Password & Notifications Column */}
          <div className="space-y-6">
              {/* Password Change */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-slate-700">
                      <Lock className="w-5 h-5"/> {t('change_password')}
                  </h3>
                  
                  {passMessage && (
                      <div className={`p-3 rounded mb-4 text-[10px] flex items-center gap-2 ${passMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {passMessage.type === 'success' ? <CheckCircle className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
                          {passMessage.text}
                      </div>
                  )}

                  <div className="space-y-3 text-xs">
                      <div>
                          <label className="font-medium text-gray-700">{t('current_password')}</label>
                          <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} className="w-full p-2 border rounded mt-1" />
                      </div>
                      <div>
                          <label className="font-medium text-gray-700">{t('new_password')}</label>
                          <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full p-2 border rounded mt-1" />
                      </div>
                      <div>
                          <label className="font-medium text-gray-700">{t('confirm_password')}</label>
                          <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="w-full p-2 border rounded mt-1" />
                      </div>
                      <button 
                        onClick={handleChangePassword}
                        disabled={!currentPass || !newPass || !confirmPass}
                        className="w-full bg-slate-800 text-white py-2 rounded font-bold hover:bg-slate-700 disabled:opacity-50 transition text-xs"
                      >
                          {t('save')}
                      </button>
                  </div>
              </div>

              {/* Recent Notifications */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-slate-700">
                      <Bell className="w-5 h-5"/> {t('recent_notifications')}
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                       {employeeData?.notifications?.map(note => (
                           <div key={note.id} className="bg-yellow-50 p-3 rounded border border-yellow-100 text-[10px]">
                               <p className="text-slate-800 font-medium">{note.message}</p>
                               <span className="text-[9px] text-slate-500 mt-1 block">{note.date}</span>
                           </div>
                       ))}
                       {(!employeeData?.notifications || employeeData.notifications.length === 0) && (
                           <p className="text-gray-400 text-center py-4 text-[10px]">{t('no_notifications')}</p>
                       )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
