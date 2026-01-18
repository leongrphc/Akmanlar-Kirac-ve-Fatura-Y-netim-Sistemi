"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Check, Building2 } from "lucide-react";
import { Button, Card, CardContent, CardHeader } from "@/components/ui";
import { formatDate } from "@/lib/utils";

// Demo veri
const mockInvoices = [
  { id: "1", companyName: "Teknoloji A.Ş.", type: "RENT", period: "2024-01", fileName: "kira_2024_01.pdf", fileSize: "245 KB", uploadedAt: "2024-01-02" },
  { id: "2", companyName: "Teknoloji A.Ş.", type: "ELECTRICITY", period: "2024-01", fileName: "elektrik_2024_01.pdf", fileSize: "128 KB", uploadedAt: "2024-01-15" },
  { id: "3", companyName: "Danışmanlık Ltd.", type: "RENT", period: "2024-01", fileName: "danismanlik_kira_01.pdf", fileSize: "312 KB", uploadedAt: "2024-01-05" },
  { id: "4", companyName: "Hukuk Bürosu", type: "WATER", period: "2024-01", fileName: "su_faturasi_01.pdf", fileSize: "98 KB", uploadedAt: "2024-01-20" },
];

const mockCompanies = [
  { id: "1", name: "Teknoloji A.Ş." },
  { id: "2", name: "Danışmanlık Ltd." },
  { id: "3", name: "Yazılım Stüdyosu" },
  { id: "4", name: "Hukuk Bürosu" },
  { id: "5", name: "Finans Grubu" },
];

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = { RENT: "Kira", ELECTRICITY: "Elektrik", WATER: "Su", DUES: "Aidat" };
  return labels[type] || type;
};

export default function InvoicesPage() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ companyId: "", type: "RENT", period: "" });
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    // Demo upload
    setUploadSuccess(true);
    setTimeout(() => {
      setShowUploadModal(false);
      setUploadSuccess(false);
      setSelectedFile(null);
      setFormData({ companyId: "", type: "RENT", period: "" });
    }, 1500);
  };

  const handleDelete = (id: string) => {
    alert(`Fatura #${id} silindi! (Demo)`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faturalar</h1>
          <p className="text-gray-500 mt-1">Fatura ve makbuz yönetimi</p>
        </div>
        <Button size="md" onClick={() => setShowUploadModal(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Fatura Yükle
        </Button>
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockInvoices.map((invoice) => (
          <Card key={invoice.id} hover>
            <CardContent className="py-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <button
                  onClick={() => handleDelete(invoice.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{invoice.fileName}</h3>
              <div className="space-y-1 text-sm text-gray-500">
                <p className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {invoice.companyName}
                </p>
                <p>
                  {getTypeLabel(invoice.type)} • {invoice.period}
                </p>
                <p>{invoice.fileSize} • {formatDate(invoice.uploadedAt)}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button size="sm" variant="secondary" className="w-full">
                  İndir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            {uploadSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Yükleme Başarılı!</h3>
                <p className="text-gray-500 mt-1">Fatura başarıyla yüklendi.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Fatura Yükle</h3>
                  <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">
                          Dosyayı sürükleyin veya <span className="text-blue-600 font-medium">seçin</span>
                        </p>
                        <p className="text-sm text-gray-400 mt-1">PDF, JPG, PNG (max 10MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Form Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
                    <select
                      value={formData.companyId}
                      onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
                    >
                      <option value="">Firma seçin</option>
                      {mockCompanies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fatura Tipi</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
                      >
                        <option value="RENT">Kira</option>
                        <option value="ELECTRICITY">Elektrik</option>
                        <option value="WATER">Su</option>
                        <option value="DUES">Aidat</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dönem</label>
                      <input
                        type="month"
                        value={formData.period}
                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="secondary" className="flex-1" onClick={() => setShowUploadModal(false)}>
                      İptal
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={handleUpload}
                      disabled={!selectedFile || !formData.companyId || !formData.period}
                    >
                      Yükle
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
