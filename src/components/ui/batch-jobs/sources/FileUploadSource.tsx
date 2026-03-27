import { Upload, FileText, X } from "lucide-react";

export function FileUploadSource({ data, updateData, onPreview }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
      {data.preview ? (
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm transition-all">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {data.preview.fileName}
            </p>
            <p className="text-[10px] text-green-600 font-black uppercase tracking-wider">
              Verified Source
            </p>
          </div>
          <button
            onClick={() => updateData({ preview: null })}
            className="ml-4 p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
            <Upload className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-700">
              Click to upload or drag and drop
            </p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              CSV, JSON, or Excel (max. 50MB)
            </p>
          </div>
          <button
            onClick={onPreview}
            className="px-8 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
          >
            Select File
          </button>
        </>
      )}
    </div>
  );
}
