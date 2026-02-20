import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchActiveSessions,
  disconnectUser,
} from "../../services/radius/radiusSlice";
import {
  Loader2,
  Activity,
  User,
  Smartphone,
  Wifi,
  Clock,
  TrendingUp,
  TrendingDown,
  Power,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const AdminActiveSessionsPage = () => {
  const dispatch = useDispatch();
  const {
    activeSessions,
    activeSessionsTotal,
    activeSessionsLoading,
    loading,
    error,
  } = useSelector((state) => state.radius);

  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    dispatch(fetchActiveSessions());
  }, [dispatch]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      dispatch(fetchActiveSessions({ username: searchTerm }));
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch, searchTerm, autoRefresh]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSearch = () => {
    dispatch(fetchActiveSessions({ username: searchTerm }));
  };

  const handleRefresh = () => {
    dispatch(fetchActiveSessions({ username: searchTerm }));
    showNotification("success", "Sessions refreshed");
  };

  const handleDisconnect = async (username) => {
    if (!window.confirm(`Disconnect user "${username}"?`)) {
      return;
    }

    try {
      await dispatch(disconnectUser(username)).unwrap();
      showNotification("success", `User ${username} disconnected successfully`);
      dispatch(fetchActiveSessions({ username: searchTerm }));
    } catch (err) {
      showNotification("error", err.message || "Failed to disconnect user");
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-top duration-300 ${
            notification.type === "success"
              ? "bg-green-500/20 border-green-500/50 text-green-300"
              : "bg-red-500/20 border-red-500/50 text-red-300"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Active Sessions
          </h1>
          <p className="text-blue-300">
            Monitor and manage currently connected users
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-emerald-900 to-green-900 p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-300 text-sm">Active Now</span>
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {activeSessionsTotal || activeSessions?.length || 0}
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-300 text-sm">Auto Refresh</span>
              <RefreshCw
                className={`w-5 h-5 text-blue-400 ${autoRefresh ? "animate-spin" : ""}`}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-500"
              />
              <span className="text-white text-sm">
                {autoRefresh ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>

          <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-300 text-sm">Showing</span>
              <Wifi className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {activeSessions?.length || 0}
            </p>
          </div>
        </div>

        {/* Search and Refresh */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
              <input
                type="text"
                placeholder="Search by username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="bg-white/10 border border-white/20 rounded-lg w-full pl-10 pr-4 py-2.5 text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2.5 rounded-lg hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/30 font-semibold"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </button>

              <button
                onClick={handleRefresh}
                className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2.5 rounded-lg hover:bg-white/20 transition-all font-semibold"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {activeSessionsLoading && (
          <div className="flex flex-col justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
            <p className="text-blue-300">Loading active sessions...</p>
          </div>
        )}

        {/* Error State */}
        {error && !activeSessionsLoading && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300 mb-6">
            <p className="font-semibold">Error loading sessions</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => dispatch(fetchActiveSessions())}
              className="mt-2 px-4 py-2 bg-red-500/30 hover:bg-red-500/40 text-white rounded-lg transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!activeSessionsLoading &&
          !error &&
          (!activeSessions || activeSessions.length === 0) && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-10 h-10 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No Active Sessions
              </h3>
              <p className="text-blue-300">
                No users are currently connected to the network.
              </p>
            </div>
          )}

        {/* Sessions Table */}
        {!activeSessionsLoading &&
          !error &&
          activeSessions &&
          activeSessions.length > 0 && (
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-left p-4 text-blue-300 font-semibold">
                        User
                      </th>
                      <th className="text-left p-4 text-blue-300 font-semibold">
                        Device
                      </th>
                      <th className="text-left p-4 text-blue-300 font-semibold">
                        IP Address
                      </th>
                      <th className="text-left p-4 text-blue-300 font-semibold">
                        Session Time
                      </th>
                      <th className="text-left p-4 text-blue-300 font-semibold">
                        Data Usage
                      </th>
                      <th className="text-center p-4 text-blue-300 font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSessions.map((session) => (
                      <tr
                        key={session.radacctid || session.acctuniqueid}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-white font-medium">
                              {session.username}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-blue-200">
                            <Smartphone className="w-4 h-4" />
                            <span className="font-mono text-sm">
                              {session.callingstationid || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-blue-200 font-mono text-sm">
                            {session.framedipaddress || "N/A"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-blue-200">
                            <Clock className="w-4 h-4" />
                            <div>
                              <p className="text-white font-medium">
                                {formatDuration(session.acctsessiontime)}
                              </p>
                              <p className="text-xs text-blue-300">
                                Since {formatTime(session.acctstarttime)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-green-400 text-sm">
                              <TrendingDown className="w-3 h-3" />
                              <span>
                                {formatBytes(session.acctinputoctets)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-blue-400 text-sm">
                              <TrendingUp className="w-3 h-3" />
                              <span>
                                {formatBytes(session.acctoutputoctets)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleDisconnect(session.username)}
                              disabled={loading}
                              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Disconnect"
                            >
                              <Power className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                Disconnect
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-white/10">
                {activeSessions.map((session) => (
                  <div
                    key={session.radacctid || session.acctuniqueid}
                    className="p-4 hover:bg-white/5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">
                            {session.username}
                          </p>
                          <p className="text-blue-300 text-sm font-mono truncate">
                            {session.framedipaddress || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="bg-white/5 rounded-lg p-2">
                        <span className="text-blue-300 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Duration
                        </span>
                        <p className="text-white font-semibold text-sm">
                          {formatDuration(session.acctsessiontime)}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <span className="text-blue-300 text-xs flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          MAC
                        </span>
                        <p className="text-white font-mono text-xs truncate">
                          {session.callingstationid || "N/A"}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <span className="text-blue-300 text-xs flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          Download
                        </span>
                        <p className="text-green-400 font-semibold text-xs">
                          {formatBytes(session.acctinputoctets)}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <span className="text-blue-300 text-xs flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Upload
                        </span>
                        <p className="text-blue-400 font-semibold text-xs">
                          {formatBytes(session.acctoutputoctets)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDisconnect(session.username)}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50"
                    >
                      <Power className="w-4 h-4" />
                      Disconnect User
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Results Count */}
        {!activeSessionsLoading &&
          !error &&
          activeSessions &&
          activeSessions.length > 0 && (
            <div className="mt-4 text-center text-blue-300 text-sm">
              Showing {activeSessions.length} active session(s)
            </div>
          )}
      </div>
    </div>
  );
};

export default AdminActiveSessionsPage;
