"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Building2,
  Bell,
  Shield,
  Palette,
  Save,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useTheme } from "@/lib/theme";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  // Bildirim ayarları
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    overdueAlerts: true,
    paymentConfirmations: true,
  });

  // Genel ayarlar
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "Akmanlar İş Merkezi",
    currency: "TRY",
    language: "tr",
    defaultDueDay: 1,
  });

  const handleSave = () => {
    // LocalStorage'a kaydet
    localStorage.setItem("notifications", JSON.stringify(notifications));
    localStorage.setItem("generalSettings", JSON.stringify(generalSettings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const themeOptions = [
    { value: "light", label: "Açık", icon: Sun, description: "Açık renkli tema" },
    { value: "dark", label: "Koyu", icon: Moon, description: "Koyu renkli tema" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Sistem ayarlarını ve tercihlerinizi yönetin
        </p>
      </div>

      <div className="grid gap-6">
        {/* Tema Ayarları */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Görünüm</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tema ve görünüm ayarları</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value as "light" | "dark")}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  theme === option.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    theme === option.value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <option.icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className={`font-medium ${
                    theme === option.value
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-900 dark:text-white"
                  }`}>
                    {option.label}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                </div>
                {theme === option.value && (
                  <Check className="w-5 h-5 text-blue-500 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Genel Ayarlar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Genel Ayarlar</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">İşletme bilgileri ve tercihler</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                İşletme Adı
              </label>
              <input
                type="text"
                value={generalSettings.companyName}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, companyName: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Para Birimi
              </label>
              <select
                value={generalSettings.currency}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, currency: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="TRY">Türk Lirası (₺)</option>
                <option value="USD">Amerikan Doları ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dil
              </label>
              <select
                value={generalSettings.language}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, language: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Varsayılan Ödeme Günü
              </label>
              <select
                value={generalSettings.defaultDueDay}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, defaultDueDay: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    Her ayın {day}. günü
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bildirim Ayarları */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
              <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bildirimler</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">E-posta ve uygulama bildirimleri</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Ödeme Hatırlatıcıları</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Yaklaşan ödemeler için e-posta hatırlatmaları
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailReminders}
                onChange={(e) =>
                  setNotifications({ ...notifications, emailReminders: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Gecikme Uyarıları</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gecikmiş ödemeler için anlık bildirimler
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.overdueAlerts}
                onChange={(e) =>
                  setNotifications({ ...notifications, overdueAlerts: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Ödeme Onayları</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ödeme alındığında onay bildirimi
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.paymentConfirmations}
                onChange={(e) =>
                  setNotifications({ ...notifications, paymentConfirmations: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Hesap Bilgileri */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hesap Bilgileri</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Giriş yapan kullanıcı bilgileri</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {session?.user?.name?.charAt(0) || "A"}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {session?.user?.name || "Yönetici"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {session?.user?.email || "admin@akmanlar.com"}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                {(session?.user as any)?.role === "ADMIN" ? "Yönetici" : "Kiracı"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saved}>
          {saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Kaydedildi
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Ayarları Kaydet
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
