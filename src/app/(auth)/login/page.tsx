"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Building2, ArrowLeft, Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "admin";
  const callbackUrl = role === "admin" ? "/admin" : "/portal";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = role === "admin";

  return (
    <main className={`min-h-screen flex items-center justify-center p-4 ${
      isAdmin
        ? "bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900"
        : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    }`}>
      <div className="max-w-md w-full">
        {/* Geri Butonu */}
        <Link
          href="/"
          className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Sayfa
        </Link>

        {/* Giriş Kartı */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={`px-8 py-6 text-center ${
            isAdmin ? "bg-primary-600" : "bg-gray-700"
          }`}>
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl mb-3">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">
              {isAdmin ? "Yönetim Paneli" : "Kiracı Portalı"}
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Akmanlar İş Merkezi
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@sirket.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isAdmin
                  ? "bg-primary-600 hover:bg-primary-700"
                  : "bg-gray-700 hover:bg-gray-800"
              }`}
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Giriş yapılıyor...
                </span>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>
        </div>

        {/* Demo bilgisi */}
        <div className="mt-6 text-center">
          <p className="text-white/50 text-sm">
            Demo: admin@akmanlar.com / demo123
          </p>
        </div>
      </div>
    </main>
  );
}
