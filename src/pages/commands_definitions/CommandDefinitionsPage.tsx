// src/pages/management/CommandDefinitionsPage.tsx
import { useEffect, useState } from "react";
import { commandService } from "@/services/commandService";
import { cn } from "@/lib/utils";
import { CommandGrid } from "@/components/management/CommandGrid";
import { useAuthStore } from "@/store/authStore";
import { PERM } from "@/types/auth";

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

  // Extract user authorization scopes
  const userPermissions = useAuthStore(
    (state) => state.user?.permissions || [],
  );

  /**
   * Safe mapping helper to link server slug variations
   * to our specific static PERM configuration keys.
   */
  const checkCategoryPermission = (slug: string): boolean => {
    const cleanSlug = slug.toLowerCase();
    if (cleanSlug.includes("ucip")) {
      return userPermissions.includes(PERM.ERICSSON_UCIP.VIEW);
    }
    if (cleanSlug.includes("cai")) {
      return userPermissions.includes(PERM.ERICSSON_CAI.VIEW);
    }
    if (cleanSlug.includes("smpp")) {
      return userPermissions.includes(PERM.SMPP.VIEW);
    }
    // Fallback security rule: permit generic categories if VIEW_ALL_COMMANDS exists
    return userPermissions.includes(PERM.VIEW_ALL_COMMANDS);
  };

  useEffect(() => {
    commandService.getCategories().then((data) => {
      // Filter out protocol categories the user does not have specific clearance to see
      const allowedCategories = data.filter((cat: ProviderCategory) =>
        checkCategoryPermission(cat.slug),
      );

      setCategories(allowedCategories);
      if (allowedCategories.length > 0) {
        setActiveTab(allowedCategories[0].slug);
      }
    });
  }, [userPermissions]);

  const activeCategory = categories.find((cat) => cat.slug === activeTab);
  const formatLabel = (slug: string) => slug.replace(/-/g, " ").toUpperCase();

  if (categories.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-400 font-medium animate-in fade-in">
        You do not possess permission parameters to view any command protocols.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
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
