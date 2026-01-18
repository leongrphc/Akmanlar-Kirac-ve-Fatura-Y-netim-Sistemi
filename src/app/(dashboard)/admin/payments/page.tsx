"use client";

import { useState, useEffect } from "react";
import { Search, Eye, AlertTriangle, CheckCircle, Clock, RefreshCw, Loader2 } from "lucide-react";
import { Button, StatusBadge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Payment {
  id: string;
  companyId: string;
  company: { id: string; name: string; floor: string; unit: string };
  type: string;
  period: string;
  amount: number;
  dueDate: string;
  status: string;
  paidDate: string | null;
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = { RENT: "Kira", ELECTRICITY: "Elektrik", WATER: "Su", DUES: "Aidat" };
  return labels[type] || type;
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = { RENT: "🏠", ELECTRICITY: "⚡", WATER: "💧", DUES: "📋" };
  return icons[type] || "💰";
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (data.success) {
        setPayments(data.data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // Her 10 saniyede bir yenile (gerçek zamanlı takip için)
    const interval = setInterval(fetchPayments, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = p.company.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // İstatistikler
  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === "PAID").length,
    pending: payments.filter(p => p.status === "PENDING").length,
    overdue: payments.filter(p => p.status === "OVERDUE").length,
    overdueAmount: payments.filter(p => p.status === "OVERDUE").reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0),
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ödeme Takibi</h1>
          <p className="text-gray-500 mt-1">Tüm kiracıların ödeme durumlarını takip edin</p>
        </div>
        <Button variant="secondary" onClick={fetchPayments} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Yenile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
              <p className="text-sm text-gray-500">Ödendi</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Bekliyor</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              <p className="text-sm text-gray-500">Gecikmiş</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-bold text-sm">₺</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</p>
              <p className="text-sm text-gray-500">Gecikmiş Tutar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Firma ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="PAID">Ödendi</option>
          <option value="PENDING">Bekliyor</option>
          <option value="OVERDUE">Gecikmiş</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
        >
          <option value="all">Tüm Tipler</option>
          <option value="RENT">Kira</option>
          <option value="ELECTRICITY">Elektrik</option>
          <option value="WATER">Su</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Firma</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dönem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Son Ödeme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ödeme Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Ödeme kaydı bulunamadı
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className={`hover:bg-gray-50 ${payment.status === "OVERDUE" ? "bg-red-50" : ""}`}>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{payment.company.name}</span>
                      <p className="text-xs text-gray-500">Kat {payment.company.floor}, No: {payment.company.unit}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2">
                        <span>{getTypeIcon(payment.type)}</span>
                        <span className="text-gray-700">{getTypeLabel(payment.type)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{payment.period}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(payment.dueDate)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={payment.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {payment.paidDate ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {formatDate(payment.paidDate)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-blue-900">Otomatik Güncelleme Aktif</p>
            <p className="text-sm text-blue-700 mt-1">
              Bu sayfa her 10 saniyede bir otomatik olarak güncellenir. Kiracılar ödeme yaptığında burada anında görünür.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
