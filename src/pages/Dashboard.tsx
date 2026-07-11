import { StatsCards } from "@/components/dashboard/StatsCards";
import { ProviderHealthList } from "@/components/dashboard/ProviderHealthList";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PlatformHealth } from "@/components/dashboard/PlatformHealth";
import { useState, useEffect } from "react";
import { HasPermission } from "@/components/auth/HasPermission";
import { PERM } from "@/types/auth";

export default function Dashboard() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Simulate initial page load of all components
    const timer = setTimeout(() => setIsInitialLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <HasPermission permission={PERM.VIEW_CONNECTIVITY_STATS}>
        <StatsCards isLoading={isInitialLoading} />
      </HasPermission>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          <RecentActivity isLoading={isInitialLoading} />
        </div>

        <div className="xl:col-span-1 flex flex-col gap-6">
          <HasPermission permission={PERM.VIEW_CONNECTIVITY_STATS}>
            <PlatformHealth isLoading={isInitialLoading} />
            <ProviderHealthList />{" "}
            {/* This one manages its own polling/loading */}
          </HasPermission>
        </div>
      </div>
    </div>
  );
}
