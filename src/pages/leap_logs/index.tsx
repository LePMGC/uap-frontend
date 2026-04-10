import { useEffect } from "react";
import { JourneyList } from "@/components/leap_logs/JourneyList";
import { JourneyTimeline } from "@/components/leap_logs/JourneyTimeline";
import { LogInputZone } from "@/components/leap_logs/LogInputZone";
import { useLeapStore } from "@/store/useLeapStore";
import { Search, Activity, Loader2, FileText } from "lucide-react";

export default function LeapJourneyPage() {
  // Destructure setJourneys and setSelectedTid to reset them
  const { journeys, selectedTid, isLoading, setJourneys, setSelectedTid } =
    useLeapStore();

  // 1. Reset the view when the page is first opened (mount)
  useEffect(() => {
    if (setJourneys) setJourneys([]);
    if (setSelectedTid) setSelectedTid(null);
  }, []);

  const selectedIndex = selectedTid ? parseInt(selectedTid, 10) : -1;
  const selectedJourney = journeys[selectedIndex];

  // 2. Strict check for data
  const hasData = journeys && journeys.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-104px)] bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Leap Journey Visualizer
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              )}
            </h1>
            <p className="text-xs text-slate-500">
              Paste raw logs to trace transaction flows across nodes.
            </p>
          </div>
        </div>
        {/* The InputZone handles the actual parsing and store population */}
        <LogInputZone />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {hasData ? (
          <>
            <aside className="w-80 border-r border-slate-200 bg-white overflow-y-auto">
              <JourneyList />
            </aside>

            <main className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
              {selectedJourney ? (
                <JourneyTimeline journey={selectedJourney} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-slate-200" />
                  </div>
                  <p className="text-sm font-medium">
                    Select a segment to view details
                  </p>
                </div>
              )}
            </main>
          </>
        ) : (
          /* 3. This view shows when journeys is empty (initial state) */
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 p-8">
            <div className="max-w-md text-center">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 mx-auto">
                <FileText className="h-10 w-10 text-slate-300" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">
                Ready to Visualise
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Enter your raw Leap logs above and click "Parse Logs" to see the
                execution flow.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
