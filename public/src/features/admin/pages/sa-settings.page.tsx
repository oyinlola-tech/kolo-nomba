import { useEffect, useState } from "react";
import { Mail, MessageSquare, Globe, Check, RefreshCw } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Button } from "../../../components/shared/Button";
import { PageHeader } from "../../../components/shared/PageHeader";
import { LoadingState } from "../../../components/shared/LoadingState";
import { ErrorState } from "../../../components/shared/ErrorState";
import { apiClient } from "../../../api/client";
import type { NotificationSettings } from "../../../types/platform.types";

export function SASettings() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<{ data: NotificationSettings }>("/admin/settings/notifications");
      setSettings(data.data);
    } catch {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await apiClient.patch("/admin/settings/notifications", settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error && !settings) return <ErrorState message={error} onRetry={fetchSettings} />;

  return (
    <div>
      <PageHeader title="System Settings" subtitle="Configure global platform behaviour." />
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-5">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Communication Settings</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            These settings override environment defaults. Security emails cannot be disabled.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                  <p className="text-sm text-gray-500">Send transactional emails</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("emailEnabled")}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings?.emailEnabled ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings?.emailEnabled ? "translate-x-6" : ""}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">SMS Notifications</p>
                  <p className="text-sm text-gray-500">Send SMS alerts to members</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("smsEnabled")}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings?.smsEnabled ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings?.smsEnabled ? "translate-x-6" : ""}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">WhatsApp Notifications</p>
                  <p className="text-sm text-gray-500">Send WhatsApp messages</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("whatsappEnabled")}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings?.whatsappEnabled ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings?.whatsappEnabled ? "translate-x-6" : ""}`} />
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Settings"}
            </Button>
            {success && (
              <span className="text-sm text-emerald-600 font-medium">Settings saved successfully</span>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Current Status</p>
          <div className="space-y-3">
            <div className="flex justify-between p-2">
              <span className="text-gray-600 dark:text-gray-400">Email</span>
              <span className={`font-medium ${settings?.emailEnabled ? "text-emerald-600" : "text-red-500"}`}>
                {settings?.emailEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between p-2">
              <span className="text-gray-600 dark:text-gray-400">SMS</span>
              <span className={`font-medium ${settings?.smsEnabled ? "text-emerald-600" : "text-red-500"}`}>
                {settings?.smsEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between p-2">
              <span className="text-gray-600 dark:text-gray-400">WhatsApp</span>
              <span className={`font-medium ${settings?.whatsappEnabled ? "text-emerald-600" : "text-red-500"}`}>
                {settings?.whatsappEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
