import React, { useState } from "react";
import { syncInvoiceToSAP } from "../services/api";
import { CloseIcon, CopyIcon, DownloadIcon, SendIcon } from "./Icons";

interface JsonViewerModalProps {
    fileName: string;
    data: Record<string, any> | null;
    invoiceId?: string;
    onClose: () => void;
    onCopy: () => void;
    onDownload: () => void;
}

// Helper function to render JSON recursively
const renderJsonValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
        return <span style={{ color: "#999" }}>N/A</span>;
    }

    if (typeof value === "boolean") {
        return <span style={{ color: "#0066cc" }}>{String(value)}</span>;
    }

    if (typeof value === "number") {
        return <span style={{ color: "#009900" }}>{value}</span>;
    }

    if (typeof value === "string") {
        return <span style={{ color: "#cc6600" }}>"{value}"</span>;
    }

    if (Array.isArray(value)) {
        return (
            <div style={{ marginLeft: "20px" }}>
                <details>
                    <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                        [{value.length}] items
                    </summary>
                    {value.map((item, idx) => (
                        <div key={idx} style={{ marginLeft: "10px", padding: "5px 0" }}>
                            <strong>[{idx}]:</strong> {renderJsonValue(item)}
                        </div>
                    ))}
                </details>
            </div>
        );
    }

    if (typeof value === "object") {
        return (
            <div style={{ marginLeft: "20px" }}>
                <details>
                    <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                        {"{...}"}
                    </summary>
                    {Object.entries(value).map(([k, v]) => (
                        <div key={k} style={{ marginLeft: "10px", padding: "5px 0" }}>
                            <strong>{k}:</strong> {renderJsonValue(v)}
                        </div>
                    ))}
                </details>
            </div>
        );
    }

    return <span>{String(value)}</span>;
};

export default function JsonViewerModal({
    fileName,
    data,
    invoiceId,
    onClose,
    onCopy,
    onDownload,
}: JsonViewerModalProps) {
    const [syncing, setSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");
    const [syncMsg, setSyncMsg] = useState("");

    if (!data) return null;

    const handleSendToSAP = async () => {
        if (!invoiceId) return;
        setSyncing(true);
        setSyncStatus("idle");
        setSyncMsg("");

        try {
            const result = await syncInvoiceToSAP(invoiceId);
            setSyncStatus("success");
            setSyncMsg(result.message || "Synced successfully!");
        } catch (err: any) {
            setSyncStatus("error");
            setSyncMsg(err.message || "Failed to sync to SAP.");
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-box">
                        <h3 className="modal-title">Extracted Invoice Data</h3>
                        <p className="modal-subtitle">{fileName}</p>
                    </div>
                    <button className="icon-btn" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <div
                        className="json-viewer-container"
                        style={{
                            backgroundColor: "#f9f9f9",
                            padding: "20px",
                            borderRadius: "8px",
                            overflowY: "auto",
                            maxHeight: "60vh",
                            fontFamily: "monospace",
                            fontSize: "14px",
                            border: "1px solid #eee"
                        }}
                    >
                        {renderJsonValue(data)}
                    </div>
                </div>
                <div className="modal-footer" style={{ flexWrap: "wrap", gap: "10px" }}>
                    {invoiceId && (
                        <button
                            className="btn btn-primary"
                            style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
                            onClick={handleSendToSAP}
                            disabled={syncing}
                        >
                            <SendIcon />
                            {syncing ? "Sending..." : "Send to SAP"}
                        </button>
                    )}
                    <button className="btn btn-outlined" onClick={onCopy}>
                        <CopyIcon />
                        Copy JSON
                    </button>
                    <button className="btn btn-outlined" onClick={onDownload}>
                        <DownloadIcon />
                        Download JSON
                    </button>
                    <div className="modal-footer-spacer" style={{ flexGrow: 1 }} />

                    {syncStatus !== "idle" && (
                        <span style={{
                            fontSize: "0.85rem",
                            color: syncStatus === "success" ? "green" : "red",
                            alignSelf: "center",
                            marginRight: "auto"
                        }}>
                            {syncMsg}
                        </span>
                    )}

                    <button className="btn btn-primary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}