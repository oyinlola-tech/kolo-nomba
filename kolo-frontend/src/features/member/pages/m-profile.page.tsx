import {
  Lock, Bell, Wallet, ShieldCheck, ChevronRight, LogOut, Pencil,
} from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Badge } from "../../../components/shared/Badge";
import { AccountNumberCard } from "../../../components/shared/AccountNumberCard";
import { Button } from "../../../components/shared/Button";
import { Input } from "../../../components/shared/Input";
import { useAuth } from "../../../hooks/use-auth";
import { useVirtualAccount, useCreateVirtualAccount } from "../../../hooks/use-virtual-account";
import { useUpdateProfile } from "../../../hooks/use-profile";
import { extractApiError } from "../../../utils/error";
import { useAppStore } from "../../../app/store";

import { useState } from "react";
import { useNavigate } from "react-router";

export function MProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const setSession = useAppStore((state) => state.setSession);
  const { data: virtualAccount, isLoading: vaLoading } = useVirtualAccount();
  const createVA = useCreateVirtualAccount();
  const updateProfileMut = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateProfileMut.mutateAsync({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), email: email.trim() });
      setSession(updated, useAppStore.getState().accessToken ?? "");
      setEditing(false);
    } catch (err: unknown) {
      setError(extractApiError(err, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setEmail(user?.email ?? "");
    setPhone(user?.phone ?? "");
    setEditing(true);
  };

  return (
    <div className="px-5 py-5">
      <p className="text-lg font-bold text-gray-900 dark:text-white mb-5">Profile</p>
      <div className="flex flex-col items-center mb-7">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-2xl font-extrabold mb-2">
          {((user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "")).toUpperCase() || "?"}
        </div>
        <p className="font-bold text-gray-900 dark:text-white">{user ? `${user.firstName} ${user.lastName}` : "Member"}</p>
        <p className="text-sm text-gray-500 dark:text-muted-foreground">{user?.email || "—"}</p>
        <Badge status="active" />
      </div>
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 tracking-wider">PERSONAL INFORMATION</p>
          {!editing && (
            <Button variant="ghost" size="sm" onClick={startEdit}><Pencil className="w-3.5 h-3.5" />Edit</Button>
          )}
        </div>
        {editing ? (
          <div className="space-y-3">
            <Input label="First Name" value={firstName} onChange={setFirstName} />
            <Input label="Last Name" value={lastName} onChange={setLastName} />
            <Input label="Phone" value={phone} onChange={setPhone} />
            <Input label="Email" value={email} onChange={setEmail} />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2 pt-1">
              <Button full variant="secondary" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
              <Button full onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            {[["Full Name", user ? `${user.firstName} ${user.lastName}` : "—"], ["Email", user?.email || "—"], ["Phone", user?.phone || "—"], ["Role", user?.role || "—"]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-gray-50 dark:border-border last:border-0">
                <span className="text-gray-500 dark:text-muted-foreground">{k}</span>
                <span className="font-medium text-gray-900 dark:text-white">{v}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 mb-3 tracking-wider">BANK ACCOUNT</p>
        <AccountNumberCard
          accountNumber={virtualAccount?.accountNumber}
          accountName={virtualAccount?.accountName}
          bankName={virtualAccount?.bankName}
          loading={vaLoading}
          onGenerate={() => createVA.mutate()}
          generating={createVA.isPending}
        />
      </div>
      <Card className="p-4 mb-4">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 mb-3 tracking-wider">ACCOUNT SETTINGS</p>
        <div className="space-y-1">
          {[
            { icon: Lock, label: "Change Password", path: "/reset-password" },
            { icon: Bell, label: "Notification Preferences", path: "/member/notifications" },
            { icon: Wallet, label: "Payment Preferences", path: "/member/pay" },
            { icon: ShieldCheck, label: "Security Settings", path: "/member/home" },
          ].map(({ icon: I, label, path }) => (
            <button key={label} onClick={() => navigate(path)} className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-muted transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
              <I className="w-4 h-4 text-gray-400" />{label}<ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
            </button>
          ))}
        </div>
      </Card>
      <button onClick={() => { logout.mutate(undefined, { onSettled: () => navigate("/") }); }}
        className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
        <LogOut className="w-4 h-4" />Sign Out
      </button>
    </div>
  );
}
