import { Badge } from "@/components/ui/badge";
import { RoomStatus } from "@/data/mockData";

interface StatusBadgeProps {
  status: RoomStatus | "confirmed" | "checked-in" | "checked-out" | "cancelled" | "pending" | "in-progress" | "completed";
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getVariant = () => {
    switch (status) {
      case "available":
      case "completed":
        return "bg-success text-success-foreground";
      case "occupied":
      case "checked-in":
        return "bg-info text-info-foreground";
      case "cleaning":
      case "in-progress":
        return "bg-warning text-warning-foreground";
      case "maintenance":
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      case "confirmed":
      case "pending":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Badge className={`${getVariant()} capitalize`}>
      {status.replace("-", " ")}
    </Badge>
  );
};
