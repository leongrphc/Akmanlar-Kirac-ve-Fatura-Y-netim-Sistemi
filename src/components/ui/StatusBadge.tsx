import { cn } from "@/lib/utils";
import { PaymentStatus } from "@/types";

interface StatusBadgeProps {
  status: PaymentStatus | string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PAID":
        return {
          label: "Ödendi",
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "OVERDUE":
        return {
          label: "Gecikmiş",
          className: "bg-red-100 text-red-800 border-red-200",
        };
      case "PENDING":
        return {
          label: "Bekliyor",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case "PARTIAL":
        return {
          label: "Kısmi Ödeme",
          className: "bg-orange-100 text-orange-800 border-orange-200",
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        sizeClasses,
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
