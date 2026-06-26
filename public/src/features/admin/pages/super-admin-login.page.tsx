import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, Key, RefreshCw } from "lucide-react";
import { Input } from "../../../components/shared/Input";

export function SuperAdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate("/ajo/admin/dashboard"); }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Platform Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Restricted access</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <Input label="Admin Email" type="email" placeholder="admin@kolo.africa" value={email} onChange={setEmail} icon={Mail} />
          <Input label="Password" type="password" placeholder="Enter password" value={password} onChange={setPassword} icon={Lock} />
          <button className="w-full mt-1 mb-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all flex items-center justify-center gap-2"
            onClick={handleLogin} disabled={loading}>
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            {loading ? "Authenticating…" : "Access Dashboard"}
          </button>
          <p className="text-xs text-gray-600 text-center">This page is not publicly linked. Unauthorized access is logged.</p>
        </div>
      </div>
    </div>
  );
}
