import { useState, useEffect } from "react";
import {
  Globe,
  Plus,
  Link as LinkIcon,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dataSourceService } from "@/services/dataSourceService";

interface APISourceProps {
  data: any;
  updateData: (newData: any) => void;
  onPreview: () => void;
}

export function APISource({ data, updateData, onPreview }: APISourceProps) {
  const [apis, setApis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch API data sources from Laravel on mount
  useEffect(() => {
    const fetchApis = async () => {
      setIsLoading(true);
      try {
        // Fetching with type 'api' and high limit to get all sources
        const response = await dataSourceService.getAll(1, 999, {
          type: "api",
        });

        // Handle Laravel pagination: actual array is in response.data
        const fetchedData = response.data || response || [];
        setApis(fetchedData);
      } catch (error) {
        console.error("Failed to fetch API sources:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApis();
  }, []);

  const config = data.source_config || {
    endpoint: "",
    method: "GET",
    data_path: "",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      {/* SECTION 1: API SERVICE SELECTION */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          1. Select API Service
        </label>
        <div className="relative">
          <select
            disabled={isLoading}
            value={data.source_id || ""}
            onChange={(e) => updateData({ source_id: e.target.value })}
            className={cn(
              "w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-bold bg-white outline-none appearance-none transition-all",
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5",
            )}
          >
            <option value="">
              {isLoading
                ? "Loading API services..."
                : "Choose an API service..."}
            </option>
            {apis.map((api) => (
              <option key={api.id} value={api.id}>
                {/* Updated to use connection_settings.endpoint based on your JSON */}
                {api.name} (
                {api.connection_settings?.endpoint ||
                  api.connection_settings?.host ||
                  "No Endpoint Defined"}
                )
              </option>
            ))}
          </select>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: ENDPOINT CONFIGURATION (Visible only after selection) */}
      {data.source_id ? (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-400">
          <div className="grid grid-cols-4 gap-4">
            {/* HTTP Method */}
            <div className="col-span-1 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Method
              </label>
              <select
                value={config.method}
                onChange={(e) =>
                  updateData({
                    source_config: { ...config, method: e.target.value },
                  })
                }
                className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-bold bg-white outline-none focus:border-indigo-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
              </select>
            </div>

            {/* Path */}
            <div className="col-span-3 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Relative Endpoint
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="/api/v1/users/export"
                  value={config.endpoint}
                  onChange={(e) =>
                    updateData({
                      source_config: { ...config, endpoint: e.target.value },
                    })
                  }
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                />
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* JSON Path */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-slate-400">
                JSON Data Path
              </label>
              <span className="text-[9px] font-bold text-slate-400 italic">
                e.g. data.items
              </span>
            </div>
            <input
              type="text"
              placeholder="data.records"
              value={config.data_path}
              onChange={(e) =>
                updateData({
                  source_config: { ...config, data_path: e.target.value },
                })
              }
              className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-mono outline-none focus:border-indigo-500"
            />
          </div>

          {/* PREVIEW ACTION */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onPreview}
              className="group flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95"
            >
              Test & Preview API
              <Globe className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100">
            <Globe className="h-5 w-5 text-slate-300" />
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center">
            Select an API service above <br /> to configure the endpoint
          </p>
        </div>
      )}
    </div>
  );
}
