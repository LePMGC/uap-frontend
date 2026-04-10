// /var/www/html/uap-frontend/src/components/leap_logs/JourneyTimeline.tsx
import type { LeapJourney } from "@/types/leapLogs";
import { TimelineStep } from "./TimelineStep";

export function JourneyTimeline({ journey }: { journey: LeapJourney }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col">
        {journey.logs.map((step, index) => (
          <TimelineStep
            key={`${journey.app_instance}-step-${index}`}
            step={step}
            isLast={index === journey.logs.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
