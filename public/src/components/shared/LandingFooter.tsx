import { useNavigate } from "react-router-dom";
import { Logo } from "./Logo";

export function LandingFooter() {
  const navigate = useNavigate();
  return (
    <footer className="bg-gray-900 dark:bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="sm:col-span-2 md:col-span-1">
            <button onClick={() => navigate("/")} className="mb-4 block">
              <Logo theme="light" size="sm" />
            </button>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Digitizing traditional cooperative savings for modern Africa.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Product</p>
            <ul className="space-y-2.5">
              <li><button onClick={() => navigate("/how-it-works")} className="text-sm text-gray-400 hover:text-white transition-colors">How It Works</button></li>
              <li><button onClick={() => navigate("/pricing")} className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</button></li>
              <li><button onClick={() => navigate("/security")} className="text-sm text-gray-400 hover:text-white transition-colors">Security</button></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Company</p>
            <ul className="space-y-2.5">
              <li><button onClick={() => navigate("/about")} className="text-sm text-gray-400 hover:text-white transition-colors">About</button></li>
              <li><button onClick={() => navigate("/contact")} className="text-sm text-gray-400 hover:text-white transition-colors">Contact</button></li>
              <li><button onClick={() => navigate("/help")} className="text-sm text-gray-400 hover:text-white transition-colors">Help Center</button></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Legal</p>
            <ul className="space-y-2.5">
              <li><button onClick={() => navigate("/terms")} className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</button></li>
              <li><button onClick={() => navigate("/privacy")} className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</button></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} KOLO Limited. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">
              <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 text-emerald-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              GDPR
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">
              <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 text-emerald-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              NDPR
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">
              <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 text-emerald-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              PCI-DSS
            </span>
          </div>
          <p className="text-xs text-gray-500">Powered by Nomba Payment Infrastructure</p>
        </div>
      </div>
    </footer>
  );
}
