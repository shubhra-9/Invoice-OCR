import React from "react";
import type { InvoiceStatus } from "../types";
import { HourglassIcon, CheckCircleIcon, ErrorIcon } from "../components/Icons";

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
  " " +
  date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

export const statusConfig: Record<InvoiceStatus, { className: string; icon: React.ReactNode; label: string }> = {
  Pending:    { className: "badge-pending",    icon: <HourglassIcon />,   label: "Pending" },
  Processing: { className: "badge-processing", icon: <HourglassIcon />,   label: "Processing" },
  Processed:  { className: "badge-processed",  icon: <CheckCircleIcon />, label: "Processed" },
  Failed:     { className: "badge-failed",     icon: <ErrorIcon />,       label: "Failed" },
};
