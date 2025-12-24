// src/pages/Admin/UsersPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsers,
  fetchUserProfile,
  clearSelectedUser,
} from "../../services/users/userSlices";
import {
  Users,
  User,
  Phone,
  Wifi,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  Smartphone,
  Globe,
  Calendar,
  DollarSign,
  BarChart3,
  Hash,
  X,
  Filter,
  Download,
  UserCheck,
  UserX,
} from "lucide-react";

const UsersPage = () => {
  const dispatch = useDispatch();

  // Get the full user state
  const userState = useSelector((state) => state.user || {});

  // Safely extract data with defaults
  const loading = userState?.loading || false;
  const detailsLoading = userState?.detailsLoading || false;
  const error = userState?.error || null;
  const selectedUser = userState?.selectedUser || null;

  // Extract users from multiple possible locations
  let userList = [];
  if (userState) {
    if (Array.isArray(userState.users)) {
      userList = userState.users;
    } else if (userState.data?.users && Array.isArray(userState.data.users)) {
      userList = userState.data.users;
    } else if (Array.isArray(userState.data)) {
      userList = userState.data;
    }
  }

  // State variables
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  console.log("Extracted userList:", userList);
  console.log("User state structure:", userState);

  useEffect(() => {
    console.log("Fetching users...");
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Debug: Log the state
  useEffect(() => {
    console.log("Current users state:", {
      users: userList?.length,
      loading,
      error,
    });
  }, [userList, loading, error]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = [...(userList || [])];

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(
        (user) =>
          (user.phone && user.phone.toLowerCase().includes(searchLower)) ||
          (user.username &&
            user.username.toLowerCase().includes(searchLower)) ||
          (user.macAddress &&
            user.macAddress.toLowerCase().includes(searchLower))
      );
    }

    // Apply type filter
    if (filter === "guest") {
      result = result.filter((user) => user.isGuest);
    } else if (filter === "registered") {
      result = result.filter((user) => !user.isGuest);
    } else if (filter === "active") {
      result = result.filter((user) => user.status === "ACTIVE");
    } else if (filter === "inactive") {
      result = result.filter((user) => user.status !== "ACTIVE");
    }

    // Apply sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "mostActive") {
      result.sort(
        (a, b) =>
          (b.subscriptions?.length || 0) - (a.subscriptions?.length || 0)
      );
    }

    return result;
  }, [userList, debouncedSearch, filter, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = userList?.length || 0;
    const guestUsers = userList?.filter((u) => u.isGuest).length || 0;
    const registeredUsers = userList?.filter((u) => !u.isGuest).length || 0;
    const activeUsers =
      userList?.filter((u) => u.status === "ACTIVE").length || 0;
    const totalSubscriptions =
      userList?.reduce(
        (sum, user) => sum + (user.subscriptions?.length || 0),
        0
      ) || 0;
    const totalPayments =
      userList?.reduce((sum, user) => sum + (user.payments?.length || 0), 0) ||
      0;
    const totalRevenue =
      userList?.reduce((sum, user) => {
        const userPayments =
          user.payments?.filter((p) => p.status === "SUCCESS") || [];
        return (
          sum +
          userPayments.reduce(
            (paymentSum, payment) => paymentSum + (payment.amount || 0),
            0
          )
        );
      }, 0) || 0;

    return {
      totalUsers,
      guestUsers,
      registeredUsers,
      activeUsers,
      totalSubscriptions,
      totalPayments,
      totalRevenue,
    };
  }, [userList]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadge = (status, isGuest) => {
    if (status !== "ACTIVE") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-red-500/50 bg-red-500/20 text-red-300 text-xs font-semibold">
          <XCircle className="w-3.5 h-3.5" />
          Inactive
        </span>
      );
    }

    if (isGuest) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-blue-500/50 bg-blue-500/20 text-blue-300 text-xs font-semibold">
          <User className="w-3.5 h-3.5" />
          Guest
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
        <UserCheck className="w-3.5 h-3.5" />
        Registered
      </span>
    );
  };

  const handleViewDetails = async (userId) => {
    console.log("Viewing details for user ID:", userId);
    if (!userId) return;

    try {
      await dispatch(fetchUserProfile(userId));
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    if (dispatch && clearSelectedUser) {
      dispatch(clearSelectedUser());
    }
  };

  const exportToCSV = () => {
    if (!userList || userList.length === 0) {
      alert("No users to export");
      return;
    }

    const headers = [
      "ID",
      "Phone",
      "Username",
      "Type",
      "Status",
      "Device",
      "Subscriptions",
      "Payments",
      "Created Date",
    ];

    const rows = userList.map((user) => [
      user.id,
      user.phone || "N/A",
      user.username || "N/A",
      user.isGuest ? "Guest" : "Registered",
      user.status,
      user.deviceName || "N/A",
      user.subscriptions?.length || 0,
      user.payments?.length || 0,
      formatDate(user.createdAt),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
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
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
              <Users className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              User Management
            </h1>
          </div>
          <p className="text-blue-300">
            Manage and monitor all system users and their activities
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-300 text-sm">Total Users</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-blue-300">{stats.guestUsers} Guest</span>
              <span className="text-emerald-300">
                {stats.registeredUsers} Registered
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-900 to-green-900 p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-300 text-sm">Active Users</span>
              <UserCheck className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
            <div className="text-green-300 text-xs mt-2">
              {stats.totalUsers > 0
                ? `${Math.round(
                    (stats.activeUsers / stats.totalUsers) * 100
                  )}% Active`
                : "0% Active"}
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-300 text-sm">Subscriptions</span>
              <Wifi className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.totalSubscriptions}
            </p>
            <div className="text-purple-300 text-xs mt-2">
              Avg:{" "}
              {stats.totalUsers > 0
                ? (stats.totalSubscriptions / stats.totalUsers).toFixed(1)
                : 0}{" "}
              per user
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-900 to-yellow-900 p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-300 text-sm">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-lg font-bold text-white">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <div className="text-amber-300 text-xs mt-2">
              {stats.totalPayments} Payments
            </div>
          </div>
        </div>

        {/* Search, Filter, and Export */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
              <input
                type="text"
                placeholder="Search by phone, username, or MAC address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg w-full pl-10 pr-4 py-2.5 text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-8 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
                >
                  <option value="all">All Users</option>
                  <option value="guest">Guest Users</option>
                  <option value="registered">Registered Users</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="relative">
                <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-8 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="mostActive">Most Active</option>
                </select>
              </div>

              <button
                onClick={exportToCSV}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2.5 rounded-lg hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/30 font-semibold"
              >
                <Download className="w-4 h-4" />
                <span className="hidden lg:inline">Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-blue-300">Loading users...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300 mb-6">
            <p className="font-semibold">Error loading users</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => dispatch(fetchAllUsers())}
              className="mt-2 px-4 py-2 bg-red-500/30 hover:bg-red-500/40 text-white rounded-lg transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && userList.length === 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No Users Found
            </h3>
            <p className="text-blue-300">No users have been registered yet.</p>
          </div>
        )}

        {/* Users Table */}
        {!loading && !error && filteredUsers.length > 0 && (
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
                      Type
                    </th>
                    <th className="text-left p-4 text-blue-300 font-semibold">
                      Device
                    </th>
                    <th className="text-left p-4 text-blue-300 font-semibold">
                      Subscriptions
                    </th>
                    <th className="text-left p-4 text-blue-300 font-semibold">
                      Payments
                    </th>
                    <th className="text-left p-4 text-blue-300 font-semibold">
                      Created
                    </th>
                    <th className="text-center p-4 text-blue-300 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                            {user.isGuest ? (
                              <User className="w-5 h-5 text-white" />
                            ) : (
                              <UserCheck className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {user.phone || user.username || `User ${user.id}`}
                            </p>
                            {user.username && user.phone && (
                              <p className="text-blue-300 text-xs">
                                {user.phone} • {user.username}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(user.status, user.isGuest)}
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Smartphone className="w-4 h-4 text-blue-400" />
                            <span className="text-white truncate max-w-[150px]">
                              {user.deviceName || "Unknown"}
                            </span>
                          </div>
                          {user.macAddress && (
                            <p className="text-blue-300 text-xs font-mono">
                              {user.macAddress}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-purple-400" />
                          <span className="text-white font-semibold">
                            {user.subscriptions?.length || 0}
                          </span>
                          <div className="flex gap-1">
                            {user.subscriptions?.slice(0, 2).map((sub) => (
                              <span
                                key={sub.id}
                                className={`w-2 h-2 rounded-full ${
                                  sub.status === "ACTIVE"
                                    ? "bg-green-500"
                                    : "bg-amber-500"
                                }`}
                                title={sub.status}
                              />
                            ))}
                            {user.subscriptions?.length > 2 && (
                              <span className="text-blue-300 text-xs">
                                +{user.subscriptions.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-amber-400" />
                          <span className="text-white font-semibold">
                            {user.payments?.length || 0}
                          </span>
                          {user.payments && user.payments.length > 0 && (
                            <span className="text-green-400 text-xs">
                              KES{" "}
                              {user.payments
                                .filter((p) => p.status === "SUCCESS")
                                .reduce((sum, p) => sum + (p.amount || 0), 0)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-blue-200 text-sm">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleViewDetails(user.id)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
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
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 hover:bg-white/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
                        {user.isGuest ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <UserCheck className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">
                          {user.phone || user.username || `User ${user.id}`}
                        </p>
                        {user.username && user.phone && (
                          <p className="text-blue-300 text-xs truncate">
                            {user.phone} • {user.username}
                          </p>
                        )}
                        <div className="mt-1">
                          {getStatusBadge(user.status, user.isGuest)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="bg-white/5 rounded-lg p-2">
                      <span className="text-blue-300 text-xs">Device</span>
                      <p className="text-white text-xs truncate">
                        {user.deviceName || "Unknown"}
                      </p>
                      {user.macAddress && (
                        <p className="text-blue-300 text-xs font-mono truncate">
                          {user.macAddress}
                        </p>
                      )}
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <span className="text-blue-300 text-xs">Created</span>
                      <p className="text-white text-xs">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <span className="text-blue-300 text-xs">
                        Subscriptions
                      </span>
                      <p className="text-white font-semibold text-sm">
                        {user.subscriptions?.length || 0}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <span className="text-blue-300 text-xs">Payments</span>
                      <p className="text-white font-semibold text-sm">
                        {user.payments?.length || 0}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewDetails(user.id)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-2 rounded-lg transition-colors text-sm font-semibold"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && filteredUsers.length > 0 && (
          <div className="mt-4 text-center text-blue-300 text-sm">
            Showing {filteredUsers.length} of {userList.length} user(s)
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 px-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl p-6 sm:p-8 relative border border-white/10 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeDetailsModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {detailsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mb-4 shadow-lg shadow-blue-500/50">
                    <User className="text-white w-8 h-8" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    User Details
                  </h2>
                  <div className="inline-block">
                    {getStatusBadge(selectedUser.status, selectedUser.isGuest)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* User Info */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      User Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-200 text-sm">User ID:</span>
                        <span className="text-white font-mono">
                          #{selectedUser.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200 text-sm">Phone:</span>
                        <span className="text-white font-medium">
                          {selectedUser.phone || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200 text-sm">Username:</span>
                        <span className="text-white">
                          {selectedUser.username || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200 text-sm">
                          Account Type:
                        </span>
                        <span
                          className={`font-semibold ${
                            selectedUser.isGuest
                              ? "text-blue-300"
                              : "text-emerald-300"
                          }`}
                        >
                          {selectedUser.isGuest
                            ? "Guest User"
                            : "Registered User"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200 text-sm">Status:</span>
                        <span
                          className={`font-semibold ${
                            selectedUser.status === "ACTIVE"
                              ? "text-emerald-300"
                              : "text-red-300"
                          }`}
                        >
                          {selectedUser.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Device Info */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Device Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-200 text-sm">
                          Device Name:
                        </span>
                        <span className="text-white">
                          {selectedUser.deviceName || "Unknown"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200 text-sm">
                          MAC Address:
                        </span>
                        <span className="text-white font-mono text-sm">
                          {selectedUser.macAddress || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200 text-sm">Joined:</span>
                        <span className="text-white">
                          {formatDate(selectedUser.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200 text-sm">
                          Last Updated:
                        </span>
                        <span className="text-white">
                          {formatDate(selectedUser.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-blue-300 text-xs">
                      Total Subscriptions
                    </div>
                    <div className="text-white font-bold text-lg">
                      {selectedUser.subscriptions?.length || 0}
                    </div>
                    <div className="text-blue-300 text-xs mt-1">
                      Active:{" "}
                      {selectedUser.subscriptions?.filter(
                        (s) => s.status === "ACTIVE"
                      ).length || 0}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-blue-300 text-xs">Total Payments</div>
                    <div className="text-white font-bold text-lg">
                      {selectedUser.payments?.length || 0}
                    </div>
                    <div className="text-blue-300 text-xs mt-1">
                      Success:{" "}
                      {selectedUser.payments?.filter(
                        (p) => p.status === "SUCCESS"
                      ).length || 0}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-blue-300 text-xs">Total Spent</div>
                    <div className="text-white font-bold text-lg">
                      {formatCurrency(
                        selectedUser.payments
                          ?.filter((p) => p.status === "SUCCESS")
                          .reduce((sum, p) => sum + (p.amount || 0), 0) || 0
                      )}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-blue-300 text-xs">Account Age</div>
                    <div className="text-white font-bold text-lg">
                      {Math.floor(
                        (new Date() - new Date(selectedUser.createdAt)) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </div>
                  </div>
                </div>

                {/* Subscriptions */}
                {selectedUser.subscriptions &&
                  selectedUser.subscriptions.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                        <Wifi className="w-4 h-4" />
                        Subscription History (
                        {selectedUser.subscriptions.length})
                      </h3>
                      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-white/10">
                            <tr>
                              <th className="p-3 text-left text-blue-300">
                                Plan
                              </th>
                              <th className="p-3 text-left text-blue-300">
                                Start
                              </th>
                              <th className="p-3 text-left text-blue-300">
                                End
                              </th>
                              <th className="p-3 text-left text-blue-300">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {selectedUser.subscriptions.map((sub) => (
                              <tr key={sub.id} className="hover:bg-white/5">
                                <td className="p-3 text-white">
                                  Plan #{sub.planId}
                                </td>
                                <td className="p-3 text-blue-200">
                                  {formatDate(sub.startTime)}
                                </td>
                                <td className="p-3 text-blue-200">
                                  {formatDate(sub.endTime)}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      sub.status === "ACTIVE"
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                                        : "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                                    }`}
                                  >
                                    {sub.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* Payments */}
                {selectedUser.payments && selectedUser.payments.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment History ({selectedUser.payments.length})
                    </h3>
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="p-3 text-left text-blue-300">
                              Amount
                            </th>
                            <th className="p-3 text-left text-blue-300">
                              M-Pesa Code
                            </th>
                            <th className="p-3 text-left text-blue-300">
                              Date
                            </th>
                            <th className="p-3 text-left text-blue-300">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {selectedUser.payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-white/5">
                              <td className="p-3 text-green-400 font-semibold">
                                {formatCurrency(payment.amount)}
                              </td>
                              <td className="p-3 text-white font-mono">
                                {payment.mpesaCode || "N/A"}
                              </td>
                              <td className="p-3 text-blue-200">
                                {formatDate(payment.transactionDate)}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    payment.status === "SUCCESS"
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                                      : payment.status === "PENDING"
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                                      : "bg-red-500/20 text-red-300 border border-red-500/50"
                                  }`}
                                >
                                  {payment.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {(!selectedUser.subscriptions ||
                  selectedUser.subscriptions.length === 0) &&
                  (!selectedUser.payments ||
                    selectedUser.payments.length === 0) && (
                    <div className="text-center py-6 text-blue-300">
                      No activity recorded for this user yet.
                    </div>
                  )}

                <button
                  onClick={closeDetailsModal}
                  className="w-full mt-6 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/30 font-semibold"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
