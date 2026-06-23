import { PdfIcon } from "./Icons";

import type { InvoiceItem } from "../pages/Repository";

interface AssignInvoiceModalProps {
  show: boolean;
  onClose: () => void;
  selectedRepoName: string | undefined;
  unassignedInvoices: InvoiceItem[];
  handleAssign: (id: string) => void;
  assigning: boolean;
}

export default function AssignInvoiceModal({
  show,
  onClose,
  selectedRepoName,
  unassignedInvoices,
  handleAssign,
  assigning,
}: AssignInvoiceModalProps) {
  if (!show) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <h2 className="modal-title">Add Existing Invoice</h2>
            <p className="modal-subtitle">
              Pick from your dashboard invoices to add to <strong>{selectedRepoName}</strong>
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {unassignedInvoices.length === 0 ? (
            <p style={{ color: "var(--text)", textAlign: "center", padding: "24px 0" }}>
              No unassigned invoices found. Upload new ones above.
            </p>
          ) : (
            <div className="assign-invoice-list">
              {unassignedInvoices.map((inv) => (
                <div key={inv.id} className="assign-invoice-item">
                  <div className="file-cell">
                    <div className="file-icon-box"><PdfIcon /></div>
                    <div>
                      <div className="file-name">{inv.name}</div>
                      {inv.repo_id && (
                        <div style={{ fontSize: "0.72rem", color: "var(--text)", marginTop: 2 }}>
                          In another repository
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary assign-invoice-btn"
                    onClick={() => handleAssign(inv.id)}
                    disabled={assigning}
                  >
                    {assigning ? "Adding…" : "Add"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <div className="modal-footer-spacer" />
          <button className="btn btn-outlined" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
