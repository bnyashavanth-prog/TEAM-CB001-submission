import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, MapPin, Sparkles, AlertCircle, Calendar } from 'lucide-react';
import { complaintApi, evidenceUrl } from '../services/api';
import ComparisonMetrics from '../components/ComparisonMetrics';
import { Complaint, Evidence } from '../types/complaint';

type PortalData = { complaint: Complaint; evidence: Evidence[]; comparison: any };

const PortalComplaintDetail: React.FC = () => {
  const { id, role } = useParams(); 
  const worker = role === 'worker';
  
  const [data, setData] = useState<PortalData | null>(null); 
  const [file, setFile] = useState<File | null>(null); 
  const [busy, setBusy] = useState(false); 
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const load = async () => { 
    try { 
      setData(await complaintApi.portalDetail(Number(id))); 
    } catch (e: any) { 
      setError(e.response?.data?.detail || 'Unable to load this complaint'); 
    } 
  };
  
  useEffect(() => { void load(); }, [id]);
  
  const uploadAfter = async () => { 
    if (!file || !data) return; 
    setBusy(true); 
    try { 
      await complaintApi.uploadEvidence(data.complaint.id, file, { type: 'AFTER', timestamp: new Date().toISOString(), latitude: data.complaint.latitude, longitude: data.complaint.longitude }); 
      setFile(null); 
      await load(); 
    } catch (e: any) { 
      setError(e.response?.data?.detail || 'Could not upload After photo'); 
    } finally { 
      setBusy(false); 
    } 
  };
  
  if (error) return (
    <div className="max-w-2xl mx-auto mt-12 p-8 card-premium text-center animate-in fade-in">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h1 className="text-xl font-semibold text-zinc-900">Error Loading Complaint</h1>
      <p className="mt-2 text-zinc-500 mb-6">{error}</p>
      <Link to={worker ? '/worker' : '/public'} className="btn-premium btn-secondary px-6 py-2">
        Return to Dashboard
      </Link>
    </div>
  );
  
  if (!data) return (
    <div className="max-w-4xl mx-auto p-12 text-center text-zinc-400 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin mb-4" />
      <p>Loading complaint details...</p>
    </div>
  );
  
  const before = data.evidence.filter(x => x.type === 'BEFORE'); 
  const after = data.evidence.filter(x => x.type === 'AFTER'); 
  const latestBefore = before[before.length - 1]; 
  const latestAfter = after[after.length - 1];
  
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <Link to={worker ? '/worker' : '/public'} className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="w-4 h-4"/> 
          Back to {worker ? 'inbox' : 'reports'}
        </Link>
      </div>

      <header className="mb-8 pb-6 border-b border-zinc-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-zinc-400 mb-2 uppercase">
              {worker ? 'TASK ASSIGNMENT' : 'CIVIC REPORT'}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">
              {data.complaint.complaint_number}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-medium text-zinc-700 capitalize bg-zinc-100 px-2 py-0.5 rounded">
                {data.complaint.issue_type.replace(/_/g, ' ')}
              </span>
              <span className="text-zinc-500 font-medium capitalize">
                {data.complaint.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm text-zinc-500 md:text-right bg-zinc-50 p-3 rounded-lg border border-zinc-100">
            <span className="flex items-center md:justify-end gap-1.5">
              <MapPin className="w-4 h-4 shrink-0"/> {data.complaint.address || 'Coordinates only'}
            </span>
            <span className="flex items-center md:justify-end gap-1.5">
              <Calendar className="w-4 h-4 shrink-0"/> {new Date(data.complaint.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <section className="card-premium p-1 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 flex items-center gap-2 text-sm">
              <ImageIcon className="w-4 h-4 text-zinc-400"/> Initial Report
            </h2>
            <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Before</span>
          </div>
          <div className="p-4 flex-1 bg-white">
            {latestBefore ? (
              <div className="rounded-lg overflow-hidden border border-zinc-200 shadow-sm relative group">
                <img className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105" src={evidenceUrl(latestBefore.file_path)} alt="Initial reported state"/>
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 pointer-events-none rounded-lg" />
              </div>
            ) : (
              <div className="w-full aspect-video bg-zinc-50 border border-zinc-200 border-dashed rounded-lg flex items-center justify-center text-zinc-400 text-sm">
                No initial photo provided.
              </div>
            )}
            <div className="mt-4 p-4 bg-zinc-50 rounded-lg border border-zinc-100 text-sm text-zinc-600 leading-relaxed italic">
              "{data.complaint.description || 'No description provided.'}"
            </div>
          </div>
        </section>

        <section className="card-premium p-1 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 flex items-center gap-2 text-sm">
              <ImageIcon className="w-4 h-4 text-zinc-400"/> Work Completion
            </h2>
            <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">After</span>
          </div>
          <div className="p-4 flex-1 flex flex-col bg-white">
            {latestAfter ? (
              <div className="rounded-lg overflow-hidden border border-zinc-200 shadow-sm relative group">
                <img className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105" src={evidenceUrl(latestAfter.file_path)} alt="Work completed state"/>
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 pointer-events-none rounded-lg" />
              </div>
            ) : (
              <div className="w-full aspect-video bg-zinc-50 border border-zinc-200 border-dashed rounded-lg flex items-center justify-center text-zinc-400 text-sm">
                Awaiting completion photo.
              </div>
            )}
            
            {worker && !latestAfter && (
              <div className="mt-4 flex flex-col h-full justify-end">
                <div className="p-4 bg-zinc-50 border border-zinc-200 border-dashed rounded-lg">
                  <label className="block mb-2 text-sm font-medium text-zinc-700">Submit Work Proof</label>
                  <input type="file" accept="image/*" className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer" onChange={e => setFile(e.target.files?.[0] || null)}/>
                  <button disabled={!file || busy} onClick={uploadAfter} className="mt-4 w-full btn-premium btn-primary py-2.5">
                    {busy ? 'Uploading & Analyzing...' : 'Submit Photo & Trigger AI'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="card-premium p-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
          <div className="p-1.5 bg-blue-100 rounded-md">
            <Sparkles className="w-4 h-4 text-blue-600"/>
          </div>
          <div>
            <h2 className="font-semibold text-zinc-900 text-sm">Gemini Multimodal Verification</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Automated visual reasoning engine</p>
          </div>
        </div>
        <div className="p-6">
          {data.comparison ? (
            <ComparisonMetrics 
              result={data.comparison.result} 
              explanation={data.comparison.explanation} 
              evidenceScore={data.comparison.overall_evidence_score} 
              metrics={{before_area: 0, after_area: 0, reduction_percent: 0}}
            />
          ) : (
            <div className="py-8 text-center text-zinc-500 text-sm">
              <p>The AI verification pipeline will execute automatically once the worker uploads the "After" completion evidence.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
export default PortalComplaintDetail;
