export type StatusType = "Pending" | "Processing" | "Processed" | "Failed";

interface StatusBadgeProps {
  status: StatusType;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getBadgeClass = (status: StatusType) => {
    switch (status) {
      case "Processed":
        return "processed";
      case "Failed":
        return "failed";
      case "Pending":
      case "Processing":
      default:
        return "pending";
    }
  };

  return (
    <span className={`status-badge ${getBadgeClass(status)}`}>
      {status}
    </span>
  );
}
