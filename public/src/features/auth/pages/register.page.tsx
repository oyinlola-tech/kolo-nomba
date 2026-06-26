import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, RefreshCw, ArrowRight } from "lucide-react";
import { AuthLayout } from "../../../components/layout/AuthLayout";
import { Input } from "../../../components/shared/Input";
import { Button } from "../../../components/shared/Button";
import { useAuth } from "../../../hooks/use-auth";
import { ValidationError } from "../../../components/shared/ErrorState";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = () => {
    setError("");
    register.mutate(
      { firstName, lastName, email, phone, password },
      {
        onSuccess: () => {
          navigate("/member/home");
        },
        onError: (err: Error) => {
          setError(err.message || "Registration failed");
        },
      },
    );
  };

  return (
    <AuthLayout title="Create an account" subtitle="Enter your details to start your journey towards financial growth.">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      <div className="text-xs text-gray-400 dark:text-gray-600 font-semibold tracking-wider mb-5">STEP 1 OF 2 \u2014 Personal Details</div>
      <Input label="First Name" placeholder="e.g. Jane" value={firstName} onChange={setFirstName} icon={User} required />
      <Input label="Last Name" placeholder="e.g. Doe" value={lastName} onChange={setLastName} icon={User} required />
      <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon={Mail} required />
      <Input label="Phone Number" placeholder="+1 (000) 000-0000" value={phone} onChange={setPhone} icon={Phone} required />
      <Input label="Password" type="password" placeholder="Min 8 characters" value={password} onChange={setPassword} icon={Lock} required hint="Must be at least 8 characters" />
      <Button full onClick={handleRegister} disabled={register.isPending} className="mt-2">
        {register.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
        {register.isPending ? "Creating account\u2026" : "Continue"}
        {!register.isPending && <ArrowRight className="w-4 h-4" />}
      </Button>
      <p className="text-center text-sm text-gray-500 dark:text-muted-foreground mt-5">
        Already have an account?{" "}
        <button onClick={() => navigate("/login")} className="text-primary font-semibold hover:underline">Log In</button>
      </p>
    </AuthLayout>
  );
}
