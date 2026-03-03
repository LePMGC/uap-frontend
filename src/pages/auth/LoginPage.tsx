import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Terminal,
  Cpu,
  Server,
  Database,
  Webhook,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [searchParams] = useSearchParams();

  // URL Params for status messages
  const sessionExpired = searchParams.get("error") === "session_expired";
  const resetSuccess = searchParams.get("reset") === "success";

  // UI States
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const data = await authService.login(username, password);

      // 1. Save credentials to global state
      setAuth(
        data.user,
        data.access_token,
        data.refresh_token,
        data.must_change_password,
      );

      // 2. Conditional Redirect
      if (data.must_change_password) {
        navigate("/reset-password");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      // FIX: Extract the string message from the Axios error object
      // This prevents the "Objects are not valid as React child" error
      const message =
        err.response?.data?.message ||
        err.message ||
        "Authentication failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-[400px]">
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-[#111827] rounded-xl flex items-center justify-center mb-4 shadow-sm">
            <span className="text-white font-bold text-xl">UA</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#111827]">
            Sign in to UAP
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Enter your credentials to access the platform.
          </p>
        </div>

        {/* Alert Messaging Stack */}
        <div className="space-y-3 mb-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {sessionExpired && !error && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-700 text-sm animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="font-medium">
                Your session has expired. Please log in again.
              </p>
            </div>
          )}

          {resetSuccess && !error && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3 text-green-700 text-sm animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <p className="font-medium">
                Password updated successfully. Please sign in.
              </p>
            </div>
          )}
        </div>

        {/* Login Card */}
        <Card className="border-slate-200 shadow-md rounded-xl overflow-hidden bg-white">
          <CardContent className="pt-8 pb-8 px-6">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-slate-700 font-medium ml-1"
                >
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    className="pl-10 h-11 border-slate-200 focus:ring-slate-100"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label
                    htmlFor="password"
                    className="text-slate-700 font-medium"
                  >
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 border-slate-200 focus:ring-slate-100"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-[#111827] hover:bg-[#1e293b] text-white font-bold rounded-lg transition-all active:scale-[0.98] mt-2 shadow-lg shadow-slate-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Subsystem Connectivity Footer */}
        <div className="mt-12 w-full">
          <div className="flex items-center justify-between px-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-4">
            <span className="h-px w-10 bg-slate-200"></span>
            <span>Subsystem Node Status</span>
            <span className="h-px w-10 bg-slate-200"></span>
          </div>
          <div className="flex justify-around items-center px-4 py-4 bg-slate-50/80 rounded-2xl border border-slate-100 shadow-inner">
            {[Terminal, Cpu, Server, Database, Webhook].map((Icon, i) => (
              <div
                key={i}
                className="flex flex-col items-center group relative"
              >
                <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-200 group-hover:border-indigo-400 group-hover:text-indigo-600 transition-all duration-300">
                  <Icon className="h-4.5 w-4.5 text-slate-500 group-hover:text-indigo-600" />
                </div>
                {/* Visual Status Indicator */}
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
