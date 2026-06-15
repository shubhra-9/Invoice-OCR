/**
 * API Service for Invoice Processing
 * 
 * Handles communication with FastAPI backend for PDF upload and processing
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

  constructor(
    status: number,
    error: string,
    message: string,
    detail?: string
  ) {
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

// ─── API Functions ───────────────────────────────────────────────────────────

/**
 * Check if API backend is running
 * 
 * @returns {Promise<boolean>} True if backend is healthy
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
    });
    return response.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
};

/**
 * Upload PDF file and extract invoice data
 * 
 * @param {File} file - PDF file to upload
 * @returns {Promise<UploadResponse>} Extracted invoice data
 * @throws {APIError} If API returns error
 * @throws {NetworkError} If network request fails
 * @throws {ValidationError} If file validation fails
 */
export const uploadInvoice = async (file: File): Promise<UploadResponse> => {
  // Validate file before upload
  validateFile(file);

  const formData = new FormData();
  formData.append("file", file);
  console.log("Uploading file:", file.name);

  try {
    const response = await fetch(`${API_BASE_URL}/upload/`, {
      method: "POST",
      body: formData,
      // Note: Don't set Content-Type header, browser will set it with boundary
    });

    const data: UploadResponse | ApiError = await response.json();
    console.log("API returned:", data);

    if (!response.ok) {
      const errorData = data as ApiError;
      throw new APIError(
        response.status,
        errorData.error || "Unknown Error",
        errorData.message || "Failed to process invoice",
        errorData.detail
      );
    }

    return data as UploadResponse;

  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new NetworkError(
        `Failed to connect to backend. Make sure FastAPI server is running on ${API_BASE_URL}`
      );
    }

    throw new NetworkError(
      `Network error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

/**
 * Validate file before upload
 * 
 * @param {File} file - File to validate
 * @throws {ValidationError} If validation fails
 */
export const validateFile = (file: File): void => {
  // Check file exists
  if (!file) {
    throw new ValidationError("No file selected");
  }

  // Check file type
  const allowedTypes = ["application/pdf", "application/x-pdf"];
  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError(
      `Invalid file type: ${file.type}. Only PDF files are allowed.`
    );
  }

  // Check file size (10 MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new ValidationError(
      `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum limit of 10MB`
    );
  }

  // Check file name
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    throw new ValidationError(
      "Invalid file extension. Please upload a PDF file."
    );
  }
};

/**
 * Format extracted invoice data for display
 * 
 * @param {ExtractedInvoiceData} data - Extracted data
 * @returns {Record<string, unknown>} Formatted data
 */
export const formatInvoiceData = (
  data: ExtractedInvoiceData
): Record<string, unknown> => {
  return {
    "Invoice Number": data.invoice_number || "N/A",
    "Invoice Date": data.invoice_date || "N/A",
    "PO Number": data.po_number || "N/A",
    "Customer Name": data.customer_name || "N/A",
    "GST Number": data.gst_number || "N/A",
    "Total Amount": data.total_amount || "N/A",
    "Pages": data.page_count || 0,
    "Confidence": `${((data.confidence_score || 0) * 100).toFixed(1)}%`,
    "Method": data.extraction_method || "N/A",
    "Processing Time": `${(data.processing_time_ms || 0).toFixed(2)}ms`,
  };
};

/**
 * Get user-friendly error message
 * 
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof APIError) {
    if (error.status === 400) {
      return error.message;
    }
    if (error.status === 413) {
      return "File size exceeds maximum limit (10MB)";
    }
    if (error.status === 500) {
      return "Server error. Please try again later.";
    }
    return error.message;
  }

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof NetworkError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred";
};