

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
  onProcess?: (file: InvoiceFile) => void;
}

import { PdfIcon, TrashIcon, EyeIcon, PlayIcon } from "./Icons";
import { formatBytes, formatDate } from "../utils/helpers";
import StatusBadge from "./dashboard/StatusBadge";

export default function InvoiceTable({ files, onView, onDelete, onProcess }: InvoiceTableProps) {
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
                      <StatusBadge status={file.status} />
                    </td>
                    <td>
                      <div className="table-actions">
                        {file.status !== "Processing" && onProcess && (
                          <button
                            className="btn btn-outlined"
                            style={{ fontSize: "0.75rem", padding: "4px 10px", marginRight: "8px" }}
                            title={file.status === "Pending" ? "Process Invoice" : "Reprocess Invoice"}
                            onClick={() => onProcess(file)}
                          >
                            <PlayIcon /> {file.status === "Pending" ? "Process" : "Reprocess"}
                          </button>
                        )}
                        {file.status === "Processed" && (
                          <button 
                            className="btn btn-outlined"
                            style={{ fontSize: "0.75rem", padding: "4px 10px", marginRight: "8px" }}
                            onClick={() => onView(file)}
                          >
                            <EyeIcon />
                            View JSON
                          </button>
                        )}
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