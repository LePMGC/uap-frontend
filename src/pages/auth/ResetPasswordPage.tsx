import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Circle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  // 1. EXTRA VALIDATION: New must be different from Current
  const isDifferentFromCurrent =
    formData.new_password !== "" &&
    formData.new_password !== formData.current_password;

  const validations = useMemo(
    () => ({
      minLength: formData.new_password.length >= 8,
      hasUpper: /[A-Z]/.test(formData.new_password),
      hasNumber: /[0-9]/.test(formData.new_password),
      hasSpecial: /[^A-Za-z0-9]/.test(formData.new_password),
    }),
    [formData.new_password],
  );

  const strengthScore = Object.values(validations).filter(Boolean).length;

  const isMatch =
    formData.new_password === formData.new_password_confirmation &&
    formData.new_password !== "";

  // 2. Updated global validation check
  const isValid =
    Object.values(validations).every(Boolean) &&
    isMatch &&
    isDifferentFromCurrent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(null);

    try {
      await authService.changePassword(
        formData.current_password,
        formData.new_password,
        formData.new_password_confirmation,
      );
      logout();
      navigate("/login?reset=success");
    } catch (err: unknown) {
      // Type guard to check if it's an object with the expected Axios shape
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as any; // Cast locally once verified
        const beMessage = axiosError.response?.data?.message;
        setError(beMessage || "Server error");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-[#111827] rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">UA</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#111827]">
            Security Update
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Please update your temporary password.
          </p>
        </div>

        <Card className="border-slate-200 shadow-md rounded-xl bg-white">
          <CardContent className="pt-8 pb-8 px-6">
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="current_password"
                    type={showPass.current ? "text" : "password"}
                    className="pl-10 h-11"
                    value={formData.current_password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_password: e.target.value,
                      })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPass({ ...showPass, current: !showPass.current })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="new_password"
                    type={showPass.new ? "text" : "password"}
                    className={cn(
                      "pl-10 h-11",
                      formData.new_password &&
                        !isDifferentFromCurrent &&
                        "border-red-300 bg-red-50",
                    )}
                    value={formData.new_password}
                    onChange={(e) =>
                      setFormData({ ...formData, new_password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPass({ ...showPass, new: !showPass.new })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* 4. NEW VALIDATION UI: Must be different */}
                {formData.new_password && !isDifferentFromCurrent && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                    <XCircle className="h-3 w-3" /> New password must be
                    different from current
                  </p>
                )}

                {/* Strength Meter Bar */}
                <div className="flex gap-1.5 pt-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-all duration-300",
                        step <= strengthScore
                          ? strengthScore <= 2
                            ? "bg-red-500"
                            : strengthScore === 3
                              ? "bg-amber-500"
                              : "bg-green-500"
                          : "bg-slate-100",
                      )}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-y-2 pt-2">
                  <ValidationItem
                    satisfied={validations.minLength}
                    label="Min. 8 characters"
                  />
                  <ValidationItem
                    satisfied={validations.hasUpper}
                    label="Uppercase letter"
                  />
                  <ValidationItem
                    satisfied={validations.hasNumber}
                    label="At least 1 number"
                  />
                  <ValidationItem
                    satisfied={validations.hasSpecial}
                    label="Special character"
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="new_password_confirmation">
                    Confirm Password
                  </Label>
                  {formData.new_password_confirmation && (
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase",
                        isMatch ? "text-green-600" : "text-red-500",
                      )}
                    >
                      {isMatch ? "Match" : "No Match"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="new_password_confirmation"
                    type={showPass.confirm ? "text" : "password"}
                    className={cn(
                      "pl-10 h-11",
                      formData.new_password_confirmation &&
                        !isMatch &&
                        "border-red-300 bg-red-50",
                    )}
                    value={formData.new_password_confirmation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        new_password_confirmation: e.target.value,
                      })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPass({ ...showPass, confirm: !showPass.confirm })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-[#111827] mt-4 font-bold shadow-lg shadow-slate-200"
                disabled={loading || !isValid}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ValidationItem({
  satisfied,
  label,
}: {
  satisfied: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {satisfied ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Circle className="h-3.5 w-3.5 text-slate-300" />
      )}
      <span
        className={cn(
          "text-xs transition-colors",
          satisfied ? "text-slate-700 font-medium" : "text-slate-400",
        )}
      >
        {label}
      </span>
    </div>
  );
}
