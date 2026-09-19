import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, MapPin, Sparkles, UploadCloud } from 'lucide-react';
import { complaintApi, evidenceUrl } from '../services/api';
import ComparisonMetrics from '../components/ComparisonMetrics';
import { Complaint, Evidence } from '../types/complaint';

const ComplaintDetail: React.FC = () => {
  const { id } = useParams(); 
  const [complaint, setComplaint] = useState<Complaint | null>(null); 
  const [evidence, setEvidence] = useState<Evidence[]>([]); 
  const [comparison, setComparison] = useState<any>(null); 
  const [file, setFile] = useState<File | null>(null); 
  const [type, setType] = useState<'BEFORE'|'AFTER'>('BEFORE'); 
  const [busy, setBusy] = useState(false);
  
  const load = async () => { 
    if (!id) return; 
    const [current, items] = await Promise.all([complaintApi.get(+id), complaintApi.getEvidence(+id)]); 
    setComplaint(current); 
    setEvidence(items); 
    try { setComparison(await complaintApi.getComparison(+id)); } catch { setComparison(null); } 
  };
  
  useEffect(() => { void load(); }, [id]);
  
  const upload = async () => { 
    if (!id || !file) return; 
    setBusy(true); 
    try { 
      await complaintApi.uploadEvidence(+id, file, { type, timestamp: new Date().toISOString(), latitude: complaint?.latitude, longitude: complaint?.longitude }); 
      setFile(null); 
      await load(); 
    } finally { setBusy(false); } 
  };
  
  const verify = async () => { 
    if (!id) return; 
    setBusy(true); 
    try { 
      setComparison(await complaintApi.verify(+id)); 
      await load(); 
    } catch (error: any) { 
      alert(error.response?.data?.detail || 'AI analysis failed'); 
    } finally { setBusy(false); } 
  };
  
  if (!complaint) return (
    <div className="max-w-4xl mx-auto p-12 text-center text-zinc-400 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin mb-4" />
      <p>Loading complaint details...</p>
    </div>
  );
  
  const beforeItems = evidence.filter(item => item.type === 'BEFORE'); 
  const afterItems = evidence.filter(item => item.type === 'AFTER'); 
  const before = beforeItems[beforeItems.length - 1]; 
  const after = afterItems[afterItems.length - 1];
  
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6">
        <Link to="/complaints" className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="w-4 h-4"/> Back to Ledger
        </Link>
      </div>

      <header className="mb-8 pb-6 border-b border-zinc-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-zinc-400 mb-2 uppercase">MCC REVIEW</p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">{complaint.complaint_number}</h1>
          <div className="flex items-center gap-3 text-sm text-zinc-600">
            <span className="font-medium text-zinc-900 capitalize bg-zinc-100 px-2 py-0.5 rounded">{complaint.issue_type.replace(/_/g, ' ')}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {complaint.address}</span>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 mb-8">
        
        {/* Evidence Images */}
        <section className="lg:col-span-8 card-premium p-1 overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-zinc-400"/> Visual Evidence
            </h2>
          </div>
          
          <div className="p-6 grid sm:grid-cols-2 gap-6 bg-white">
            {[
              {label:'Initial Report (Before)', type:'BEFORE', item:before},
              {label:'Completion Proof (After)', type:'AFTER', item:after}
            ].map(({label, type, item}) => (
              <div key={type} className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-zinc-900">{label}</span>
                  {item && <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{new Date(item.created_at).toLocaleDateString()}</span>}
                </div>
                
                {item ? (
                  <div className="rounded-xl overflow-hidden border border-zinc-200 shadow-sm relative group flex-1">
                    <img src={evidenceUrl(item.file_path)} alt={label} className="w-full h-full object-cover aspect-video transition-transform duration-700 group-hover:scale-105"/>
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 pointer-events-none rounded-xl" />
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-zinc-50 border border-zinc-200 border-dashed rounded-xl flex items-center justify-center text-zinc-400 text-sm flex-1">
                    Awaiting Upload
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Action Panel */}
        <div className="lg:col-span-4 space-y-6">
          <section className="card-premium p-6 bg-zinc-50/50 border-zinc-200">
            <h2 className="font-semibold text-zinc-900 mb-4 text-sm">Manual Override</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Evidence Type</label>
                <select className="input-premium" value={type} onChange={e => setType(e.target.value as 'BEFORE'|'AFTER')}>
                  <option value="BEFORE">Initial Report (Before)</option>
                  <option value="AFTER">Completion Proof (After)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Upload File</label>
                <label className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-zinc-200 border-dashed rounded-md cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-colors">
                  <UploadCloud className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-600 truncate max-w-[200px]">
                    {file ? file.name : 'Select image file'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)}/>
                </label>
              </div>
              <button disabled={!file || busy} onClick={upload} className="btn-premium btn-secondary w-full">
                Attach Evidence
              </button>
            </div>
          </section>

          <section className="card-premium p-6 border-zinc-900 bg-zinc-900 text-zinc-100">
            <h2 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" /> Verification Engine
            </h2>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Trigger the multimodal pipeline to analyze both images and generate a final, immutable score and status.
            </p>
            <button disabled={!before || !after || busy} onClick={verify} className="btn-premium bg-white text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 w-full py-2.5 font-bold shadow-lg shadow-white/10">
              {busy ? 'Pipeline Running...' : 'Execute AI Assessment'}
            </button>
          </section>
        </div>
      </div>

      <section className="card-premium p-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900 text-sm">Algorithm Decision</h2>
        </div>
        <div className="p-6 bg-white">
          {comparison ? (
            <ComparisonMetrics 
              result={comparison.result} 
              explanation={comparison.explanation} 
              evidenceScore={comparison.overall_evidence_score} 
              metrics={{before_area:0,after_area:0,reduction_percent:0}}
            />
          ) : (
            <div className="py-8 text-center text-zinc-500 text-sm">
              <Sparkles className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
              <p>Execute the AI assessment above to generate verification metrics.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
export default ComplaintDetail;
