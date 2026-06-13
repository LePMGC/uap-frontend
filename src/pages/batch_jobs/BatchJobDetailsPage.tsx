// src/pages/operations/BatchJobDetailsPage.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToastStore } from "@/hooks/useToastStore";
import { batchJobsService } from "@/services/batchJobsService";
import { commandService } from "@/services/commandService";
import { JobConfigurationHeader } from "./details/JobConfigurationHeader";
import { ExecutionStats } from "./details/ExecutionStats";
import { LogSection } from "./details/LogSection";
import { useAuthStore } from "@/store/authStore";
import { PERM } from "@/types/auth";

export default function BatchJobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  // --- IDENTITY & PERMISSION CHECKS ---
  const user = useAuthStore((state) => state.user);
  const userPermissions = useMemo(() => user?.permissions || [], [user]);

  const [jobConfig, setJobConfig] = useState<any>(null);
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>("");
  const [instanceDetails, setInstanceDetails] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [logMeta, setLogMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logStatus, setLogStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  // Check read clearance levels dynamically based on individual job metrics
  const hasViewAccess = useMemo(() => {
    if (!jobConfig) return false;
    if (
      userPermissions.includes(PERM.VIEW_ALL_BATCH_INSTANCES) ||
      userPermissions.includes(PERM.MANAGE_ALL_BATCH_TEMPLATES)
    ) {
      return true;
    }
    const isOwner =
      String(jobConfig.user_id || jobConfig.created_by_id) === String(user?.id);
    if (
      isOwner &&
      (userPermissions.includes(PERM.VIEW_OWN_BATCH_INSTANCES) ||
        userPermissions.includes(PERM.MANAGE_OWN_BATCH_TEMPLATES))
    ) {
      return true;
    }
    return false;
  }, [jobConfig, userPermissions, user?.id]);

  // Check mutation clearance levels dynamically
  const hasManagementAccess = useMemo(() => {
    if (!jobConfig) return false;
    if (userPermissions.includes(PERM.MANAGE_ALL_BATCH_TEMPLATES)) return true;
    const isOwner =
      String(jobConfig.user_id || jobConfig.created_by_id) === String(user?.id);
    if (isOwner && userPermissions.includes(PERM.MANAGE_OWN_BATCH_TEMPLATES))
      return true;
    return false;
  }, [jobConfig, userPermissions, user?.id]);

  const refreshInstanceList = useCallback(async () => {
    if (!id) return;
    try {
      const instancesResponse = await batchJobsService.getInstances(id);
      setInstances(instancesResponse.data?.data || []);
    } catch (error) {
      console.error("Failed to refresh instance list", error);
    }
  }, [id]);

  const fetchInstanceData = useCallback(
    async (isSilent = false) => {
      if (!selectedInstanceId || !hasViewAccess) return;
      try {
        const statusFilter =
          logStatus !== "All" ? logStatus.toLowerCase() : undefined;
        const [details, logResponse] = await Promise.all([
          batchJobsService.getInstanceDetails(selectedInstanceId),
          commandService.getCommandLogs(page, perPage, {
            job_instance_id: selectedInstanceId,
            status: statusFilter,
          }),
        ]);
        setInstanceDetails(details.data);
        setLogs(logResponse.data || []);
        setLogMeta(logResponse.meta || null);
      } catch (error) {
        if (!isSilent) showToast("Failed to refresh instance data", "error");
      }
    },
    [selectedInstanceId, logStatus, page, perPage, showToast, hasViewAccess],
  );

  useEffect(() => {
    const initPage = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const configResponse = await batchJobsService.getById(id);
        const activeConfig = configResponse.data || configResponse;
        setJobConfig(activeConfig);

        // Load operational instances immediately following configuration confirmation
        const instancesResponse = await batchJobsService.getInstances(id);
        setInstances(instancesResponse.data?.data || []);
      } catch (error) {
        showToast("Failed to load job details", "error");
      } finally {
        setIsLoading(false);
      }
    };
    initPage();
  }, [id, showToast]);

  useEffect(() => {
    if (instances.length > 0 && !selectedInstanceId) {
      setSelectedInstanceId(instances[0].id.toString());
    }
  }, [instances, selectedInstanceId]);

  useEffect(() => {
    if (hasViewAccess) {
      fetchInstanceData();
    }
  }, [fetchInstanceData, hasViewAccess]);

  useEffect(() => {
    let interval: number | undefined;
    const isOngoing =
      instanceDetails?.status === "processing" ||
      instanceDetails?.status === "pending";
    if (isOngoing && selectedInstanceId && hasViewAccess) {
      interval = window.setInterval(() => fetchInstanceData(true), 3000);
    } else if (
      instanceDetails?.status === "completed" ||
      instanceDetails?.status === "failed"
    ) {
      refreshInstanceList();
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [
    instanceDetails?.status,
    selectedInstanceId,
    fetchInstanceData,
    refreshInstanceList,
    hasViewAccess,
  ]);

  // --- ACTIONS WITH EXPLICIT GUARD VALIDATIONS ---
  const handleExportReport = () => {
    if (!userPermissions.includes(PERM.DOWNLOAD_BATCH_REPORT)) {
      showToast("Access Denied: Missing report download permissions", "error");
      return;
    }
    showToast("Report download initiated", "success");
  };

  const handleExportAllErrors = () => {
    if (!userPermissions.includes(PERM.DOWNLOAD_BATCH_RESULTS)) {
      showToast("Access Denied: Missing results export privileges", "error");
      return;
    }
    batchJobsService
      .exportAllErrors(selectedInstanceId)
      .then(() => {
        showToast("Report download initiated", "success");
      })
      .catch(() => {
        showToast("Failed to download report", "error");
      });
  };

  const handleExportByCode = async (code: string) => {
    if (!userPermissions.includes(PERM.DOWNLOAD_BATCH_RESULTS)) {
      showToast("Access Denied: Missing results export privileges", "error");
      return;
    }
    try {
      showToast(`Exporting ${code} records...`, "success");
      await batchJobsService.exportErrorsByCode(selectedInstanceId, code);
    } catch (error) {
      showToast("Export failed", "error");
    }
  };

  const handleRetryByCode = async (code: string) => {
    if (
      !hasManagementAccess ||
      !userPermissions.includes(PERM.RUN_BATCH_JOBS)
    ) {
      showToast(
        "Access Denied: Insufficient authorization to trigger execution task re-runs.",
        "error",
      );
      return;
    }
    try {
      await batchJobsService.retryByErrorCode(selectedInstanceId, code);
      showToast(`Retry initiated for error code: ${code}`, "success");
      fetchInstanceData();
    } catch (error) {
      showToast("Retry failed", "error");
    }
  };

  const handleDownloadSource = async (instanceId: string) => {
    if (!userPermissions.includes(PERM.DOWNLOAD_BATCH_RESULTS)) {
      showToast(
        "Access Denied: Missing authorization to pull down data source configurations",
        "error",
      );
      return;
    }
    try {
      await batchJobsService.downloadSourceFile(instanceId);
      showToast("Source file download initiated", "success");
    } catch (error) {
      showToast("Failed to download source file", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium italic">
        Loading dashboard...
      </div>
    );
  }

  // Active Denial Guard Render
  if (jobConfig && !hasViewAccess) {
    return (
      <div className="p-8 text-center font-bold text-red-600">
        Access Denied: You do not possess clearance parameters to view this
        batch tracking node.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        <JobConfigurationHeader
          data={jobConfig}
          onExportReport={handleExportReport}
        />

        <hr className="border-slate-200" />

        <ExecutionStats
          instances={instances}
          selectedId={selectedInstanceId}
          onInstanceChange={(val) => {
            setSelectedInstanceId(val);
            setPage(1);
          }}
          stats={
            instanceDetails || { total: 0, executed: 0, success: 0, failed: 0 }
          }
        />

        <LogSection
          logs={logs}
          meta={logMeta}
          stats={instanceDetails}
          currentPage={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(val) => {
            setPerPage(val);
            setPage(1);
          }}
          errors={instanceDetails?.error_analysis || []}
          onRetryFailed={async () => {
            if (
              !hasManagementAccess ||
              !userPermissions.includes(PERM.RUN_BATCH_JOBS)
            ) {
              showToast(
                "Access Denied: Insufficient application privileges.",
                "error",
              );
              return;
            }
            try {
              await batchJobsService.retryFailedRecords(selectedInstanceId);
              showToast("Global retry triggered", "success");
              fetchInstanceData();
            } catch (e) {
              showToast("Retry failed", "error");
            }
          }}
          onRetryByCode={handleRetryByCode}
          onExportByCode={handleExportByCode}
          onExportAllErrors={handleExportAllErrors}
          onFilterChange={(status) => {
            setLogStatus(status);
            setPage(1);
          }}
          onDownloadSource={handleDownloadSource}
        />
      </div>
    </div>
  );
}
