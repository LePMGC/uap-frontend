import { StatsCards } from "@/components/dashboard/StatsCards";
import { ProviderHealthList } from "@/components/dashboard/ProviderHealthList";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PlatformHealth } from "@/components/dashboard/PlatformHealth";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Simulate initial page load of all components
    const timer = setTimeout(() => setIsInitialLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <StatsCards isLoading={isInitialLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          <RecentActivity isLoading={isInitialLoading} />
        </div>

        <div className="xl:col-span-1 flex flex-col gap-6">
          <PlatformHealth isLoading={isInitialLoading} />
          <ProviderHealthList />{" "}
          {/* This one manages its own polling/loading */}
        </div>
      </div>
    </div>
  );
}
