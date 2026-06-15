import React from "react";

type Status = "Pending" | "Processing" | "Processed" | "Failed";

interface InvoiceFile {
  id: string;
  name: string;
  size: number;
  uploadDate: Date;
  status: Status;
  jsonData: Record<string, unknown>;
}

interface InvoiceTableProps {
  files: InvoiceFile[];
  onView: (file: InvoiceFile) => void;
  onDelete: (id: string) => void;
}

// ─── Inline SVG Icons ───
const PdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const HourglassIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20" />
    <path d="M17 5H7" />
    <path d="M17 19H7" />
    <path d="M17 5A5 5 0 0 0 12 10a5 5 0 0 0-5-5" />
    <path d="M17 19a5 5 0 0 1-5-5 5 5 0 0 1-5 5" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
  " " +
  date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

const statusConfig: Record<Status, { className: string; icon: React.ReactNode; label: string }> = {
  Pending: { className: "badge-pending", icon: <HourglassIcon />, label: "Pending" },
  Processing: { className: "badge-processing", icon: <HourglassIcon />, label: "Processing" },
  Processed: { className: "badge-processed", icon: <CheckCircleIcon />, label: "Processed" },
  Failed: { className: "badge-failed", icon: <ErrorIcon />, label: "Failed" },
};

export default function InvoiceTable({ files, onView, onDelete }: InvoiceTableProps) {
  return (
    <div className="glass-card table-card">
      <div className="table-header-row">
        <h3 className="table-title">Uploaded Invoices</h3>
        <span className="table-subtitle">{files.length} file{files.length !== 1 ? "s" : ""}</span>
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
            {files.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state-cell">
                  No files uploaded yet. Drag and drop or browse files above to get started.
                </td>
              </tr>
            ) : (
              files.map((file) => {
                const sc = statusConfig[file.status];
                return (
                  <tr key={file.id}>
                    <td>
                      <div className="file-cell">
                        <div className="file-icon-box">
                          <PdfIcon />
                        </div>
                        <span className="file-name" title={file.name}>
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td>{formatBytes(file.size)}</td>
                    <td>{formatDate(file.uploadDate)}</td>
                    <td>
                      <span className={`badge ${sc.className}`}>
                        {sc.icon}
                        {sc.label}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn btn-outlined"
                          style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                          onClick={() => onView(file)}
                        >
                          <EyeIcon />
                          View JSON
                        </button>
                        <button 
                          className="icon-btn icon-btn-danger"
                          title="Delete file"
                          onClick={() => onDelete(file.id)}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}