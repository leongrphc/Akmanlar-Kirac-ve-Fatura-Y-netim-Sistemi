"use client";

import { useState, useEffect } from "react";
import { Building2, CreditCard, AlertTriangle, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { StatsCard, CompanyCard } from "@/components/dashboard";
import { Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  companySummaries: any[];
  recentPayments: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Her 10 saniyede bir yenile
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Veriler yüklenemedi</p>
        <Button onClick={fetchStats} className="mt-4">Tekrar Dene</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Akmanlar İş Merkezi kiracı ve ödeme durumu özeti
          </p>
        </div>
        <Button variant="secondary" onClick={fetchStats}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Toplam Firma"
          value={stats.totalCompanies}
          subtitle={`${stats.activeCompanies} aktif`}
          icon={Building2}
          variant="default"
        />
        <StatsCard
          title="Ödenen"
          value={formatCurrency(stats.paidAmount)}
          subtitle={`${stats.totalPaid} ödeme`}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Bekleyen"
          value={formatCurrency(stats.pendingAmount)}
          subtitle={`${stats.totalPending} ödeme`}
          icon={CreditCard}
          variant="warning"
        />
        <StatsCard
          title="Gecikmiş"
          value={formatCurrency(stats.overdueAmount)}
          subtitle={`${stats.totalOverdue} ödeme`}
          icon={AlertTriangle}
          variant="danger"
        />
      </div>

      {/* Recent Payments */}
      {stats.recentPayments && stats.recentPayments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Son Ödemeler</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentPayments.map((payment: any) => (
              <div key={payment.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{payment.company.name}</p>
                    <p className="text-xs text-gray-500">{payment.type} - {payment.period}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-gray-500">
                    {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString("tr-TR") : "-"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Companies Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Firmalar</h2>
          <a
            href="/admin/companies"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Tümünü Gör →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.companySummaries.map((company: any) => (
            <CompanyCard
              key={company.id}
              company={{
                id: company.id,
                name: company.name,
                floor: company.floor,
                unit: company.unit,
                rentAmount: company.rentAmount,
                lastPaymentStatus: company.lastPaymentStatus,
                overdueCount: 0,
                pendingAmount: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
