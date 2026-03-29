import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { StepperHeader } from "./StepperHeader";
import { cn } from "@/lib/utils";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2DataMapping } from "./Step2DataMapping";
import { Step3Scheduling } from "./Step3Scheduling";
import { Step4Review } from "./Step4Review";
import { SuccessModal } from "@/components/batch-jobs/SuccessModal";

export default function CreateBatchJobPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdJobId, setCreatedJobId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    provider_instance_id: "",
    command_id: "",
    source_type: "upload",
    source_config: {},
    column_mapping: {},
    is_scheduled: false,
    cron_expression: "",
  });

  const steps = [
    { id: 1, title: "Setup Source" },
    { id: 2, title: "Data Mapping" },
    { id: 3, title: "Schedule" },
    { id: 4, title: "Review" },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // 🟢 HANDLE FINALIZATION
      handleFinalize();
    }
  };

  const handleFinalize = async () => {
    const mockUuid = crypto.randomUUID();
    setCreatedJobId(mockUuid);
    setIsSuccessModalOpen(true);
  };
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 🔵 HEADER */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Create Batch Job
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure data source mapping and execution schedule.
        </p>
      </div>

      {/* 🔵 STEPPER (FULL WIDTH) */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <StepperHeader currentStep={currentStep} steps={steps} />
      </div>

      {/* 🔵 MAIN CONTENT */}
      <div className="p-8">
        <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm">
          {/* CONTENT */}
          <div className="p-8 w-full">
            {currentStep === 1 && (
              <Step1BasicInfo
                data={formData}
                updateData={(newData) =>
                  setFormData({ ...formData, ...newData })
                }
                onConfirm={handleNext}
              />
            )}
            {currentStep === 2 && (
              <Step2DataMapping data={formData} updateData={updateFormData} />
            )}
            {currentStep === 3 && (
              <Step3Scheduling data={formData} updateData={updateFormData} />
            )}

            {/* FIX: Explicitly pass the goToStep function */}
            {currentStep === 4 && (
              <Step4Review
                data={formData}
                goToStep={(stepNumber) => setCurrentStep(stepNumber)}
              />
            )}
          </div>

          {/* FOOTER */}
          <div className="px-8 py-5 border-t border-slate-200 flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                currentStep === 1
                  ? "text-slate-300 cursor-not-allowed"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
            >
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>

              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-indigo-700"
              >
                {currentStep === 4 ? "Finalize & Launch" : "Next Step"}
                {currentStep === 4 ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Add the Modal Component */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        jobId={createdJobId}
        jobName={formData.name}
      />
    </div>
  );
}
