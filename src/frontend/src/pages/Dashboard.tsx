import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckCircle2, AlertCircle, Clock, TrendingUp, Map as MapIcon, RotateCw } from 'lucide-react';
import MysuruMap from '../components/MysuruMap';
import WorkerCreator from '../components/WorkerCreator';
import { complaintApi } from '../services/api';

const StatCard = ({ title, value, icon: Icon, colorClass }: { title: string, value: number, icon: any, colorClass: string }) => (
  <div className="card-premium p-6 flex flex-col justify-between h-full group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-lg border ${colorClass} transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div>
      <p className="text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
      <p className="text-sm font-medium text-zinc-500 mt-1 uppercase tracking-wider">{title}</p>
    </div>
  </div>
);

const pretty = (value: string) => value.replace(/_/g, ' ');

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null); 
  const [error, setError] = useState(''); 
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const load = async () => { 
    setRefreshing(true);
    try { 
      setData(await complaintApi.dashboard()); 
      setError('');
    } catch (e: any) { 
      setError(e.response?.status === 403 ? 'MCC administrator access is required.' : 'Could not load live dashboard data.'); 
      if (e.response?.status === 401 || e.response?.status === 403) navigate('/access/admin'); 
    } finally {
      setTimeout(() => setRefreshing(false), 500); // Visual feedback
    }
  };

  useEffect(() => { void load(); }, []);
  
  const logout = () => { localStorage.removeItem('mcc_token'); localStorage.removeItem('mcc_user'); navigate('/'); };

  if (error) return (
    <div className="max-w-2xl mx-auto mt-12 p-8 card-premium text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h1 className="text-xl font-semibold text-zinc-900">Access Denied</h1>
      <p className="mt-2 text-zinc-500">{error}</p>
      <button onClick={logout} className="mt-6 btn-premium btn-secondary px-6 py-2">Return to Login</button>
    </div>
  );

  const stats = data || { total: 0, verified: 0, needs_review: 0, not_resolved: 0, partial: 0, recurring: 0, recent: [] };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Control Room</h1>
          <p className="text-zinc-500 mt-1">Live complaint status and AI-verification overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => void load()} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-200 bg-white text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-zinc-900' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Live Data'}
          </button>
          <button onClick={logout} className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors px-2">
            Logout
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total" value={stats.total} icon={LayoutDashboard} colorClass="bg-zinc-100 text-zinc-700 border-zinc-200" />
        <StatCard title="Verified" value={stats.verified} icon={CheckCircle2} colorClass="bg-emerald-50 text-emerald-600 border-emerald-100" />
        <StatCard title="Review" value={stats.needs_review} icon={AlertCircle} colorClass="bg-amber-50 text-amber-600 border-amber-100" />
        <StatCard title="Not Fixed" value={stats.not_resolved} icon={AlertCircle} colorClass="bg-red-50 text-red-600 border-red-100" />
        <StatCard title="Partial" value={stats.partial} icon={Clock} colorClass="bg-blue-50 text-blue-600 border-blue-100" />
        <StatCard title="Recurring" value={stats.recurring} icon={TrendingUp} colorClass="bg-purple-50 text-purple-600 border-purple-100" />
      </div>

      {/* Map and Worker Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <MysuruMap />
          <div className="card-premium p-6">
            <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-zinc-400" /> Routing Logic
            </h2>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              Create a worker account, then draw a geographical boundary for that worker on the map. Public complaints are automatically assigned when their submitted coordinates fall inside a saved service area.
            </p>
          </div>
        </div>
        
        <div className="space-y-8">
          <WorkerCreator />
          
          <div className="card-premium p-0 overflow-hidden flex flex-col h-[400px]">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="font-semibold text-zinc-900">Recent AI Verifications</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {stats.recent.map((item: any) => (
                <div key={item.complaint_number} className="p-3 mb-2 rounded-lg hover:bg-zinc-50 transition-colors flex justify-between items-center group cursor-default">
                  <div>
                    <p className="font-semibold text-sm text-zinc-900 group-hover:text-zinc-600 transition-colors">{item.complaint_number}</p>
                    <p className="text-xs text-zinc-500 capitalize mt-0.5">{pretty(item.issue_type)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-900">{Math.round(item.score)}<span className="text-zinc-400 font-normal">/100</span></p>
                    <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider mt-0.5">{pretty(item.result)}</p>
                  </div>
                </div>
              ))}
              {!stats.recent.length && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-sm p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-zinc-200 mb-2" />
                  <p>No completed AI reviews yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
