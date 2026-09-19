import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { complaintApi } from '../services/api';
import { ComplaintCreateInput, IssueType } from '../types/complaint';

const ComplaintCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ComplaintCreateInput>({
    issue_type: 'garbage_accumulation',
    description: '',
    latitude: 12.3051,
    longitude: 76.6551,
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await complaintApi.create(formData);
      navigate('/complaints');
    } catch (error) {
      alert('Failed to create complaint');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/complaints')}
          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to List
        </button>
        <h1 className="text-3xl font-bold text-slate-900">Report New Issue</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Issue Type</label>
            <select
              className="w-full p-2 border rounded-lg bg-slate-50"
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
            <label className="block text-sm font-medium text-slate-700">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="w-full p-2 pl-10 border rounded-lg bg-slate-50"
                placeholder="Enter street address..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            className="w-full p-2 border rounded-lg bg-slate-50 h-32"
            placeholder="Describe the problem in detail..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Latitude</label>
            <input
              type="number"
              step="any"
              className="w-full p-2 border rounded-lg bg-slate-50"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Longitude</label>
            <input
              type="number"
              step="any"
              className="w-full p-2 border rounded-lg bg-slate-50"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Submit Complaint
        </button>
      </form>
    </div>
  );
};

export default ComplaintCreate;
