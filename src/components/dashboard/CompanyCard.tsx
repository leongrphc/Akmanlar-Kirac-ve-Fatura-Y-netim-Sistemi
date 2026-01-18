"use client";

import Link from "next/link";
import { Building2, Phone, Mail, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { CompanySummary, PaymentStatus } from "@/types";

interface CompanyCardProps {
  company: CompanySummary;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const getCardBorderColor = (status: PaymentStatus | null) => {
    switch (status) {
      case "PAID":
        return "border-l-green-500";
      case "OVERDUE":
        return "border-l-red-500";
      case "PENDING":
        return "border-l-yellow-500";
      default:
        return "border-l-gray-300";
    }
  };

  return (
    <Link href={`/admin/companies/${company.id}`}>
      <div
        className={`bg-white rounded-xl border border-gray-200 border-l-4 ${getCardBorderColor(
          company.lastPaymentStatus
        )} shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer`}
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{company.name}</h3>
                <p className="text-sm text-gray-500">
                  {company.floor && `Kat ${company.floor}`}
                  {company.floor && company.unit && " / "}
                  {company.unit && `No: ${company.unit}`}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Aylık Kira</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(company.rentAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Bekleyen Borç</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(company.pendingAmount)}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {company.lastPaymentStatus && (
                <StatusBadge status={company.lastPaymentStatus} size="sm" />
              )}
              {company.overdueCount > 0 && (
                <span className="text-xs text-red-600 font-medium">
                  {company.overdueCount} gecikmiş
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
