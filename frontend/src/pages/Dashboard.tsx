import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/react";
import "../App.css";

import InvoiceTable from "../components/Invoicetable";
import JsonViewerModal from "../components/JsonViewModal";
import DashboardCard from "../components/dashboard/DashboardCard";
import Snackbar from "../components/Snackbar";
import Sidebar from "../components/Sidebar";
import StatsCards from "../components/Statscard";
import RepositoryPage from "./Repository";
import { ReceiptIcon } from "../components/Icons";
import { getInvoices, getRepositories, deleteInvoice } from "../services/api";
import type { Repository } from "../services/api";

type Status = "Pending" | "Processing" | "Processed" | "Failed";

interface InvoiceFile {
  id: string;
  name: string;
  size: number;
  uploadDate: Date;
  status: Status;
  jsonData: Record<string, any>;
  repo_id?: number | null;
}

export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const userName = user?.username || user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "User";

  const [activeView, setActiveView] = useState<"dashboard" | "repository">("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // When true, the Repository page will auto-open its create-repo modal
  const [repoAutoCreate, setRepoAutoCreate] = useState(false);

  // Stat filter state
  const [selectedStat, setSelectedStat] = useState<string>("Total Invoices");
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedDashboardRepo, setSelectedDashboardRepo] = useState<string>("all");

  const [files, setFiles] = useState<InvoiceFile[]>([]);
  const [viewJson, setViewJson] = useState<InvoiceFile | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [processing, setProcessing] = useState(false);

  const showSnackbar = (message: string, severity: "success" | "error" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const repoFilteredFiles = files.filter((f) => {
    if (selectedDashboardRepo === "all") return true;
    if (selectedDashboardRepo === "unassigned") return f.repo_id == null;
    return String(f.repo_id) === selectedDashboardRepo;
  });

  const stats = {
    total: repoFilteredFiles.length,
    pending: repoFilteredFiles.filter((f) => f.status === "Pending").length,
    processing: repoFilteredFiles.filter((f) => f.status === "Processing").length,
    processed: repoFilteredFiles.filter((f) => f.status === "Processed").length,
    failed: repoFilteredFiles.filter((f) => f.status === "Failed").length,
  };

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
            size: 0,
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



  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        setSnackbar((s) => ({ ...s, open: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

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
      
      const { processInvoice } = await import("../services/api");
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

  const handleNewRepoClick = () => {
    setActiveView("repository");
    setRepoAutoCreate(true);
  };

  const finalFiles = repoFilteredFiles.filter((f) => {
    if (selectedStat === "Total Invoices") return true;
    if (selectedStat === "Pending") return f.status === "Pending";
    if (selectedStat === "Processed") return f.status === "Processed";
    if (selectedStat === "Failed") return f.status === "Failed";
    return true;
  });

  return (
    <div className="dashboard-root">
      <header className="navbar" style={{ position: 'sticky', top: 0, zIndex: 1000, borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div className="navbar-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '64px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle sidebar" style={{ padding: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            
            <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="logo-icon-box" style={{ 
                width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent) 0%, #047857 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0
              }}>
                  <ReceiptIcon />
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-h)' }}>
                  Invoice<span className="logo-text-accent" style={{ color: 'var(--accent)' }}>OCR</span>
              </span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-outlined" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem' }}
            title="Back to Homepage"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>Home</span>
          </button>
        </div>
      </header>

      <div className="app-body">
        <div className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`} onClick={() => setIsSidebarOpen(false)} />
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => {
            setActiveView(view);
            // Reset auto-create when user manually navigates
            if (view !== "repository") setRepoAutoCreate(false);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="main-container main-with-sidebar">
          {activeView === "dashboard" ? (
            <>
              <div className="page-header dashboard-header-row">
                <div>
                  <h1 className="page-title">Dashboard</h1>
                  <p className="page-subtitle">Upload invoices and view extraction statistics</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleNewRepoClick}
                  title="Create a new repository"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M3 3h6l3 3h9a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
                    <line x1="12" y1="10" x2="12" y2="16" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                  </svg>
                  New Repository
                </button>
              </div>
              <StatsCards
                total={stats.total}
                pending={stats.pending}
                processed={stats.processed}
                failed={stats.failed}
                onCardClick={setSelectedStat}
                selectedCard={selectedStat}
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, marginTop: 16 }}>
                <h2 style={{ color: "var(--text-h)", fontSize: "1.1rem", margin: 0, paddingLeft: 4 }}>
                  {selectedDashboardRepo === "all" 
                    ? "All Invoices" 
                    : selectedDashboardRepo === "unassigned"
                      ? "Unassigned Invoices"
                      : (
                        <>Repository: <span style={{ color: "var(--accent)", fontWeight: 600 }}>{repos.find(r => String(r.id) === selectedDashboardRepo)?.name || "Unknown"}</span></>
                      )
                  }
                </h2>
                <select 
                  className="form-input" 
                  style={{ width: "250px", padding: "8px 12px" }}
                  value={selectedDashboardRepo} 
                  onChange={(e) => setSelectedDashboardRepo(e.target.value)}
                >
                  <option value="all">All Invoices</option>
                  {repos.map(r => (
                    <option key={r.id} value={String(r.id)}>{r.name}</option>
                  ))}
                </select>
              </div>

              <DashboardCard>
                <InvoiceTable files={finalFiles} onView={setViewJson} onDelete={handleDelete} onProcess={handleProcess} />
              </DashboardCard>
            </>
          ) : (
            <RepositoryPage
              onSnackbar={showSnackbar}
              autoOpenCreate={repoAutoCreate}
              onAutoCreateHandled={() => setRepoAutoCreate(false)}
              onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          )}
        </main>
      </div>

      <JsonViewerModal
        fileName={viewJson?.name || ""}
        data={viewJson?.jsonData ?? null}
        invoiceId={viewJson?.id}
        onClose={() => setViewJson(null)}
        onCopy={handleCopyJson}
        onDownload={handleDownloadJson}
      />
      <Snackbar open={snackbar.open} message={snackbar.message} />
    </div>
  );
}
