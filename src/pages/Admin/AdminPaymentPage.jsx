import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllPayments,
  fetchPaymentDetails,
  clearSelectedPayment,
} from "../../services/payment/paymentSlice.js";
import {
  Loader2,
  CreditCard,
  Phone,
  Wifi,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Download,
  Eye,
  Calendar,
  DollarSign,
  Hash,
  Smartphone,
  X,
} from "lucide-react";

const AdminPaymentsPage = () => {
  const dispatch = useDispatch();
  const { payments, selectedPayment, loading, detailsLoading, error } =
    useSelector((state) => state.payment);

  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAllPayments());
  }, [dispatch]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch with search
  useEffect(() => {
    if (debouncedSearch !== undefined) {
      dispatch(fetchAllPayments({ search: debouncedSearch }));
    }
  }, [debouncedSearch, dispatch]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      COMPLETED: {
        icon: CheckCircle,
        className: "bg-green-500/20 text-green-300 border-green-500/50",
        text: "Completed",
      },
      PENDING: {
        icon: Clock,
        className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
        text: "Pending",
      },
      FAILED: {
        icon: XCircle,
        className: "bg-red-500/20 text-red-300 border-red-500/50",
        text: "Failed",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  // Statistics
  const stats = {
    total: payments.length,
    completed: payments.filter((p) => p.status === "COMPLETED").length,
    pending: payments.filter((p) => p.status === "PENDING").length,
    failed: payments.filter((p) => p.status === "FAILED").length,
    totalAmount: payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + (p.amount || 0), 0),
  };

  const handleViewDetails = async (paymentId) => {
    await dispatch(fetchPaymentDetails(paymentId));
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    dispatch(clearSelectedPayment());
  };

  const exportToCSV = () => {
    const headers = [
      "Phone",
      "Plan",
      "Amount",
      "M-Pesa Code",
      "Status",
      "Date",
    ];
    const rows = payments.map((payment) => [
      payment.user?.phone || "N/A",
      payment.plan?.name || "N/A",
      payment.amount || 0,
      payment.mpesaCode || "N/A",
      payment.status,
      formatDate(payment.createdAt),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_${new Date().toISOString().split("T")[0]}.csv`;
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
            Payment Transactions
          </h1>
          <p className="text-blue-300">
            Monitor all M-Pesa payments and transactions
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-300 text-sm">Total</span>
              <CreditCard className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-r from-emerald-900 to-green-900 p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-300 text-sm">Completed</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.completed}</p>
          </div>

          <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-300 text-sm">Pending</span>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
          </div>

          <div className="bg-gradient-to-r from-amber-900 to-yellow-900 p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-300 text-sm">Failed</span>
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.failed}</p>
          </div>

          <div className="p-4  bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl border border-white/10 shadow-lg ">
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-300 text-sm">Revenue</span>
              <DollarSign className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-lg font-bold text-white">
              {formatCurrency(stats.totalAmount)}
            </p>
          </div>
        </div>

        {/* Search and Export */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
              <input
                type="text"
                placeholder="Search by phone, plan, M-Pesa code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg w-full pl-10 pr-4 py-2.5 text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2.5 rounded-lg hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/30 font-semibold"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
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
            <p className="font-semibold">Error loading payments</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && payments.length === 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-10 h-10 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No Payments Yet
            </h3>
            <p className="text-blue-300">No payment transactions found.</p>
          </div>
        )}

        {/* Payments Table */}
        {!loading && !error && payments.length > 0 && (
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
                      Amount
                    </th>
                    <th className="text-left p-4 text-blue-300 font-semibold">
                      M-Pesa Code
                    </th>
                    <th className="text-left p-4 text-blue-300 font-semibold">
                      Date
                    </th>
                    <th className="text-left p-4 text-blue-300 font-semibold">
                      Status
                    </th>
                    <th className="text-center p-4 text-blue-300 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-400 rounded-lg flex items-center justify-center">
                            <Phone className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-white font-medium">
                            {payment.user?.phone || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium">
                            {payment.plan?.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-green-400 font-bold">
                          {formatCurrency(payment.amount || 0)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-blue-200 font-mono text-sm">
                          {payment.mpesaCode || "—"}
                        </span>
                      </td>
                      <td className="p-4 text-blue-200 text-sm">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="p-4">{getStatusBadge(payment.status)}</td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleViewDetails(payment.id)}
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
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 hover:bg-white/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">
                          {payment.user?.phone || "N/A"}
                        </p>
                        <p className="text-blue-300 text-sm flex items-center gap-1">
                          <Wifi className="w-3 h-3" />
                          {payment.plan?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="bg-white/5 rounded-lg p-2">
                      <span className="text-blue-300 text-xs">Amount</span>
                      <p className="text-green-400 font-bold text-sm">
                        {formatCurrency(payment.amount || 0)}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <span className="text-blue-300 text-xs">M-Pesa</span>
                      <p className="text-white font-mono text-xs truncate">
                        {payment.mpesaCode || "—"}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 col-span-2">
                      <span className="text-blue-300 text-xs">Date</span>
                      <p className="text-white text-xs">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewDetails(payment.id)}
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
        {!loading && !error && payments.length > 0 && (
          <div className="mt-4 text-center text-blue-300 text-sm">
            Showing {payments.length} payment(s)
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 px-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 relative border border-white/10 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeDetailsModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mb-4 shadow-lg shadow-blue-500/50">
                <CreditCard className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Payment Details
              </h2>
              <div className="inline-block">
                {getStatusBadge(selectedPayment.status)}
              </div>
            </div>

            {detailsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Transaction Info */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Transaction Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">Amount:</span>
                      <span className="text-green-400 font-bold">
                        {formatCurrency(selectedPayment.amount || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">
                        M-Pesa Code:
                      </span>
                      <span className="text-white font-mono">
                        {selectedPayment.mpesaCode || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">Date:</span>
                      <span className="text-white">
                        {formatDate(selectedPayment.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    User Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">Phone:</span>
                      <span className="text-white font-medium">
                        {selectedPayment.user?.phone || "N/A"}
                      </span>
                    </div>
                    {selectedPayment.user?.deviceName && (
                      <div className="flex justify-between">
                        <span className="text-blue-200 text-sm">Device:</span>
                        <span className="text-white">
                          {selectedPayment.user.deviceName}
                        </span>
                      </div>
                    )}
                    {selectedPayment.user?.macAddress && (
                      <div className="flex justify-between">
                        <span className="text-blue-200 text-sm">
                          MAC Address:
                        </span>
                        <span className="text-white font-mono text-sm">
                          {selectedPayment.user.macAddress}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Plan Info */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    Plan Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">Plan Name:</span>
                      <span className="text-white font-medium">
                        {selectedPayment.plan?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">Duration:</span>
                      <span className="text-white">
                        {selectedPayment.plan?.durationValue}{" "}
                        {selectedPayment.plan?.durationType.toLowerCase()}(s)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">Price:</span>
                      <span className="text-white font-semibold">
                        {formatCurrency(selectedPayment.plan?.price || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={closeDetailsModal}
              className="w-full mt-6 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/30 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
