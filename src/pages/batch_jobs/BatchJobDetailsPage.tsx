import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToastStore } from "@/hooks/useToastStore";
import { batchJobsService } from "@/services/batchJobsService";
import { commandService } from "@/services/commandService"; // Added
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
  const [isLoading, setIsLoading] = useState(true);

  // Initial Load: Fetch static job info and the list of available instances
  useEffect(() => {
    const initPage = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [configResponse, instancesResponse] = await Promise.all([
          batchJobsService.getById(id),
          batchJobsService.getInstances(id),
        ]);

        const configData = configResponse.data || configResponse;
        setJobConfig(configData);

        const instanceList = instancesResponse.data?.data || [];
        setInstances(instanceList);

        if (instanceList.length > 0) {
          setSelectedInstanceId(instanceList[0].id.toString());
        }
      } catch (error) {
        showToast("Failed to load job details", "error");
      } finally {
        setIsLoading(false);
      }
    };
    initPage();
  }, [id]);

  /** * UPDATED: Data Refresh logic
   * Now calls commandService.getCommandLogs with job_instance_id filter
   */
  useEffect(() => {
    const fetchInstanceData = async () => {
      if (!selectedInstanceId) return;
      try {
        const [details, logResponse] = await Promise.all([
          batchJobsService.getInstanceDetails(selectedInstanceId),
          // Call the general command logs endpoint with the specific instance filter
          commandService.getCommandLogs(1, 10, {
            job_instance_id: selectedInstanceId,
          }),
        ]);

        setInstanceDetails(details.data);

        // Extract the array from the paginated response structure
        const logData = logResponse.data?.data || logResponse.data || [];
        setLogs(logData);
      } catch (error) {
        showToast("Failed to refresh instance data", "error");
      }
    };
    fetchInstanceData();
  }, [selectedInstanceId]);

  if (isLoading || !jobConfig) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        <JobConfigurationHeader data={jobConfig} />

        <hr className="border-slate-200" />

        <ExecutionStats
          instances={instances}
          selectedId={selectedInstanceId}
          onInstanceChange={(val: string) => setSelectedInstanceId(val)}
          stats={
            instanceDetails || { total: 0, executed: 0, success: 0, failed: 0 }
          }
        />

        <LogSection
          logs={logs}
          errors={instanceDetails?.error_analysis || []}
          onRetryFailed={() => {
            batchJobsService
              .retryFailedRecords(selectedInstanceId)
              .then(() => showToast("Retry triggered", "success"))
              .catch(() => showToast("Retry failed", "error"));
          }}
        />
      </div>
    </div>
  );
}
