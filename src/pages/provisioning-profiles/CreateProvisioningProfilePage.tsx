import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  Landmark,
  Cpu,
  ToggleLeft,
  ToggleRight,
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

interface CommonLookup {
  id: number;
  name: string;
}

export default function CreateProvisioningProfilePage() {
  const navigate = useNavigate();
  const { showToast } = useToastStore();

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

  // Lookups & UI Control
  const [fundingAccounts, setFundingAccounts] = useState<
    FundingAccountLookup[]
  >([]);
  const [providerInstances, setProviderInstances] = useState<CommonLookup[]>(
    [],
  );
  const [commands, setCommands] = useState<CommonLookup[]>([]);

  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadDependencies() {
      try {
        setIsLoadingDropdowns(true);

        const [fundingRes, providersRes, commandsRes, categoriesRes] =
          await Promise.all([
            fundingAccountsService.getAccounts(1, 1000),
            providerInstanceService.getAll(1, 1000),
            commandService.getCommands(1, 1000),
            reimbursementsService.getBundleCategories(),
          ]);

        setBundleCategories(categoriesRes?.data ?? []);

        setFundingAccounts(fundingRes?.data?.data ?? fundingRes?.data ?? []);
        setProviderInstances(
          providersRes?.data?.data ?? providersRes?.data ?? [],
        );
        setCommands(commandsRes?.data?.data ?? commandsRes?.data ?? []);
      } catch (err) {
        showToast("Failed to load engine infrastructure relations.", "error");
      } finally {
        setIsLoadingDropdowns(false);
      }
    }

    loadDependencies();
  }, [showToast]);

  useEffect(() => {
    if (debitByProvisioningProvider) {
      setDebitProviderInstanceId("");
      setDebitCommandId("");
    }
  }, [debitByProvisioningProvider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      if (!debitProviderInstanceId) {
        return showToast("Please select the debit provider instance.", "error");
      }

      if (!debitCommandId) {
        return showToast("Please select the debit command.", "error");
      }
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

    // Rest of handleSubmit remains completely unchanged...
    setIsSubmitting(true);
    try {
      await provisioningProfilesService.createProfile(payload);
      showToast("Provisioning profile deployed successfully.", "success");
      navigate("/provisioning-profiles");
    } catch (err) {
      showToast("Failed to compile and write provisioning profile.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/provisioning-profiles")}
          type="button"
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm text-slate-500 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          New Provisioning Profile
        </h1>
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
            onClick={() => setIsActive(!isActive)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all shadow-sm",
              isActive
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-slate-50 border-slate-200 text-slate-500",
            )}
          >
            {isActive ? (
              <>
                <ToggleRight className="h-4 w-4 text-emerald-600" /> Active on
                Creation
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4 text-slate-400" /> Disabled on
                Creation
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
              placeholder="e.g. Standard Core Reimbursement"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Landmark className="h-3 w-3 text-slate-400" /> Funding Account
              Link <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={fundingAccountId}
              onChange={(e) => setFundingAccountId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all"
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
              onChange={(e) => {
                setReimbursementType(e.target.value);

                if (e.target.value !== "BUNDLE") {
                  setSelectedBundleCategories([]);
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all"
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
                  value={selectedBundleCategories}
                  onChange={(e) =>
                    setSelectedBundleCategories(
                      Array.from(
                        e.target.selectedOptions,
                        (option) => option.value,
                      ),
                    )
                  }
                  className="w-full min-h-[180px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all"
                >
                  {bundleCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <span className="text-[11px] text-slate-400">
                  Hold Ctrl (Windows/Linux) or Cmd (macOS) to select multiple
                  categories.
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
              Execution Mode Runtime
              <span className="text-red-500">*</span>
            </label>

            <select
              required
              value={executionMode}
              onChange={(e) => setExecutionMode(e.target.value)}
              className="
      w-full
      bg-slate-50
      border
      border-slate-200
      rounded-xl
      px-3
      py-2
      text-xs
      font-semibold
      text-slate-800
      outline-none
      focus:border-indigo-500
      focus:ring-2
      focus:ring-indigo-100
      transition-all
      cursor-pointer
    "
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
            <Cpu className="h-4 w-4" />
            Pipeline Configuration
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Provisioning */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Provisioning
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Configure the provider and command responsible for executing
                  the provisioning request.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500">
                  Provider Instance <span className="text-red-500">*</span>
                </label>

                <select
                  required
                  value={provisioningProviderInstanceId}
                  onChange={(e) =>
                    setProvisioningProviderInstanceId(e.target.value)
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all"
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
                <label className="text-[11px] font-bold text-slate-500">
                  Provisioning Command <span className="text-red-500">*</span>
                </label>

                <select
                  required
                  value={provisioningCommandId}
                  onChange={(e) => setProvisioningCommandId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="">
                    {isLoadingDropdowns
                      ? "Fetching commands..."
                      : "-- Unset (NULL) --"}
                  </option>

                  {commands.map((command) => (
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
                    checked={debitByProvisioningProvider}
                    onChange={(e) =>
                      setDebitByProvisioningProvider(e.target.checked)
                    }
                    className="rounded border-slate-300"
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
                    Debit Provider Instance
                    {!debitByProvisioningProvider && (
                      <span className="text-red-500"> *</span>
                    )}
                  </label>

                  <select
                    required={!debitByProvisioningProvider}
                    disabled={debitByProvisioningProvider}
                    value={debitProviderInstanceId}
                    onChange={(e) => setDebitProviderInstanceId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {isLoadingDropdowns
                        ? "Fetching provider instances..."
                        : "-- Unset (NULL) --"}
                    </option>

                    {providerInstances.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500">
                    Debit Command
                    {!debitByProvisioningProvider && (
                      <span className="text-red-500"> *</span>
                    )}
                  </label>

                  <select
                    required={!debitByProvisioningProvider}
                    disabled={debitByProvisioningProvider}
                    value={debitCommandId}
                    onChange={(e) => setDebitCommandId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {isLoadingDropdowns
                        ? "Fetching commands..."
                        : "-- Unset (NULL) --"}
                    </option>

                    {commands.map((command) => (
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

        {/* Form Submission */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/provisioning-profiles")}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 border border-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md disabled:bg-slate-200 transition-all active:scale-95"
          >
            {isSubmitting ? "Compiling..." : "Deploy Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
