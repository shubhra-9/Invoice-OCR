

interface CreateRepoModalProps {
  show: boolean;
  onClose: () => void;
  newRepoName: string;
  setNewRepoName: (name: string) => void;
  newRepoDesc: string;
  setNewRepoDesc: (desc: string) => void;
  handleCreate: () => void;
  creating: boolean;
}

export default function CreateRepoModal({
  show,
  onClose,
  newRepoName,
  setNewRepoName,
  newRepoDesc,
  setNewRepoDesc,
  handleCreate,
  creating,
}: CreateRepoModalProps) {
  if (!show) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <h2 className="modal-title">New Repository</h2>
            <p className="modal-subtitle">Give your collection a name — you can upload files right after</p>
          </div>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Repository Name *</label>
            <input
              id="repo-name-input"
              className="form-input"
              placeholder="e.g. Q1 2026 Invoices"
              value={newRepoName}
              onChange={(e) => setNewRepoName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <input
              id="repo-desc-input"
              className="form-input"
              placeholder="Short description…"
              value={newRepoDesc}
              onChange={(e) => setNewRepoDesc(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <div className="modal-footer-spacer" />
          <button className="btn btn-outlined" onClick={onClose}>Cancel</button>
          <button
            id="repo-create-confirm-btn"
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={creating || !newRepoName.trim()}
          >
            {creating ? "Creating…" : "Create & Open Repository"}
          </button>
        </div>
      </div>
    </div>
  );
}
