import React from "react";

interface JsonViewerModalProps {
    fileName: string;
    data: Record<string, any> | null;
    onClose: () => void;
    onCopy: () => void;
    onDownload: () => void;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

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
    onClose,
    onCopy,
    onDownload,
}: JsonViewerModalProps) {
    if (!data) return null;

    // Check if data has backend response structure (success, message, file_name, data)
    const isBackendResponse = "success" in data || "message" in data;
    const rawExtracted = isBackendResponse && "data" in data ? data.data : data;
    const extractedData = rawExtracted || {};

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
                <div className="modal-footer">
                    <button className="btn btn-outlined" onClick={onCopy}>
                        <CopyIcon />
                        Copy JSON
                    </button>
                    <button className="btn btn-outlined" onClick={onDownload}>
                        <DownloadIcon />
                        Download JSON
                    </button>
                    <div className="modal-footer-spacer" />
                    <button className="btn btn-primary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}