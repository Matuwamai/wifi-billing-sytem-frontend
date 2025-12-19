import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVouchers,
  createVoucher,
  deleteVoucher,
  expireVouchers,
  clearError,
} from "../../services/voucher/Vouchers";
import { fetchPlans } from "../../services/plan/planSlice"; // Assuming you have this

const VoucherPage = () => {
  const dispatch = useDispatch();
  const { vouchers, loading, error } = useSelector((state) => state.voucher);
  const { plans } = useSelector((state) => state.plan); // Get plans for dropdown
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [formData, setFormData] = useState({
    planId: "",
    quantity: 1,
    expiresInDays: 30,
  });
  const [stats, setStats] = useState({
    total: 0,
    unused: 0,
    used: 0,
    expired: 0,
  });

  useEffect(() => {
    dispatch(fetchVouchers());
    dispatch(fetchPlans()); // Fetch plans for dropdown
  }, [dispatch]);

  useEffect(() => {
    if (vouchers) {
      const stats = {
        total: vouchers.length,
        unused: vouchers.filter((v) => v.status === "UNUSED").length,
        used: vouchers.filter((v) => v.status === "USED").length,
        expired: vouchers.filter((v) => v.status === "EXPIRED").length,
      };
      setStats(stats);
    }
  }, [vouchers]);

  const handleCreateVoucher = (e) => {
    e.preventDefault();
    const adminId = localStorage.getItem("userId"); // Get admin ID from localStorage
    dispatch(createVoucher({ ...formData, adminId }))
      .unwrap()
      .then(() => {
        setShowCreateModal(false);
        setFormData({ planId: "", quantity: 1, expiresInDays: 30 });
        dispatch(fetchVouchers()); // Refresh list
      });
  };

  const handleDeleteVoucher = () => {
    if (selectedVoucher) {
      dispatch(deleteVoucher(selectedVoucher.id))
        .unwrap()
        .then(() => {
          setShowDeleteModal(false);
          setSelectedVoucher(null);
          dispatch(fetchVouchers()); // Refresh list
        });
    }
  };

  const handleExpireVouchers = () => {
    dispatch(expireVouchers())
      .unwrap()
      .then(() => {
        dispatch(fetchVouchers()); // Refresh list
      });
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case "UNUSED":
        return "bg-emerald-900/30 text-emerald-300 border-emerald-800";
      case "USED":
        return "bg-blue-900/30 text-blue-300 border-blue-800";
      case "EXPIRED":
        return "bg-amber-900/30 text-amber-300 border-amber-800";
      default:
        return "bg-gray-800 text-gray-300 border-gray-700";
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert("Voucher code copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Voucher Management
        </h1>
        <p className="text-gray-400">Create, manage, and track voucher codes</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-4 rounded-xl border border-white/10 shadow-lg">
          <p className="text-gray-300 text-sm">Total Vouchers</p>
          <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-900 to-green-900 p-4 rounded-xl border border-white/10 shadow-lg">
          <p className="text-gray-300 text-sm">Available</p>
          <p className="text-2xl font-bold text-white mt-2">{stats.unused}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-4 rounded-xl border border-white/10 shadow-lg">
          <p className="text-gray-300 text-sm">Redeemed</p>
          <p className="text-2xl font-bold text-white mt-2">{stats.used}</p>
        </div>
        <div className="bg-gradient-to-r from-amber-900 to-yellow-900 p-4 rounded-xl border border-white/10 shadow-lg">
          <p className="text-gray-300 text-sm">Expired</p>
          <p className="text-2xl font-bold text-white mt-2">{stats.expired}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create New Vouchers
        </button>

        <button
          onClick={handleExpireVouchers}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Expire Old Vouchers
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-300">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Vouchers Table */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">All Vouchers</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search voucher codes..."
              className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            <select className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Status</option>
              <option value="UNUSED">Available</option>
              <option value="USED">Redeemed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-2">Loading vouchers...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-700/50">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-900">
                <tr>
                  <th className="p-4 text-left text-slate-300 font-medium">
                    Voucher Code
                  </th>
                  <th className="p-4 text-left text-slate-300 font-medium">
                    Plan
                  </th>
                  <th className="p-4 text-left text-slate-300 font-medium">
                    Status
                  </th>
                  <th className="p-4 text-left text-slate-300 font-medium">
                    Created
                  </th>
                  <th className="p-4 text-left text-slate-300 font-medium">
                    Expires
                  </th>
                  <th className="p-4 text-left text-slate-300 font-medium">
                    Used By
                  </th>
                  <th className="p-4 text-left text-slate-300 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {vouchers?.map((voucher) => (
                  <tr
                    key={voucher.id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <code className="text-slate-300 font-mono bg-slate-900/50 px-3 py-1 rounded">
                          {voucher.code}
                        </code>
                        <button
                          onClick={() => handleCopyCode(voucher.code)}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="Copy code"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      {voucher.plan?.name || "Unknown Plan"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          voucher.status
                        )}`}
                      >
                        {voucher.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {formatDate(voucher.createdAt)}
                    </td>
                    <td className="p-4 text-slate-300">
                      {formatDate(voucher.expiresAt)}
                    </td>
                    <td className="p-4 text-slate-300">
                      {voucher.user?.phone ||
                        voucher.user?.username ||
                        "Not Used"}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {voucher.status === "UNUSED" && (
                          <button
                            onClick={() => {
                              setSelectedVoucher(voucher);
                              setShowDeleteModal(true);
                            }}
                            className="px-3 py-1 text-xs bg-red-900/30 text-red-300 border border-red-800 rounded-lg hover:bg-red-800/50 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-400">
          Showing {vouchers?.length || 0} voucher(s)
        </div>
      </div>

      {/* Create Voucher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Create New Vouchers
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateVoucher}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Plan
                  </label>
                  <select
                    value={formData.planId}
                    onChange={(e) =>
                      setFormData({ ...formData, planId: e.target.value })
                    }
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a plan...</option>
                    {plans?.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - {plan.durationValue} {plan.durationType}
                        (s)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Vouchers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expires After (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.expiresInDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expiresInDays: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-700 text-gray-300 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Vouchers"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedVoucher && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 max-w-md w-full p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Delete Voucher
              </h3>
              <p className="text-gray-400">
                Are you sure you want to delete this voucher? This action cannot
                be undone.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <code className="text-lg font-mono text-white">
                  {selectedVoucher.code}
                </code>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                    selectedVoucher.status
                  )}`}
                >
                  {selectedVoucher.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Plan: {selectedVoucher.plan?.name || "Unknown"}
              </p>
              <p className="text-gray-400 text-sm">
                Expires: {formatDate(selectedVoucher.expiresAt)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedVoucher(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-700 text-gray-300 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVoucher}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Voucher"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherPage;
