import React, { useState, useRef, useCallback, useEffect } from "react";
import "./App.css";
import UploadZone from "./components/Uploadzone";
import InvoiceTable from "./components/Invoicetable";
import JsonViewerModal from "./components/JsonViewModal";
import Snackbar from "./components/Snackbar";
import Navbar from "./components/Navbar";
import StatsCards from "./components/Statscard";
import { uploadInvoice } from "./services/api";





type Status = "Pending" | "Processing" | "Processed" | "Failed";

interface InvoiceFile {
  id: string;
  name: string;
  size: number;
  uploadDate: Date;
  status: Status;
  jsonData: Record<string, any>;
}

// ─── Inline SVG Icons ──────────────────────────────────────────────────────────

const ReceiptIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
    <path d="M16 8H8" />
    <path d="M16 12H8" />
    <path d="M13 16H8" />
  </svg>
);


const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
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





// ─── Mock Data ────────────────────────────────────────────────────────────────








// ─── Main Component ───────────────────────────────────────────────────────────

export default function App() {
  // Navigation & View control state: "login" | "signup" | "dashboard"
  const [view, setView] = useState<"login" | "signup" | "dashboard">("login");

  // Dashboard states
  const [files, setFiles] = useState<InvoiceFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [viewJson, setViewJson] = useState<InvoiceFile | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [processing, setProcessing] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Auth Form input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Active user details
  const [currentUser, setCurrentUser] = useState({ name: "Jane Doe", role: "Admin", initials: "JD" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);


  // Compute Statistics
  const stats = {
    total: files.length,
    pending: files.filter((f) => f.status === "Pending").length,
    processing: files.filter((f) => f.status === "Processing").length,
    processed: files.filter((f) => f.status === "Processed").length,
    failed: files.filter((f) => f.status === "Failed").length,
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toast auto-hide
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        setSnackbar((s) => ({ ...s, open: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  // Drag handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    const pdfFiles = dropped.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));

    if (pdfFiles.length === 0 && dropped.length > 0) {
      setSnackbar({
        open: true,
        message: "Only PDF files are supported!",
        severity: "error",
      });
      return;
    }

    addFiles(pdfFiles);
  }, []);

  const addFiles = async (rawFiles: File[]) => {
    if (rawFiles.length === 0) return;

    // 1. Create initial files list with 'Pending' state
    const newItems: InvoiceFile[] = rawFiles.map((f) => {
      const id = typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 9) + Date.now().toString();
      return {
        id,
        name: f.name,
        size: f.size,
        uploadDate: new Date(),
        status: "Pending",
        jsonData: { status: "Pending OCR Extraction" },
      };
    });

    setFiles((prev) => [...newItems, ...prev]);
    setSnackbar({
      open: true,
      message: `Uploading ${rawFiles.length} file${rawFiles.length > 1 ? "s" : ""}...`,
      severity: "success",
    });

    // 2. Asynchronously upload each file
    for (let i = 0; i < rawFiles.length; i++) {
      const file = rawFiles[i];
      const correspondingItem = newItems[i];

      // Set state to Processing when starting upload
      setFiles((prev) =>
        prev.map((f) =>
          f.id === correspondingItem.id
            ? { ...f, status: "Processing", jsonData: { status: "Uploading & Extracting..." } }
            : f
        )
      );

      try {
        console.log("Sending file to backend:", file.name);
        const result = await uploadInvoice(file);
        // On success, mark as Processed
        setFiles((prev) =>
          prev.map((f) =>
            f.id === correspondingItem.id
              ? { ...f, status: "Processed", jsonData: result }
              : f
          )
        );
      } catch (err: any) {
        // On failure, mark as Failed
        setFiles((prev) =>
          prev.map((f) =>
            f.id === correspondingItem.id
              ? { ...f, status: "Failed", jsonData: { error: err.message || "Upload and extraction failed" } }
              : f
          )
        );
        setSnackbar({
          open: true,
          message: `Failed to upload ${file.name}`,
          severity: "error",
        });
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const handleDelete = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleProcess = () => {
    setProcessing(true);
    setFiles((prev) =>
      prev.map((f) => (f.status === "Pending" ? { ...f, status: "Processing" } : f))
    );
    setTimeout(() => {
      setFiles((prev) =>
        prev.map((f) => (f.status === "Processing" ? { ...f, status: Math.random() > 0.15 ? "Processed" : "Failed" } : f))
      );
      setProcessing(false);
      setSnackbar({ open: true, message: "All invoices processed successfully!", severity: "success" });
    }, 3000);
  };

  const handleCopyJson = () => {
    if (viewJson) {
      navigator.clipboard.writeText(JSON.stringify(viewJson.jsonData, null, 2));
      setSnackbar({ open: true, message: "JSON copied to clipboard!", severity: "success" });
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

  // Auth Submission Handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Success Mock authentication
    setErrors({});
    const localPart = email.split("@")[0];
    const computedName = localPart.charAt(0).toUpperCase() + localPart.slice(1);
    const initials = computedName.substring(0, 2).toUpperCase();

    setCurrentUser({
      name: computedName,
      role: "Member",
      initials: initials || "JD",
    });

    setView("dashboard");
    setSnackbar({ open: true, message: `Welcome back, ${computedName}!`, severity: "success" });
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name) {
      newErrors.name = "Full name is required";
    }

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Success Mock signup
    setErrors({});
    const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

    setCurrentUser({
      name: name,
      role: "Member",
      initials: initials || "US",
    });

    setView("dashboard");
    setSnackbar({ open: true, message: `Account created successfully! Welcome ${name}`, severity: "success" });
  };

  // Render Login and Signup views
  if (view === "login" || view === "signup") {
    return (
      <div className="auth-viewport">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-box">
              <ReceiptIcon />
            </div>
            <h2 className="auth-title">
              Invoice<span style={{ color: "var(--accent)" }}>OCR</span>
            </h2>
            <p className="auth-desc">
              {view === "login"
                ? "Sign in to extract data from your invoices"
                : "Create an account to get started"}
            </p>
          </div>

          {view === "login" ? (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                />
                {errors.email && (
                  <span className="form-error-text">
                    <ErrorIcon /> {errors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                />
                {errors.password && (
                  <span className="form-error-text">
                    <ErrorIcon /> {errors.password}
                  </span>
                )}
              </div>

              <button type="submit" className="btn-auth">
                Log In
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                />
                {errors.name && (
                  <span className="form-error-text">
                    <ErrorIcon /> {errors.name}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                />
                {errors.email && (
                  <span className="form-error-text">
                    <ErrorIcon /> {errors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                />
                {errors.password && (
                  <span className="form-error-text">
                    <ErrorIcon /> {errors.password}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                />
                {errors.confirmPassword && (
                  <span className="form-error-text">
                    <ErrorIcon /> {errors.confirmPassword}
                  </span>
                )}
              </div>

              <button type="submit" className="btn-auth">
                Sign Up
              </button>
            </form>
          )}

          <div className="auth-footer">
            {view === "login" ? (
              <>
                Don't have an account?
                <button
                  className="auth-link"
                  onClick={() => {
                    setView("signup");
                    setErrors({});
                  }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?
                <button
                  className="auth-link"
                  onClick={() => {
                    setView("login");
                    setErrors({});
                  }}
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Snackbar Toast Notification in Auth View ── */}
        {snackbar.open && (
          <div className={`custom-toast toast-${snackbar.severity}`}>
            <div className="toast-icon">
              {snackbar.severity === "success" ? (
                <span className="toast-icon-success"><CheckCircleIcon /></span>
              ) : (
                <span className="toast-icon-error"><ErrorIcon /></span>
              )}
            </div>
            <div className="toast-message">{snackbar.message}</div>
            <button
              className="toast-close"
              onClick={() => setSnackbar((s) => ({ ...s, open: false }))}
            >
              <CloseIcon />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Dashboard Page Render (after login/signup)
  return (
    <div className="dashboard-root">
      {/* ── Navbar ── */}
      <Navbar
        currentUser={currentUser}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
        profileRef={profileRef}
        onLogout={() => {
          setView("login");
          setEmail("");
          setPassword("");
          setName("");
          setConfirmPassword("");
          setErrors({});
          setSnackbar({
            open: true,
            message: "Logged out successfully.",
            severity: "success",
          });
        }}
      />




      {/* ── Main Content ── */}
      <main className="main-container">
        {/* ── Page Header ── */}
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Upload invoices and view extraction statistics</p>
        </div>

        {/* ── Upload Section ── */}
        <UploadZone
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleFileInput={handleFileInput}
        />


        <StatsCards
          total={stats.total}
          pending={stats.pending}
          processed={stats.processed}
          failed={stats.failed}
        />

        {/* ── Uploaded Invoices Table ── */}
        <InvoiceTable
          files={files}
          onView={(file) => setViewJson(file)}
          onDelete={handleDelete}
        />

        {/* ── Process Button ── */}
        <div className="process-action-container">
          <button
            className="btn btn-secondary"
            onClick={handleProcess}
            disabled={processing || files.filter((f) => f.status === "Pending").length === 0}
          >
            {processing ? "Processing…" : `Process Invoice${files.filter((f) => f.status === "Pending").length !== 1 ? "s" : ""} (${files.filter((f) => f.status === "Pending").length})`}
          </button>
        </div>
      </main>

      {/* ── JSON Viewer Dialog ── */}
      <JsonViewerModal
        fileName={viewJson?.name || ""}
        data={viewJson?.jsonData ?? null}
        onClose={() => setViewJson(null)}
        onCopy={handleCopyJson}
        onDownload={handleDownloadJson}
      />

      {/* ── Snackbar Toast Notification ── */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
      />
    </div>
  );
}
