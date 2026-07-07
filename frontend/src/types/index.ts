/**
 * Shared TypeScript types used across the application.
 * Centralises InvoiceFile / InvoiceStatus so they are defined once.
 */

// ─── Invoice Status ─────────────────────────────────────────────────────────

export type InvoiceStatus = "Pending" | "Processing" | "Processed" | "Failed";

// ─── Invoice File / Item ────────────────────────────────────────────────────

export interface InvoiceFile {
  id: string;
  name: string;
  size: number;
  uploadDate: Date;
  status: InvoiceStatus;
  jsonData: Record<string, any>;
  repo_id?: number | null;
}
