"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Building2,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  LogOut,
  Bell,
  X,
  History,
  Receipt,
  Loader2,
  RefreshCw,
  Moon,
  Sun,
} from "lucide-react";
import { Button, Card, CardContent, StatusBadge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

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
  const labels: Record<string, string> = { RENT: "Kira", ELECTRICITY: "Elektrik", WATER: "Su", DUES: "Aidat" };
  return labels[type] || type;
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = { RENT: "🏠", ELECTRICITY: "⚡", WATER: "💧", DUES: "📋" };
  return icons[type] || "💰";
};

export default function TenantPortal() {
  const { data: session, status } = useSession();
  const companyId = session?.user?.companyId;
  const companyName = session?.user?.companyName || "Firma";
  const userName = session?.user?.name || "Kullanıcı";
  const { theme, toggleTheme } = useTheme();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Ödemeleri API'den çek
  const fetchPayments = async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/payments?companyId=${companyId}`);
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
    if (companyId) {
      fetchPayments();
    } else if (status === "authenticated" && !companyId) {
      // Session yüklendi ama companyId yok
      setLoading(false);
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [companyId, status]);

  // İstatistikler
  const pendingPayments = payments.filter((p) => p.status === "PENDING" || p.status === "OVERDUE");
  const paidPayments = payments.filter((p) => p.status === "PAID");
  const overduePayments = payments.filter((p) => p.status === "OVERDUE");
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  const selectedPayment = payments.find((p) => p.id === showPayModal);

  // Gerçek ödeme işlemi
  const handlePay = async () => {
    if (!selectedPayment) return;

    setIsProcessing(true);

    try {
      const res = await fetch(`/api/payments/${selectedPayment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardLast4: cardNumber.slice(-4),
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Listeyi güncelle
        setPayments((prev) =>
          prev.map((p) =>
            p.id === selectedPayment.id
              ? { ...p, status: "PAID", paidDate: new Date().toISOString() }
              : p
          )
        );

        setShowPayModal(null);
        setShowSuccessModal(true);
        setCardNumber("");
        setExpiry("");
        setCvv("");

        setTimeout(() => setShowSuccessModal(false), 3000);
      } else {
        alert(data.error || "Ödeme işlemi başarısız");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Ödeme işlemi sırasında bir hata oluştu");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{companyName}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hoş geldiniz, {userName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchPayments}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Yenile"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={theme === "dark" ? "Açık Mod" : "Koyu Mod"}
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {overduePayments.length > 0 && (
                <div className="relative">
                  <Bell className="w-6 h-6 text-red-500" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {overduePayments.length}
                  </span>
                </div>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Uyarı Banner - Gecikmiş Ödeme */}
        {overduePayments.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-900 dark:text-red-200">Gecikmiş Ödemeniz Var!</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {overduePayments.length} adet gecikmiş ödemeniz bulunmaktadır. Toplam: <strong>{formatCurrency(totalOverdue)}</strong>
                </p>
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setShowPayModal(overduePayments[0].id)}
              >
                Hemen Öde
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="flex items-center gap-4 py-5">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalPending)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bekleyen Borç</p>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="flex items-center gap-4 py-5">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalOverdue)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gecikmiş</p>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="flex items-center gap-4 py-5">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{paidPayments.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ödenen</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "pending"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Bekleyen Ödemeler ({pendingPayments.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <History className="w-4 h-4 inline mr-2" />
            Ödeme Geçmişi ({paidPayments.length})
          </button>
        </div>

        {/* Payment List */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {activeTab === "pending" && pendingPayments.length === 0 && (
              <div className="px-6 py-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white">Tüm ödemeleriniz güncel!</p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Bekleyen ödemeniz bulunmamaktadır.</p>
              </div>
            )}

            {activeTab === "pending" &&
              pendingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    payment.status === "OVERDUE" ? "bg-red-50 dark:bg-red-900/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{getTypeIcon(payment.type)}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getTypeLabel(payment.type)} - {payment.period}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Son Ödeme: {formatDate(payment.dueDate)}
                        {payment.status === "OVERDUE" && (
                          <span className="text-red-600 dark:text-red-400 font-medium ml-2">• Gecikmiş!</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                      <StatusBadge status={payment.status} size="sm" />
                    </div>
                    <Button
                      size="md"
                      variant={payment.status === "OVERDUE" ? "danger" : "primary"}
                      onClick={() => setShowPayModal(payment.id)}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Öde
                    </Button>
                  </div>
                </div>
              ))}

            {activeTab === "history" && paidPayments.length === 0 && (
              <div className="px-6 py-12 text-center">
                <History className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white">Henüz ödeme yapılmamış</p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Ödeme geçmişiniz burada görünecek.</p>
              </div>
            )}

            {activeTab === "history" &&
              paidPayments.map((payment) => (
                <div key={payment.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{getTypeIcon(payment.type)}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getTypeLabel(payment.type)} - {payment.period}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ödeme Tarihi: {payment.paidDate ? formatDate(payment.paidDate) : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                      <span className="text-green-600 dark:text-green-400 text-sm flex items-center justify-end gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Ödendi
                      </span>
                    </div>
                    <Button size="sm" variant="secondary">
                      <Receipt className="w-4 h-4 mr-1" />
                      Makbuz
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </main>

      {/* Payment Modal */}
      {showPayModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Ödeme Yapılıyor</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <button
                  onClick={() => setShowPayModal(null)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Payment Details */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTypeIcon(selectedPayment.type)}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getTypeLabel(selectedPayment.type)} Ödemesi
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPayment.period} Dönemi</p>
                </div>
              </div>
            </div>

            {/* Card Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kart Numarası</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg tracking-wider bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Son Kullanma</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="•••"
                    maxLength={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handlePay}
                  disabled={!cardNumber || !expiry || !cvv || isProcessing}
                  isLoading={isProcessing}
                >
                  {isProcessing ? "İşleniyor..." : `${formatCurrency(selectedPayment.amount)} Öde`}
                </Button>
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500 text-center flex items-center justify-center gap-1">
                🔒 256-bit SSL ile güvenli ödeme
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ödeme Başarılı!</h3>
            <p className="text-gray-600 dark:text-gray-400">Ödemeniz başarıyla alındı ve kayıt edildi.</p>
          </div>
        </div>
      )}
    </div>
  );
}
