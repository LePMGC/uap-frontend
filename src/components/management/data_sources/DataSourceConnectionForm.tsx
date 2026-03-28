import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { APISourceForm } from "./source_types/APISourceForm";
import { DatabaseSourceForm } from "./source_types/DatabaseSourceForm";
import { SFTPSourceForm } from "./source_types/SFTPSourceForm";
import { UploadSourceForm } from "./source_types/UploadSourceForm";

interface Props {
  type: string;
  settings: any;
  onChange: (settings: any) => void;
}

export function DataSourceConnectionForm({
  type,
  settings = {},
  onChange,
}: Props) {
  useEffect(() => {
    if (type === "database" && !settings.driver) updateField("driver", "mysql");
    if (type === "sftp" && !settings.port) updateField("port", 22);
  }, [type]);

  const updateField = (field: string, value: any) => {
    onChange({ ...settings, [field]: value });
  };

  const updateNestedField = (parent: string, key: string, value: any) => {
    const parentObj = settings[parent] || {};
    onChange({ ...settings, [parent]: { ...parentObj, [key]: value } });
  };

  const removeNestedField = (parent: string, key: string) => {
    const parentObj = { ...settings[parent] };
    delete parentObj[key];
    onChange({ ...settings, [parent]: parentObj });
  };

  const renderKeyValueEditor = (title: string, parentKey: string) => {
    const items = settings[parentKey] || {};
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {title}
          </label>
          <button
            type="button"
            onClick={() =>
              updateNestedField(parentKey, "new_key_" + Date.now(), "")
            }
            className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors"
          >
            <Plus className="h-3 w-3" /> Add Item
          </button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {Object.entries(items).map(([k, v], idx) => (
            <div key={idx} className="flex gap-2">
              <input
                value={k}
                onChange={(e) => {
                  const newObj = { ...items };
                  delete newObj[k];
                  newObj[e.target.value] = items[k];
                  onChange({ ...settings, [parentKey]: newObj });
                }}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono outline-none"
                placeholder="Key"
              />
              <input
                value={v as string}
                onChange={(e) =>
                  updateNestedField(parentKey, k, e.target.value)
                }
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                placeholder="Value"
              />
              <button
                onClick={() => removeNestedField(parentKey, k)}
                className="p-2 text-slate-300 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Rendering logic
  return (
    <div>
      {type === "api" && (
        <APISourceForm
          settings={settings}
          updateField={updateField}
          renderKeyValueEditor={renderKeyValueEditor}
        />
      )}
      {type === "database" && (
        <DatabaseSourceForm settings={settings} updateField={updateField} />
      )}
      {type === "sftp" && (
        <SFTPSourceForm settings={settings} updateField={updateField} />
      )}
      {type === "upload" && (
        <UploadSourceForm settings={settings} updateField={updateField} />
      )}

      {!["api", "database", "sftp", "upload"].includes(type) && (
        <div className="py-20 text-center text-slate-400 italic border-2 border-dashed border-slate-100 rounded-2xl">
          Select a source type to begin configuration
        </div>
      )}
    </div>
  );
}
