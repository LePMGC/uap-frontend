// src/pages/management/CommandDefinitionsPage.tsx
import { useEffect, useState } from "react";
import { commandService } from "@/services/commandService";
import { cn } from "@/lib/utils";
import { CommandGrid } from "@/components/management/CommandGrid";

interface ProviderCategory {
  slug: string;
  request_format: string;
  response_format: string;
  command_count: number;
  command_actions: string[];
}

export default function CommandDefinitionsPage() {
  const [categories, setCategories] = useState<ProviderCategory[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    commandService.getCategories().then((data) => {
      setCategories(data);
      if (data.length > 0) setActiveTab(data[0].slug);
    });
  }, []);

  // Find the current active category object to get its command_actions
  const activeCategory = categories.find((cat) => cat.slug === activeTab);

  // Helper to format slugs like 'ericsson-ucip' to 'ERICSSON UCIP'
  const formatLabel = (slug: string) => slug.replace(/-/g, " ").toUpperCase();

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Dynamic Tabs based on your new Payload */}
      <div className="flex gap-8 border-b border-slate-200 mb-6 mt-6">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveTab(cat.slug)}
            className={cn(
              "flex items-center gap-3 pb-4 text-[11px] font-bold uppercase tracking-tight transition-all border-b-2 relative",
              activeTab === cat.slug
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600",
            )}
          >
            {formatLabel(cat.slug)}

            {/* Command Count Badge */}
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-md text-[9px]",
                activeTab === cat.slug
                  ? "bg-indigo-50 text-indigo-600"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {cat.command_count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid View */}
      {activeTab && (
        <CommandGrid
          key={activeTab}
          categorySlug={activeTab}
          availableActions={activeCategory?.command_actions || []}
        />
      )}
    </div>
  );
}
