import React from "react";

interface UploadZoneProps {
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CloudUploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export default function UploadZone({
  isDragging,
  fileInputRef,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileInput,
}: UploadZoneProps) {
  return (
    <div
      className={`dropzone ${isDragging ? "dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        hidden
        onChange={handleFileInput}
      />

      <div className="dropzone-content">
        <div className="dropzone-icon-box">
          <CloudUploadIcon />
        </div>

        <div>
          <p className="dropzone-title">
            Drop PDF files here, or <span>browse</span>
          </p>

          <p className="dropzone-desc">
            Supports multiple PDF files · Max 50MB per file
          </p>
        </div>

        <button
          className="btn btn-outlined"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <CloudUploadIcon />
          Select Files
        </button>
      </div>
    </div>
  );
}
