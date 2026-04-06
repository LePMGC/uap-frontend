import { useRef, useState } from "react";
import {
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  Download,
  Table as TableIcon,
} from "lucide-react";
import { batchJobsService } from "@/services/batchJobsService";
import { useToastStore } from "@/hooks/useToastStore";
import { cn } from "@/lib/utils";

export function FileUploadSource({ data, updateData }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { showToast } = useToastStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast("File too large. Max 10MB allowed.", "error");
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("number_of_rows", "10");

    try {
      const response = await batchJobsService.discoverSchema(formData);
      updateData({
        source_type: "upload",
        source_config: {
          temporary_path: response.temporary_path,
          original_name: file.name,
        },
        preview: {
          fileName: file.name,
          headers: response.headers,
          schema: response.preview,
        },
      });
      showToast(`Successfully analyzed ${file.name}`, "success");
    } catch (error: any) {
      showToast(
        error.response?.data?.error || "Could not read file schema.",
        "error",
      );
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = () => {
    updateData({ preview: null, source_config: {} });
    showToast("File removed", "success");
  };

  const downloadSample = async () => {
    try {
      showToast("Preparing your template...", "success");

      await batchJobsService.downloadSampleInputFile();
    } catch (error) {
      showToast("Failed to download sample file.", "error");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".csv,.txt,.xlsx"
        onChange={handleFileChange}
      />

      {data.preview ? (
        /* COMPACT ATTACHED STATE */
        <div className="flex justify-center">
          <div className="w-full max-w-md group relative flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-indigo-50 shadow-sm transition-all">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">
                {data.preview.fileName}
              </p>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                  Ready
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 items-stretch">
          {/* UPLOAD TARGET - ROW LAYOUT */}
          <div
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
            className={cn(
              "flex items-center gap-4 p-4 border-2 border-dashed rounded-2xl transition-all cursor-pointer",
              isAnalyzing
                ? "border-indigo-300 bg-indigo-50/30"
                : "border-slate-200 bg-slate-50/50 hover:border-indigo-400 hover:bg-white group",
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border transition-all bg-white shrink-0",
                isAnalyzing
                  ? "border-indigo-100"
                  : "border-slate-100 group-hover:scale-105",
              )}
            >
              {isAnalyzing ? (
                <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
              ) : (
                <Upload className="h-6 w-6 text-indigo-600 group-hover:-translate-y-0.5 transition-transform" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-tight truncate">
                {isAnalyzing ? "Analyzing..." : "Choose Data Source"}
              </h4>
              <p className="text-[10px] text-slate-400 font-medium leading-tight line-clamp-1">
                CSV or Excel (Max 10MB)
              </p>
            </div>
          </div>

          {/* SAMPLE FILE REFERENCE - MATCHED HEIGHT */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                <TableIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                  Template
                </p>
                <p className="text-[10px] text-slate-400 font-medium leading-tight truncate">
                  Download sample.csv
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadSample();
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-black text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              SAMPLE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
