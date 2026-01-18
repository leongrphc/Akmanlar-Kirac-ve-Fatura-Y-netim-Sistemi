import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays, isAfter, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

// Tailwind class birleştirme
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Para formatı (Türk Lirası)
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(num);
}

// Tarih formatı
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd.MM.yyyy", { locale: tr });
}

// Tarih ve saat formatı
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd.MM.yyyy HH:mm", { locale: tr });
}

// Dönem formatı (2024-01 -> Ocak 2024)
export function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return format(date, "MMMM yyyy", { locale: tr });
}

// Gecikme gün sayısı
export function getDaysOverdue(dueDate: Date | string): number {
  const d = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  const today = new Date();
  if (isAfter(d, today)) return 0;
  return differenceInDays(today, d);
}

// Ödeme durumuna göre renk
export function getStatusColor(status: string): string {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-800 border-green-200";
    case "OVERDUE":
      return "bg-red-100 text-red-800 border-red-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "PARTIAL":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

// Ödeme durumu Türkçe
export function getStatusLabel(status: string): string {
  switch (status) {
    case "PAID":
      return "Ödendi";
    case "OVERDUE":
      return "Gecikmiş";
    case "PENDING":
      return "Bekliyor";
    case "PARTIAL":
      return "Kısmi Ödeme";
    default:
      return status;
  }
}

// Ödeme tipi Türkçe
export function getPaymentTypeLabel(type: string): string {
  switch (type) {
    case "RENT":
      return "Kira";
    case "ELECTRICITY":
      return "Elektrik";
    case "WATER":
      return "Su";
    case "DUES":
      return "Aidat";
    case "OTHER":
      return "Diğer";
    default:
      return type;
  }
}

// Ödeme tipi ikon rengi
export function getPaymentTypeColor(type: string): string {
  switch (type) {
    case "RENT":
      return "bg-blue-500";
    case "ELECTRICITY":
      return "bg-yellow-500";
    case "WATER":
      return "bg-cyan-500";
    case "DUES":
      return "bg-purple-500";
    case "OTHER":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
}
