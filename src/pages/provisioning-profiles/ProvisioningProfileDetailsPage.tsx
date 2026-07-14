import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  Landmark,
  Cpu,
  Edit3,
  Save,
  X,
  Play,
  Octagon,
  Clock,
  Calendar,
} from "lucide-react";
import { provisioningProfilesService } from "@/services/provisioningProfilesService";
import { fundingAccountsService } from "@/services/fundingAccountsService";
import { useToastStore } from "@/hooks/useToastStore";
import { cn } from "@/lib/utils";
import { commandService } from "@/services/commandService";
import { providerInstanceService } from "@/services/providerInstanceService";
import { reimbursementsService } from "@/services/reimbursementsService";

interface ProvisioningProfile {
  id: number;
  name: string;
  reimbursement_type: string;
  catalog_product_types?: string[] | null;
  execution_mode: string;
  funding_account_id: number;
  is_active: boolean;

  // Provisioning Fields
  provisioning_provider_instance_id: number;
  provisioning_provider_instance: {
    id: number;
    name: string;
  } | null;
  provisioning_command_id: number | null;
  provisioning_command: {
    id: number;
    name: string | null;
  } | null;

  // Debit Fields
  debit_using_provisioning_provider: boolean;
  debit_provider_instance_id: number | null;
  debit_provider_instance: {
    id: number;
    name: string;
  } | null;
  debit_command_id: number | null;
  debit_command: {
    id: number;
    name: string | null;
  } | null;

  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

interface FundingLookup {
  id: number;
  name: string;
}

interface CommonLookup {
  id: number;
  name: string;
}

export default function ProvisioningProfileDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);

  const [profile, setProfile] = useState<ProvisioningProfile | null>(null);
  const [fundingAccounts, setFundingAccounts] = useState<FundingLookup[]>([]);
  const [providerInstances, setProviderInstances] = useState<CommonLookup[]>(
    [],
  );
  const [commands, setCommands] = useState<CommonLookup[]>([]);

  // Bound form values
  const [name, setName] = useState("");
  const [reimbursementType, setReimbursementType] = useState("");
  const [executionMode, setExecutionMode] = useState("");
  const [fundingAccountId, setFundingAccountId] = useState("");

  // Provisioning Form State
  const [provisioningProviderInstanceId, setProvisioningProviderInstanceId] =
    useState("");
  const [provisioningCommandId, setProvisioningCommandId] = useState("");

  // Debit Form State
  const [debitByProvisioningProvider, setDebitByProvisioningProvider] =
    useState(true);
  const [debitProviderInstanceId, setDebitProviderInstanceId] = useState("");
  const [debitCommandId, setDebitCommandId] = useState("");

  const [selectedBundleCategories, setSelectedBundleCategories] = useState<
    string[]
  >([]);
  const [bundleCategories, setBundleCategories] = useState<string[]>([]);

  const loadProfileDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [
        profileRes,
        accountsRes,
        providersRes,
        commandsRes,
        categoriesRes,
      ] = await Promise.all([
        provisioningProfilesService.getProfileById(id),
        fundingAccountsService.getAccounts(1, 1000),
        providerInstanceService.getAll(1, 1000),
        commandService.getCommands(1, 1000),
        reimbursementsService.getBundleCategories(),
      ]);

      const data: ProvisioningProfile = profileRes.data || profileRes;

      const accounts = Array.isArray(accountsRes)
        ? accountsRes
        : Array.isArray(accountsRes.data)
          ? accountsRes.data
          : Array.isArray(accountsRes.data?.data)
            ? accountsRes.data.data
            : [];

      setFundingAccounts(accounts);
      setProviderInstances(
        providersRes?.data?.data ?? providersRes?.data ?? [],
      );
      setCommands(commandsRes?.data?.data ?? commandsRes?.data ?? []);
      setBundleCategories(categoriesRes?.data ?? []);

      setProfile(data);
      setName(data.name);
      setReimbursementType(data.reimbursement_type);
      setSelectedBundleCategories(data.catalog_product_types ?? []);
      setExecutionMode(data.execution_mode);
      setFundingAccountId(String(data.funding_account_id));

      // Map provisioning values
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

      // Map debit values
      setDebitByProvisioningProvider(data.debit_using_provisioning_provider);
      setDebitProviderInstanceId(
        data.debit_provider_instance_id
          ? String(data.debit_provider_instance_id)
          : "",
      );
      setDebitCommandId(
        data.debit_command_id ? String(data.debit_command_id) : "",
      );
    } catch (err) {
      showToast(
        "Could not recover database entries for requested provisioning profile.",
        "error",
      );
      navigate("/provisioning-profiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileDetails();
  }, [id]);

  // Clean debit values if option "Use provisioning provider" is toggled
  useEffect(() => {
    if (debitByProvisioningProvider) {
      setDebitProviderInstanceId("");
      setDebitCommandId("");
    }
  }, [debitByProvisioningProvider]);

  const handleToggleProfileStatus = async () => {
    if (!id || !profile) return;

    const nextState = !profile.is_active;

    try {
      setIsActioning(true);
      await provisioningProfilesService.updateProfileStatus(id, nextState);

      showToast(
        `Profile execution state set to ${nextState ? "Active" : "Deactivated"}.`,
        "success",
      );

      setIsStateModalOpen(false);
      await loadProfileDetails();
    } catch (err) {
      showToast("Failed to switch dynamic status register.", "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!id || !profile) return;
    if (
      !name.trim() ||
      !reimbursementType.trim() ||
      !fundingAccountId ||
      !provisioningProviderInstanceId ||
      !provisioningCommandId
    ) {
      return showToast("Missing core validation routing components.", "error");
    }

    if (!debitByProvisioningProvider) {
      if (!debitProviderInstanceId) {
        return showToast("Please select the debit provider instance.", "error");
      }
      if (!debitCommandId) {
        return showToast("Please select the debit command.", "error");
      }
    }

    try {
      setIsSaving(true);
      await provisioningProfilesService.updateProfile(id, {
        name: name.trim(),
        reimbursement_type: reimbursementType.trim(),
        catalog_product_types:
          reimbursementType === "BUNDLE" ? selectedBundleCategories : [],
        execution_mode: executionMode,
        funding_account_id: Number(fundingAccountId),

        provisioning_provider_instance_id: Number(
          provisioningProviderInstanceId,
        ),
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
      });
      showToast(
        "Profile schema changes synced to upstream database.",
        "success",
      );
      setIsEditing(false);
      await loadProfileDetails();
    } catch (err) {
      showToast("Failed to serialize modified properties.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 flex flex-col items-center justify-center text-xs font-mono font-bold text-slate-400 gap-2">
        <Clock className="h-5 w-5 text-indigo-500 animate-spin" /> LOAD-CHECK
        PROFILE INFRASTRUCTURE...
      </div>
    );
  if (!profile) return null;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Upper Control Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/provisioning-profiles")}
            className="h-8 w-8 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 text-slate-600 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-md font-bold text-slate-900">
            Provisioning Profile Blueprint
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsStateModalOpen(true)}
              className={cn(
                "h-8 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm border transition-all",
                profile.is_active
                  ? "border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
              )}
            >
              {profile.is_active ? (
                <Octagon className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {profile.is_active ? "Suspend Engine" : "Wake Engine"}
            </button>
          )}

          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  loadProfileDetails();
                }}
                disabled={isSaving}
                className="h-8 px-3 border rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5 inline mr-1" /> Revert
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="h-8 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm"
              >
                <Save className="h-3.5 w-3.5 inline mr-1" /> Commit
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="h-8 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shadow-sm"
            >
              <Edit3 className="h-3.5 w-3.5 inline mr-1" /> Adjust Setup
            </button>
          )}
        </div>
      </div>

      {/* Main Structural Metadata Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            Primary Key Serial: {profile.id}
          </span>
          <div
            className={cn(
              "px-2.5 py-0.5 border text-[10px] font-black uppercase tracking-wide rounded-full",
              profile.is_active
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-rose-50 border-rose-200 text-rose-700",
            )}
          >
            ● {profile.is_active ? "Active Processing Node" : "Offline"}
          </div>
        </div>

        {/* Data Grid fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Layers className="h-3 w-3 text-slate-400" /> Identity Signature
              Name
            </span>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold outline-none"
              />
            ) : (
              <span className="text-slate-900 font-bold mt-0.5">
                {profile.name}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Landmark className="h-3 w-3 text-slate-400" /> Bound Funding
              Account Node
            </span>
            {isEditing ? (
              <select
                value={fundingAccountId}
                onChange={(e) => setFundingAccountId(e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold"
              >
                {fundingAccounts.map((fa) => (
                  <option key={fa.id} value={fa.id}>
                    {fa.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-slate-900 font-mono font-semibold mt-0.5 underline decoration-slate-200">
                {fundingAccounts.find(
                  (fa) => fa.id === profile.funding_account_id,
                )?.name || profile.funding_account_id}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Reimbursement Logic Layer
            </span>

            {isEditing ? (
              <select
                value={reimbursementType}
                onChange={(e) => {
                  setReimbursementType(e.target.value);

                  if (e.target.value !== "BUNDLE") {
                    setSelectedBundleCategories([]);
                  }
                }}
                className="mt-1 w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold outline-none"
              >
                <option value="BUNDLE">Bundle</option>
                <option value="AIRTIME">Airtime</option>
              </select>
            ) : (
              <span className="text-slate-900 font-semibold mt-0.5">
                {profile.reimbursement_type}
              </span>
            )}

            {(isEditing ? reimbursementType : profile.reimbursement_type) ===
              "BUNDLE" && (
              <div className="mt-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Bundle Categories
                </span>

                {isEditing ? (
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
                    className="
    mt-1
    w-full
    px-2
    py-1
    bg-white
    border
    border-slate-200
    rounded-lg
    text-slate-800
    font-semibold
    outline-none
    min-h-[100px]
  "
                  >
                    {bundleCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.catalog_product_types &&
                    profile.catalog_product_types.length > 0 ? (
                      profile.catalog_product_types.map((category) => (
                        <span
                          key={category}
                          className="
          px-1.5
          py-0.5
          rounded
          bg-indigo-50
          border
          border-indigo-100
          text-indigo-600
          text-[10px]
          font-bold
          uppercase
        "
                        >
                          {category}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">Not configured</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Execution Mode Layer
            </span>
            {isEditing ? (
              <select
                required
                value={executionMode}
                onChange={(e) => setExecutionMode(e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold outline-none"
              >
                <option value="COMMAND">
                  COMMAND - Execute provider command immediately
                </option>
                <option value="BATCH">
                  BATCH - Queue execution for batch processing
                </option>
              </select>
            ) : (
              <span className="text-slate-900 font-mono font-bold mt-0.5">
                {profile.execution_mode}
              </span>
            )}
          </div>
        </div>

        {/* Pipeline Control Identifiers Container */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-5">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Cpu className="h-3.5 w-3.5 text-slate-400" /> Pipeline Control
            Identifiers
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Provisioning Subsection */}
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

              <div className="flex flex-col gap-1.5 text-xs">
                <label className="text-[11px] font-bold text-slate-500">
                  Provider Instance <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <select
                    required
                    value={provisioningProviderInstanceId}
                    onChange={(e) =>
                      setProvisioningProviderInstanceId(e.target.value)
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="">-- Select Provider Instance --</option>
                    {providerInstances.map((pi) => (
                      <option key={pi.id} value={pi.id}>
                        {pi.name} (ID: {pi.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl px-3 py-2 font-semibold text-slate-800 shadow-sm">
                    {profile.provisioning_provider_instance?.name ||
                      `Instance #${profile.provisioning_provider_instance_id}`}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <label className="text-[11px] font-bold text-slate-500">
                  Provisioning Command <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <select
                    required
                    value={provisioningCommandId}
                    onChange={(e) => setProvisioningCommandId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="">-- Select Provisioning Command --</option>
                    {commands.map((cmd) => (
                      <option key={cmd.id} value={cmd.id}>
                        {cmd.name || `Command #${cmd.id}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl px-3 py-2 font-semibold text-slate-800 shadow-sm">
                    {profile.provisioning_command?.name ?? (
                      <span className="text-slate-400 font-normal">
                        Unset (NULL)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Debit Subsection */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Debit</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Configure how reimbursement debit requests are executed.
                  </p>
                </div>

                {isEditing ? (
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
                ) : (
                  <span className="text-[10px] bg-slate-100 font-mono text-slate-600 font-bold px-2 py-1 rounded">
                    {profile.debit_using_provisioning_provider
                      ? "Reusing Provisioning Setup"
                      : "Isolated Debit Route"}
                  </span>
                )}
              </div>

              <div
                className={cn(
                  "space-y-4 transition-all",
                  isEditing &&
                    debitByProvisioningProvider &&
                    "opacity-50 pointer-events-none",
                )}
              >
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="text-[11px] font-bold text-slate-500">
                    Debit Provider Instance
                    {isEditing && !debitByProvisioningProvider && (
                      <span className="text-red-500"> *</span>
                    )}
                  </label>
                  {isEditing ? (
                    <select
                      required={!debitByProvisioningProvider}
                      disabled={debitByProvisioningProvider}
                      value={debitProviderInstanceId}
                      onChange={(e) =>
                        setDebitProviderInstanceId(e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">-- Unset (NULL) --</option>
                      {providerInstances.map((pi) => (
                        <option key={pi.id} value={pi.id}>
                          {pi.name} (ID: {pi.id})
                        </option>
                      ))}
                    </select>
                  ) : (
                    !profile.debit_using_provisioning_provider && (
                      <div className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl px-3 py-2 font-semibold text-slate-800 shadow-sm">
                        {profile.debit_provider_instance?.name ||
                          (profile.debit_provider_instance_id
                            ? `Instance #${profile.debit_provider_instance_id}`
                            : "Unset (NULL)")}
                      </div>
                    )
                  )}
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="text-[11px] font-bold text-slate-500">
                    Debit Command
                    {isEditing && !debitByProvisioningProvider && (
                      <span className="text-red-500"> *</span>
                    )}
                  </label>
                  {isEditing ? (
                    <select
                      required={!debitByProvisioningProvider}
                      disabled={debitByProvisioningProvider}
                      value={debitCommandId}
                      onChange={(e) => setDebitCommandId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">-- Unset (NULL) --</option>
                      {commands.map((cmd) => (
                        <option key={cmd.id} value={cmd.id}>
                          {cmd.name || `Command #${cmd.id}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    !profile.debit_using_provisioning_provider && (
                      <div className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl px-3 py-2 font-semibold text-slate-800 shadow-sm">
                        {profile.debit_command?.name ?? (
                          <span className="text-slate-400 font-normal">
                            Unset (NULL)
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {((isEditing && debitByProvisioningProvider) ||
                (!isEditing && profile.debit_using_provisioning_provider)) && (
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

        {/* System Lifecycles timestamps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-3 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-300" /> Spawned:{" "}
            {new Date(profile.created_at).toLocaleString()}
          </div>
          {profile.updated_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-300" /> Synced:{" "}
              {new Date(profile.updated_at).toLocaleString()}
            </div>
          )}
          {profile.deleted_at && (
            <div className="flex items-center gap-1 text-rose-500 font-bold">
              ● Trash State: {new Date(profile.deleted_at).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Overlay Modal */}
      {isStateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl border p-5 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 border-b pb-2">
              {profile.is_active ? (
                <Octagon className="h-4 w-4 text-rose-500" />
              ) : (
                <Play className="h-4 w-4 text-emerald-500" />
              )}
              <h3 className="text-xs font-bold text-slate-900 uppercase">
                {profile.is_active
                  ? "Deactivate Blueprint Route"
                  : "Activate Blueprint Route"}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-normal">
              {profile.is_active
                ? "Suspending this profile halts matching algorithmic provision routines across all incoming processing operations."
                : "Waking this mapping logic allows runtime execution loops to utilize this strategy array immediately."}
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsStateModalOpen(false)}
                className="h-8 px-3 border rounded-lg text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActioning}
                onClick={handleToggleProfileStatus}
                className={cn(
                  "h-8 px-3.5 text-white rounded-lg text-xs font-bold shadow-sm",
                  profile.is_active
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700",
                )}
              >
                {isActioning
                  ? "Syncing..."
                  : profile.is_active
                    ? "Confirm Suspension"
                    : "Confirm Activation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
