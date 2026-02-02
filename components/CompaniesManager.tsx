
import React, { useState } from 'react';
import { Company, CurrentUser, CompanyHRSettings } from '../types';
import { Plus, Trash2, Edit, Save, X, Building2, Hash, MapPin, Phone, Mail, Palette, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  currentUser: CurrentUser | null;
  setHrConfigs: React.Dispatch<React.SetStateAction<CompanyHRSettings[]>>;
}

export const CompaniesManager: React.FC<Props> = ({ companies, setCompanies, currentUser, setHrConfigs }) => {
  const { t, dir } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Company>>({
      color: 'blue'
  });

  const resetForm = () => {
    setFormData({ color: 'blue' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (company: Company) => {
    setFormData(company);
    setEditingId(company.id);
    setShowForm(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (companies.length <= 1) {
        alert("لا يمكن حذف آخر شركة في النظام.");
        return;
    }
    if (window.confirm(`هل أنت متأكد من حذف شركة "${name}"؟ سيؤدي ذلك لحذف الوصول لكافة بياناتها.`)) {
      setCompanies(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSave = () => {
    if (formData.name && formData.fullName) {
      if (editingId) {
        setCompanies(prev => prev.map(c => c.id === editingId ? { ...c, ...formData } as Company : c));
      } else {
        const newId = formData.name.toUpperCase().replace(/\s+/g, '_') + '_' + Date.now();
        const company: Company = {
            id: newId,
            name: formData.name,
            fullName: formData.fullName,
            description: formData.description || '',
            color: formData.color || 'blue',
            commercialRegister: formData.commercialRegister,
            taxNumber: formData.taxNumber,
            address: formData.address,
            phone: formData.phone,
            poBox: formData.poBox
        };
        setCompanies(prev => [...prev, company]);
        
        // Initialize Default HR Settings for the new company
        setHrConfigs(prev => [...prev, {
            companyId: newId,
            workStartTime: "08:00",
            workEndTime: "16:00",
            allowedDelayMinutes: 15,
            delayPenaltyAmount: 50,
            absencePenaltyRate: 1.0
        }]);
      }
      resetForm();
    } else {
      alert("يرجى إدخال اسم الشركة والاسم الرسمي الكامل.");
    }
  };

  const colors = ['blue', 'purple', 'orange', 'emerald', 'rose', 'slate', 'indigo', 'amber'];

  if (currentUser?.role !== 'ADMIN') {
      return <div className="p-20 text-center font-black text-red-500">عذراً، هذه الشاشة مخصصة لمدير المجموعة فقط.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in" dir={dir}>
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm">
        <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3"><Building2 className="w-8 h-8 text-amber-500"/> إدارة شركات المجموعة</h2>
            <p className="text-gray-500 text-xs mt-1 font-bold">إضافة وتعديل الكيانات القانونية والشركات التابعة</p>
        </div>
        <button onClick={() => {resetForm(); setShowForm(true);}} className="bg-amber-500 text-slate-950 px-6 py-3 rounded-2xl shadow-xl hover:bg-amber-400 transition flex items-center gap-2 font-black text-xs">
            <Plus className="w-5 h-5"/> إضافة شركة جديدة
        </button>
      </div>

      {showForm && (
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-2xl animate-slide-down relative">
              <button onClick={resetForm} className={`absolute top-8 ${dir === 'rtl' ? 'left-8' : 'right-8'} text-gray-400 hover:text-red-500 transition`}><X className="w-8 h-8"/></button>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-10 border-amber-500 rtl:border-r-8 rtl:pr-6 ltr:border-l-8 ltr:pl-6">{editingId ? 'تعديل بيانات الشركة' : 'تسجيل كيان جديد بالمجموعة'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المعلومات الأساسية</label>
                      <input placeholder="اسم الشركة المختصر (مثال: MMT)" className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-[10px] font-black focus:border-amber-500 outline-none transition" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                      <input placeholder="الاسم الرسمي الكامل للشركة" className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-[10px] font-black focus:border-amber-500 outline-none transition" value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                      <textarea placeholder="وصف نشاط الشركة..." className="w-full p-4 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-[10px] font-bold h-32 resize-none outline-none focus:border-amber-500 transition" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>

                  <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">البيانات القانونية والاتصال</label>
                      <div className="relative">
                          <Hash className="absolute top-4 right-4 w-5 h-5 text-gray-400"/>
                          <input placeholder="رقم السجل التجاري" className="w-full p-4 pr-12 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-[10px] font-black font-mono focus:border-amber-500 outline-none transition" value={formData.commercialRegister || ''} onChange={e => setFormData({...formData, commercialRegister: e.target.value})} />
                      </div>
                      <div className="relative">
                          <Palette className="absolute top-4 right-4 w-5 h-5 text-gray-400"/>
                          <input placeholder="الرقم الضريبي VAT" className="w-full p-4 pr-12 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-[10px] font-black font-mono focus:border-amber-500 outline-none transition" value={formData.taxNumber || ''} onChange={e => setFormData({...formData, taxNumber: e.target.value})} />
                      </div>
                      <div className="relative">
                          <Phone className="absolute top-4 right-4 w-5 h-5 text-gray-400"/>
                          <input placeholder="هاتف الشركة" className="w-full p-4 pr-12 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-[10px] font-black focus:border-amber-500 outline-none transition" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                      </div>
                      <div className="relative">
                          <MapPin className="absolute top-4 right-4 w-5 h-5 text-gray-400"/>
                          <input placeholder="العنوان الرئيسي" className="w-full p-4 pr-12 border-2 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl text-[10px] font-bold focus:border-amber-500 outline-none transition" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
                      </div>
                  </div>

                  <div className="space-y-6">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تخصيص الهوية البصرية</label>
                      <div className="grid grid-cols-4 gap-3">
                          {colors.map(c => (
                              <button 
                                key={c} 
                                onClick={() => setFormData({...formData, color: c})}
                                className={`h-12 rounded-xl border-4 transition-all ${formData.color === c ? 'border-amber-500 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'} bg-${c}-500`}
                              />
                          ))}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border-2 border-dashed dark:border-slate-700 text-center group cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition">
                          <Globe className="w-10 h-10 text-gray-300 mx-auto mb-2 group-hover:text-amber-500 transition-colors"/>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رفع شعار الشركة</p>
                      </div>
                  </div>
              </div>

              <div className="mt-12 pt-8 border-t dark:border-slate-800 flex justify-end gap-4">
                  <button onClick={resetForm} className="px-10 py-4 text-slate-500 font-black hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition text-xs">إلغاء</button>
                  <button onClick={handleSave} className="bg-amber-500 text-slate-950 px-16 py-4 rounded-2xl shadow-2xl shadow-amber-500/20 hover:bg-amber-600 transition-all font-black flex items-center gap-3 text-xs"><Save className="w-6 h-6"/> {editingId ? 'تحديث البيانات' : 'إضافة الشركة للنظام'}</button>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map(c => (
              <div key={c.id} className="bg-white dark:bg-slate-900 border-2 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-2 h-full bg-${c.color}-500`}></div>
                  <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-2xl bg-${c.color}-50 dark:bg-${c.color}-950/30 flex items-center justify-center font-black text-xl text-${c.color}-600 border-2 border-${c.color}-100 dark:border-${c.color}-900`}>
                          {c.name.charAt(0)}
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => handleEdit(c)} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm"><Edit className="w-4 h-4"/></button>
                          <button onClick={() => handleDelete(c.id, c.name)} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-red-600 hover:text-white transition shadow-sm"><Trash2 className="w-4 h-4"/></button>
                      </div>
                  </div>
                  
                  <h4 className="text-base font-black text-slate-800 dark:text-white mb-2 leading-tight">{c.fullName}</h4>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold mb-6 line-clamp-2">{c.description}</p>
                  
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                      <div className="flex justify-between items-center text-[10px] font-black text-gray-400">
                          <span className="uppercase tracking-widest">السجل التجاري</span>
                          <span className="text-slate-700 dark:text-slate-200 font-mono">{c.commercialRegister || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black text-gray-400">
                          <span className="uppercase tracking-widest">الرقم الضريبي</span>
                          <span className="text-slate-700 dark:text-slate-200 font-mono">{c.taxNumber || '-'}</span>
                      </div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};
