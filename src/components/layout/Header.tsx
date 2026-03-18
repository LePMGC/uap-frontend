import { Search, Bell, Settings } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-10 px-6 flex items-center justify-between min-w-0 overflow-hidden">
      {/* Search Bar - flex-shrink allowed here */}
      <div className="relative w-96 min-w-[200px] flex-shrink">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          placeholder="Search MSISDN, Batch Name, Run ID..."
          className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 border border-slate-200 px-1.5 py-0.5 rounded uppercase shrink-0">
          OK
        </div>
      </div>

      {/* Global Indicators - shrink-0 prevents these from disappearing */}
      <div className="flex items-center gap-6 shrink-0 ml-4">
        <div className="hidden md:flex items-center gap-4 border-r border-slate-200 pr-6 mr-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-tight whitespace-nowrap">
              System Operational
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
          </button>
          <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
