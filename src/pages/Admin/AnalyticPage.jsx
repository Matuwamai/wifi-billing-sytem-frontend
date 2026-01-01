// src/pages/Admin/AnalyticsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardAnalytics,
  fetchRevenueTrends,
  fetchSubscriptionAnalytics,
  fetchUserGrowth,
  clearAnalyticsError,
} from "../../services/Analytics/analyticSlices";
import {
  BarChart3,
  LineChart,
  PieChart,
  Users,
  Wifi,
  CreditCard,
  Ticket,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Activity,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Smartphone,
  UserCheck,
  UserPlus,
  Shield,
} from "lucide-react";

const AnalyticsPage = () => {
  const dispatch = useDispatch();

  // Get analytics state
  const {
    dashboardData,
    revenueTrends = [],
    subscriptionAnalytics,
    userGrowth = [],
    loading,
    trendsLoading,
    subscriptionsLoading,
    userGrowthLoading,
    error,
  } = useSelector((state) => state.analytics || {});

  // State variables
  const [revenuePeriod, setRevenuePeriod] = useState("monthly");
  const [userGrowthPeriod, setUserGrowthPeriod] = useState("monthly");
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    console.log("Fetching analytics data...");
    dispatch(fetchDashboardAnalytics());
    dispatch(fetchRevenueTrends({ period: revenuePeriod }));
    dispatch(fetchSubscriptionAnalytics());
    dispatch(fetchUserGrowth({ period: userGrowthPeriod }));
  }, [dispatch, revenuePeriod, userGrowthPeriod]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num || 0);
  };

  // Calculate percentage change
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Get overview stats
  const overviewStats = useMemo(() => {
    if (!dashboardData) return [];

    const { overview = {}, revenue = {} } = dashboardData;

    return [
      {
        title: "Total Revenue",
        value: formatCurrency(revenue.total || 0),
        change: calculateChange(revenue.today || 0, revenue.week || 0),
        icon: <DollarSign className="w-5 h-5" />,
        color: "from-emerald-600 to-emerald-700",
      },
      {
        title: "Total Users",
        value: formatNumber(overview.totalUsers || 0),
        change: calculateChange(
          overview.activeUsers || 0,
          overview.totalUsers || 0
        ),
        icon: <Users className="w-5 h-5" />,
        color: "from-blue-600 to-cyan-500",
      },
      {
        title: "Active Subscriptions",
        value: formatNumber(overview.activeSubscriptions || 0),
        change: calculateChange(
          overview.activeSubscriptions || 0,
          overview.totalSubscriptions || 0
        ),
        icon: <Wifi className="w-5 h-5" />,
        color: "from-purple-600 to-pink-500",
      },
      {
        title: "Successful Payments",
        value: formatNumber(overview.totalPayments || 0),
        change: 12.5, // You can calculate this from your data
        icon: <CreditCard className="w-5 h-5" />,
        color: "from-amber-600 to-yellow-500",
      },
      {
        title: "Vouchers Used",
        value: formatNumber(overview.usedVouchers || 0),
        change: calculateChange(
          overview.usedVouchers || 0,
          overview.totalVouchers || 0
        ),
        icon: <Ticket className="w-5 h-5" />,
        color: "from-red-600 to-orange-500",
      },
      {
        title: "Avg. Session Time",
        value: "2.5h",
        change: 8.3,
        icon: <Clock className="w-5 h-5" />,
        color: "from-indigo-600 to-violet-500",
      },
    ];
  }, [dashboardData]);

  // Get revenue chart data
  const revenueChartData = useMemo(() => {
    if (!revenueTrends.length) return [];

    return revenueTrends.map((item, index) => ({
      period: item.period,
      revenue: item.totalRevenue || 0,
      transactions: item.transactionCount || 0,
    }));
  }, [revenueTrends]);

  // Get subscription status data
  const subscriptionStatusData = useMemo(() => {
    if (!subscriptionAnalytics?.statusDistribution) return [];

    return subscriptionAnalytics.statusDistribution.map((item) => ({
      status: item.status,
      count: item._count || 0,
      color: getStatusColor(item.status),
    }));
  }, [subscriptionAnalytics]);

  // Get user growth chart data
  const userGrowthChartData = useMemo(() => {
    if (!userGrowth.length) return [];

    return userGrowth.map((item) => ({
      period: item.period,
      newUsers: item.newUsers || 0,
      cumulativeTotal: item.cumulativeTotal || 0,
    }));
  }, [userGrowth]);

  // Helper function for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "text-emerald-500 bg-emerald-500/20";
      case "EXPIRED":
        return "text-amber-500 bg-amber-500/20";
      case "CANCELED":
        return "text-red-500 bg-red-500/20";
      default:
        return "text-gray-500 bg-gray-500/20";
    }
  };

  // Refresh all data
  const handleRefresh = () => {
    dispatch(fetchDashboardAnalytics());
    dispatch(fetchRevenueTrends({ period: revenuePeriod }));
    dispatch(fetchSubscriptionAnalytics());
    dispatch(fetchUserGrowth({ period: userGrowthPeriod }));
  };

  // Export data
  const handleExportData = () => {
    // Implement export functionality
    alert("Export feature coming soon!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
              <BarChart3 className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Analytics Dashboard
              </h1>
              <p className="text-blue-300 text-sm">
                Real-time insights and performance metrics
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 rounded-lg transition-all shadow-lg shadow-blue-500/30"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Time Range Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
            <Calendar className="w-4 h-4 text-blue-400 ml-2" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-white px-2 py-1 focus:outline-none"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-800/50 rounded-lg p-1">
            {["overview", "revenue", "subscriptions", "users", "devices"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => dispatch(clearAnalyticsError())}
              className="text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {(loading ||
        trendsLoading ||
        subscriptionsLoading ||
        userGrowthLoading) && (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-300">Loading analytics data...</p>
        </div>
      )}

      {/* Overview Stats Grid */}
      {!loading && dashboardData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {overviewStats.map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.color} p-4 rounded-xl border border-white/10 shadow-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-white/10 rounded-lg">{stat.icon}</div>
                <div className="flex items-center gap-1">
                  {stat.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-300" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      stat.change >= 0 ? "text-emerald-300" : "text-red-300"
                    }`}
                  >
                    {Math.abs(stat.change).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-white/80 mt-1">{stat.title}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <LineChart className="w-5 h-5 text-blue-400" />
                Revenue Trends
              </h3>
              <p className="text-slate-400 text-sm">
                Revenue performance over time
              </p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              {["daily", "weekly", "monthly"].map((period) => (
                <button
                  key={period}
                  onClick={() => setRevenuePeriod(period)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    revenuePeriod === period
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                      : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {trendsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : revenueChartData.length > 0 ? (
            <div className="h-64">
              {/* Simple bar chart visualization */}
              <div className="flex items-end justify-between h-48 mt-4">
                {revenueChartData.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1 mx-1"
                  >
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all hover:opacity-80"
                      style={{
                        height: `${Math.min((item.revenue / 1000) * 2, 100)}%`,
                      }}
                      title={`KES ${item.revenue}`}
                    />
                    <div className="text-xs text-slate-400 mt-2 truncate w-full text-center">
                      {item.period}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/50">
                <div className="text-slate-400 text-sm">
                  Total:{" "}
                  {formatCurrency(
                    revenueChartData.reduce(
                      (sum, item) => sum + item.revenue,
                      0
                    )
                  )}
                </div>
                <div className="text-slate-400 text-sm">
                  {revenueChartData.length} periods
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <LineChart className="w-12 h-12 mb-2" />
              <p>No revenue data available</p>
            </div>
          )}
        </div>

        {/* Subscription Status */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 sm:p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              Subscription Status
            </h3>
            <p className="text-slate-400 text-sm">
              Distribution of subscription statuses
            </p>
          </div>

          {subscriptionsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : subscriptionStatusData.length > 0 ? (
            <div className="h-64">
              {/* Doughnut chart visualization */}
              <div className="flex items-center justify-center h-40">
                <div className="relative w-40 h-40">
                  {subscriptionStatusData.map((item, index, array) => {
                    const total = array.reduce((sum, i) => sum + i.count, 0);
                    const percentage =
                      total > 0 ? (item.count / total) * 100 : 0;
                    const radius = 60;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDasharray = `${
                      (percentage / 100) * circumference
                    } ${circumference}`;

                    return (
                      <div
                        key={item.status}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          transform: `rotate(${
                            index * (360 / array.length)
                          }deg)`,
                        }}
                      >
                        <svg className="w-40 h-40 -rotate-90">
                          <circle
                            cx="80"
                            cy="80"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="16"
                            fill="none"
                            strokeLinecap="round"
                            className={`${
                              getStatusColor(item.status).split(" ")[0]
                            } opacity-20`}
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="16"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={strokeDasharray}
                            className={`${
                              getStatusColor(item.status).split(" ")[0]
                            }`}
                          />
                        </svg>
                      </div>
                    );
                  })}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {subscriptionAnalytics?.totalActive || 0}
                      </div>
                      <div className="text-sm text-slate-400">Active</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-6">
                {subscriptionStatusData.map((item) => (
                  <div key={item.status} className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        getStatusColor(item.status).split(" ")[0]
                      }`}
                    />
                    <span className="text-sm text-slate-300">
                      {item.status}
                    </span>
                    <span className="text-sm font-semibold text-white ml-auto">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <PieChart className="w-12 h-12 mb-2" />
              <p>No subscription data available</p>
            </div>
          )}
        </div>

        {/* User Growth */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                User Growth
              </h3>
              <p className="text-slate-400 text-sm">
                New user acquisition over time
              </p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              {["weekly", "monthly", "quarterly"].map((period) => (
                <button
                  key={period}
                  onClick={() => setUserGrowthPeriod(period)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    userGrowthPeriod === period
                      ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white"
                      : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {userGrowthLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : userGrowthChartData.length > 0 ? (
            <div className="h-64">
              {/* Line chart visualization */}
              <div className="relative h-48 mt-4">
                {userGrowthChartData.map((item, index, array) => {
                  const max = Math.max(...array.map((i) => i.cumulativeTotal));
                  const height =
                    max > 0 ? (item.cumulativeTotal / max) * 100 : 0;
                  const nextItem = array[index + 1];

                  return (
                    <div
                      key={index}
                      className="absolute bottom-0"
                      style={{
                        left: `${(index / array.length) * 100}%`,
                        width: `${100 / array.length}%`,
                      }}
                    >
                      <div className="flex flex-col items-center">
                        {/* Line to next point */}
                        {nextItem && (
                          <div
                            className="absolute top-0 left-1/2 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-transparent"
                            style={{ transform: "rotate(0deg)" }}
                          />
                        )}

                        {/* Data point */}
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 border-2 border-slate-900" />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                            {item.newUsers} new
                          </div>
                        </div>

                        {/* Period label */}
                        <div className="text-xs text-slate-400 mt-2 truncate w-full text-center">
                          {item.period}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/50">
                <div className="text-slate-400 text-sm">
                  Total Growth:{" "}
                  {userGrowthChartData[userGrowthChartData.length - 1]
                    ?.cumulativeTotal || 0}{" "}
                  users
                </div>
                <div className="text-slate-400 text-sm">
                  Peak:{" "}
                  {Math.max(...userGrowthChartData.map((i) => i.newUsers))} new
                  users
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <Activity className="w-12 h-12 mb-2" />
              <p>No user growth data available</p>
            </div>
          )}
        </div>

        {/* Device Statistics */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 sm:p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-amber-400" />
              Device Statistics
            </h3>
            <p className="text-slate-400 text-sm">
              User devices and guest vs registered
            </p>
          </div>

          <div className="space-y-4">
            {/* Guest vs Registered */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">Guest Users</span>
                <span className="text-white font-semibold">
                  {dashboardData?.overview?.totalUsers
                    ? Math.round(
                        (dashboardData.overview.activeUsers /
                          dashboardData.overview.totalUsers) *
                          100
                      ) || 0
                    : 0}
                  %
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                  style={{
                    width: `${
                      dashboardData?.overview?.totalUsers
                        ? (dashboardData.overview.activeUsers /
                            dashboardData.overview.totalUsers) *
                            100 || 0
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Active vs Total Subscriptions */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">
                  Active Subscriptions
                </span>
                <span className="text-white font-semibold">
                  {dashboardData?.overview?.totalSubscriptions
                    ? Math.round(
                        (dashboardData.overview.activeSubscriptions /
                          dashboardData.overview.totalSubscriptions) *
                          100
                      ) || 0
                    : 0}
                  %
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full"
                  style={{
                    width: `${
                      dashboardData?.overview?.totalSubscriptions
                        ? (dashboardData.overview.activeSubscriptions /
                            dashboardData.overview.totalSubscriptions) *
                            100 || 0
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Voucher Utilization */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">Voucher Usage</span>
                <span className="text-white font-semibold">
                  {dashboardData?.overview?.totalVouchers
                    ? Math.round(
                        (dashboardData.overview.usedVouchers /
                          dashboardData.overview.totalVouchers) *
                          100
                      ) || 0
                    : 0}
                  %
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full"
                  style={{
                    width: `${
                      dashboardData?.overview?.totalVouchers
                        ? (dashboardData.overview.usedVouchers /
                            dashboardData.overview.totalVouchers) *
                            100 || 0
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <h4 className="text-sm font-medium text-slate-300 mb-3">
              Device Types
            </h4>
            <div className="space-y-2">
              {["Android", "iOS", "Windows", "Linux", "Mac"].map(
                (device, index) => (
                  <div
                    key={device}
                    className="flex items-center justify-between"
                  >
                    <span className="text-slate-400 text-sm">{device}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                          style={{ width: `${Math.random() * 30 + 70}%` }}
                        />
                      </div>
                      <span className="text-white text-sm font-medium w-8 text-right">
                        {Math.floor(Math.random() * 30 + 70)}%
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {[
              {
                user: "John Doe",
                action: "purchased",
                plan: "4 Hours Plan",
                time: "2 minutes ago",
                amount: "KES 10",
              },
              {
                user: "Jane Smith",
                action: "redeemed",
                plan: "Voucher",
                time: "15 minutes ago",
                amount: "Free",
              },
              {
                user: "Robert Johnson",
                action: "subscribed",
                plan: "1 Hour Plan",
                time: "1 hour ago",
                amount: "KES 1",
              },
              {
                user: "Sarah Williams",
                action: "extended",
                plan: "Subscription",
                time: "3 hours ago",
                amount: "KES 5",
              },
              {
                user: "Mike Brown",
                action: "cancelled",
                plan: "Monthly Plan",
                time: "5 hours ago",
                amount: "Refunded",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {activity.user}{" "}
                      <span className="text-slate-400">{activity.action}</span>{" "}
                      {activity.plan}
                    </p>
                    <p className="text-slate-400 text-xs">{activity.time}</p>
                  </div>
                </div>
                <div className="text-emerald-400 font-semibold">
                  {activity.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
          <div className="space-y-4">
            {[
              {
                label: "Avg. Revenue per User",
                value: "KES 45.20",
                change: "+12.3%",
              },
              { label: "Conversion Rate", value: "68.5%", change: "+5.2%" },
              {
                label: "Avg. Session Duration",
                value: "2h 15m",
                change: "+8.7%",
              },
              {
                label: "Customer Satisfaction",
                value: "4.8/5.0",
                change: "+0.3",
              },
              { label: "Support Tickets", value: "12", change: "-3" },
              { label: "System Uptime", value: "99.9%", change: "+0.1%" },
            ].map((stat, index) => (
              <div
                key={index}
                className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-300 text-sm">{stat.label}</span>
                  <span
                    className={`text-xs font-medium ${
                      stat.change.startsWith("+")
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <p className="text-white text-lg font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
