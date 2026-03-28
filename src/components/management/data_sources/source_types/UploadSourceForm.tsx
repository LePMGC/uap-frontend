export function UploadSourceForm({ settings, updateField }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-top-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        File Storage Path
      </label>
      <input
        value={settings.file_path || ""}
        onChange={(e) => updateField("file_path", e.target.value)}
        className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
        placeholder="uploads/my_file.csv"
      />
      <p className="mt-3 text-[11px] text-slate-500 bg-slate-100 p-3 rounded-lg border border-slate-200 leading-relaxed">
        <b>Note:</b> For manual uploads, ensure the file is physically present
        in the server storage directory before running the job.
      </p>
    </div>
  );
}
