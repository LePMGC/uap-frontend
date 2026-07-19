import { AlertTriangle, XCircle } from "lucide-react";

interface FailedCheck {
  name: string;
  status: string;
  status_type: string;
  message?: string | null;
}

interface FailedModalProps {
  isOpen: boolean;
  checks: FailedCheck[];
  onClose: () => void;
}

export function FailedModal({ isOpen, checks, onClose }: FailedModalProps) {
  if (!isOpen) return null;

  const failedChecks = checks.filter((check) => check.status_type === "danger");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle className="text-red-600 h-6 w-6" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Batch Job Cannot Be Created
            </h2>

            <p className="text-sm text-slate-500">
              Platform prerequisites are not satisfied.
            </p>
          </div>
        </div>

        {/* Failed checks */}
        <div className="px-6 py-5 space-y-3">
          {failedChecks.map((check, index) => (
            <div
              key={index}
              className="border border-red-200 bg-red-50 rounded-lg p-4"
            >
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />

                <span className="font-medium text-red-800">{check.name}</span>
              </div>

              <div className="mt-2 text-sm text-slate-700">
                <div>
                  Status:
                  <span className="ml-1 font-medium">{check.status}</span>
                </div>

                {check.message && (
                  <div className="mt-1 text-red-700">{check.message}</div>
                )}
              </div>
            </div>
          ))}

          <div className="text-sm text-slate-500 mt-4">
            Please resolve the above issue and try again.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="
              px-5 py-2
              rounded-lg
              bg-slate-900
              text-white
              text-sm
              hover:bg-slate-800
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
