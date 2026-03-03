export function ActiveBatches() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <h2 className="font-bold text-slate-800 text-base">Active Batches</h2>
        <button className="text-blue-600 text-xs font-semibold hover:underline">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Job Name / Schedule</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Progress</th>
              <th className="px-6 py-3 text-right">Timing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-bold text-slate-900">
                  February Promo Campaign
                </p>
                <p className="text-[11px] text-slate-400">One-time Schedule</p>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse" />
                  Processing
                </span>
              </td>
              <td className="px-6 py-4 w-64">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: "65%" }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700">65%</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <p className="font-bold text-slate-900">ETA: ~12m</p>
                <p className="text-[11px] text-slate-400">Started 14:30</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
