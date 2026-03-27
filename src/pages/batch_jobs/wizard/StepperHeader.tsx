import { cn } from "@/lib/utils";

interface StepperHeaderProps {
  currentStep: number;
  steps: { id: number; title: string }[];
}

export function StepperHeader({ currentStep, steps }: StepperHeaderProps) {
  return (
    <div className="flex items-center justify-between relative">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <div
            key={step.id}
            className="relative z-10 flex items-center gap-3 bg-white px-2"
          >
            {/* CIRCLE */}
            <div
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold",
                isCompleted
                  ? "bg-indigo-600 text-white"
                  : isActive
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-300 text-slate-400",
              )}
            >
              {step.id}
            </div>

            {/* LABEL */}
            <span
              className={cn(
                "text-sm font-medium",
                isActive ? "text-slate-900" : "text-slate-500",
              )}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
