import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { User, Mail, Phone, Lock, Building2, Users, RefreshCw, ArrowRight } from "lucide-react";
import { AuthLayout } from "../../../components/layout/AuthLayout";
import { Input } from "../../../components/shared/Input";
import { Button } from "../../../components/shared/Button";
import { FormError } from "../../../components/shared/FormError";
import { parseApiError } from "../../../utils/error";
import * as authService from "../../../services/auth.service";

type RegisterMode = "member" | "cooperative";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<RegisterMode>(location.pathname.includes("cooperative") ? "cooperative" : "member");
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [coopName, setCoopName] = useState("");

  const [error, setError] = useState<{ message: string; fieldErrors?: Record<string, string> } | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const validate = (): boolean => {
    const fe: Record<string, string> = {};
    if (!firstName.trim()) fe.firstName = "Enter your first name";
    if (!lastName.trim()) fe.lastName = "Enter your last name";
    const e = email.trim();
    if (!e || !EMAIL_RE.test(e)) fe.email = "Enter a valid email address";
    const p = phone.trim();
    if (p.length < 10) fe.phone = "Phone must be at least 10 characters";
    if (password.length < 8) fe.password = "Password must be at least 8 characters";
    if (!confirmPassword) fe.confirmPassword = "Confirm your password";
    else if (password !== confirmPassword) fe.confirmPassword = "Passwords do not match";
    if (Object.keys(fe).length > 0) {
      setError({ message: "Please fix the errors below", fieldErrors: fe });
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    setLoading(true);
    try {
      const payload = mode === "member"
        ? { firstName: firstName.trim(), lastName: lastName.trim(), email: trimmedEmail, phone: trimmedPhone, password }
        : { firstName: firstName.trim(), lastName: lastName.trim(), email: trimmedEmail, phone: trimmedPhone, password, coopName: coopName.trim() || undefined };
      const result = await authService.register(payload);
      sessionStorage.setItem("verifyEmail", email);
      navigate(`/verify-otp?userId=${result.userId}`);
    } catch (err: unknown) {
      const parsed = parseApiError(err, "Registration failed. Please check your information.");
      setError(parsed);
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
        <FormError message={error.message} fieldErrors={error.fieldErrors} onDismiss={clearError} />
      )}

      <div className="flex mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => { setMode("member"); clearError(); }}
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
          onClick={() => { setMode("cooperative"); clearError(); }}
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

      <div className="space-y-4">
        <Input label="First Name" placeholder="e.g. Jane" value={firstName} onChange={setFirstName} icon={User} required />
        <Input label="Last Name" placeholder="e.g. Doe" value={lastName} onChange={setLastName} icon={User} required />
        <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon={Mail} required />
        <Input label="Phone Number" placeholder="+1 (000) 000-0000" value={phone} onChange={setPhone} icon={Phone} required />
        {mode === "cooperative" && (
          <Input label="Cooperative / Group Name" placeholder="e.g. Lagos Women Cooperative" value={coopName} onChange={setCoopName} icon={Building2} />
        )}
        <Input label="Password" type="password" placeholder="Min 8 characters" value={password} onChange={setPassword} icon={Lock} required hint="Must be at least 8 characters" />
        <Input label="Confirm Password" type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={setConfirmPassword} icon={Lock} required />
      </div>

      <Button full onClick={handleRegister} disabled={loading} className="mt-6">
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
