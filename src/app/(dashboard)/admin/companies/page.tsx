"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Building2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui";
import { CompanyCard } from "@/components/dashboard";
import { formatCurrency } from "@/lib/utils";

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
  payments?: any[];
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    floor: "",
    unit: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    rentAmount: "",
    rentDueDay: "1",
    // Kiracı giriş bilgileri
    userEmail: "",
    userPassword: "",
    createUser: true,
  });

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/companies?includePayments=true");
      const data = await res.json();
      if (data.success) {
        setCompanies(data.data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          floor: formData.floor,
          unit: formData.unit,
          contactName: formData.contactName,
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
          rentAmount: parseFloat(formData.rentAmount),
          rentDueDay: parseInt(formData.rentDueDay),
          // Kullanıcı bilgileri
          userEmail: formData.createUser ? formData.userEmail : undefined,
          userPassword: formData.createUser ? formData.userPassword : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        setFormData({
          name: "",
          floor: "",
          unit: "",
          contactName: "",
          contactPhone: "",
          contactEmail: "",
          rentAmount: "",
          rentDueDay: "1",
          userEmail: "",
          userPassword: "",
          createUser: true,
        });
        fetchCompanies();
        if (data.user) {
          alert(`Firma ve kullanıcı hesabı oluşturuldu!\n\nGiriş bilgileri:\nE-posta: ${data.user.email}\nŞifre: (belirlediğiniz şifre)`);
        }
      } else {
        alert(data.error || "Firma oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating company:", error);
      alert("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase())
  );

  // Firma özeti oluştur
  const getCompanySummary = (company: Company) => {
    const payments = company.payments || [];
    const lastPayment = payments[0];
    const overdueCount = payments.filter((p: any) => p.status === "OVERDUE").length;
    const pendingAmount = payments
      .filter((p: any) => p.status === "PENDING" || p.status === "OVERDUE")
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    return {
      id: company.id,
      name: company.name,
      floor: company.floor,
      unit: company.unit,
      rentAmount: company.rentAmount,
      lastPaymentStatus: lastPayment?.status || null,
      overdueCount,
      pendingAmount,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Firmalar</h1>
          <p className="text-gray-500 mt-1">Toplam {companies.length} kayıtlı firma</p>
        </div>
        <Button size="md" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Firma
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Firma ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Company Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((company) => (
          <CompanyCard key={company.id} company={getCompanySummary(company)} />
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Firma bulunamadı</p>
        </div>
      )}

      {/* New Company Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Yeni Firma Ekle</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firma Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: ABC Teknoloji A.Ş."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kat</label>
                  <input
                    type="text"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    placeholder="Örn: 3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daire/Ofis No</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Örn: 301"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İletişim Kişisi</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="Örn: 0532 123 4567"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="Örn: info@firma.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aylık Kira (₺) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.rentAmount}
                    onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                    placeholder="Örn: 8000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ödeme Günü <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.rentDueDay}
                    onChange={(e) => setFormData({ ...formData, rentDueDay: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        Her ayın {day}. günü
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kiracı Giriş Bilgileri */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-900">Kiracı Panel Girişi</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.createUser}
                      onChange={(e) => setFormData({ ...formData, createUser: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Kullanıcı hesabı oluştur</span>
                  </label>
                </div>

                {formData.createUser && (
                  <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-blue-700">
                      Bu bilgilerle kiracı paneline giriş yapılabilir.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giriş E-postası <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required={formData.createUser}
                        value={formData.userEmail}
                        onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                        placeholder="Örn: kiraci@firma.com"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Şifre <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required={formData.createUser}
                        minLength={6}
                        value={formData.userPassword}
                        onChange={(e) => setFormData({ ...formData, userPassword: e.target.value })}
                        placeholder="En az 6 karakter"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
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
                  {saving ? "Kaydediliyor..." : "Firma Oluştur"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
