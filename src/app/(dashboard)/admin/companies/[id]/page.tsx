"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Edit,
  Trash2,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  X,
  RefreshCw,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, StatusBadge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
  floor: string | null;
  unit: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  rentAmount: number;
  rentDueDay: number;
  payments: Payment[];
  invoices: any[];
}

interface Payment {
  id: string;
  type: string;
  period: string;
  amount: number;
  dueDate: string;
  status: string;
  paidDate: string | null;
  description: string | null;
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = { RENT: "Kira", ELECTRICITY: "Elektrik", WATER: "Su", DUES: "Aidat", OTHER: "Diğer" };
  return labels[type] || type;
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = { RENT: "🏠", ELECTRICITY: "⚡", WATER: "💧", DUES: "📋", OTHER: "💰" };
  return icons[type] || "💰";
};

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    type: "RENT",
    amount: "",
    dueDate: "",
    period: "",
    description: "",
  });

  const fetchCompany = async () => {
    try {
      const res = await fetch(`/api/companies/${companyId}`);
      const data = await res.json();
      if (data.success) {
        setCompany(data.data);
        // Varsayılan kira tutarını ayarla
        setPaymentForm((prev) => ({
          ...prev,
          amount: data.data.rentAmount.toString(),
        }));
      }
    } catch (error) {
      console.error("Error fetching company:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [companyId]);

  // Varsayılan dönem ve tarih hesapla
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const defaultPeriod = `${year}-${month}`;
    const defaultDueDate = company
      ? `${year}-${month}-${String(company.rentDueDay).padStart(2, "0")}`
      : `${year}-${month}-01`;

    setPaymentForm((prev) => ({
      ...prev,
      period: defaultPeriod,
      dueDate: defaultDueDate,
    }));
  }, [company]);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          type: paymentForm.type,
          amount: parseFloat(paymentForm.amount),
          dueDate: paymentForm.dueDate,
          period: paymentForm.period,
          description: paymentForm.description || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowPaymentModal(false);
        setPaymentForm({
          type: "RENT",
          amount: company?.rentAmount.toString() || "",
          dueDate: "",
          period: "",
          description: "",
        });
        fetchCompany(); // Listeyi yenile
      } else {
        alert(data.error || "Ödeme oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        router.push("/admin/companies");
      } else {
        alert(data.error || "Firma silinemedi");
      }
    } catch (error) {
      console.error("Error deleting company:", error);
      alert("Bir hata oluştu");
    } finally {
      setDeleting(false);
    }
  };

  // Ödeme tipi değişince tutarı güncelle
  const handleTypeChange = (type: string) => {
    let amount = "";
    if (type === "RENT" && company) {
      amount = company.rentAmount.toString();
    }
    setPaymentForm({ ...paymentForm, type, amount });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Firma bulunamadı</p>
        <Link href="/admin/companies">
          <Button className="mt-4">Firmalara Dön</Button>
        </Link>
      </div>
    );
  }

  // İstatistikler
  const paidPayments = company.payments.filter((p) => p.status === "PAID");
  const pendingPayments = company.payments.filter((p) => p.status === "PENDING");
  const overduePayments = company.payments.filter((p) => p.status === "OVERDUE");
  const totalPending = [...pendingPayments, ...overduePayments].reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/companies"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Firmalara Dön
      </Link>

      {/* Company Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                {(company.floor || company.unit) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {company.floor && `Kat ${company.floor}`}
                    {company.floor && company.unit && ", "}
                    {company.unit && `No: ${company.unit}`}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Ödeme Günü: {company.rentDueDay}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="md" onClick={() => setShowPaymentModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ödeme Oluştur
            </Button>
            <Button variant="secondary" size="md">
              <Edit className="w-4 h-4 mr-2" />
              Düzenle
            </Button>
            <Button variant="danger" size="md" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Sil
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">E-posta</p>
              <p className="text-sm font-medium">{company.contactEmail || "-"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Telefon</p>
              <p className="text-sm font-medium">{company.contactPhone || "-"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Aylık Kira</p>
              <p className="text-sm font-medium">{formatCurrency(company.rentAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{paidPayments.length}</p>
                <p className="text-xs text-gray-500">Ödenen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{pendingPayments.length}</p>
                <p className="text-xs text-gray-500">Bekleyen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-red-600">{overduePayments.length}</p>
                <p className="text-xs text-gray-500">Gecikmiş</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">₺</span>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalPending)}</p>
                <p className="text-xs text-gray-500">Toplam Borç</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Ödemeler ({company.payments.length})</h2>
          <Button size="sm" onClick={() => setShowPaymentModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Yeni Ödeme
          </Button>
        </CardHeader>
        <div className="divide-y divide-gray-100">
          {company.payments.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Henüz ödeme kaydı yok
            </div>
          ) : (
            company.payments.map((payment) => (
              <div
                key={payment.id}
                className={`px-6 py-4 flex items-center justify-between ${
                  payment.status === "OVERDUE" ? "bg-red-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{getTypeIcon(payment.type)}</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {getTypeLabel(payment.type)} - {payment.period}
                    </p>
                    <p className="text-sm text-gray-500">
                      Son Ödeme: {formatDate(payment.dueDate)}
                      {payment.description && ` • ${payment.description}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                    <StatusBadge status={payment.status} size="sm" />
                  </div>
                  {payment.paidDate && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      {formatDate(payment.paidDate)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Faturalar / Makbuzlar</h2>
          <Link href="/admin/invoices">
            <Button size="sm" variant="secondary">
              <Plus className="w-4 h-4 mr-1" />
              Fatura Yükle
            </Button>
          </Link>
        </CardHeader>
        <div className="divide-y divide-gray-100">
          {company.invoices.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Henüz fatura yüklenmemiş
            </div>
          ) : (
            company.invoices.map((invoice) => (
              <div key={invoice.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{invoice.fileName}</p>
                    <p className="text-sm text-gray-500">
                      {getTypeLabel(invoice.type)} - {invoice.period}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="secondary">
                  İndir
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Create Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ödeme Oluştur</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">
                  <strong>{company.name}</strong> için yeni ödeme talebi oluşturuluyor.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ödeme Tipi <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={paymentForm.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="RENT">🏠 Kira</option>
                  <option value="ELECTRICITY">⚡ Elektrik</option>
                  <option value="WATER">💧 Su</option>
                  <option value="DUES">📋 Aidat</option>
                  <option value="OTHER">💰 Diğer</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tutar (₺) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dönem <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="month"
                    required
                    value={paymentForm.period}
                    onChange={(e) => setPaymentForm({ ...paymentForm, period: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Son Ödeme Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={paymentForm.dueDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, dueDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  placeholder="Örn: Ocak 2024 kira ödemesi"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowPaymentModal(false)}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={saving}
                  isLoading={saving}
                >
                  {saving ? "Oluşturuluyor..." : "Ödeme Oluştur"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Firmayı Sil</h3>
            <p className="text-gray-600 mb-6">
              <strong>{company.name}</strong> firmasını ve tüm ödeme kayıtlarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowDeleteModal(false)}
              >
                İptal
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDelete}
                disabled={deleting}
                isLoading={deleting}
              >
                {deleting ? "Siliniyor..." : "Evet, Sil"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
