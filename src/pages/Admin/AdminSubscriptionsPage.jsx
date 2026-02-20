import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllSubscriptions } from "../../services/subscription/subscriptionSlice.js";
import {
  Loader2,
  Wifi,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Search,
  Download,
} from "lucide-react";

const AdminSubscriptionsPage = () => {
  const dispatch = useDispatch();
  const { allSubscriptions, loading, error } = useSelector(
    (state) => state.subscription,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    dispatch(fetchAllSubscriptions());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: {
        icon: CheckCircle,
        className: "bg-green-500/20 text-green-300 border-green-500/50",
        text: "Active",
      },
      EXPIRED: {
        icon: XCircle,
        className: "bg-red-500/20 text-red-300 border-red-500/50",
        text: "Expired",
      },
      CANCELLED: {
        icon: AlertCircle,
        className: "bg-orange-500/20 text-orange-300 border-orange-500/50",
        text: "Cancelled",
      },
    };

    const config = statusConfig[status] || statusConfig.EXPIRED;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${config.className}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter subscriptions
  const filteredSubscriptions = allSubscriptions.filter((sub) => {
    const matchesSearch =
      sub.user?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: allSubscriptions.length,
    active: allSubscriptions.filter((s) => s.status === "ACTIVE").length,
    expired: allSubscriptions.filter((s) => s.status === "EXPIRED").length,
    cancelled: allSubscriptions.filter((s) => s.status === "CANCELLED").length,
  };

  const exportToCSV = () => {
    const headers = [
      "Phone",
      "Plan",
      "Duration",
      "Status",
      "Start Date",
      "End Date",
    ];
    const rows = filteredSubscriptions.map((sub) => [
      sub.user?.phone || "N/A",
      sub.plan?.name || "N/A",
      `${sub.plan?.durationValue} ${sub.plan?.durationType.toLowerCase()}(s)`,
      sub.status,
      formatDate(sub.startDate),
      formatDate(sub.endDate),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscriptions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
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
            All Subscriptions
          </h1>
          <p className="text-blue-300">
            Monitor and manage all user subscriptions
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-300 text-sm">Total</span>
              <Wifi className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-r from-emerald-900 to-green-900 p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-300 text-sm">Active</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.active}</p>
          </div>

          <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-300 text-sm">Expired</span>
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.expired}</p>
          </div>

          <div className="bg-gradient-to-r from-amber-900 to-yellow-900 p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-300 text-sm">Cancelled</span>
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
              <input
                type="text"
                placeholder="Search by phone or plan name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg w-full pl-10 pr-4 py-2.5 text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="ALL" className="bg-slate-800">
                  All Status
                </option>
                <option value="ACTIVE" className="bg-slate-800">
                  Active
                </option>
                <option value="EXPIRED" className="bg-slate-800">
                  Expired
                </option>
                <option value="CANCELLED" className="bg-slate-800">
                  Cancelled
                </option>
              </select>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2.5 rounded-lg hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/30 font-semibold"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300">
            <p className="font-semibold">Error loading subscriptions</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading &&
          !error &&
          filteredSubscriptions.length === 0 &&
          allSubscriptions.length === 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-10 h-10 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No Subscriptions Yet
              </h3>
              <p className="text-blue-300">
                No users have subscribed to any plans yet.
              </p>
            </div>
          )}

        {/* No Results */}
        {!loading &&
          !error &&
          filteredSubscriptions.length === 0 &&
          allSubscriptions.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
              <p className="text-blue-300">
                No subscriptions match your filters.
              </p>
            </div>
          )}

        {/* Subscriptions Table */}
        {!loading && !error && filteredSubscriptions.length > 0 && (
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
                      Plan
                    </th>
                    <th className="text-left p-4 text-blue-300 font-semibold">
                      Duration
                    </th>
                    <th className="text-left p-4 text-blue-300 font-semibold">
                      Start Date
                    </th>
                    <th className="text-left p-4 text-blue-300 font-semibold">
                      End Date
                    </th>
                    <th className="text-left p-4 text-blue-300 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((subscription) => (
                    <tr
                      key={subscription.id}
                      className="border-b border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-400 rounded-lg flex items-center justify-center">
                            <Phone className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-white font-medium">
                            {subscription.user?.phone || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium">
                            {subscription.plan?.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-blue-200">
                          <Clock className="w-4 h-4" />
                          <span>
                            {subscription.plan?.durationValue}{" "}
                            {subscription.plan?.durationType}(s)
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-blue-200">
                        {formatDate(subscription.startTime)}
                      </td>
                      <td className="p-4 text-blue-200">
                        {formatDate(subscription.endTime)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(subscription.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-white/10">
              {filteredSubscriptions.map((subscription) => (
                <div key={subscription.id} className="p-4 hover:bg-white/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {subscription.user?.phone || "N/A"}
                        </p>
                        <p className="text-blue-300 text-sm flex items-center gap-1">
                          <Wifi className="w-3 h-3" />
                          {subscription.plan?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(subscription.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white/5 rounded-lg p-2">
                      <span className="text-blue-300 text-xs">Duration</span>
                      <p className="text-white font-semibold">
                        {subscription.plan?.durationValue}{" "}
                        {subscription.plan?.durationType}(s)
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <span className="text-blue-300 text-xs">Started</span>
                      <p className="text-white font-semibold text-xs">
                        {formatDate(subscription.startDate)}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 col-span-2">
                      <span className="text-blue-300 text-xs">Expires</span>
                      <p className="text-white font-semibold text-xs">
                        {formatDate(subscription.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && filteredSubscriptions.length > 0 && (
          <div className="mt-4 text-center text-blue-300 text-sm">
            Showing {filteredSubscriptions.length} of {allSubscriptions.length}{" "}
            subscriptions
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptionsPage;
