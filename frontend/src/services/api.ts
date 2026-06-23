/**
 * API Service for Invoice Processing
 *
 * Handles communication with FastAPI backend for PDF upload and processing.
 * Authentication tokens are provided by Clerk.
 */

const API_BASE_URL = "http://localhost:8000";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ExtractedInvoiceData {
  invoice_number: string | null;
  invoice_date: string | null;
  po_number: string | null;
  customer_name: string | null;
  gst_number: string | null;
  total_amount: string | null;
  raw_text?: string;
  page_count: number | null;
  confidence_score: number | null;
  extraction_method: string | null;
  processing_time_ms: number | null;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file_name?: string;
  file_id?: string;
  invoice_id?: number;
  status?: string;
  data?: ExtractedInvoiceData;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  detail?: string;
}

// ─── Error Classes ───────────────────────────────────────────────────────────

export class APIError extends Error {
  public status: number;
  public error: string;
  public detail?: string;

  constructor(status: number, error: string, message: string, detail?: string) {
    super(message);
    this.status = status;
    this.error = error;
    this.detail = detail;
    this.name = "APIError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// ─── Clerk Token Helper ─────────────────────────────────────────────────────

/**
 * Get the current Clerk session token for API requests.
 * This uses the global Clerk instance exposed by @clerk/react.
 */
const getClerkToken = async (): Promise<string | null> => {
  try {
    // @clerk/react exposes window.Clerk after initialization
    const clerk = (window as any).Clerk;
    if (clerk?.session) {
      return await clerk.session.getToken();
    }
    return null;
  } catch {
    return null;
  }
};

const authHeader = async (): Promise<Record<string, string>> => {
  const token = await getClerkToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── API Functions ───────────────────────────────────────────────────────────

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { method: "GET" });
    return response.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
};

export const validateFile = (file: File): void => {
  if (!file) throw new ValidationError("No file selected");

  const allowedTypes = ["application/pdf", "application/x-pdf"];
  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError(`Invalid file type: ${file.type}. Only PDF files are allowed.`);
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new ValidationError(
      `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum limit of 10MB`
    );
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    throw new ValidationError("Invalid file extension. Please upload a PDF file.");
  }
};

export const uploadInvoice = async (file: File, repoId: string | number): Promise<UploadResponse> => {
  validateFile(file);
  console.log("Starting upload for:", file.name, "to repo:", repoId);

  try {
    const headers = await authHeader();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("repo_id", repoId.toString());

    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers, // Do NOT set Content-Type header manually, let fetch set it to multipart/form-data with boundary
      body: formData,
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new APIError(res.status, data.error || "Error", data.detail || "Failed to upload file");
    }

    return {
      success: true,
      message: "File uploaded successfully and is pending processing.",
      file_id: data.document_id,
      status: "pending_upload"
    } as UploadResponse;

  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new NetworkError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};



export const getInvoices = async (): Promise<any[]> => {
  try {
    const headers = await authHeader();
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: "GET",
      headers,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch invoices");
    return data.data || [];
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
};

export const getExtractedData = async (invoiceId: string | number): Promise<any> => {
  const headers = await authHeader();
  const res = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, { headers });
  if (!res.ok) throw new Error("Failed to fetch extracted data");
  const data = await res.json();
  return data.jsonData || data;
};

export const deleteInvoice = async (invoiceId: string | number): Promise<void> => {
  const headers = await authHeader();
  const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || data.message || "Failed to delete invoice");
  }
};

export const processInvoice = async (invoiceId: string | number): Promise<void> => {
  const headers = await authHeader();
  const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/process`, {
    method: "POST",
    headers,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || data.message || "Failed to start processing");
  }
};

export const syncInvoiceToSAP = async (invoiceId: string | number): Promise<any> => {
  const headers = await authHeader();
  const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/sync-sap`, {
    method: "POST",
    headers,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.message || "Failed to sync to SAP");
  }
  return data;
};

export const formatInvoiceData = (data: ExtractedInvoiceData): Record<string, unknown> => {
  return {
    "Invoice Number": data.invoice_number || "N/A",
    "Invoice Date": data.invoice_date || "N/A",
    "PO Number": data.po_number || "N/A",
    "Customer Name": data.customer_name || "N/A",
    "GST Number": data.gst_number || "N/A",
    "Total Amount": data.total_amount || "N/A",
    Pages: data.page_count || 0,
    Confidence: `${((data.confidence_score || 0) * 100).toFixed(1)}%`,
    Method: data.extraction_method || "N/A",
    "Processing Time": `${(data.processing_time_ms || 0).toFixed(2)}ms`,
  };
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof APIError) {
    if (error.status === 400) return error.message;
    if (error.status === 413) return "File size exceeds maximum limit (10MB)";
    if (error.status === 500) return "Server error. Please try again later.";
    return error.message;
  }
  if (error instanceof ValidationError) return error.message;
  if (error instanceof NetworkError) return error.message;
  if (error instanceof Error) return error.message;
  return "An unknown error occurred";
};

// ─── Repository API ───────────────────────────────────────────────────────────

export interface Repository {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  invoice_count: number;
}

export const getRepositories = async (): Promise<Repository[]> => {
  const headers = await authHeader();
  const res = await fetch(`${API_BASE_URL}/repos/`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch repositories");
  return data.data;
};

export const createRepository = async (name: string, description?: string): Promise<Repository> => {
  const headers = await authHeader();
  const res = await fetch(`${API_BASE_URL}/repos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ name, description }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to create repository");
  return data.data;
};

export const deleteRepository = async (repoId: number): Promise<void> => {
  const headers = await authHeader();
  const res = await fetch(`${API_BASE_URL}/repos/${repoId}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "Failed to delete repository");
  }
};

export const getRepoInvoices = async (repoId: number): Promise<any[]> => {
  const headers = await authHeader();
  const res = await fetch(`${API_BASE_URL}/repos/${repoId}/invoices`, {
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch repo invoices");
  return data.data;
};

export const assignInvoiceToRepo = async (repoId: number, invoiceId: number): Promise<void> => {
  const headers = await authHeader();
  const res = await fetch(`${API_BASE_URL}/repos/${repoId}/invoices`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ invoice_id: invoiceId }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "Failed to assign invoice");
  }
};

export const removeInvoiceFromRepo = async (repoId: number, invoiceId: number): Promise<void> => {
  const headers = await authHeader();
  const res = await fetch(`${API_BASE_URL}/repos/${repoId}/invoices/${invoiceId}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "Failed to remove invoice from repository");
  }
};