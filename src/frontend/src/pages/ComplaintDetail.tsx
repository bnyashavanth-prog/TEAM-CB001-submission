import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Upload, Image as ImageIcon, CheckCircle, Clock, AlertCircle, Zap, Gavel, Trash2 } from 'lucide-react';
import { complaintApi, evidenceUrl } from '../services/api';
import { Complaint, Evidence } from '../types/complaint';
import ComparisonMetrics from '../components/ComparisonMetrics';

const ComplaintDetail: React.FC = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [comparison, setComparison] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [evidenceType, setEvidenceType] = useState<'BEFORE' | 'AFTER'>('BEFORE');

  // Human Decision State
  const [decision, setDecision] = useState<string>('CONFIRM_FIX');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const beforeItems = evidence.filter((item) => item.type === 'BEFORE');
  const afterItems = evidence.filter((item) => item.type === 'AFTER');
  const beforeEvidence = beforeItems[beforeItems.length - 1];
  const afterEvidence = afterItems[afterItems.length - 1];

  useEffect(() => {
    if (id) {
      loadData(Number(id));
    }
  }, [id]);

  const loadData = async (complaintId: number) => {
    try {
      const [c, e] = await Promise.all([
        complaintApi.get(complaintId),
        complaintApi.getEvidence(complaintId),
      ]);
      setComplaint(c);
      setEvidence(e);

      // If complaint is already AI verified, try to load the latest comparison
      if (c.status === 'AI_VERIFICATION') {
        try {
          setComparison(await complaintApi.getComparison(complaintId));
        } catch (err) {
          console.log('No comparison found yet');
        }
      }
    } catch (error) {
      console.error('Error loading complaint detail:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !id) return;

    setUploading(true);
    try {
      const metadata = {
        type: evidenceType,
        timestamp: new Date().toISOString(),
        latitude: 12.3051, // Mock GPS
        longitude: 76.6551, // Mock GPS
      };
      await complaintApi.uploadEvidence(Number(id), selectedFile, metadata);
      await loadData(Number(id));
      setSelectedFile(null);
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const runVerification = async () => {
    if (!id) return;
    setVerifying(true);
    try {
      const res = await complaintApi.verify(Number(id));
      setComparison(res);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Verification failed: Insufficient evidence or server error');
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteEvidence = async (evidenceId: number) => {
    if (!window.confirm('Are you sure you want to delete this evidence?')) return;
    try {
      await complaintApi.deleteEvidence(Number(id), evidenceId);
      await loadData(Number(id));
    } catch (error) {
      alert('Failed to delete evidence');
    }
  };

  const submitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comparison || !id) return;

    setSubmitting(true);
    try {
      await complaintApi.submitDecision({
        comparison_id: comparison.id,
        reviewer_id: 1, // Mock current user
        decision,
        reason,
      });
      alert('Decision submitted successfully');
      await loadData(Number(id));
    } catch (error) {
      alert('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!complaint) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/complaints" className="text-blue-600 hover:underline text-sm">
          &larr; Back to List
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">{complaint.complaint_number}</h1>
        <span className={`px-3 py-1 rounded-full text-xs font-medium
          ${complaint.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
            complaint.status === 'VERIFIED_RESOLVED' ? 'bg-green-100 text-green-700' :
            'bg-orange-100 text-orange-700'}`}>
          {complaint.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Complaint Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Issue Type:</span>
                <span className="font-medium capitalize">{complaint.issue_type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-medium text-right">{complaint.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Created:</span>
                <span className="font-medium">{new Date(complaint.created_at).toLocaleDateString()}</span>
              </div>
              <div className="pt-3 border-t">
                <span className="text-slate-500 block mb-1">Description:</span>
                <p className="text-slate-700">{complaint.description || 'No description provided.'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Upload Evidence</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                {(['BEFORE', 'AFTER'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEvidenceType(type)}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                      evidenceType === type ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept="image/*,video/*"
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">
                  {selectedFile ? selectedFile.name : 'Click or drag to upload image/video'}
                </p>
              </div>
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Evidence'}
              </button>
            </form>
          </div>

          {complaint.status !== 'VERIFIED_RESOLVED' && (
            <button
              onClick={runVerification}
              disabled={verifying || !beforeEvidence || !afterEvidence}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50"
            >
              <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              {verifying ? 'Running AI Analysis...' : beforeEvidence && afterEvidence ? 'Compare photos with AI' : 'Upload a before and after photo'}
            </button>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {beforeEvidence && afterEvidence && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Photos selected for AI comparison</h2>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">Ready to compare</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[{ label: 'Before', item: beforeEvidence }, { label: 'After', item: afterEvidence }].map(({ label, item }) => (
                  <figure key={label} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    <img src={evidenceUrl(item.file_path)} alt={`${label} comparison image`} className="h-52 w-full object-cover" />
                    <figcaption className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600">{label}</figcaption>
                  </figure>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-600">The AI checks issue area, scene alignment, evidence quality, and signs that material may have been moved rather than removed.</p>
            </div>
          )}
          {comparison && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900">AI Verification Result</h2>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                  <Gavel className="w-4 h-4" /> Human Review Required
                </div>
              </div>

              <ComparisonMetrics
                result={comparison.result}
                explanation={comparison.explanation}
                evidenceScore={comparison.overall_evidence_score}
                metrics={{
                  before_area: comparison.affected_area_before,
                  after_area: comparison.affected_area_after,
                  reduction_percent: comparison.affected_area_before
                    ? Math.round(((comparison.affected_area_before - comparison.affected_area_after) / comparison.affected_area_before) * 100)
                    : 0
                }}
              />

              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Final Municipal Decision</h3>
                <form onSubmit={submitDecision} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'CONFIRM_FIX', label: 'Confirm Fix', color: 'bg-green-100 text-green-700' },
                        { id: 'PARTIAL_FIX', label: 'Partial Fix', color: 'bg-orange-100 text-orange-700' },
                        { id: 'NOT_FIXED', label: 'Not Fixed', color: 'bg-red-100 text-red-700' },
                        { id: 'REQUEST_FIELD_INSPECTION', label: 'Field Inspection', color: 'bg-blue-100 text-blue-700' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDecision(opt.id)}
                          className={`p-2 text-xs font-bold rounded-lg border transition-all ${
                            decision === opt.id ? `${opt.color} border-current ring-2 ring-offset-1 ring-current` : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="w-full p-3 border rounded-lg text-sm h-24 bg-slate-50"
                      placeholder="Enter reason for decision..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="flex flex-col justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Official Decision'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[600px]">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-slate-500" />
              Evidence Timeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evidence.map((e) => (
                <div key={e.id} className="border rounded-lg overflow-hidden bg-slate-50">
                  <div className="p-2 bg-slate-200 text-[10px] font-bold flex justify-between items-center">
                    <div className="flex gap-2">
                      <span>{e.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{new Date(e.timestamp).toLocaleString()}</span>
                      <button
                        onClick={() => handleDeleteEvidence(e.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete evidence"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="aspect-video bg-slate-300 flex items-center justify-center text-slate-500 text-xs italic relative overflow-hidden">
                    {e.file_path.endsWith('.mp4') || e.file_path.endsWith('.mov') || e.file_path.endsWith('.webm') ? (
                      <video
                        src={evidenceUrl(e.file_path)}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={evidenceUrl(e.file_path)}
                        alt={`${e.type} evidence`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Quality Score:</span>
                      <span className="font-medium">{e.quality_score ?? 'Pending'}</span>
                    </div>
                  </div>
                </div>
              ))}
              {evidence.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400 italic">
                  No evidence uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
