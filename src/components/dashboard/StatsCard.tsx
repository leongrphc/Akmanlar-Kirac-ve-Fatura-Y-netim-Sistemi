import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatsCardProps) {
  const variants = {
    default: {
      bg: "bg-primary-50",
      icon: "bg-primary-100 text-primary-600",
    },
    success: {
      bg: "bg-green-50",
      icon: "bg-green-100 text-green-600",
    },
    warning: {
      bg: "bg-yellow-50",
      icon: "bg-yellow-100 text-yellow-600",
    },
    danger: {
      bg: "bg-red-50",
      icon: "bg-red-100 text-red-600",
    },
  };

  const config = variants[variant];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-2 text-sm font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%{" "}
              <span className="text-gray-500 font-normal">geçen aya göre</span>
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", config.icon)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
