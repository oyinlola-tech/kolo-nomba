import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Mail, Phone, Lock, Building2, RefreshCw, ArrowRight } from "lucide-react";
import { AuthLayout } from "../../../components/layout/AuthLayout";
import { Input } from "../../../components/shared/Input";
import { Button } from "../../../components/shared/Button";
import { extractApiError } from "../../../utils/error";
import * as authService from "../../../services/auth.service";

export function RegisterCoopPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coopName, setCoopName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    const [firstName, ...rest] = name.split(" ");
    const lastName = rest.join(" ") || firstName;
    try {
      const result = await authService.register({
        firstName: firstName || name,
        lastName: lastName || "",
        email,
        phone,
        password,
        coopName,
      });
      sessionStorage.setItem("verifyEmail", email);
      navigate(`/verify-otp?userId=${result.userId}`);
    } catch (err: unknown) {
      setError(extractApiError(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create a Cooperative Account" subtitle="Set up your cooperative and start managing group savings today.">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}
      <div className="text-xs text-gray-400 dark:text-gray-600 font-semibold tracking-wider mb-5">STEP 1 OF 3 — Admin Details</div>
      <Input label="Full Name" placeholder="e.g. Jane Doe" value={name} onChange={setName} icon={User} required />
      <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon={Mail} required />
      <Input label="Phone Number" placeholder="+1 (000) 000-0000" value={phone} onChange={setPhone} icon={Phone} required />
      <Input label="Cooperative / Group Name" placeholder="e.g. Lagos Women Cooperative" value={coopName} onChange={setCoopName} icon={Building2} />
      <Input label="Password" type="password" placeholder="Min 8 characters" value={password} onChange={setPassword} icon={Lock} required hint="Must be at least 8 characters" />
      <Button full onClick={handleRegister} disabled={loading} className="mt-2">
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
        {loading ? "Creating account…" : "Continue"}
        {!loading && <ArrowRight className="w-4 h-4" />}
      </Button>
      <p className="text-center text-sm text-gray-500 dark:text-muted-foreground mt-5">
        Already have an account?{" "}
        <button onClick={() => navigate("/login")} className="text-primary font-semibold hover:underline">Log In</button>
      </p>
    </AuthLayout>
  );
}
