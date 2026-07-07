import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { User, Mail, Phone, Lock, Building2, Users, RefreshCw, ArrowRight } from "lucide-react";
import { AuthLayout } from "../../../components/layout/AuthLayout";
import { Input } from "../../../components/shared/Input";
import { Button } from "../../../components/shared/Button";
import { extractApiError } from "../../../utils/error";
import * as authService from "../../../services/auth.service";

type RegisterMode = "member" | "cooperative";

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<RegisterMode>(location.pathname.includes("cooperative") ? "cooperative" : "member");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [coopName, setCoopName] = useState("");

  const handleRegister = async () => {
    setError("");
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    if (!firstName.trim()) { setError("First name is required"); return; }
    if (!lastName.trim()) { setError("Last name is required"); return; }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) { setError("Please enter a valid email address"); return; }
    if (trimmedPhone.length < 10) { setError("Phone number must be at least 10 characters"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    try {
      const payload = mode === "member"
        ? { firstName: firstName.trim(), lastName: lastName.trim(), email: trimmedEmail, phone: trimmedPhone, password }
        : { firstName: firstName.trim(), lastName: lastName.trim() || firstName.trim(), email: trimmedEmail, phone: trimmedPhone, password, coopName: coopName.trim() || undefined };
      const result = await authService.register(payload);
      sessionStorage.setItem("verifyEmail", email);
      navigate(`/verify-otp?userId=${result.userId}`);
    } catch (err: unknown) {
      setError(extractApiError(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={mode === "member" ? "Create an account" : "Create a Cooperative Account"}
      subtitle={mode === "member" ? "Enter your details to start your journey towards financial growth." : "Set up your cooperative and start managing group savings today."}
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => setMode("member")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            mode === "member"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Users className="w-4 h-4" />
          Member
        </button>
        <button
          onClick={() => setMode("cooperative")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            mode === "cooperative"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Cooperative
        </button>
      </div>

      {mode === "member" ? (
        <>
          <div className="text-xs text-gray-400 dark:text-gray-600 font-semibold tracking-wider mb-5">STEP 1 OF 2 Personal Details</div>
          <Input label="First Name" placeholder="e.g. Jane" value={firstName} onChange={setFirstName} icon={User} required />
          <Input label="Last Name" placeholder="e.g. Doe" value={lastName} onChange={setLastName} icon={User} required />
          <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon={Mail} required />
          <Input label="Phone Number" placeholder="+1 (000) 000-0000" value={phone} onChange={setPhone} icon={Phone} required />
          <Input label="Password" type="password" placeholder="Min 8 characters" value={password} onChange={setPassword} icon={Lock} required hint="Must be at least 8 characters" />
        </>
      ) : (
        <>
          <div className="text-xs text-gray-400 dark:text-gray-600 font-semibold tracking-wider mb-5">STEP 1 OF 3 Admin Details</div>
          <Input label="Full Name" placeholder="e.g. Jane Doe" value={firstName} onChange={setFirstName} icon={User} required />
          <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon={Mail} required />
          <Input label="Phone Number" placeholder="+1 (000) 000-0000" value={phone} onChange={setPhone} icon={Phone} required />
          <Input label="Cooperative / Group Name" placeholder="e.g. Lagos Women Cooperative" value={coopName} onChange={setCoopName} icon={Building2} />
          <Input label="Password" type="password" placeholder="Min 8 characters" value={password} onChange={setPassword} icon={Lock} required hint="Must be at least 8 characters" />
        </>
      )}

      <Button full onClick={handleRegister} disabled={loading} className="mt-2">
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
        {loading ? "Creating account\u2026" : "Continue"}
        {!loading && <ArrowRight className="w-4 h-4" />}
      </Button>
      <p className="text-center text-sm text-gray-500 dark:text-muted-foreground mt-5">
        Already have an account?{" "}
        <button onClick={() => navigate("/login")} className="text-primary font-semibold hover:underline">Log In</button>
      </p>
    </AuthLayout>
  );
}
