import { LayoutDashboard, Plus } from "lucide-react";

export function NavigationBar() {
  return (
    <div className="h-10 border-b border-slate-200 bg-slate-50/50 px-4 flex items-center gap-1">
      <div className="h-full flex items-center px-4 gap-2 bg-white border-x border-t border-slate-200 text-blue-600 text-xs font-semibold rounded-t-sm translate-y-[1px]">
        <LayoutDashboard className="h-3.5 w-3.5" />
        Dashboard
      </div>
      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-md transition-all ml-1">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
