import React, { useState, useRef, useEffect, useCallback } from "react";
import type { InvoiceFile } from "../types";
import type { Repository } from "../services/api";
import {
  getRepositories,
  createRepository,
  deleteRepository,
  getRepoInvoices,
  uploadInvoice,
  removeInvoiceFromRepo,
  processInvoice,
  getInvoices,
} from "../services/api";
import JsonViewerModal from "../components/JsonViewModal";
import { copyJsonToClipboard, downloadJsonFile } from "../utils/jsonActions";

import {
  FolderIcon, PlusIcon, TrashIcon, PdfIcon, BackIcon,
  EyeIcon, UnlinkIcon, CloudUploadIcon, PlayIcon
} from "../components/Icons";
import { formatBytes, formatDate, statusConfig } from "../utils/helpers";
import CreateRepoModal from "../components/CreateRepoModal";

interface RepoPageProps {
  onSnackbar: (msg: string, severity?: "success" | "error") => void;
  /** When true, auto-open the create-repo modal on mount */
  autoOpenCreate?: boolean;
  /** Called once the auto-open has been consumed so parent can reset the flag */
  onAutoCreateHandled?: () => void;
  onOpenSidebar?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RepositoryPage({ onSnackbar, autoOpenCreate = false, onAutoCreateHandled }: RepoPageProps) {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [repoInvoices, setRepoInvoices] = useState<InvoiceFile[]>([]);
  const [viewJson, setViewJson] = useState<InvoiceFile | null>(null);

  // Create repo modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoDesc, setNewRepoDesc] = useState("");
  const [creating, setCreating] = useState(false);

  // Upload-into-repo state
  const [repoDragging, setRepoDragging] = useState(false);
  const repoFileRef = useRef<HTMLInputElement>(null);

  // Per-invoice processing state
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Auto-open create modal when parent signals it
  useEffect(() => {
    if (autoOpenCreate) {
      setShowCreateModal(true);
      onAutoCreateHandled?.();
    }
  }, [autoOpenCreate]);

  const loadRepos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRepositories();
      setRepos(data);
    } catch {
      onSnackbar("Failed to load repositories", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRepos();
  }, [loadRepos]);

  const openRepo = async (repo: Repository) => {
    setSelectedRepo(repo);
    try {
      const invs = await getRepoInvoices(repo.id);
      setRepoInvoices(
        invs.map((inv: any) => ({
          id: String(inv.id),
          name: inv.original_filename || "invoice.pdf",
          size: inv.file_size || 0,
          uploadDate: new Date(inv.created_at),
          status: (inv.status || "Pending") as InvoiceFile["status"],
          jsonData: inv.extracted_data,
          repo_id: inv.repo_id,
        }))
      );
    } catch {
      onSnackbar("Failed to load repo invoices", "error");
    }
  };

  // ── Upload directly into repo ──────────────────────────────────────────────

  const uploadFilesToRepo = async (files: File[]) => {
    if (!selectedRepo) return;
    const pdfFiles = files.filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (pdfFiles.length === 0) {
      onSnackbar("Only PDF files are allowed", "error");
      return;
    }

    // Immediately show temp rows as "Pending"
    const tempItems: InvoiceFile[] = pdfFiles.map((f, i) => ({
      id: `temp-${Date.now()}-${i}`,
      name: f.name,
      size: f.size,
      uploadDate: new Date(),
      status: "Pending" as const,
      jsonData: {},
      repo_id: selectedRepo.id,
    }));
    setRepoInvoices((prev) => [...tempItems, ...prev]);
    onSnackbar(`Uploading ${pdfFiles.length} file${pdfFiles.length > 1 ? "s" : ""}…`);

    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      const tmpId = tempItems[i].id;

      try {
        // 1. Upload to repo
        const result = await uploadInvoice(file, selectedRepo.id);
        const finalId = String(result.file_id || (result as any).invoice_id || tmpId);

        // 2. Replace temp row with real data from backend
        setRepoInvoices((prev) =>
          prev.map((r) =>
            r.id === tmpId
              ? {
                  id: finalId,
                  name: file.name,
                  size: file.size,
                  uploadDate: new Date(),
                  status: "Pending", // Wait for manual process
                  jsonData: {},
                  repo_id: selectedRepo.id,
                }
              : r
          )
        );
        onSnackbar(`${file.name} uploaded! Ready to process.`);

      } catch (err: any) {
        setRepoInvoices((prev) =>
          prev.map((r) => (r.id === tmpId ? { ...r, status: "Failed" } : r))
        );
        onSnackbar(err.message || `Failed to upload ${file.name}`, "error");
      }
    }

    // Refresh repo list invoice counts
    await loadRepos();
  };

  const handleRepoDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setRepoDragging(false);
      const files = Array.from(e.dataTransfer.files);
      uploadFilesToRepo(files);
    },
    [selectedRepo]
  );

  const handleRepoFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFilesToRepo(Array.from(e.target.files));
    e.target.value = "";
  };

  // ── Per-row process ────────────────────────────────────────────────────────

  const handleProcess = async (inv: InvoiceFile) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(inv.id));
      setRepoInvoices((prev) => prev.map((r) => (r.id === inv.id ? { ...r, status: "Processing" } : r)));
      
      await processInvoice(inv.id);
      onSnackbar(`${inv.name} processing started!`);
      
      const pollInterval = setInterval(async () => {
        try {
          const refreshed = await getInvoices();
          const updatedInv = refreshed.find((i: any) => String(i.id) === inv.id);
          if (updatedInv && updatedInv.status !== "Processing" && updatedInv.status !== "Pending") {
            clearInterval(pollInterval);
            setProcessingIds((prev) => {
              const next = new Set(prev);
              next.delete(inv.id);
              return next;
            });
            setRepoInvoices((prev) =>
              prev.map((i) => (i.id === inv.id ? { 
                ...i, 
                status: updatedInv.status as "Processed" | "Failed", 
                jsonData: updatedInv.extracted_data || {} 
              } : i))
            );
            if (updatedInv.status === "Processed") {
              onSnackbar(`${inv.name} processed successfully!`);
            } else {
              onSnackbar(`Processing failed for ${inv.name}`, "error");
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);
    } catch (err: any) {
      onSnackbar(err.message || `Failed to process ${inv.name}`, "error");
      setRepoInvoices((prev) => prev.map((r) => (r.id === inv.id ? { ...r, status: "Failed" } : r)));
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(inv.id);
        return next;
      });
    }
  };

  // ── Repo CRUD ──────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!newRepoName.trim()) return;
    setCreating(true);
    try {
      const created = await createRepository(newRepoName.trim(), newRepoDesc.trim() || undefined);
      onSnackbar(`Repository "${newRepoName}" created!`);
      setNewRepoName("");
      setNewRepoDesc("");
      setShowCreateModal(false);
      await loadRepos();
      // Auto-open the newly created repo so user can upload right away
      openRepo(created);
    } catch (err: any) {
      onSnackbar(err.message || "Failed to create repository", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRepo = async (repo: Repository, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete repository "${repo.name}"? Invoices inside will be unlinked.`)) return;
    try {
      await deleteRepository(repo.id);
      onSnackbar(`Repository "${repo.name}" deleted.`);
      if (selectedRepo?.id === repo.id) setSelectedRepo(null);
      await loadRepos();
    } catch (err: any) {
      onSnackbar(err.message || "Failed to delete repository", "error");
    }
  };

  const handleRemove = async (invoiceId: string) => {
    if (!selectedRepo) return;
    try {
      // Optimistic update
      setRepoInvoices((prev) => prev.filter((inv) => String(inv.id) !== String(invoiceId)));
      await removeInvoiceFromRepo(selectedRepo.id, invoiceId);
      onSnackbar("Invoice removed from repository.");
    } catch (err: any) {
      // Revert or show error
      await openRepo(selectedRepo);
      onSnackbar(err.message || "Failed to remove invoice", "error");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="repo-page">

      {/* Page Header */}
      <div className="page-header">
        {selectedRepo ? (
          <div className="repo-detail-header">
            <button className="icon-btn repo-back-btn" onClick={() => setSelectedRepo(null)} title="Back">
              <BackIcon />
            </button>
            <div>
              <h1 className="page-title" style={{ margin: 0 }}>
                <span className="repo-name-accent">{selectedRepo.name}</span>
              </h1>
              {selectedRepo.description && (
                <p className="page-subtitle">{selectedRepo.description}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="repo-list-header-row">
            <div>
              <h1 className="page-title">Repositories</h1>
              <p className="page-subtitle">Organise your invoices into named collections</p>
            </div>
            <button
              id="create-repo-btn"
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <PlusIcon /> New Repository
            </button>
          </div>
        )}
      </div>

      {!selectedRepo ? (
        /* ── Repo List ─────────────────────────────────────────── */
        <>
          {loading ? (
            <div className="repo-loading">
              <div className="progress-bar-container" style={{ borderRadius: 4, height: 4 }}>
                <div className="progress-bar-fill" />
              </div>
              <p style={{ color: "var(--text)", marginTop: 16, fontSize: "0.875rem" }}>Loading repositories…</p>
            </div>
          ) : repos.length === 0 ? (
            <div className="repo-empty-state glass-card">
              <span className="repo-empty-icon"><FolderIcon /></span>
              <h3>No Repositories Yet</h3>
              <p>Create a repository to start organising your invoices.</p>
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                <PlusIcon /> Create your first Repository
              </button>
            </div>
          ) : (
            <div className="repo-grid">
              {repos.map((repo) => (
                <div
                  key={repo.id}
                  className="repo-card glass-card"
                  onClick={() => openRepo(repo)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openRepo(repo)}
                >
                  <div className="repo-card-top">
                    <span className="repo-card-icon"><FolderIcon /></span>
                    <button className="icon-btn icon-btn-danger" onClick={(e) => handleDeleteRepo(repo, e)} title="Delete">
                      <TrashIcon />
                    </button>
                  </div>
                  <h3 className="repo-card-name">{repo.name}</h3>
                  {repo.description && <p className="repo-card-desc">{repo.description}</p>}
                  <div className="repo-card-footer">
                    <span className="repo-card-count">
                      {repo.invoice_count} invoice{repo.invoice_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ── Repo Detail — upload zone + full invoice table ─────── */
        <div>

          {/* ── Inline Upload Zone ── */}
          <div
            className={`repo-dropzone ${repoDragging ? "dragging" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setRepoDragging(true); }}
            onDragLeave={() => setRepoDragging(false)}
            onDrop={handleRepoDrop}
            onClick={() => repoFileRef.current?.click()}
            title="Click or drag PDFs here to upload directly into this repository"
          >
            <input
              ref={repoFileRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              hidden
              onChange={handleRepoFileInput}
            />
            <div className="repo-dropzone-content">
              <span className="repo-dropzone-icon"><CloudUploadIcon /></span>
              <div>
                <p className="repo-dropzone-title">
                  Drop PDF invoices here, or <span>browse</span>
                </p>
                <p className="repo-dropzone-desc">
                  Files will be uploaded, processed, and added to <strong>{selectedRepo.name}</strong>
                </p>
              </div>
              <button
                className="btn btn-outlined"
                onClick={(e) => { e.stopPropagation(); repoFileRef.current?.click(); }}
              >
                <CloudUploadIcon /> Select Files
              </button>
            </div>
          </div>

          {/* ── Invoice Table ── */}
          <div className="repo-detail-actions">
            <span className="table-subtitle">
              {repoInvoices.length} invoice{repoInvoices.length !== 1 ? "s" : ""} in this repository
            </span>
          </div>

          <div className="glass-card table-card">
            {repoInvoices.length === 0 ? (
              <div className="repo-empty-state" style={{ padding: "40px 24px" }}>
                <span className="repo-empty-icon"><PdfIcon /></span>
                <h3>No Invoices Yet</h3>
                <p>Upload PDFs above to get started.</p>
              </div>
            ) : (
              <>
                <div className="table-header-row">
                  <h3 className="table-title">Invoices</h3>
                  <span className="table-subtitle">{repoInvoices.length} file{repoInvoices.length !== 1 ? "s" : ""}</span>
                </div>

                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>File</th>
                        <th>Size</th>
                        <th>Uploaded</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repoInvoices.map((inv) => {
                        const sc = statusConfig[inv.status];
                        const isProcessing = processingIds.has(inv.id);
                        return (
                          <tr key={inv.id}>
                            <td>
                              <div className="file-cell">
                                <div className="file-icon-box"><PdfIcon /></div>
                                <span className="file-name" title={inv.name}>{inv.name}</span>
                              </div>
                            </td>
                            <td>{formatBytes(inv.size)}</td>
                            <td>{formatDate(inv.uploadDate)}</td>
                            <td>
                              <span className={`badge ${sc.className}`}>
                                {sc.icon}{sc.label}
                              </span>
                            </td>
                            <td>
                                <div className="table-actions">

                                  {/* Process */}
                                  {inv.status !== "Processing" && (
                                    <button
                                      className="btn btn-outlined"
                                      style={{ fontSize: "0.75rem", padding: "4px 10px", marginRight: "8px" }}
                                      title={inv.status === "Pending" ? "Process Invoice" : "Reprocess Invoice"}
                                      disabled={isProcessing}
                                      onClick={() => handleProcess(inv)}
                                    >
                                      <PlayIcon /> {inv.status === "Pending" ? "Process" : "Reprocess"}
                                    </button>
                                  )}

                                  {/* View JSON */}
                                  <button
                                    className="btn btn-outlined"
                                    style={{ fontSize: "0.75rem", padding: "4px 10px", marginRight: "8px" }}
                                    title="View JSON"
                                    disabled={inv.status !== "Processed"}
                                    onClick={() => setViewJson(inv)}
                                  >
                                    <EyeIcon /> View JSON
                                  </button>
                                {/* Remove */}
                                <button
                                  className="icon-btn icon-btn-danger"
                                  title="Remove from repository"
                                  onClick={() => handleRemove(inv.id)}
                                >
                                  <UnlinkIcon />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Create Repo Modal ──────────────────────────────────── */}
      <CreateRepoModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newRepoName={newRepoName}
        setNewRepoName={setNewRepoName}
        newRepoDesc={newRepoDesc}
        setNewRepoDesc={setNewRepoDesc}
        handleCreate={handleCreate}
        creating={creating}
      />

      {/* JSON Viewer */}
      <JsonViewerModal
        fileName={viewJson?.name || ""}
        data={viewJson?.jsonData ?? null}
        invoiceId={viewJson?.id}
        onClose={() => setViewJson(null)}
        onCopy={() => {
          if (viewJson) {
            copyJsonToClipboard(viewJson.jsonData);
            onSnackbar("JSON copied to clipboard!");
          }
        }}
        onDownload={() => {
          if (viewJson) {
            downloadJsonFile(viewJson.jsonData, viewJson.name);
          }
        }}
      />
    </div>
  );
}
