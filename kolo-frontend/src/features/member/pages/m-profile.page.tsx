import {
  Lock, Bell, Wallet, ShieldCheck, ChevronRight, LogOut, Pencil, Mail, Phone, User,
} from "lucide-react";
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
  const userName = user ? `${user.firstName} ${user.lastName}` : "Member";
  const initials = ((user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "")).toUpperCase() || "?";

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
    <div className="px-4 sm:px-5 lg:px-6 py-4 lg:py-5 space-y-5">

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 rounded-2xl lg:rounded-3xl px-5 lg:px-6 pt-6 lg:pt-7 pb-5 lg:pb-6 text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/15 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3 text-white text-2xl lg:text-3xl font-extrabold border-2 border-white/20 shadow-xl shadow-emerald-900/30">
            {initials}
          </div>
          <p className="font-bold text-lg lg:text-xl text-white">{userName}</p>
          <p className="text-emerald-200/70 text-xs">{user?.email || "—"}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur text-emerald-200 text-[10px] font-semibold px-3 py-1 rounded-full border border-emerald-400/20">
            <ShieldCheck className="w-3 h-3" />
            {user?.role === "MEMBER" ? "Member" : user?.role || "Active"}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-gray-400 dark:text-muted-foreground uppercase tracking-wider">Personal Info</p>
          </div>
          {!editing && (
            <Button variant="ghost" size="sm" onClick={startEdit}>
              <Pencil className="w-3 h-3" />Edit
            </Button>
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
          <div className="space-y-0">
            {[
              { icon: User, label: "Full Name", value: userName },
              { icon: Mail, label: "Email", value: user?.email || "—" },
              { icon: Phone, label: "Phone", value: user?.phone || "—" },
              { icon: ShieldCheck, label: "Role", value: user?.role || "—" },
            ].map(({ icon: I, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-border/50 last:border-0">
                <div className="w-7 h-7 bg-gray-50 dark:bg-muted rounded-lg flex items-center justify-center">
                  <I className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 dark:text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bank Account */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-gray-400 dark:text-muted-foreground uppercase tracking-wider">Bank Account</p>
        </div>
        <AccountNumberCard
          accountNumber={virtualAccount?.accountNumber}
          accountName={virtualAccount?.accountName}
          bankName={virtualAccount?.bankName}
          loading={vaLoading}
          onGenerate={() => createVA.mutate()}
          generating={createVA.isPending}
        />
      </div>

      {/* Account Settings */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-gray-50 dark:bg-muted rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <p className="text-xs font-semibold text-gray-400 dark:text-muted-foreground uppercase tracking-wider">Settings</p>
        </div>
        <div className="space-y-0.5">
          {[
            { icon: Lock, label: "Change Password", path: "/reset-password" },
            { icon: Bell, label: "Notification Preferences", path: "/member/notifications" },
            { icon: Wallet, label: "Payment Preferences", path: "/member/pay" },
          ].map(({ icon: I, label, path }) => (
            <button key={label} onClick={() => navigate(path)}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
              <I className="w-4 h-4 text-gray-400" />{label}<ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
            </button>
          ))}
        </div>
      </div>

      {/* Sign Out */}
      <button onClick={() => { logout.mutate(undefined, { onSettled: () => navigate("/") }); }}
        className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl lg:rounded-2xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
        <LogOut className="w-4 h-4" />Sign Out
      </button>
    </div>
  );
}
