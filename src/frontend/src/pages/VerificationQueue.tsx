import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { API_ORIGIN } from '../services/api';
import { Complaint } from '../types/complaint';

const VerificationQueue: React.FC = () => {
  const [queue, setQueue] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_ORIGIN}/api/v1/verification-human/queue`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setQueue(res.data);
        } else {
          console.error('Expected array but received:', res.data);
          setQueue([]);
        }
      })
      .catch(err => {
        console.error('Error fetching queue:', err);
        setQueue([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Verification Queue</h1>
          <p className="text-slate-500">Complaints requiring human confirmation of AI results</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading queue...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {queue.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{c.complaint_number}</p>
                  <h3 className="text-lg font-bold text-slate-900 capitalize">{c.issue_type.replace('_', ' ')}</h3>
                </div>
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                  AI Verified
                </span>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>Reported {new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="truncate">{c.address}</span>
                </div>
              </div>

              <Link
                to={`/complaints/${c.id}`}
                className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white transition-all"
              >
                Review Evidence
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          ))}
          {queue.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400 italic">
              Queue is empty. All complaints are verified!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationQueue;
