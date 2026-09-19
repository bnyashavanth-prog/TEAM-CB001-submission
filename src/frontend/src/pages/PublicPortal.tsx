import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { complaintApi } from '../services/api';
import { Complaint } from '../types/complaint';
import { CheckCircle2, ChevronRight, FileText, Image as ImageIcon, MapPin, Search } from 'lucide-react';

const PublicPortal: React.FC = () => {
  const [items, setItems] = useState<Complaint[]>([]);
  const navigate = useNavigate();
  
  const load = async () => { 
    try { setItems(await complaintApi.mine()); } 
    catch { navigate('/access/public'); } 
  };
  
  useEffect(() => { void load(); }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED_RESOLVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PARTIALLY_RESOLVED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'NOT_RESOLVED': return 'bg-red-100 text-red-700 border-red-200';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 pb-6 border-b border-zinc-200">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-zinc-400 mb-2">CIVIC PORTAL</p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Your Reports</h1>
          <p className="text-zinc-500 mt-1">Track the resolution status of civic issues you've reported.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/complaints/new" className="btn-premium btn-primary px-5 py-2">
            Report New Issue
          </Link>
          <button onClick={() => { localStorage.removeItem('mcc_token'); localStorage.removeItem('mcc_user'); navigate('/'); }} className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors px-2">
            Logout
          </button>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="card-premium p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-6 h-6 text-zinc-400" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">No reports yet</h2>
          <p className="text-zinc-500 max-w-sm mx-auto mb-8 leading-relaxed">
            Help keep Mysuru clean and safe. Report an issue with photo evidence, and we'll route it to the right department.
          </p>
          <Link to="/complaints/new" className="btn-premium btn-secondary px-6 py-2.5">
            Create First Report
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map(item => (
            <Link 
              key={item.id} 
              to={`/public/complaints/${item.id}`} 
              className="card-premium p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors">
                    {item.complaint_number}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-zinc-700 capitalize">
                    {item.issue_type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1 truncate max-w-lg">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {item.address || 'Location provided via coordinates'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-zinc-400 shrink-0 border-t sm:border-t-0 sm:border-l border-zinc-100 pt-4 sm:pt-0 sm:pl-6">
                <div className="flex flex-col sm:text-right">
                  <span className="text-xs uppercase tracking-wider font-semibold">Reported</span>
                  <span className="font-medium text-zinc-600 mt-0.5">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-100 group-hover:border-zinc-300 transition-colors">
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicPortal;
