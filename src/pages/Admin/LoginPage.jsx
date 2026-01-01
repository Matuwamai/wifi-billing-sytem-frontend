import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Eye, EyeOff, LogIn, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const LoginPage = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, clearError, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for stored credentials
  useEffect(() => {
    const savedPhone = localStorage.getItem("admin_phone");
    const savedRemember = localStorage.getItem("remember_admin");

    if (savedRemember === "true" && savedPhone) {
      setPhone(savedPhone);
      setRememberMe(true);
    }

    // Clear any previous errors
    clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone || !password) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    // Save phone if remember me is checked
    if (rememberMe) {
      localStorage.setItem("admin_phone", phone);
      localStorage.setItem("remember_admin", "true");
    } else {
      localStorage.removeItem("admin_phone");
      localStorage.removeItem("remember_admin");
    }

    const credentials = { phone, password };

    try {
      const result = await login(credentials);

      if (result.success) {
        // Navigate to the intended destination or default admin dashboard
        const from = location.state?.from?.pathname || "/admin";
        navigate(from, { replace: true });
      } else {
        setIsSubmitting(false);
      }
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setPhone("+254700000000");
    setPassword("admin123");
    setRememberMe(true);

    // Auto-submit after a short delay
    setTimeout(() => {
      document
        .getElementById("loginForm")
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true })
        );
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b] p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
                <Shield size={40} className="text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[#0f172a] flex items-center justify-center">
                <Lock size={12} className="text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400">
            Secure access to Budget WiFi dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl">
              <LogIn size={24} className="text-blue-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Sign in to continue
          </h2>

          <form id="loginForm" onSubmit={handleSubmit}>
            {/* Phone Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-sm">+254</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-16 pr-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="700 000 000"
                  required
                  disabled={loading || isSubmitting}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  disabled={loading || isSubmitting}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                  disabled={loading || isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading || isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-slate-400" />
                  ) : (
                    <Eye size={20} className="text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-8">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-700 rounded focus:ring-blue-500 focus:ring-offset-slate-900"
                  disabled={loading || isSubmitting}
                />
                <span className="ml-2 text-sm text-slate-300">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                onClick={() => navigate("/admin/forgot-password")}
                disabled={loading || isSubmitting}
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                <p className="text-red-300 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isSubmitting || !phone || !password}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading || isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Demo Login Button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading || isSubmitting}
              className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 border border-slate-600 text-slate-300 font-semibold rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Shield size={20} className="text-blue-400" />
              <span>Use Demo Admin Account</span>
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <div className="flex items-start gap-3">
              <Shield size={16} className="text-green-400 mt-0.5" />
              <p className="text-xs text-slate-400">
                This is a secure admin portal. All login attempts are logged and
                monitored. Unauthorized access is prohibited.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Budget WiFi Admin Panel v1.0
          </p>
          <p className="text-xs text-slate-600 mt-1">
            For authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
