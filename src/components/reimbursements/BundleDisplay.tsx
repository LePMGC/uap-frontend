// src/components/reimbursements/BundleDisplay.tsx

import { cn } from "@/lib/utils";

export interface BundleDisplayProps {
  name: string;
  offerId: number | string;
  price: string;
  className?: string;
  compact?: boolean;
}

export function BundleDisplay({
  name,
  offerId,
  price,
  className,
  compact = false,
}: BundleDisplayProps) {
  return (
    <span
      className={cn(
        "flex items-center",
        compact ? "gap-2 text-[11px]" : "gap-3 text-xs",
        className,
      )}
    >
      <span className="font-bold text-slate-800 truncate">{name}</span>

      <span className="text-slate-400">|</span>

      <span className="font-mono text-slate-600 whitespace-nowrap">
        #{offerId}
      </span>

      <span className="text-slate-400">|</span>

      <span className="font-semibold text-indigo-600 whitespace-nowrap">
        {price}
      </span>
    </span>
  );
}
