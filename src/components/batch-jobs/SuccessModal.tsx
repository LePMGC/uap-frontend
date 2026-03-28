import { CheckCircle2, List, ArrowRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SuccessModalProps {
  isOpen: boolean;
  jobId: string; // The UUID from your database
  jobName: string;
}

export function SuccessModal({ isOpen, jobId, jobName }: SuccessModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl text-center space-y-8 scale-in-center transition-transform">
        {/* Success Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
          <div className="relative flex items-center justify-center w-24 h-24 bg-emerald-500 rounded-full shadow-lg shadow-emerald-200">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Job Successfully Created!
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            The batch job{" "}
            <span className="font-bold text-slate-900">"{jobName}"</span> has
            been configured and is ready for execution.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3 pt-4">
          <button
            onClick={() => navigate(`/operations/batch-jobs/${jobId}`)}
            className="flex items-center justify-center gap-3 w-full py-4 bg-indigo-600 text-white rounded-[1.5rem] font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 group"
          >
            Go to Job Details
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate("/operations/batch-jobs")}
            className="flex items-center justify-center gap-3 w-full py-4 bg-slate-100 text-slate-700 rounded-[1.5rem] font-bold text-sm hover:bg-slate-200 transition-all"
          >
            <List className="h-4 w-4" />
            View All Batch Jobs
          </button>
        </div>

        <p className="text-[10px] text-slate-400 font-medium">
          Job ID: <span className="font-mono">{jobId}</span>
        </p>
      </div>
    </div>
  );
}
