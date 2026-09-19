import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Tag, AlignLeft, Send, CheckCircle2 } from 'lucide-react';
import { complaintApi } from '../services/api';
import { ComplaintCreateInput, IssueType } from '../types/complaint';
import PublicLocationPicker from '../components/PublicLocationPicker';

const ComplaintCreate: React.FC = () => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [formData, setFormData] = useState<ComplaintCreateInput>({
    issue_type: 'garbage_accumulation',
    description: '',
    latitude: 12.3051,
    longitude: 76.6551,
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await complaintApi.create(formData);
      navigate(window.location.pathname.startsWith('/mcc') ? '/complaints' : '/public');
    } catch (error) {
      alert('Failed to create complaint');
    } finally {
      setBusy(false);
    }
  };

  const isPublic = !window.location.pathname.startsWith('/complaints');

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <button
          onClick={() => navigate(isPublic ? '/public' : '/complaints')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to List
        </button>
      </div>

      <header className="mb-8 pb-6 border-b border-zinc-200">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">Report Civic Issue</h1>
        <p className="text-zinc-500">Provide details about the issue to alert the municipal control room.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card-premium p-6 sm:p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <Tag className="w-4 h-4 text-zinc-400" /> Category
              </label>
              <p className="text-xs text-zinc-500 mb-2">Select the type of civic issue</p>
              <select
                className="input-premium py-2.5 bg-zinc-50/50"
                value={formData.issue_type}
                onChange={(e) => setFormData({ ...formData, issue_type: e.target.value as IssueType })}
              >
                <option value="garbage_accumulation">Garbage Accumulation</option>
                <option value="overflowing_bin">Overflowing Bin</option>
                <option value="construction_debris">Construction Debris</option>
                <option value="pothole">Pothole</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <MapPin className="w-4 h-4 text-zinc-400" /> Street Address
              </label>
              <p className="text-xs text-zinc-500 mb-2">Approximate location or landmark</p>
              <input
                type="text"
                className="input-premium py-2.5 bg-zinc-50/50"
                placeholder="e.g. Near KD Circle, Gokulam"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-8 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 mb-1">
                <MapPin className="w-4 h-4 text-zinc-400" /> Exact Location
              </label>
              <p className="text-xs text-zinc-500 mb-2">Tap on the map to pinpoint the exact coordinates for the field worker.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                <span className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Latitude</span>
                <span className="text-sm font-medium text-zinc-700">{formData.latitude.toFixed(6)}</span>
              </div>
              <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                <span className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Longitude</span>
                <span className="text-sm font-medium text-zinc-700">{formData.longitude.toFixed(6)}</span>
              </div>
            </div>
            
            <PublicLocationPicker 
              latitude={formData.latitude} 
              longitude={formData.longitude} 
              onSelect={(lat, lng) => setFormData({...formData, latitude: lat, longitude: lng})} 
            />
          </div>

          <div className="border-t border-zinc-100 pt-8 space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 mb-1">
              <AlignLeft className="w-4 h-4 text-zinc-400" /> Description
            </label>
            <textarea
              className="input-premium py-3 bg-zinc-50/50 min-h-[120px] resize-y"
              placeholder="Provide additional details to help the field worker locate and resolve the issue..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>
          
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(isPublic ? '/public' : '/complaints')}
            className="btn-premium btn-secondary px-6 py-2.5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="btn-premium btn-primary px-8 py-2.5 flex items-center gap-2"
          >
            {busy ? (
              <>Processing...</>
            ) : (
              <>Submit Report <Send className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintCreate;
