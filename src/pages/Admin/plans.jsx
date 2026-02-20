import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from "../../services/plan/planSlice";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Wifi,
  Clock,
  DollarSign,
  X,
} from "lucide-react";

const AdminPlansPage = () => {
  const dispatch = useDispatch();
  const { plans, loading, error } = useSelector((state) => state.plan);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    durationType: "HOUR",
    durationValue: "",
    price: "",
    description: "",
  });

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({
      name: "",
      durationType: "HOUR",
      durationValue: "",
      price: "",
      description: "",
    });
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setModalMode("edit");
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      durationType: plan.durationType,
      durationValue: plan.durationValue.toString(),
      price: plan.price.toString(),
      description: plan.description || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
    setFormData({
      name: "",
      durationType: "HOUR",
      durationValue: "",
      price: "",
      description: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.durationValue || !formData.price) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    const planData = {
      name: formData.name,
      durationType: formData.durationType,
      durationValue: parseInt(formData.durationValue),
      price: parseFloat(formData.price),
      description: formData.description,
    };

    try {
      if (modalMode === "create") {
        await dispatch(createPlan(planData)).unwrap();
        showNotification("success", "Plan created successfully!");
      } else {
        await dispatch(updatePlan({ id: selectedPlan.id, planData })).unwrap();
        showNotification("success", "Plan updated successfully!");
      }
      dispatch(fetchPlans());
      closeModal();
    } catch (err) {
      showNotification("error", err.message || "Operation failed");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await dispatch(deletePlan(id)).unwrap();
      showNotification("success", "Plan deleted successfully!");
      dispatch(fetchPlans());
    } catch (err) {
      showNotification("error", err.message || "Failed to delete plan");
    }
  };

  // Helper function to format duration display
  const formatDuration = (value, type) => {
    const typeLabel = type.toLowerCase();
    return `${value} ${typeLabel}${value !== 1 ? "s" : ""}`;
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Plans Management
            </h1>
            <p className="text-blue-300">Create and manage internet plans</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/30 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Plan
          </button>
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
            <p className="font-semibold">Error loading plans</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Plans Table */}
        {!loading && !error && (
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-blue-300 font-semibold">
                      Plan Name
                    </th>
                    <th className="text-left p-4 text-blue-300 font-semibold">
                      Duration
                    </th>
                    <th className="text-left p-4 text-blue-300 font-semibold">
                      Price
                    </th>
                    <th className="text-left p-4 text-blue-300 font-semibold">
                      Description
                    </th>
                    <th className="text-right p-4 text-blue-300 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plans.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center p-8 text-blue-200">
                        No plans available. Create your first plan!
                      </td>
                    </tr>
                  ) : (
                    plans.map((plan) => (
                      <tr
                        key={plan.id}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                              <Wifi className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-white font-semibold">
                              {plan.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-blue-200">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatDuration(
                                plan.durationValue,
                                plan.durationType,
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-green-400 font-semibold">
                            <DollarSign className="w-4 h-4" />
                            <span>KES {plan.price}</span>
                          </div>
                        </td>
                        <td className="p-4 text-blue-200 max-w-xs truncate">
                          {plan.description || "—"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(plan)}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(plan.id, plan.name)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-white/10">
              {plans.length === 0 ? (
                <div className="text-center p-8 text-blue-200">
                  No plans available. Create your first plan!
                </div>
              ) : (
                plans.map((plan) => (
                  <div key={plan.id} className="p-4 hover:bg-white/5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                          <Wifi className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            {plan.name}
                          </h3>
                          <p className="text-green-400 text-sm font-semibold">
                            KES {plan.price}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="p-2 bg-blue-500/20 text-blue-300 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id, plan.name)}
                          className="p-2 bg-red-500/20 text-red-300 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-blue-200">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatDuration(
                            plan.durationValue,
                            plan.durationType,
                          )}
                        </span>
                      </div>
                      {plan.description && (
                        <p className="text-blue-200 text-sm">
                          {plan.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 px-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative border border-white/10 animate-in fade-in zoom-in duration-200">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mb-4 shadow-lg shadow-blue-500/50">
                {modalMode === "create" ? (
                  <Plus className="text-white w-8 h-8" />
                ) : (
                  <Edit2 className="text-white w-8 h-8" />
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {modalMode === "create" ? "Create New Plan" : "Edit Plan"}
              </h2>
              <p className="text-blue-300 text-sm">
                {modalMode === "create"
                  ? "Add a new internet plan"
                  : "Update plan details"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-blue-300 text-sm font-semibold mb-2">
                  Plan Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Premium WiFi"
                  className="bg-white/10 border border-white/20 rounded-xl w-full p-3 text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-300 text-sm font-semibold mb-2">
                    Duration Type *
                  </label>
                  <select
                    name="durationType"
                    value={formData.durationType}
                    onChange={handleInputChange}
                    className="bg-white/10 border border-white/20 rounded-xl w-full p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="MINUTE" className="bg-slate-800">
                      Minute
                    </option>
                    <option value="HOUR" className="bg-slate-800">
                      Hour
                    </option>
                    <option value="DAY" className="bg-slate-800">
                      Day
                    </option>
                    <option value="WEEK" className="bg-slate-800">
                      Week
                    </option>
                    <option value="MONTH" className="bg-slate-800">
                      Month
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-blue-300 text-sm font-semibold mb-2">
                    Duration Value *
                  </label>
                  <input
                    type="number"
                    name="durationValue"
                    value={formData.durationValue}
                    onChange={handleInputChange}
                    placeholder="e.g., 1"
                    min="1"
                    className="bg-white/10 border border-white/20 rounded-xl w-full p-3 text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-blue-300 text-sm font-semibold mb-2">
                  Price (KES) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                  min="0"
                  step="0.01"
                  className="bg-white/10 border border-white/20 rounded-xl w-full p-3 text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-blue-300 text-sm font-semibold mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the plan"
                  rows="3"
                  className="bg-white/10 border border-white/20 rounded-xl w-full p-3 text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/30 font-semibold"
                >
                  {modalMode === "create" ? "Create Plan" : "Update Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlansPage;
