import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ComparisonMetricsProps {
  metrics: {
    before_area: number;
    after_area: number;
    reduction_percent: number;
  };
  result: string;
  explanation: string;
  evidenceScore: number;
}

const ComparisonMetrics: React.FC<ComparisonMetricsProps> = ({ metrics, result, explanation, evidenceScore }) => {
const scoreCategory = () => {
    if (result === 'CATEGORY_MISMATCH') return '0/100 · Category mismatch';
    if (result === 'LOCATION_MISMATCH' || result === 'INSUFFICIENT_EVIDENCE') return '0/100 · Evidence not comparable';
    if (evidenceScore >= 90) return `${Math.round(evidenceScore)}/100 · Resolved`;
    if (evidenceScore >= 60) return `${Math.round(evidenceScore)}/100 · Partially resolved`;
    return `${Math.round(evidenceScore)}/100 · Not resolved`;
  };
const getStatusColor = (res: string) => {
    switch (res) {
      case 'RESOLUTION_SUPPORTED': return 'text-green-600 bg-green-50 border-green-200';
      case 'PARTIALLY_RESOLVED': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'NOT_RESOLVED': return 'text-red-600 bg-red-50 border-red-200';
      case 'RELOCATED_POSSIBLE': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'CATEGORY_MISMATCH': return 'text-amber-700 bg-amber-50 border-amber-300';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Live AI image assessment</h3>
        <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold">
          AI score: {scoreCategory()}
        </div>
      </div>

      <div className={`p-4 rounded-xl border ${getStatusColor(result)}`}>
        <div className="flex items-center gap-2 mb-1">
          {result === 'RESOLUTION_SUPPORTED' && <CheckCircle className="w-5 h-5" />}
          {result === 'NOT_RESOLVED' && <AlertCircle className="w-5 h-5" />}
          {result === 'PARTIALLY_RESOLVED' && <Info className="w-5 h-5" />}
          {result === 'CATEGORY_MISMATCH' && <AlertCircle className="w-5 h-5" />}
          <span className="font-bold uppercase tracking-wider text-sm">{result?.replace('_', ' ') || 'PENDING'}</span>
        </div>
        <p className="text-sm opacity-90">{explanation}</p>
      </div>

      <p className="text-xs text-slate-500">Gemini’s visual review of the selected category and both images produces this final score category automatically. Area metrics are not shown because demo detection must not influence an AI judgment.</p>
    </div>
  );
};

export default ComparisonMetrics;
