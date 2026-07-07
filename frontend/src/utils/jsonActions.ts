/**
 * Reusable JSON copy & download helpers.
 * Used by both the Dashboard page and the Repository page.
 */

export function copyJsonToClipboard(data: Record<string, any>): void {
  navigator.clipboard.writeText(JSON.stringify(data, null, 2));
}

export function downloadJsonFile(data: Record<string, any>, fileName: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.replace(".pdf", ".json");
  a.click();
  URL.revokeObjectURL(url);
}
