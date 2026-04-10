import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { StepperHeader } from "./StepperHeader";
import { cn } from "@/lib/utils";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2DataMapping } from "./Step2DataMapping";
import { Step3Scheduling } from "./Step3Scheduling";
import { Step4Review } from "./Step4Review";
import { SuccessModal } from "@/components/batch-jobs/SuccessModal";
import { useToastStore } from "@/hooks/useToastStore";
import { commandService } from "@/services/commandService";
import { batchJobsService } from "@/services/batchJobsService";

export default function CreateBatchJobPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdJobId, setCreatedJobId] = useState("");
  const [commandParams, setCommandParams] = useState([]);
  const { showToast } = useToastStore();

  const [formData, setFormData] = useState({
    name: "",
    provider_instance_id: "",
    provider_name: "",
    command_id: "",
    command_name: "",
    source_type: "upload",
    source_config: {} as any,
    column_mapping: {} as Record<string, string>,
    is_scheduled: false,
    cron_expression: "",
    starts_at: "", // Added to resolve TS2339
    ends_at: "", // Added to resolve TS2339
    step1Valid: false,
    step2Valid: false,
    step3Valid: false,
  });

  const steps = [
    { id: 1, title: "Setup Source" },
    { id: 2, title: "Data Mapping" },
    { id: 3, title: "Schedule" },
    { id: 4, title: "Review" },
  ];

  const handleNext = async () => {
    if (currentStep === 1) {
      try {
        const response = await commandService.getOneCommand(
          formData.command_id,
        );
        setCommandParams(response.mapping_blueprint);
        setCurrentStep(2);
      } catch (error) {
        showToast("Failed to load command parameters", "error");
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleFinalize = async () => {
    try {
      // 1. Correctly extract dynamic column names from the new mapping structure
      const dynamicColumns = Object.values(
        formData.column_mapping as Record<string, any>,
      )
        .filter((mapping) => mapping.mode === "dynamic" && mapping.value)
        .map((mapping) => mapping.value);

      const payload = {
        name: formData.name,
        provider_instance_id: formData.provider_instance_id,
        data_source_id: 1,
        command_id: formData.command_id,
        job_specific_config: {
          command: formData.command_name,
        },

        // Use the extracted dynamic columns here
        expected_columns: dynamicColumns,

        column_mapping: formData.column_mapping,
        source_config: formData.source_config,
        is_scheduled: formData.is_scheduled,

        ...(formData.is_scheduled && {
          cron_expression: formData.cron_expression,
          starts_at: formData.starts_at,
          ends_at: formData.ends_at,
          timezone: "UTC",
        }),
      };

      // 2. Call the backend service
      const response = await batchJobsService.create(payload);

      // 3. Handle success - Match the "template" and "instance_id" keys from your BE
      if (response.template || response.id) {
        // Use template.id from your new BE response
        const newId = response.template?.id || response.id;

        setCreatedJobId(newId);
        setIsSuccessModalOpen(true);
        //showToast("Batch job created successfully", "success");
      } else if (response.id || response.uuid) {
        // Fallback if your service already returns the inner data
        setCreatedJobId(response.id || response.uuid);
        setIsSuccessModalOpen(true);
      }
    } catch (error: any) {
      console.error("Creation failed:", error);
      showToast(
        error.response?.data?.message || "Failed to create batch job",
        "error",
      );
    }
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Create Batch Job
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure data source mapping and execution schedule.
        </p>
      </div>

      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <StepperHeader currentStep={currentStep} steps={steps} />
      </div>

      <div className="p-8">
        <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="p-8 w-full">
            {currentStep === 1 && (
              <Step1BasicInfo
                data={formData}
                updateData={updateFormData}
                onConfirm={handleNext}
              />
            )}
            {currentStep === 2 && (
              <Step2DataMapping
                data={formData}
                commandParameters={commandParams}
                updateData={updateFormData}
              />
            )}
            {currentStep === 3 && (
              <Step3Scheduling data={formData} updateData={updateFormData} />
            )}
            {currentStep === 4 && (
              <Step4Review
                data={formData}
                goToStep={(stepNumber) => setCurrentStep(stepNumber)}
              />
            )}
          </div>

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
                onClick={currentStep === 4 ? handleFinalize : handleNext}
                disabled={
                  (currentStep === 1 && !formData.step1Valid) || // 👈 Use step1Valid here
                  (currentStep === 2 && !formData.step2Valid) ||
                  (currentStep === 3 && !formData.step3Valid)
                }
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all",
                  (currentStep === 1 && !formData.step1Valid) || // 👈 And here
                    (currentStep === 2 && !formData.step2Valid) ||
                    (currentStep === 3 && !formData.step3Valid)
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700",
                )}
              >
                {currentStep === 4 ? "Finalize & Launch" : "Next Step"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <SuccessModal
        isOpen={isSuccessModalOpen}
        jobId={createdJobId}
        jobName={formData.name}
      />
    </div>
  );
}
