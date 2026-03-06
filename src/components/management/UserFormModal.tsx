import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Shield,
  CheckCircle2,
  ShieldCheck,
  UserCog,
  Eye,
  AlertCircle,
  Phone,
  Mail,
  Copy,
  Check,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { roleAndPermissionsService } from "@/services/roleService";
import { userService } from "@/services/userService";
import { useToastStore } from "@/hooks/useToastStore";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialData?: any;
  onSuccess?: () => void;
}

const ROLE_UI_MAP: Record<string, { desc: string; icon: React.ReactNode }> = {
  admin: {
    desc: "Full access to manage users, security, and system settings.",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  operator: {
    desc: "Can manage daily operations and resource configurations.",
    icon: <UserCog className="h-5 w-5" />,
  },
  viewer: {
    desc: "Read-only access to monitoring and reporting tools.",
    icon: <Eye className="h-5 w-5" />,
  },
};

export default function UserFormModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSuccess,
}: UserFormModalProps) {
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone_number: "",
  });

  // UI States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<any[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | string>("");
  const [, setApiGeneralError] = useState<string | null>(null);

  // Success Screen State
  const [successData, setSuccessData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToastStore();

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      if (mode === "edit" && initialData) {
        setFormData({
          name: initialData.name || "",
          username: initialData.username || "",
          email: initialData.email || "",
          phone_number: initialData.phone_number || "",
        });
        setSelectedRoleId(initialData.role_id || "");
      }
    } else {
      // Complete Reset on Close
      setFormData({ name: "", username: "", email: "", phone_number: "" });
      setErrors({});
      setSuccessData(null);
      setCopied(false);
      setIsSubmitting(false);
    }
  }, [isOpen, mode, initialData]);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const resp = await roleAndPermissionsService.getAllRoles(); // PaginatedResponse<Role>
      setRoles(resp.data); // set the state – no reassignment
      if (mode === "create" && resp.data.length > 0) {
        setSelectedRoleId(resp.data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch roles", error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.phone_number.trim())
      newErrors.phone_number = "Phone number is required";

    const parsedRoleId =
      typeof selectedRoleId === "string"
        ? parseInt(selectedRoleId, 10)
        : selectedRoleId;
    if (parsedRoleId == null || Number.isNaN(parsedRoleId))
      newErrors.role = "Please select a role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (!isOpen) setApiGeneralError(null);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiGeneralError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const roleId =
        typeof selectedRoleId === "string"
          ? parseInt(selectedRoleId, 10)
          : selectedRoleId;

      const payload = { ...formData, role_id: roleId as number };

      if (mode === "edit" && initialData) {
        // --- EDIT MODE LOGIC ---
        await userService.updateUser(initialData.id, payload);

        showToast(
          `${formData.name}'s profile has been updated successfully.`,
          "success",
        );
        onSuccess?.(); // Refresh the grid
        onClose(); // Close modal immediately for edit
      } else {
        // --- CREATE MODE LOGIC ---
        const response = await userService.createUser(payload);
        setSuccessData(response); // This triggers the password success screen
        onSuccess?.(); // Refresh grid in background
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const backendErrors = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        Object.keys(backendErrors).forEach((key) => {
          formattedErrors[key] = backendErrors[key][0];
        });
        setErrors(formattedErrors);
      } else {
        const msg =
          error.response?.data?.message ||
          "Operation failed. Please try again.";
        setApiGeneralError(msg);
        showToast(msg, "error"); // Also show toast for visibility
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (!isOpen) return null;

  // --- SUCCESS STATE VIEW ---
  if (successData) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              User Created Successfully
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              The account for{" "}
              <span className="font-bold text-slate-700">
                {successData.user?.name}
              </span>{" "}
              is ready. Share the credentials below securely.
            </p>

            <div className="mt-8 space-y-4">
              {/* Username Display */}
              <div className="text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Username
                </label>
                <div className="mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-slate-700 text-sm">
                  {successData.user?.username}
                </div>
              </div>

              {/* Password Display & Copy */}
              <div className="text-left relative group">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Temporary Password
                </label>
                <div className="mt-1 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl relative overflow-hidden">
                  <p className="text-lg font-mono font-bold text-indigo-600 pr-10">
                    {successData.temporary_password || "NoPasswordReturn"}
                  </p>
                  <button
                    onClick={() => handleCopy(successData.temporary_password)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-90"
                    title="Copy Password"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </div>
                {copied && (
                  <span className="absolute -top-1 right-0 text-[10px] font-bold text-green-600 animate-bounce">
                    Copied!
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
            >
              Done, Return to List <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- STANDARD FORM VIEW ---
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {mode === "create" ? "Add New Member" : "Edit Member Details"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Passwords are automatically generated for new members.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <form id="user-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <User className="h-3.5 w-3.5" /> Personal Information
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="e.g. Jane Doe"
                  icon={<User className="h-3.5 w-3.5" />}
                />
                <InputField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  placeholder="j.doe"
                  icon={<User className="h-3.5 w-3.5" />}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="name@company.com"
                  icon={<Mail className="h-3.5 w-3.5" />}
                />
                <InputField
                  label="Phone Number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  error={errors.phone_number}
                  placeholder="+242..."
                  icon={<Phone className="h-3.5 w-3.5" />}
                />
              </div>
            </div>

            {/* Section 2: Role Assignment */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Shield className="h-3.5 w-3.5" /> Role Assignment
                </div>
                {loadingRoles && (
                  <span className="text-[10px] text-indigo-500 font-bold animate-pulse">
                    Refreshing Roles...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roles.map((role) => {
                  const isSelected = selectedRoleId === role.id;
                  const ui = ROLE_UI_MAP[role.name.toLowerCase()] || {
                    desc: "Standard platform access.",
                    icon: <Shield className="h-5 w-5" />,
                  };

                  return (
                    <label
                      key={role.id}
                      className="relative cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="role"
                        className="peer sr-only"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedRoleId(role.id);
                          setErrors((prev) => ({ ...prev, role: "" }));
                        }}
                      />
                      <div
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all flex items-start gap-4",
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/40 shadow-sm"
                            : "border-slate-100 bg-white hover:border-slate-200",
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 transition-colors",
                            isSelected
                              ? "bg-white border-indigo-100 text-indigo-600"
                              : "bg-slate-50 border-slate-100 text-slate-400",
                          )}
                        >
                          {ui.icon}
                        </div>
                        <div className="flex-1 pr-6">
                          <p className="text-sm font-bold text-slate-900 leading-none">
                            {capitalize(role.name)}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                            {ui.desc}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "absolute top-4 right-4 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                            isSelected
                              ? "border-indigo-600 bg-indigo-600"
                              : "border-slate-200",
                          )}
                        >
                          <CheckCircle2
                            className={cn(
                              "h-3.5 w-3.5 text-white transition-opacity",
                              isSelected ? "opacity-100" : "opacity-0",
                            )}
                          />
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.role && (
                <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.role}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="user-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-indigo-600 rounded-lg text-sm font-bold text-white hover:bg-indigo-700 shadow-md active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : mode === "create" ? (
              "Create User"
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Sub-Component
function InputField({ label, error, icon, ...props }: any) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-xs font-bold text-slate-700">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={cn(
            "w-full py-2.5 bg-slate-50 border rounded-lg text-sm outline-none transition-all focus:ring-2",
            icon ? "pl-10 pr-4" : "px-4",
            error
              ? "border-red-300 focus:ring-red-500/10 bg-red-50/20"
              : "border-slate-200 focus:ring-indigo-500/20",
          )}
        />
      </div>
      {error && (
        <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}
