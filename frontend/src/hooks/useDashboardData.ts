import { useState, useEffect, useCallback } from "react";
import type { InvoiceFile } from "../types";
import type { Repository } from "../services/api";
import { getInvoices, getRepositories, deleteInvoice, processInvoice } from "../services/api";

/**
 * Custom hook that encapsulates all Dashboard state management:
 * - Invoice files and repo data fetching
 * - Snackbar notifications
 * - Invoice delete / process / poll logic
 * - JSON copy & download handlers
 * - Repo filter and stat-filter
 */
export default function useDashboardData(activeView: "dashboard" | "repository") {
  // ── Snackbar ────────────────────────────────────────────────────────────────
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = useCallback((message: string, severity: "success" | "error" = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        setSnackbar((s) => ({ ...s, open: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  // ── Data ────────────────────────────────────────────────────────────────────
  const [files, setFiles] = useState<InvoiceFile[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedStat, setSelectedStat] = useState<string>("Total Invoices");
  const [selectedDashboardRepo, setSelectedDashboardRepo] = useState<string>("all");
  const [viewJson, setViewJson] = useState<InvoiceFile | null>(null);

  useEffect(() => {
    if (activeView === "dashboard") {
      const fetchAllData = async () => {
        try {
          const [savedInvoices, fetchedRepos] = await Promise.all([
            getInvoices(),
            getRepositories()
          ]);
          setRepos(fetchedRepos);
          const formattedFiles: InvoiceFile[] = (savedInvoices || []).map((inv: any) => ({
            id: inv.id,
            name: inv.original_filename || "invoice.pdf",
            size: inv.file_size || 0,
            uploadDate: new Date(inv.created_at),
            status: inv.status || "Pending",
            jsonData: inv.extracted_data,
            repo_id: inv.repo_id,
          }));
          setFiles(formattedFiles);
        } catch (err) {
          console.error("Failed to fetch data", err);
        }
      };
      fetchAllData();
    }
  }, [activeView]);

  // ── Derived data ────────────────────────────────────────────────────────────
  const repoFilteredFiles = files.filter((f) => {
    if (selectedDashboardRepo === "all") return true;
    return String(f.repo_id) === selectedDashboardRepo;
  });

  const stats = {
    total: repoFilteredFiles.length,
    pending: repoFilteredFiles.filter((f) => f.status === "Pending").length,
    processing: repoFilteredFiles.filter((f) => f.status === "Processing").length,
    processed: repoFilteredFiles.filter((f) => f.status === "Processed").length,
    failed: repoFilteredFiles.filter((f) => f.status === "Failed").length,
  };

  const finalFiles = repoFilteredFiles.filter((f) => {
    if (selectedStat === "Total Invoices") return true;
    if (selectedStat === "Pending") return f.status === "Pending";
    if (selectedStat === "Processed") return f.status === "Processed";
    if (selectedStat === "Failed") return f.status === "Failed";
    return true;
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this invoice?")) return;
    try {
      setFiles((prev) => prev.filter((f) => String(f.id) !== String(id)));
      await deleteInvoice(id);
      showSnackbar("Invoice deleted successfully");
    } catch (err: any) {
      showSnackbar(err.message || "Failed to delete invoice", "error");
    }
  };

  const handleProcess = async (inv: InvoiceFile) => {
    try {
      setFiles((prev) => prev.map((f) => (f.id === inv.id ? { ...f, status: "Processing" } : f)));
      
      await processInvoice(inv.id);
      showSnackbar(`${inv.name} processing started!`);
      
      const pollInterval = setInterval(async () => {
        try {
          const refreshed = await getInvoices();
          const updatedInv = refreshed.find((i: any) => String(i.id) === inv.id);
          if (updatedInv && updatedInv.status !== "Processing" && updatedInv.status !== "Pending") {
            clearInterval(pollInterval);
            
            setFiles((prev) =>
              prev.map((f) => (f.id === inv.id ? { 
                ...f, 
                status: updatedInv.status as "Processed" | "Failed", 
                jsonData: updatedInv.extracted_data || {} 
              } : f))
            );
            if (updatedInv.status === "Processed") {
              showSnackbar(`${inv.name} processed successfully!`);
            } else {
              showSnackbar(`Processing failed for ${inv.name}`, "error");
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);
    } catch (err: any) {
      showSnackbar(err.message || `Failed to process ${inv.name}`, "error");
      setFiles((prev) => prev.map((f) => (f.id === inv.id ? { ...f, status: "Failed" } : f)));
    }
  };

  const handleCopyJson = () => {
    if (viewJson) {
      navigator.clipboard.writeText(JSON.stringify(viewJson.jsonData, null, 2));
      showSnackbar("JSON copied to clipboard!");
    }
  };

  const handleDownloadJson = () => {
    if (viewJson) {
      const blob = new Blob([JSON.stringify(viewJson.jsonData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = viewJson.name.replace(".pdf", ".json");
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return {
    // Snackbar
    snackbar,
    showSnackbar,
    // Data
    files,
    repos,
    selectedStat,
    setSelectedStat,
    selectedDashboardRepo,
    setSelectedDashboardRepo,
    viewJson,
    setViewJson,
    // Derived
    stats,
    finalFiles,
    // Handlers
    handleDelete,
    handleProcess,
    handleCopyJson,
    handleDownloadJson,
  };
}
