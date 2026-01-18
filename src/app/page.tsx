import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo ve Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Akmanlar İş Merkezi
          </h1>
          <p className="text-primary-200">
            Kiracı Takip ve Ödeme Yönetim Sistemi
          </p>
        </div>

        {/* Giriş Kartları */}
        <div className="space-y-4">
          {/* Admin Girişi */}
          <Link
            href="/login?role=admin"
            className="group block bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Yönetim Paneli
                </h2>
                <p className="text-sm text-gray-500">
                  Bina yönetimi ve kiracı takibi
                </p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                <ArrowRight className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </Link>

          {/* Kiracı Girişi */}
          <Link
            href="/login?role=tenant"
            className="group block bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">
                  Kiracı Portalı
                </h2>
                <p className="text-sm text-primary-200">
                  Ödeme ve fatura görüntüleme
                </p>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </div>
          </Link>
        </div>

        {/* Alt Bilgi */}
        <p className="text-center text-primary-300 text-sm mt-8">
          © 2024 Akmanlar İş Merkezi. Tüm hakları saklıdır.
        </p>
      </div>
    </main>
  );
}
