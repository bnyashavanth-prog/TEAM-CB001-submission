import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Calendar, Search } from 'lucide-react';
import { complaintApi } from '../services/api';
import { Complaint } from '../types/complaint';

const Complaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintApi.list()
      .then(setComplaints)
      .finally(() => setLoading(false));
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-zinc-100 text-zinc-700';
      case 'ASSIGNED': return 'bg-cyan-50 text-cyan-700';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700';
      case 'VERIFIED_RESOLVED': return 'bg-emerald-50 text-emerald-700';
      case 'PARTIALLY_RESOLVED': return 'bg-amber-50 text-amber-700';
      default: return 'bg-red-50 text-red-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Complaints Ledger</h1>
          <p className="text-zinc-500 mt-1">Manage and track all reported civic issues</p>
        </div>
        <Link to="/complaints/new" className="btn-premium btn-primary px-4 py-2 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Report
        </Link>
      </div>

      <div className="card-premium overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search reports..." 
              className="input-premium pl-9 h-9 w-full"
            />
          </div>
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {complaints.length} Total Records
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-400 flex flex-col items-center">
            <div className="w-6 h-6 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin mb-4" />
            <p>Loading ledger...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/50 transition-colors group cursor-default">
                    <td className="px-6 py-4">
                      <span className="font-medium text-zinc-900 group-hover:text-zinc-600 transition-colors">
                        {c.complaint_number}
                      </span>
                      <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1 uppercase tracking-wider">
                        <Calendar className="w-3 h-3" /> {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-zinc-700 capitalize">
                        {c.issue_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-1.5 text-sm text-zinc-500 max-w-[200px]">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
                        <span className="truncate" title={c.address}>{c.address || 'Coordinates only'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(c.status)}`}>
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/complaints/${c.id}`} className="inline-flex items-center text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition-colors">
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
                {complaints.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-zinc-500 text-sm">
                      No complaints found in the ledger.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;
