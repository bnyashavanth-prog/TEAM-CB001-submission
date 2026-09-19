import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

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
    if (result === 'CATEGORY_MISMATCH') return '0/100 · Mismatch';
    if (result === 'LOCATION_MISMATCH' || result === 'INSUFFICIENT_EVIDENCE') return '0/100 · Unverifiable';
    if (evidenceScore >= 90) return `${Math.round(evidenceScore)}/100 · Resolved`;
    if (evidenceScore >= 60) return `${Math.round(evidenceScore)}/100 · Partial`;
    return `${Math.round(evidenceScore)}/100 · Not Resolved`;
  };

  const getStatusStyle = (res: string) => {
    switch (res) {
      case 'RESOLUTION_SUPPORTED': 
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> };
      case 'PARTIALLY_RESOLVED': 
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: <Info className="w-4 h-4 text-blue-600" /> };
      case 'NOT_RESOLVED': 
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: <AlertCircle className="w-4 h-4 text-red-600" /> };
      case 'RELOCATED_POSSIBLE': 
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: <AlertCircle className="w-4 h-4 text-amber-600" /> };
      case 'CATEGORY_MISMATCH': 
        return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: <AlertCircle className="w-4 h-4 text-orange-600" /> };
      default: 
        return { bg: 'bg-zinc-50', border: 'border-zinc-200', text: 'text-zinc-700', icon: <Info className="w-4 h-4 text-zinc-500" /> };
    }
  };

  const style = getStatusStyle(result);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
        <h3 className="text-xs font-semibold text-zinc-500 tracking-widest uppercase">Live AI Assessment</h3>
        <div className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded text-[10px] font-bold tracking-wider uppercase border border-zinc-200">
          Score: {scoreCategory()}
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${style.bg} ${style.border}`}>
        <div className="flex items-center gap-2 mb-2">
          {style.icon}
          <span className={`text-xs font-bold tracking-widest uppercase ${style.text}`}>
            {result?.replace(/_/g, ' ') || 'PENDING'}
          </span>
        </div>
        <p className={`text-sm leading-relaxed ${style.text} opacity-90`}>
          {explanation}
        </p>
      </div>

      <p className="text-[11px] text-zinc-400 leading-relaxed">
        Gemini's multimodal reasoning engine evaluates both images and acts as the final arbiter for resolution status. 
        Deterministic area metrics are tracked internally but omitted here to prioritize the VLM's judgment.
      </p>
    </div>
  );
};

export default ComparisonMetrics;
