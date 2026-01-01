import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  ArrowLeft,
  Home,
  AlertTriangle,
  UserX,
} from "lucide-react";
import { useAuth } from "../../context/AuthContex";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    if (user?.UserRole === "ADMIN") {
      navigate("/admin");
    } else if (isAuthenticated) {
      navigate("/");
    } else {
      navigate("/");
    }
  };

  const handleLoginAsAdmin = () => {
    navigate("/admin/login");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getUserRoleName = () => {
    if (!user?.UserRole) return "Guest";

    const roleMap = {
      ADMIN: "Administrator",
      MODERATOR: "Moderator",
      USER: "Regular User",
    };

    return roleMap[user.UserRole] || user.UserRole;
  };

  const getUserName = () => {
    if (user?.username) return user.username;
    if (user?.phone) return user.phone.replace(/^\+254/, "0");
    return "Guest";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b] p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-600/20 to-orange-500/20 flex items-center justify-center shadow-lg border border-red-500/30">
              <div className="relative">
                <Lock size={48} className="text-red-400" />
                <AlertTriangle
                  size={24}
                  className="text-red-300 absolute -top-2 -right-2"
                />
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-red-500 rounded-full border-4 border-[#0f172a] flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-3">Access Denied</h1>
          <p className="text-lg text-slate-300 max-w-lg mx-auto">
            You don't have permission to access this page
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
          {/* User Info Section */}
          {user && (
            <div className="p-6 bg-gradient-to-r from-slate-800/70 to-slate-900/70 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {getUserName().charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-[#1e293b] flex items-center justify-center">
                      <UserX size={10} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {getUserName()}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs font-medium rounded-full">
                        {getUserRoleName()}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-500">
                        {/* ID: {user.id?.substring(0, 8)}... */}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Current Access Level</p>
                  <p className="text-lg font-bold text-red-400">Insufficient</p>
                </div>
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Error Details */}
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <Shield
                    size={20}
                    className="text-red-400 mt-1 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Permission Required
                    </h4>
                    <p className="text-sm text-slate-400">
                      This page requires{" "}
                      <span className="text-blue-400 font-medium">
                        Administrator
                      </span>{" "}
                      privileges
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={20}
                    className="text-yellow-400 mt-1 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Access Level
                    </h4>
                    <p className="text-sm text-slate-400">
                      Your current role:{" "}
                      <span className="text-yellow-400 font-medium">
                        {getUserRoleName()}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Lock size={16} />
                    Security Notice
                  </h4>
                  <p className="text-sm text-red-300">
                    All unauthorized access attempts are logged and monitored.
                    Repeated attempts may result in account suspension.
                  </p>
                </div>
              </div>

              {/* Right: Resolution Steps */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    What you can do:
                  </h3>

                  <div className="space-y-4">
                    {user?.UserRole === "ADMIN" ? (
                      <div className="bg-blue-900/10 border border-blue-800/30 rounded-lg p-4">
                        <p className="text-sm text-blue-300">
                          You appear to have admin privileges but still can't
                          access this page. Please contact system administrator.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-400 text-sm font-bold">
                              1
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-slate-300">
                              Request admin access from your supervisor
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-400 text-sm font-bold">
                              2
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-slate-300">
                              Login with an admin account if you have one
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-400 text-sm font-bold">
                          3
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-300">
                          Contact IT support for assistance
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Email: support@budgetwifi.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-8 border-t border-slate-700/50">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGoBack}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-lg border border-slate-600 transition-all duration-300"
                >
                  <ArrowLeft size={18} />
                  Go Back
                </button>

                <button
                  onClick={handleGoHome}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-lg shadow-lg transition-all duration-300"
                >
                  <Home size={18} />
                  Go to Dashboard
                </button>

                {!user?.UserRole === "ADMIN" && (
                  <button
                    onClick={handleLoginAsAdmin}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium rounded-lg shadow-lg transition-all duration-300"
                  >
                    <Shield size={18} />
                    Admin Login
                  </button>
                )}

                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600/20 to-red-500/20 hover:from-red-700/30 hover:to-red-600/30 text-red-300 font-medium rounded-lg border border-red-500/30 transition-all duration-300"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 text-sm text-slate-500">
            <span>
              Error Code:{" "}
              <code className="bg-slate-800/50 px-2 py-1 rounded">403</code>
            </span>
            <span>•</span>
            <span>
              Ref:{" "}
              <code className="bg-slate-800/50 px-2 py-1 rounded">
                {/* ACC_DENIED_{user?.id?.substring(0, 6) || "GUEST"} */}
              </code>
            </span>
            <span>•</span>
            <span>Time: {new Date().toLocaleTimeString()}</span>
          </div>

          <p className="mt-4 text-sm text-slate-600">
            If you believe this is an error, please contact the system
            administrator with your user ID and the time of this error.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500">Security Alert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-slate-500">System Online</span>
            </div>
          </div>

          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} Budget WiFi • Secure Admin Portal
          </p>
          <p className="text-xs text-slate-700 mt-1">
            Unauthorized access is strictly prohibited
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
