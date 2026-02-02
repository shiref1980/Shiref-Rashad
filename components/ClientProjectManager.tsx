
import React, { useState } from 'react';
import { Client, Project, ProjectType, CompanyId, DocumentItem } from '../types';
import { Plus, Image as ImageIcon, Trash2, Edit, X, Save, Mail, Coins, Wallet, FileText, ExternalLink, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  companyId: CompanyId;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  isReadOnly?: boolean;
}

export const ClientProjectManager: React.FC<Props> = ({ 
  clients, setClients, projects, isReadOnly = false
}) => {
  const { t } = useLanguage();
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newClient, setNewClient] = useState<Partial<Client>>({ projectType: ProjectType.RESIDENTIAL, documents: [] });
  
  // Doc State
  const [docName, setDocName] = useState('');

  const resetForm = () => {
    setNewClient({ projectType: ProjectType.RESIDENTIAL, documents: [] });
    setEditingId(null);
    setShowClientForm(false);
    setDocName('');
  };

  const handleSaveClient = () => {
    if (newClient.name && newClient.phone) {
      if (editingId) {
        setClients(prev => prev.map(c => c.id === editingId ? { ...c, ...newClient } as Client : c));
      } else {
        const client: Client = {
            id: Date.now().toString(),
            name: newClient.name!,
            phone: newClient.phone!,
            email: newClient.email || '',
            nationalId: newClient.nationalId || '',
            licenseNumber: newClient.licenseNumber || '',
            projectType: newClient.projectType || ProjectType.RESIDENTIAL,
            idImage: newClient.idImage,
            licenseImage: newClient.licenseImage,
            documents: newClient.documents || []
        };
        setClients(prev => [...prev, client]);
      }
      resetForm();
    } else {
        alert(t('fill_client_name_phone'));
    }
  };

  const handleEditClick = (client: Client) => {
    setNewClient(client);
    setEditingId(client.id);
    setShowClientForm(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (window.confirm(`${t('confirm_delete_client')} "${name}"?`)) {
        setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSendEmail = (email: string) => {
      if (email) {
          window.location.href = `mailto:${email}`;
      } else {
          alert('No email address provided for this client.');
      }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && docName) {
          const file = e.target.files[0];
          const url = URL.createObjectURL(file);
          const type = file.type.includes('pdf') ? 'pdf' : 'image';
          
          const newDoc: DocumentItem = {
              id: Date.now().toString(),
              name: docName,
              url,
              type,
              date: new Date().toISOString().split('T')[0]
          };

          setNewClient(prev => ({
              ...prev,
              documents: [...(prev.documents || []), newDoc]
          }));
          setDocName('');
      } else {
          alert("Please enter a document name first");
      }
  };

  const handleDeleteDoc = (docId: string) => {
      setNewClient(prev => ({
          ...prev,
          documents: prev.documents?.filter(d => d.id !== docId)
      }));
  };

  const getClientFinancials = (clientId: string) => {
      const clientProjects = projects.filter(p => p.clientId === clientId);
      const totalContracts = clientProjects.reduce((sum, p) => sum + p.contractValue, 0);
      const collected = clientProjects.reduce((sum, p) => {
          const paidPayments = p.payments?.filter(pay => pay.status === 'PAID') || [];
          return sum + paidPayments.reduce((pSum, pay) => pSum + pay.amount, 0);
      }, 0);
      const remaining = totalContracts - collected;
      const progress = totalContracts > 0 ? Math.round((collected / totalContracts) * 100) : 0;

      return { totalContracts, collected, remaining, progress };
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 animate-fade-in border dark:border-slate-800">
       <div>
           <div className="flex justify-between mb-4">
             <h3 className="font-bold text-lg dark:text-white">{t('client_list')}</h3>
             {!showClientForm && !isReadOnly && (
                <button 
                    onClick={() => { resetForm(); setShowClientForm(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all"
                >
                    <Plus className="w-4 h-4" /> {t('add_new_client')}
                </button>
             )}
           </div>

           {showClientForm && (
             <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg border dark:border-slate-700 mb-6 relative animate-slide-down">
                <button onClick={resetForm} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"><X className="w-5 h-5"/></button>
                <h4 className="font-bold text-gray-700 dark:text-slate-200 mb-4">{editingId ? t('edit_client_data') : t('add_new_client')}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder={t('client_name')} className="p-2 border dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white rounded" value={newClient.name || ''} onChange={e => setNewClient({...newClient, name: e.target.value})} />
                    <input placeholder={t('phone_number')} className="p-2 border dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white rounded" value={newClient.phone || ''} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
                    <input placeholder={t('email')} className="p-2 border dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white rounded" value={newClient.email || ''} onChange={e => setNewClient({...newClient, email: e.target.value})} />
                    <input placeholder={t('national_id')} className="p-2 border dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white rounded" value={newClient.nationalId || ''} onChange={e => setNewClient({...newClient, nationalId: e.target.value})} />
                    <input placeholder={t('license_number')} className="p-2 border dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white rounded" value={newClient.licenseNumber || ''} onChange={e => setNewClient({...newClient, licenseNumber: e.target.value})} />
                    
                    <select 
                        className="p-2 border dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white rounded"
                        value={newClient.projectType}
                        onChange={e => setNewClient({...newClient, projectType: e.target.value as ProjectType})}
                    >
                    {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                    <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-900 border dark:border-slate-600 p-2 rounded w-full hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <ImageIcon className="w-4 h-4" /> {t('id_image')}
                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setNewClient({...newClient, idImage: e.target.files?.[0]})} />
                    </label>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                    <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-900 border dark:border-slate-600 p-2 rounded w-full hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <ImageIcon className="w-4 h-4" /> {t('license_image')}
                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setNewClient({...newClient, licenseImage: e.target.files?.[0]})} />
                    </label>
                    </div>
                </div>
                
                {/* Documents Section */}
                <div className="mt-6 border-t pt-4">
                    <h5 className="font-bold text-sm mb-2">{t('client_documents')}</h5>
                    <div className="flex gap-2 mb-4">
                        <input 
                            placeholder={t('document_name')} 
                            className="flex-1 p-2 border dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white rounded text-sm"
                            value={docName}
                            onChange={(e) => setDocName(e.target.value)}
                        />
                         <label className="flex items-center gap-2 cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition">
                            <Plus className="w-4 h-4" /> {t('upload_document')}
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleDocUpload} />
                        </label>
                    </div>
                    
                    <div className="space-y-2">
                        {newClient.documents?.map(doc => (
                            <div key={doc.id} className="flex justify-between items-center bg-white dark:bg-slate-900 p-2 rounded border dark:border-slate-600">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-500"/>
                                    <span className="text-sm dark:text-white">{doc.name}</span>
                                    <span className="text-xs text-gray-400">({doc.type}) - {doc.date}</span>
                                </div>
                                <div className="flex gap-2">
                                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600"><ExternalLink className="w-4 h-4"/></a>
                                    <button onClick={() => handleDeleteDoc(doc.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ))}
                        {(!newClient.documents || newClient.documents.length === 0) && (
                            <p className="text-sm text-gray-400 italic text-center py-2">{t('no_documents')}</p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button onClick={handleSaveClient} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 flex items-center justify-center gap-2 shadow-md">
                      <Save className="w-4 h-4"/> {editingId ? t('save_changes') : t('save_client')}
                  </button>
                  <button onClick={resetForm} className="px-4 py-2 border dark:border-slate-600 rounded text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">{t('cancel')}</button>
                </div>
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.length === 0 && !showClientForm && (
                  <div className="col-span-full text-center py-10 text-gray-400 dark:text-slate-500 border-2 border-dashed rounded-xl dark:border-slate-800">
                      {t('no_clients')}
                  </div>
              )}
              {clients.map(client => {
                const financials = getClientFinancials(client.id);
                return (
                    <div key={client.id} className="border dark:border-slate-800 p-4 rounded-lg hover:shadow-md transition relative group bg-white dark:bg-slate-900/40 flex flex-col justify-between">
                    <div>
                        <div className="absolute top-4 left-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleSendEmail(client.email)} className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors" title={t('send_email')}><Mail className="w-4 h-4"/></button>
                            {!isReadOnly && (
                                <>
                                    <button onClick={() => handleEditClick(client)} className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"><Edit className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteClick(client.id, client.name)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"><Trash2 className="w-4 h-4"/></button>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                            {client.name.charAt(0)}
                            </div>
                            <div>
                            <p className="font-bold dark:text-slate-100">{client.name}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{client.projectType}</p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-slate-300 space-y-1 mb-4">
                            <p>📱 {client.phone}</p>
                            <p>📧 {client.email}</p>
                            {client.nationalId && <p>🆔 {client.nationalId}</p>}
                            <p>📄 {client.licenseNumber}</p>
                        </div>
                        
                        {/* Docs Badge */}
                        {client.documents && client.documents.length > 0 && (
                            <div className="mb-2">
                                <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-xs px-2 py-1 rounded">
                                    <FileText className="w-3 h-3"/> {client.documents.length} {t('documents')}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mt-2 border-t dark:border-slate-800 pt-3 bg-gray-50 dark:bg-slate-800/30 -mx-4 -mb-4 p-4 rounded-b-lg">
                        <h5 className="font-bold text-xs text-gray-700 dark:text-slate-200 mb-2 flex items-center gap-1">
                            <Coins className="w-3 h-3 text-yellow-600 dark:text-yellow-400"/> {t('collection_followup')}
                        </h5>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-slate-400">{t('total_contracts_value')}:</span>
                                <span className="font-bold dark:text-slate-100">{financials.totalContracts.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-green-700 dark:text-green-400">
                                <span>{t('collected_amount')}:</span>
                                <span className="font-bold">{financials.collected.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-red-700 dark:text-red-400">
                                <span>{t('remaining_amount')}:</span>
                                <span className="font-bold">{financials.remaining.toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                            <div 
                                className="h-full bg-green-500 transition-all duration-1000" 
                                style={{ width: `${financials.progress}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-center mt-1 text-gray-400 dark:text-slate-500">{t('collection_rate')}: {financials.progress}%</p>
                    </div>
                    </div>
                );
              })}
           </div>
        </div>
    </div>
  );
};
