import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  Landmark,
  Cpu,
  ToggleLeft,
  ToggleRight,
  Edit3,
  Save,
  X,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/hooks/useToastStore";
import { provisioningProfilesService } from "@/services/provisioningProfilesService";
import { fundingAccountsService } from "@/services/fundingAccountsService";
import { providerInstanceService } from "@/services/providerInstanceService";
import { commandService } from "@/services/commandService";
import { reimbursementsService } from "@/services/reimbursementsService";

interface FundingAccountLookup {
  id: number;
  name: string;
  msisdn: string;
}

interface ProviderInstanceLookup {
  id: number;
  name: string;
  category_slug?: string;
  is_active?: boolean;
}

interface CommandLookup {
  id: number;
  name: string;
}

export default function ProvisioningProfileDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  // Workspace States
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [reimbursementType, setReimbursementType] = useState("BUNDLE");
  const [bundleCategories, setBundleCategories] = useState<string[]>([]);
  const [selectedBundleCategories, setSelectedBundleCategories] = useState<
    string[]
  >([]);
  const [executionMode, setExecutionMode] = useState("COMMAND");
  const [fundingAccountId, setFundingAccountId] = useState("");
  const [provisioningProviderInstanceId, setProvisioningProviderInstanceId] =
    useState("");
  const [provisioningCommandId, setProvisioningCommandId] = useState("");
  const [debitByProvisioningProvider, setDebitByProvisioningProvider] =
    useState(true);
  const [debitProviderInstanceId, setDebitProviderInstanceId] = useState("");
  const [debitCommandId, setDebitCommandId] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Lookups
  const [fundingAccounts, setFundingAccounts] = useState<
    FundingAccountLookup[]
  >([]);
  const [providerInstances, setProviderInstances] = useState<
    ProviderInstanceLookup[]
  >([]);

  // Categorized Commands lists
  const [provisioningCommands, setProvisioningCommands] = useState<
    CommandLookup[]
  >([]);
  const [debitCommands, setDebitCommands] = useState<CommandLookup[]>([]);

  // Category Command Loading States
  const [loadingProvisioningCommands, setLoadingProvisioningCommands] =
    useState(false);
  const [loadingDebitCommands, setLoadingDebitCommands] = useState(false);

  // 1. Load Initial Dependencies (Funding accounts, Provider instances, Categories)
  useEffect(() => {
    async function loadDependencies() {
      try {
        setIsLoadingDropdowns(true);
        const [fundingRes, providersRes, categoriesRes] = await Promise.all([
          fundingAccountsService.getAccounts(1, 1000),
          providerInstanceService.getAll(1, 1000),
          reimbursementsService.getBundleCategories(),
        ]);

        setBundleCategories(categoriesRes?.data ?? []);
        setFundingAccounts(fundingRes?.data?.data ?? fundingRes?.data ?? []);
        setProviderInstances(
          providersRes?.data?.data ?? providersRes?.data ?? [],
        );
      } catch (err) {
        showToast("Failed to load engine infrastructure relations.", "error");
      } finally {
        setIsLoadingDropdowns(false);
      }
    }
    loadDependencies();
  }, [showToast]);

  // 2. Fetch Provisioning Commands when Provisioning Provider Instance changes
  useEffect(() => {
    if (!provisioningProviderInstanceId) {
      setProvisioningCommands([]);
      return;
    }

    const fetchProvisioningCommands = async () => {
      setLoadingProvisioningCommands(true);
      try {
        const instance = providerInstances.find(
          (i) => i.id.toString() === provisioningProviderInstanceId.toString(),
        );
        if (instance?.category_slug) {
          const res = await commandService.getCommandsByCategory(
            instance.category_slug,
            true,
          );
          setProvisioningCommands(res?.data?.data ?? res?.data ?? res ?? []);
        } else {
          setProvisioningCommands([]);
        }
      } catch (err) {
        console.error("Failed to fetch provisioning commands:", err);
        setProvisioningCommands([]);
      } finally {
        setLoadingProvisioningCommands(false);
      }
    };

    fetchProvisioningCommands();
  }, [provisioningProviderInstanceId, providerInstances]);

  // 3. Fetch Debit Commands when Debit Provider Instance changes
  useEffect(() => {
    if (debitByProvisioningProvider || !debitProviderInstanceId) {
      setDebitCommands([]);
      return;
    }

    const fetchDebitCommands = async () => {
      setLoadingDebitCommands(true);
      try {
        const instance = providerInstances.find(
          (i) => i.id.toString() === debitProviderInstanceId.toString(),
        );
        if (instance?.category_slug) {
          const res = await commandService.getCommandsByCategory(
            instance.category_slug,
            true,
          );
          setDebitCommands(res?.data?.data ?? res?.data ?? res ?? []);
        } else {
          setDebitCommands([]);
        }
      } catch (err) {
        console.error("Failed to fetch debit commands:", err);
        setDebitCommands([]);
      } finally {
        setLoadingDebitCommands(false);
      }
    };

    fetchDebitCommands();
  }, [debitProviderInstanceId, debitByProvisioningProvider, providerInstances]);

  // 4. Load Profile Details
  const fetchDetails = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await provisioningProfilesService.getProfileById(id);
      const data = (response as any).data || response;

      if (!data) throw new Error("Missing profile data.");

      setName(data.name || "");
      setReimbursementType(data.reimbursement_type || "BUNDLE");
      setSelectedBundleCategories(data.catalog_product_types || []);
      setExecutionMode(data.execution_mode || "COMMAND");
      setFundingAccountId(
        data.funding_account_id ? String(data.funding_account_id) : "",
      );
      setProvisioningProviderInstanceId(
        data.provisioning_provider_instance_id
          ? String(data.provisioning_provider_instance_id)
          : "",
      );
      setProvisioningCommandId(
        data.provisioning_command_id
          ? String(data.provisioning_command_id)
          : "",
      );
      setDebitByProvisioningProvider(
        data.debit_using_provisioning_provider ?? true,
      );
      setDebitProviderInstanceId(
        data.debit_provider_instance_id
          ? String(data.debit_provider_instance_id)
          : "",
      );
      setDebitCommandId(
        data.debit_command_id ? String(data.debit_command_id) : "",
      );
      setIsActive(data.is_active ?? true);
    } catch (err) {
      console.error(err);
      showToast("Failed to retrieve profile details.", "error");
      navigate("/provisioning-profiles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (debitByProvisioningProvider) {
      setDebitProviderInstanceId("");
      setDebitCommandId("");
    }
  }, [debitByProvisioningProvider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (
      !name.trim() ||
      !reimbursementType.trim() ||
      !fundingAccountId ||
      !provisioningProviderInstanceId ||
      !provisioningCommandId
    ) {
      return showToast(
        "Please complete all required provisioning parameters.",
        "error",
      );
    }

    if (!debitByProvisioningProvider) {
      if (!debitProviderInstanceId)
        return showToast("Please select the debit provider instance.", "error");
      if (!debitCommandId)
        return showToast("Please select the debit command.", "error");
    }

    const payload = {
      name: name.trim(),
      reimbursement_type: reimbursementType,
      catalog_product_types:
        reimbursementType === "BUNDLE" ? selectedBundleCategories : [],
      execution_mode: executionMode,
      funding_account_id: Number(fundingAccountId),
      provisioning_provider_instance_id: Number(provisioningProviderInstanceId),
      provisioning_command_id: provisioningCommandId
        ? Number(provisioningCommandId)
        : null,
      debit_using_provisioning_provider: debitByProvisioningProvider,
      debit_provider_instance_id: debitByProvisioningProvider
        ? null
        : debitProviderInstanceId
          ? Number(debitProviderInstanceId)
          : null,
      debit_command_id: debitByProvisioningProvider
        ? null
        : debitCommandId
          ? Number(debitCommandId)
          : null,
      is_active: isActive,
    };

    setIsSubmitting(true);
    try {
      await provisioningProfilesService.updateProfile(id, payload);
      showToast("Provisioning profile updated successfully.", "success");
      setIsEditing(false);
      await fetchDetails();
    } catch (err) {
      showToast(
        "Failed to compile and write provisioning profile updates.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-slate-400 text-xs font-semibold gap-2 font-mono animate-pulse">
        <Clock className="h-6 w-6 text-indigo-500 animate-spin" />
        LOADING PROFILE REGISTRIES...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/provisioning-profiles")}
            type="button"
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm text-slate-500 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Provisioning Profile Details
            </h1>
            <span className="text-xs font-mono text-slate-400">ID: {id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  fetchDetails();
                }}
                disabled={isSubmitting}
                className="h-9 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
              >
                <X className="h-3.5 w-3.5" /> Discard
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-9 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />{" "}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="h-9 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6"
      >
        {/* Header Action Section */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Engine Configurations
          </span>
          <button
            type="button"
            disabled={!isEditing}
            onClick={() => setIsActive(!isActive)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all shadow-sm",
              isActive
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-slate-50 border-slate-200 text-slate-500",
              !isEditing && "opacity-80 cursor-default",
            )}
          >
            {isActive ? (
              <>
                <ToggleRight className="h-4 w-4 text-emerald-600" /> Active
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4 text-slate-400" /> Disabled
              </>
            )}
          </button>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Layers className="h-3 w-3 text-slate-400" /> Profile Name{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!isEditing}
              placeholder="e.g. Standard Core Reimbursement"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all disabled:opacity-70 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Landmark className="h-3 w-3 text-slate-400" /> Funding Account
              Link <span className="text-red-500">*</span>
            </label>
            <select
              required
              disabled={!isEditing}
              value={fundingAccountId}
              onChange={(e) => setFundingAccountId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all disabled:opacity-70 disabled:bg-slate-100"
            >
              <option value="">
                {isLoadingDropdowns
                  ? "Fetching relations..."
                  : "-- Select Linked Funding Node --"}
              </option>
              {fundingAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.msisdn})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
              Radio Reimbursement Type <span className="text-red-500">*</span>
            </label>
            <select
              value={reimbursementType}
              disabled={!isEditing}
              onChange={(e) => {
                setReimbursementType(e.target.value);
                if (e.target.value !== "BUNDLE")
                  setSelectedBundleCategories([]);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all disabled:opacity-70 disabled:bg-slate-100"
            >
              <option value="BUNDLE">Bundle</option>
              <option value="AIRTIME">Airtime</option>
            </select>

            {reimbursementType === "BUNDLE" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">
                  Bundle Categories
                </label>
                <select
                  multiple
                  disabled={!isEditing}
                  value={selectedBundleCategories}
                  onChange={(e) =>
                    setSelectedBundleCategories(
                      Array.from(
                        e.target.selectedOptions,
                        (option) => option.value,
                      ),
                    )
                  }
                  className="w-full min-h-[180px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all disabled:opacity-70 disabled:bg-slate-100"
                >
                  {bundleCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {isEditing && (
                  <span className="text-[11px] text-slate-400">
                    Hold Ctrl (Windows/Linux) or Cmd (macOS) to select multiple
                    categories.
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
              Execution Mode Runtime <span className="text-red-500">*</span>
            </label>
            <select
              required
              disabled={!isEditing}
              value={executionMode}
              onChange={(e) => setExecutionMode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-70 disabled:bg-slate-100"
            >
              <option value="COMMAND">
                COMMAND - Execute provider command immediately
              </option>
              <option value="BATCH">
                BATCH - Queue execution for batch processing
              </option>
            </select>
            <p className="text-[11px] text-slate-400">
              Defines how provisioning requests are dispatched to the execution
              engine.
            </p>
          </div>
        </div>

        {/* Pipeline Configuration */}
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-5">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Cpu className="h-4 w-4" /> Pipeline Configuration
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Provisioning */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Provisioning
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure the provider and command responsible.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500">
                  Provider Instance <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  disabled={!isEditing}
                  value={provisioningProviderInstanceId}
                  onChange={(e) => {
                    setProvisioningProviderInstanceId(e.target.value);
                    setProvisioningCommandId(""); // Reset command selection when provider instance changes
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all disabled:bg-slate-100"
                >
                  <option value="">
                    {isLoadingDropdowns
                      ? "Fetching provider instances..."
                      : "-- Select Provider Instance --"}
                  </option>
                  {providerInstances.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                  <span>
                    Provisioning Command <span className="text-red-500">*</span>
                  </span>
                  {loadingProvisioningCommands && (
                    <Loader2 className="h-3 w-3 text-indigo-500 animate-spin" />
                  )}
                </label>
                <select
                  required
                  disabled={
                    !isEditing ||
                    !provisioningProviderInstanceId ||
                    loadingProvisioningCommands
                  }
                  value={provisioningCommandId}
                  onChange={(e) => setProvisioningCommandId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {loadingProvisioningCommands
                      ? "Fetching commands for category..."
                      : !provisioningProviderInstanceId
                        ? "-- Select Provider Instance First --"
                        : "-- Select Command --"}
                  </option>
                  {provisioningCommands.map((command) => (
                    <option key={command.id} value={command.id}>
                      {command.name || `Command #${command.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Debit */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Debit</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Configure how reimbursement debit requests are executed.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 whitespace-nowrap">
                  <input
                    type="checkbox"
                    disabled={!isEditing}
                    checked={debitByProvisioningProvider}
                    onChange={(e) =>
                      setDebitByProvisioningProvider(e.target.checked)
                    }
                    className="rounded border-slate-300 disabled:opacity-70"
                  />
                  Use provisioning provider
                </label>
              </div>

              <div
                className={cn(
                  "space-y-4 transition-all",
                  debitByProvisioningProvider &&
                    "opacity-50 pointer-events-none",
                )}
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500">
                    Debit Provider Instance{" "}
                    {!debitByProvisioningProvider && (
                      <span className="text-red-500"> *</span>
                    )}
                  </label>
                  <select
                    required={!debitByProvisioningProvider}
                    disabled={debitByProvisioningProvider || !isEditing}
                    value={debitProviderInstanceId}
                    onChange={(e) => {
                      setDebitProviderInstanceId(e.target.value);
                      setDebitCommandId(""); // Reset command when debit provider instance changes
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {isLoadingDropdowns
                        ? "Fetching provider instances..."
                        : "-- Select Provider Instance --"}
                    </option>
                    {providerInstances.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                    <span>
                      Debit Command{" "}
                      {!debitByProvisioningProvider && (
                        <span className="text-red-500"> *</span>
                      )}
                    </span>
                    {loadingDebitCommands && (
                      <Loader2 className="h-3 w-3 text-indigo-500 animate-spin" />
                    )}
                  </label>
                  <select
                    required={!debitByProvisioningProvider}
                    disabled={
                      debitByProvisioningProvider ||
                      !isEditing ||
                      !debitProviderInstanceId ||
                      loadingDebitCommands
                    }
                    value={debitCommandId}
                    onChange={(e) => setDebitCommandId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {loadingDebitCommands
                        ? "Fetching commands for category..."
                        : !debitProviderInstanceId
                          ? "-- Select Provider Instance First --"
                          : "-- Select Command --"}
                    </option>
                    {debitCommands.map((command) => (
                      <option key={command.id} value={command.id}>
                        {command.name || `Command #${command.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {debitByProvisioningProvider && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                  <p className="text-[11px] text-blue-700">
                    Debit operations will reuse the provisioning provider
                    instance and provisioning command. Separate debit
                    configuration is ignored.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
