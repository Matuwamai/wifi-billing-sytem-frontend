import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRadiusStats } from "../../services/radius/radiusSlice";
import {
  Loader2,
  Users,
  Activity,
  Wifi,
  Database,
  TrendingUp,
  Clock,
  HardDrive,
} from "lucide-react";

const AdminRadiusDashboard = () => {
  const dispatch = useDispatch();
  const { stats, statsLoading, error } = useSelector((state) => state.radius);

  useEffect(() => {
    dispatch(fetchRadiusStats());

    // Refresh stats every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchRadiusStats());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            RADIUS Dashboard
          </h1>
          <p className="text-blue-300">
            Monitor RADIUS server statistics and active sessions
          </p>
        </div>

        {/* Loading State */}
        {statsLoading && !stats && (
          <div className="flex flex-col justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
            <p className="text-blue-300">Loading RADIUS stats...</p>
          </div>
        )}

        {/* Error State */}
        {error && !statsLoading && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300 mb-6">
            <p className="font-semibold">Error loading RADIUS statistics</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => dispatch(fetchRadiusStats())}
              className="mt-2 px-4 py-2 bg-red-500/30 hover:bg-red-500/40 text-white rounded-lg transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Grid */}
        {!statsLoading && !error && stats && (
          <>
            {/* Main Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-4 rounded-xl border border-white/10 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-300 text-sm">Total Users</span>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats.totalUsers || 0}
                </p>
              </div>

              <div className="bg-gradient-to-r from-emerald-900 to-green-900 p-4 rounded-xl border border-white/10 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-300 text-sm">
                    Active Sessions
                  </span>
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats.activeSessions || 0}
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-4 rounded-xl border border-white/10 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-300 text-sm">
                    Total Sessions
                  </span>
                  <Database className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats.totalSessions || 0}
                </p>
              </div>

              <div className="bg-gradient-to-r from-amber-900 to-yellow-900 p-4 rounded-xl border border-white/10 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-300 text-sm">Recent Auths</span>
                  <Wifi className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats.recentAuthentications || 0}
                </p>
              </div>
            </div>

            {/* Top Users by Data Usage */}
            {stats.topUsers && stats.topUsers.length > 0 && (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Top Users by Data Usage
                </h2>

                <div className="space-y-3">
                  {stats.topUsers.map((user, index) => (
                    <div
                      key={user.username}
                      className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold">
                              {user.username}
                            </p>
                            <p className="text-blue-300 text-sm flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {user.sessions} session
                              {user.sessions !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-lg">
                            {user.totalGB} GB
                          </p>
                          <p className="text-blue-300 text-xs">
                            {user.totalMB} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Server Info */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Connection Stats */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Connection Statistics
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300">Active Now:</span>
                    <span className="text-white font-semibold">
                      {stats.activeSessions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300">Total Sessions:</span>
                    <span className="text-white font-semibold">
                      {stats.totalSessions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300">Success Rate:</span>
                    <span className="text-green-400 font-semibold">
                      {stats.successRate ? `${stats.successRate}%` : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* System Info */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-blue-400" />
                  System Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300">RADIUS Users:</span>
                    <span className="text-white font-semibold">
                      {stats.totalUsers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300">Database Size:</span>
                    <span className="text-white font-semibold">
                      {stats.databaseSize
                        ? formatBytes(stats.databaseSize)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300">Uptime:</span>
                    <span className="text-white font-semibold">
                      {stats.uptime || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminRadiusDashboard;
