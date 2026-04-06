import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useToastStore } from "@/hooks/useToastStore";
import { batchJobsService } from "@/services/batchJobsService";
import { commandService } from "@/services/commandService";
import { JobConfigurationHeader } from "./details/JobConfigurationHeader";
import { ExecutionStats } from "./details/ExecutionStats";
import { LogSection } from "./details/LogSection";

export default function BatchJobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToastStore();

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
      if (!selectedInstanceId) return;
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
    [selectedInstanceId, logStatus, page, perPage, showToast],
  );

  useEffect(() => {
    const initPage = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [configResponse] = await Promise.all([
          batchJobsService.getById(id),
          refreshInstanceList(),
        ]);
        setJobConfig(configResponse.data || configResponse);
      } catch (error) {
        showToast("Failed to load job details", "error");
      } finally {
        setIsLoading(false);
      }
    };
    initPage();
  }, [id, showToast, refreshInstanceList]);

  useEffect(() => {
    if (instances.length > 0 && !selectedInstanceId) {
      setSelectedInstanceId(instances[0].id.toString());
    }
  }, [instances, selectedInstanceId]);

  useEffect(() => {
    fetchInstanceData();
  }, [fetchInstanceData]);

  useEffect(() => {
    let interval: number | undefined;
    const isOngoing =
      instanceDetails?.status === "processing" ||
      instanceDetails?.status === "pending";
    if (isOngoing && selectedInstanceId) {
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
  ]);

  // Export/Retry Handlers
  const handleExportReport = () => {
    // showToast("Generating instance report...", "info");
    // API Call: batchJobsService.downloadReport(selectedInstanceId)
  };

  const handleExportAllErrors = () => {
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
    try {
      showToast(`Exporting ${code} records...`, "success");
      await batchJobsService.exportErrorsByCode(selectedInstanceId, code);
    } catch (error) {
      showToast("Export failed", "error");
    }
  };

  const handleRetryByCode = async (code: string) => {
    try {
      // showToast(`Retry initiated for error: ${code}`, "info");
      await batchJobsService.retryByErrorCode(selectedInstanceId, code);
      fetchInstanceData();
    } catch (error) {
      showToast("Retry failed", "error");
    }
  };

  const handleDownloadSource = async (instanceId: string) => {
    try {
      await batchJobsService.downloadSourceFile(instanceId);
      showToast("Source file download initiated", "success");
    } catch (error) {
      showToast("Failed to download source file", "error");
    }
  };

  if (isLoading || !jobConfig) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium italic">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Full-width Header with integrated Export button */}
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
