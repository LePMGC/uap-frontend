// src/components/management/commands/CommandGrid.tsx
import { useEffect, useState } from "react";
import { GenericDataTable } from "@/components/ui/GenericDataTable";
import { commandService } from "@/services/commandService";
import { useToastStore } from "@/hooks/useToastStore";
import { cn } from "@/lib/utils";
import { Edit2, Trash2 } from "lucide-react";

interface CommandGridProps {
  categorySlug: string;
}

export function CommandGrid({ categorySlug }: CommandGridProps) {
  const { showToast } = useToastStore();

  // Data State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 5,
    last_page: 1,
    from: 1,
    to: 5,
  });

  // Filter & Pagination States (Mirroring DataSource pattern)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const fetchCommands = async () => {
    setLoading(true);
    try {
      const filters = {
        category: categorySlug,
        search: searchQuery,
        action: actionFilter,
      };

      const response = await commandService.getCommands(
        currentPage,
        pageSize,
        filters,
      );

      setData(response.data);
      setPagination({
        current_page: response.current_page,
        total: response.total,
        from: response.from,
        to: response.to,
        last_page: response.last_page,
        per_page: response.per_page,
      });
    } catch (error) {
      showToast(`Failed to load ${categorySlug} commands`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when category, page, size, search, or action filter changes
  useEffect(() => {
    fetchCommands();
  }, [categorySlug, currentPage, pageSize, searchQuery, actionFilter]);

  // Reset page when switching categories
  useEffect(() => {
    setCurrentPage(1);
  }, [categorySlug]);

  const columns = [
    {
      header: "Command Name",
      accessor: (item: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{item.name}</span>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            {item.command_key}
          </span>
        </div>
      ),
    },
    {
      header: "Action",
      accessor: (item: any) => {
        const colors: Record<string, string> = {
          view: "bg-blue-50 text-blue-600 border-blue-100",
          create: "bg-green-50 text-green-600 border-green-100",
          update: "bg-amber-50 text-amber-600 border-amber-100",
          delete: "bg-red-50 text-red-600 border-red-100",
          run: "bg-indigo-50 text-indigo-600 border-indigo-100",
        };
        return (
          <span
            className={cn(
              "px-2 py-0.5 rounded border text-[10px] font-bold uppercase",
              colors[item.action] ||
                "bg-slate-50 border-slate-100 text-slate-500",
            )}
          >
            {item.action}
          </span>
        );
      },
    },
    {
      header: "Description",
      accessor: (item: any) => (
        <span className="text-xs text-slate-500 line-clamp-1 max-w-md">
          {item.description || "No description provided"}
        </span>
      ),
    },
  ];

  // Filter definitions for the GenericDataTable
  const filterConfigs = [
    {
      id: "action",
      label: "All Actions",
      value: actionFilter,
      options: [
        { label: "View", value: "view" },
        { label: "Create", value: "create" },
        { label: "Update", value: "update" },
        { label: "Delete", value: "delete" },
        { label: "Run", value: "run" },
      ],
      onChange: (val: string) => {
        setActionFilter(val);
        setCurrentPage(1);
      },
    },
  ];

  const actions = [
    {
      label: "Edit Definition",
      icon: <Edit2 className="h-3.5 w-3.5" />,
      onClick: (item: any) => console.log("Edit", item),
    },
    {
      label: "Delete Command",
      icon: <Trash2 className="h-3.5 w-3.5" />,
      variant: "danger" as const,
      onClick: (item: any) => console.log("Delete", item),
    },
  ];

  return (
    <GenericDataTable
      title=""
      data={data}
      isLoading={loading}
      columns={columns}
      actions={actions}
      pagination={pagination}
      filters={filterConfigs}
      onPageChange={(page) => setCurrentPage(page)}
      onPageSizeChange={(newSize) => {
        setPageSize(newSize);
        setCurrentPage(1);
      }}
      onSearchChange={(val) => {
        setSearchQuery(val);
        setCurrentPage(1);
      }}
      searchPlaceholder="Search by command name or key..."
      // ADD THESE PROPS TO ENABLE THE BUTTONS
      showAdd={true}
      showExport={true}
      onAddClick={() => {
        console.log("Add button clicked");
        // Example: navigate(`/management/commands/create?category=${categorySlug}`);
      }}
      onExportClick={() => {
        console.log("Exporting", categorySlug, "commands...");
        // Logic for exporting data
      }}
    />
  );
}
