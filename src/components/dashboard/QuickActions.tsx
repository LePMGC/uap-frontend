import { useEffect, useState } from "react";
import { Play, Loader2, Settings2 } from "lucide-react";
import { InstanceService } from "@/services/instanceService";
import type { ProviderInstance, Command } from "@/services/instanceService";

export function QuickActions() {
  const [providers, setProviders] = useState<ProviderInstance[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);

  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedCommand, setSelectedCommand] = useState<string>("");

  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [isLoadingCommands, setIsLoadingCommands] = useState(false);

  useEffect(() => {
    const initProviders = async () => {
      setIsLoadingProviders(true);
      try {
        const data = await InstanceService.getInstances();
        if (data && data.length > 0) {
          setProviders(data);
          setSelectedProvider(data[0].id.toString());
        }
      } catch (error) {
        console.error("Failed to load instances:", error);
      } finally {
        setIsLoadingProviders(false);
      }
    };
    initProviders();
  }, []);

  useEffect(() => {
    const loadCommands = async () => {
      if (!selectedProvider) return;
      setIsLoadingCommands(true);
      try {
        const data = await InstanceService.getCommands(selectedProvider);
        setCommands(data ?? []);
        if (data && data.length > 0) {
          setSelectedCommand(data[0].name);
        } else {
          setSelectedCommand("");
        }
      } catch (error) {
        setCommands([]);
      } finally {
        setIsLoadingCommands(false);
      }
    };
    loadCommands();
  }, [selectedProvider]);

  const handleContinue = () => {
    const commandDetails = commands.find((c) => c.name === selectedCommand);
    console.log("Opening configuration for:", commandDetails);
    // Logic to open a modal or navigate to a configuration page goes here
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Settings2 className="h-4 w-4 text-indigo-600" />
          </div>
          <h2 className="font-bold text-slate-800 text-sm whitespace-nowrap">
            Quick Execute
          </h2>
        </div>

        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">
              Provider{" "}
              {isLoadingProviders && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {providers?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5 space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">
              Command{" "}
              {isLoadingCommands && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
            </label>
            <select
              value={selectedCommand}
              onChange={(e) => setSelectedCommand(e.target.value)}
              disabled={commands.length === 0}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
            >
              {commands.length > 0 ? (
                commands.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))
              ) : (
                <option value="">No commands available</option>
              )}
            </select>
          </div>

          <div className="md:col-span-3">
            <button
              onClick={handleContinue}
              disabled={!selectedCommand || isLoadingCommands}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 py-2 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 transition-all"
            >
              Continue <Play className="h-3 w-3 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
