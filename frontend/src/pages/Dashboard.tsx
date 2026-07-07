import { useState, useEffect } from "react";

import InvoiceTable from "../components/Invoicetable";
import JsonViewerModal from "../components/JsonViewModal";
import DashboardCard from "../components/dashboard/DashboardCard";
import Snackbar from "../components/Snackbar";
import Sidebar from "../components/Sidebar";
import StatsCards from "../components/Statscard";
import DashboardNavbar from "../components/layout/DashboardNavbar";
import RepositoryPage from "./Repository";
import useDashboardData from "../hooks/useDashboardData";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<"dashboard" | "repository">("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [repoAutoCreate, setRepoAutoCreate] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    snackbar,
    showSnackbar,
    repos,
    selectedStat,
    setSelectedStat,
    selectedDashboardRepo,
    setSelectedDashboardRepo,
    viewJson,
    setViewJson,
    stats,
    finalFiles,
    handleDelete,
    handleProcess,
    handleCopyJson,
    handleDownloadJson,
  } = useDashboardData(activeView);

  const handleNewRepoClick = () => {
    setActiveView("repository");
    setRepoAutoCreate(true);
  };

  return (
    <div className="dashboard-root">
      <DashboardNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="app-body">
        <div className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`} onClick={() => setIsSidebarOpen(false)} />
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => {
            setActiveView(view);
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
