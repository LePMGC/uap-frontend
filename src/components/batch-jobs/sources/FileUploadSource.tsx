import { useRef, useState } from "react";
import { Upload, FileText, X, Loader2, CheckCircle2 } from "lucide-react";
import { batchJobsService } from "@/services/batchJobsService";
import { useToastStore } from "@/hooks/useToastStore"; // Using your existing toast hook
import { cn } from "@/lib/utils";

export function FileUploadSource({ data, updateData }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { showToast } = useToastStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local validation for 10MB limit
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
        // Populate preview for the DataPreviewPanel
        preview: {
          fileName: file.name,
          headers: response.headers,
          schema: response.preview,
        },
      });

      showToast(`Successfully analyzed ${file.name}`, "success");
    } catch (error: any) {
      console.error("Analysis Error:", error);
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

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".csv,.txt,.xlsx"
        onChange={handleFileChange}
      />

      {data.preview ? (
        /* FILE ATTACHED STATE */
        <div className="w-full max-w-md animate-in zoom-in-95 duration-300">
          <div className="group relative flex items-center gap-4 bg-white p-5 rounded-[2rem] border-2 border-indigo-50 shadow-sm hover:border-indigo-100 transition-all">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <FileText className="h-7 w-7" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">
                {data.preview.fileName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">
                  Schema Sync Complete
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        /* UPLOAD TARGET STATE */
        <div
          onClick={() => !isAnalyzing && fileInputRef.current?.click()}
          className={cn(
            "w-full max-w-md p-10 border-2 border-dashed rounded-[3rem] transition-all cursor-pointer flex flex-col items-center space-y-4",
            isAnalyzing
              ? "border-indigo-300 bg-indigo-50/30"
              : "border-slate-200 bg-slate-50/50 hover:border-indigo-400 hover:bg-white group",
          )}
        >
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border transition-all bg-white",
              isAnalyzing
                ? "border-indigo-100"
                : "border-slate-100 group-hover:scale-110",
            )}
          >
            {isAnalyzing ? (
              <Loader2 className="h-7 w-7 text-indigo-600 animate-spin" />
            ) : (
              <Upload className="h-7 w-7 text-indigo-600 group-hover:-translate-y-1 transition-transform" />
            )}
          </div>

          <div className="text-center">
            <h4 className="text-sm font-black text-slate-700 uppercase tracking-tight">
              {isAnalyzing ? "Analyzing File..." : "Choose Data Source"}
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              {isAnalyzing
                ? "Extracting headers and preview rows"
                : "Click to browse CSV or Excel"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
