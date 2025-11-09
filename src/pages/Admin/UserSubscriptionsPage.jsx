import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserSubscriptions } from "../../services/subscription/subscriptionSlice.js";
import {
  Loader2,
  Wifi,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const UserSubscriptionsPage = () => {
  const dispatch = useDispatch();
  const { subscriptions, loading, error } = useSelector(
    (state) => state.subscription
  );

  useEffect(() => {
    dispatch(fetchUserSubscriptions());
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
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-semibold ${config.className}`}
      >
        <Icon className="w-4 h-4" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
              <Wifi className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              My Subscriptions
            </h1>
          </div>
          <p className="text-blue-300">
            View and manage your internet plan subscriptions
          </p>
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
        {!loading && !error && subscriptions.length === 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wifi className="w-10 h-10 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No Subscriptions Yet
            </h3>
            <p className="text-blue-300 mb-6">
              You haven't subscribed to any plans yet. Browse available plans to
              get started!
            </p>
            <a
              href="/plans"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/30 font-semibold"
            >
              View Plans
            </a>
          </div>
        )}

        {/* Subscriptions List */}
        {!loading && !error && subscriptions.length > 0 && (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                      <Wifi className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {subscription.plan.name}
                      </h3>
                      <p className="text-blue-200 text-sm">
                        {subscription.plan.description ||
                          "Internet subscription"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="flex items-center gap-2 text-blue-300 text-sm mb-1">
                        <Clock className="w-4 h-4" />
                        <span>Duration</span>
                      </div>
                      <p className="text-white font-semibold">
                        {subscription.plan.durationValue}{" "}
                        {subscription.plan.durationType.toLowerCase()}(s)
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-2 text-blue-300 text-sm mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Started</span>
                      </div>
                      <p className="text-white font-semibold">
                        {formatDate(subscription.startDate)}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-2 text-blue-300 text-sm mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Expires</span>
                      </div>
                      <p className="text-white font-semibold">
                        {formatDate(subscription.endDate)}
                      </p>
                    </div>

                    <div>{getStatusBadge(subscription.status)}</div>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Wifi className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {subscription.plan.name}
                      </h3>
                      <p className="text-blue-200 text-sm">
                        {subscription.plan.description ||
                          "Internet subscription"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-300 text-xs mb-1">
                        <Clock className="w-3 h-3" />
                        <span>Duration</span>
                      </div>
                      <p className="text-white font-semibold text-sm">
                        {subscription.plan.durationValue}{" "}
                        {subscription.plan.durationType.toLowerCase()}(s)
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-300 text-xs mb-1">
                        <Calendar className="w-3 h-3" />
                        <span>Started</span>
                      </div>
                      <p className="text-white font-semibold text-xs">
                        {new Date(subscription.startDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-300 text-xs mb-1">
                        <Calendar className="w-3 h-3" />
                        <span>Expires</span>
                      </div>
                      <p className="text-white font-semibold text-xs">
                        {new Date(subscription.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3 flex items-center justify-center">
                      {getStatusBadge(subscription.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSubscriptionsPage;
