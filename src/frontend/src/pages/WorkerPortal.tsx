import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { complaintApi, areaApi } from '../services/api';
import { Complaint } from '../types/complaint';
import { ArrowRight, CheckCircle2, ChevronRight, Clock, FileUp, MapPin, Navigation } from 'lucide-react';

const WorkerPortal: React.FC = () => {
  const [items, setItems] = useState<Complaint[]>([]); 
  const [area, setArea] = useState<any>(null); 
  const [files, setFiles] = useState<Record<number, File | null>>({}); 
  const [busy, setBusy] = useState<number | null>(null);
  const navigate = useNavigate();
  
  const load = async () => { 
    try { 
      const [inbox, allotted] = await Promise.all([complaintApi.workerInbox(), areaApi.mine()]); 
      setItems(inbox); 
      setArea(allotted); 
    } catch { 
      navigate('/access/worker'); 
    } 
  };
  
  useEffect(() => { void load(); }, []);
  
  const upload = async (item: Complaint) => { 
    const file = files[item.id]; 
    if (!file) return; 
    setBusy(item.id); 
    try { 
      await complaintApi.uploadEvidence(item.id, file, { type:'AFTER', timestamp:new Date().toISOString(), latitude:item.latitude, longitude:item.longitude }); 
      await load(); 
    } catch (error:any) { 
      alert(error.response?.data?.detail || 'Upload failed'); 
    } finally { 
      setBusy(null); 
    } 
  };
  
  const acknowledge = async (item: Complaint) => { 
    setBusy(item.id); 
    try { 
      await complaintApi.acknowledge(item.id); 
      await load(); 
    } catch (error:any) { 
      alert(error.response?.data?.detail || 'Could not acknowledge this complaint'); 
    } finally { 
      setBusy(null); 
    } 
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 pb-6 border-b border-zinc-200">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-zinc-400 mb-2">FIELD WORKER PORTAL</p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Task Inbox</h1>
          <p className="text-zinc-500 mt-1">Issues assigned to your service area boundary.</p>
        </div>
        <button onClick={() => {localStorage.removeItem('mcc_token');localStorage.removeItem('mcc_user');navigate('/')}} className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors px-2">
          Logout
        </button>
      </header>

      <section className="card-premium p-6 mb-8 bg-zinc-900 text-zinc-100 border-zinc-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-zinc-800 rounded-lg">
            <Navigation className="w-6 h-6 text-zinc-300" />
          </div>
          <div>
            <h2 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-1">Current Allocation</h2>
            {area?.assigned ? (
              <>
                <p className="text-lg font-semibold text-white">{area.name}</p>
                <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                  You are actively receiving complaints from this geographic zone. Acknowledge tasks when you begin, and upload completion photos for AI verification when finished.
                </p>
              </>
            ) : (
              <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                No active service area. Contact MCC administration to have a geographic boundary allocated to your account.
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="space-y-6">
        {items.map(item => (
          <article key={item.id} className="card-premium overflow-hidden group">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-zinc-900">{item.complaint_number}</span>
                    {!item.worker_acknowledged_at && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
                        Action Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-zinc-700 capitalize mb-1">
                    {item.issue_type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-zinc-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" /> {item.address}
                  </p>
                  <p className="text-sm text-zinc-600 mt-4 leading-relaxed max-w-2xl bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                    "{item.description}"
                  </p>
                </div>
                <Link to={`/worker/complaints/${item.id}`} className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors h-fit">
                  Full Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="pt-6 border-t border-zinc-100 flex flex-wrap gap-4 items-center">
                {!item.worker_acknowledged_at ? (
                  <button 
                    disabled={busy === item.id} 
                    onClick={() => acknowledge(item)} 
                    className="btn-premium btn-primary px-6 py-2.5 flex items-center gap-2"
                  >
                    {busy === item.id ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {busy === item.id ? 'Saving...' : 'Acknowledge Assignment'}
                  </button>
                ) : (
                  <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4 items-center p-4 rounded-lg bg-zinc-50 border border-zinc-200 border-dashed">
                    <label className="flex-1 w-full flex items-center gap-3 cursor-pointer">
                      <div className="w-10 h-10 rounded bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm text-zinc-500 group-hover:border-zinc-300 transition-colors">
                        <FileUp className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <span className="block text-sm font-medium text-zinc-900">
                          {files[item.id] ? files[item.id]?.name : 'Select Completion Photo'}
                        </span>
                        <span className="block text-xs text-zinc-500 mt-0.5">JPEG or PNG, max 10MB</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={e => setFiles({...files,[item.id]:e.target.files?.[0] || null})}
                      />
                    </label>
                    <button 
                      disabled={!files[item.id] || busy === item.id} 
                      onClick={() => upload(item)} 
                      className="btn-premium bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 px-6 py-2.5 w-full sm:w-auto shrink-0"
                    >
                      {busy === item.id ? 'Submitting...' : 'Submit Evidence'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
        {!items.length && (
          <div className="p-12 text-center text-zinc-500 border border-zinc-200 border-dashed rounded-xl bg-white">
            <CheckCircle2 className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
            <p className="text-lg font-medium text-zinc-900 mb-1">Inbox Zero</p>
            <p>No complaints currently pending in your assigned area.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default WorkerPortal;
