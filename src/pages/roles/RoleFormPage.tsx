import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Permission } from "@/types/roles";
import { roleAndPermissionsService as roleService } from "@/services/roleService";
import { useToastStore } from "@/hooks/useToastStore";

export default function RoleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== "create");

  const [roleName, setRoleName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<number[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const groups = Array.from(new Set(allPermissions.map((p) => p.group)));
  const { showToast } = useToastStore();

  const togglePermission = (id: number) => {
    setSelectedPerms((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const perms = await roleService.getAllPermissions();
        setAllPermissions(perms);

        if (isEdit && id) {
          const roleData = await roleService.getRoleById(id);
          setRoleName(roleData.name);
          setSelectedPerms(roleData.permissions?.map((p: any) => p.id) || []);
        }
      } catch (error: any) {
        showToast("Failed to load role configuration", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!roleName.trim()) {
      showToast("Please enter a role name", "error");
      return;
    }

    const payload = { name: roleName, permissions: selectedPerms };
    try {
      if (isEdit && id) {
        await roleService.updateRole(id, payload);
      } else {
        await roleService.createRole(payload);
      }
      showToast("Role saved successfully", "success");
      navigate("/roles");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to save role", "error");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-slate-400 animate-pulse">
        Loading configuration...
      </div>
    );

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-end justify-between mb-8 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {isEdit ? "Edit Role" : "Create New Role"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure permissions and access levels for this security group.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
          <Save className="h-4 w-4" /> Save Role Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Panel: Identity */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-8">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Role Identity
            </label>
            <input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Operator"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all focus:bg-white"
            />
            <div className="mt-6 pt-6 border-t border-slate-50">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Assigning permissions grants users specific access to system
                modules. Ensure you follow the principle of least privilege.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Permissions Grid */}
        <div className="lg:col-span-3 space-y-8">
          {groups.map((group) => (
            <div
              key={group}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                  {group}
                </h3>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
                  {allPermissions.filter((p) => p.group === group).length}{" "}
                  Options
                </span>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {allPermissions
                  .filter((p) => p.group === group)
                  .map((perm) => (
                    <label
                      key={perm.id}
                      className={cn(
                        "relative flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer group select-none",
                        selectedPerms.includes(perm.id)
                          ? "border-indigo-600 bg-indigo-50/30"
                          : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedPerms.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                      />
                      <div className="flex-1 pr-2">
                        <p
                          className={cn(
                            "text-[11px] font-bold mb-1 transition-colors",
                            selectedPerms.includes(perm.id)
                              ? "text-indigo-900"
                              : "text-slate-700",
                          )}
                        >
                          {perm.label}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono tracking-tight break-all uppercase">
                          {perm.name}
                        </p>
                      </div>
                      {selectedPerms.includes(perm.id) && (
                        <CheckCircle className="h-4 w-4 text-indigo-600 shrink-0" />
                      )}
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
