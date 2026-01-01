import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlans } from "../services/plan/planSlice.js";
import {
  startPayment,
  resetPaymentState,
} from "../services/payment/paymentSlice.js";
import {
  createGuestUser,
  setUser,
  loginWithMpesaCode,
  loginWithUsername,
  clearError as clearAuthError,
  clearLoginSuccess,
} from "../services/auth/authSlice.js";
import { redeemVoucher } from "../services/voucher/Vouchers.js";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Wifi,
  CreditCard,
  Clock,
  Zap,
  Shield,
  Smartphone,
  Ticket,
  Key,
  UserCircle,
  Receipt,
} from "lucide-react";

const PlansPage = () => {
  const dispatch = useDispatch();
  const { plans, loading: plansLoading } = useSelector((state) => state.plan);
  const {
    user,
    loading: userLoading,
    loginLoading = false, // Add default value
    error: authError,
    subscription: userSubscription,
    session: userSession,
  } = useSelector((state) => state.auth || {}); // Add fallback
  const {
    loading: payLoading,
    success,
    error,
  } = useSelector((state) => state.payment);

  // Add these missing states
  const [phone, setPhone] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Voucher & Login States
  const [showVoucherSection, setShowVoucherSection] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherSuccess, setVoucherSuccess] = useState("");
  const [voucherError, setVoucherError] = useState("");

  const [loginMethod, setLoginMethod] = useState("mpesa");
  const [mpesaCode, setMpesaCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginSuccess, setLoginSuccessLocal] = useState("");
  const [loginError, setLoginError] = useState("");

  // Handle login success
  useEffect(() => {
    if (loginSuccess && userSubscription) {
      setLoginSuccessLocal(
        `Welcome back! You have ${userSubscription.remainingTime} remaining on your ${userSubscription.plan} plan.`
      );

      // Clear form
      setMpesaCode("");
      setUsername("");
      setPassword("");
      setLoginError("");

      // Auto-hide success message after 8 seconds
      setTimeout(() => {
        setLoginSuccessLocal("");
        dispatch(clearLoginSuccess());
      }, 8000);
    }
  }, [loginSuccess, userSubscription, dispatch]);

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    let device = "Unknown Device";

    if (/android/i.test(userAgent)) {
      device = "Android Device";
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      device = "iOS Device";
    } else if (/Windows/.test(userAgent)) {
      device = "Windows PC";
    } else if (/Mac/.test(userAgent)) {
      device = "Mac";
    } else if (/Linux/.test(userAgent)) {
      device = "Linux Device";
    }

    setDeviceName(device);

    const generateMacFromFingerprint = () => {
      const fingerprint =
        userAgent + navigator.language + screen.width + screen.height;
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        hash = (hash << 5) - hash + fingerprint.charCodeAt(i);
        hash = hash & hash;
      }

      const hex = Math.abs(hash).toString(16).padStart(12, "0").slice(0, 12);
      return hex
        .match(/.{1,2}/g)
        .join(":")
        .toUpperCase();
    };

    const generatedMac = generateMacFromFingerprint();
    setMacAddress(generatedMac);
  }, []);

  useEffect(() => {
    const initializeGuest = async () => {
      if (!user) {
        const storedUser = localStorage.getItem("guestUser");
        if (storedUser) {
          dispatch(setUser(JSON.parse(storedUser)));
        } else {
          const res = await dispatch(createGuestUser());
          if (res?.payload?.user) {
            localStorage.setItem("guestUser", JSON.stringify(res.payload.user));
            dispatch(setUser(res.payload.user));
          }
        }
      }
    };
    initializeGuest();
  }, [dispatch, user]);

  const handleBuy = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handlePay = async () => {
    if (!selectedPlan) return alert("No plan selected.");
    if (!user || !user.id)
      return alert("Please wait... preparing your account.");
    if (!phone || phone.length < 10) {
      return alert("Enter a valid phone number (e.g. 07xxxxxxxx)");
    }
    if (!macAddress) {
      return alert(
        "Device identification failed. Please refresh and try again."
      );
    }

    dispatch(
      startPayment({
        phone,
        userId: user.id,
        planId: selectedPlan.id,
        macAddress,
        deviceName,
      })
    );
  };

  const closeModal = () => {
    setShowModal(false);
    setPhone("");
    setSelectedPlan(null);
    dispatch(resetPaymentState());
  };

  const handleRedeemVoucher = async (e) => {
    e.preventDefault();

    if (!voucherCode || voucherCode.length < 10) {
      setVoucherError("Please enter a valid voucher code");
      return;
    }

    if (!macAddress) {
      setVoucherError("Device identification failed. Please refresh.");
      return;
    }

    setVoucherLoading(true);
    setVoucherError("");
    setVoucherSuccess("");

    try {
      const result = await dispatch(
        redeemVoucher({
          voucherCode: voucherCode.toUpperCase().replace(/\s/g, ""),
          phone: phone || undefined,
          macAddress,
          deviceName,
        })
      ).unwrap();

      setVoucherSuccess(
        result.message || "Voucher redeemed successfully! You're now connected."
      );
      setVoucherCode("");
      setPhone("");

      setTimeout(() => setVoucherSuccess(""), 5000);
    } catch (error) {
      setVoucherError(
        error ||
          "Failed to redeem voucher. Please check the code and try again."
      );
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleMpesaLogin = async (e) => {
    e.preventDefault();

    if (!mpesaCode || mpesaCode.length < 8) {
      setLoginError("Please enter a valid M-Pesa transaction code");
      return;
    }

    if (!macAddress) {
      setLoginError("Device identification failed. Please refresh.");
      return;
    }

    try {
      await dispatch(
        loginWithMpesaCode({
          mpesaCode: mpesaCode.toUpperCase(),
          macAddress,
          ipAddress: window.location.hostname,
          deviceName,
        })
      ).unwrap();

      // Success is handled by useEffect above
    } catch (error) {
      setLoginError(
        error || "Failed to login. Please check your M-Pesa code and try again."
      );
    }
  };

  const handleUsernameLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setLoginError("Please enter both username and password");
      return;
    }

    if (!macAddress) {
      setLoginError("Device identification failed. Please refresh.");
      return;
    }

    try {
      await dispatch(
        loginWithUsername({
          username,
          password,
          macAddress,
          ipAddress: window.location.hostname,
          deviceName,
        })
      ).unwrap();

      // Success is handled by useEffect above
    } catch (error) {
      setLoginError(
        error || "Failed to login. Please check your credentials and try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <div className="text-center py-8 px-4 sm:py-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl shadow-lg shadow-blue-500/50">
              <Wifi className="text-white w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h1 className="text-white text-2xl sm:text-2xl font-bold">
              Wifi Zone
            </h1>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
            Choose Your Package
          </h1>
          <p className="text-blue-200 text-sm sm:text-base max-w-2xl mx-auto px-4">
            Lightning-fast internet at your fingertips. Subscribe in seconds
            with M-Pesa.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 text-xs sm:text-sm text-blue-300">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Instant Activation</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Support: 0742664700/0714724209</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-8 sm:pb-12">
          {(plansLoading || userLoading) && (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          )}

          {!plansLoading && (!plans || plans.length === 0) && (
            <div className="text-center py-12">
              <p className="text-blue-200 text-lg">
                No plans available at the moment.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {Array.isArray(plans) &&
              plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className="group relative bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/20 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-md">
                          <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                      </div>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-white mb-2 line-clamp-1">
                      {plan.name}
                    </h2>

                    <p className="text-blue-200 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                      {plan.description || "Fast and reliable internet"}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-blue-300">Duration</span>
                        <span className="text-white font-semibold">
                          {plan.durationValue} {plan.durationType.toLowerCase()}
                          (s)
                        </span>
                      </div>
                      <div className="h-px bg-white/10"></div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-300 text-xs sm:text-sm">
                          Price
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                          KES {plan.price}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuy(plan)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-blue-500 hover:to-cyan-400 active:scale-95 transition-all duration-200 shadow-lg shadow-blue-500/30 font-semibold text-sm sm:text-base"
                    >
                      <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Subscribe
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-12 sm:pb-16">
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
            <button
              onClick={() => setShowVoucherSection(!showVoucherSection)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:from-purple-500 hover:to-pink-400 transition-all shadow-lg shadow-purple-500/30 font-semibold"
            >
              <Ticket className="w-5 h-5" />
              {showVoucherSection ? "Hide Voucher" : "Have a Voucher?"}
            </button>
          </div>

          {showVoucherSection && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 mb-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl mb-4 shadow-lg shadow-purple-500/50">
                  <Ticket className="text-white w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Redeem Voucher
                </h2>
                <p className="text-blue-300 text-sm sm:text-base">
                  Enter your voucher code to get instant access
                </p>
              </div>

              <form onSubmit={handleRedeemVoucher} className="space-y-4">
                <div>
                  <label className="block text-blue-300 text-sm font-medium mb-2">
                    Voucher Code
                  </label>
                  <input
                    type="text"
                    placeholder="XXXX-XXXX-XXXX"
                    value={voucherCode}
                    onChange={(e) =>
                      setVoucherCode(e.target.value.toUpperCase())
                    }
                    className="bg-white/10 border border-white/20 rounded-xl w-full p-3 sm:p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-blue-300/50 transition-all font-mono text-center text-lg"
                    disabled={voucherLoading}
                  />
                </div>

                <div>
                  <label className="block text-blue-300 text-sm font-medium mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="07xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl w-full p-3 sm:p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-blue-300/50 transition-all"
                    disabled={voucherLoading}
                  />
                </div>

                {voucherLoading && (
                  <div className="flex items-center justify-center gap-2 text-purple-400 bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Redeeming voucher...</span>
                  </div>
                )}

                {voucherSuccess && (
                  <div className="flex items-center justify-center gap-2 text-green-400 bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">{voucherSuccess}</span>
                  </div>
                )}

                {voucherError && (
                  <div className="flex items-center justify-center gap-2 text-red-400 bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm">{voucherError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={voucherLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 sm:py-4 rounded-xl hover:from-purple-500 hover:to-pink-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 font-semibold text-base sm:text-lg"
                >
                  <Ticket className="w-5 h-5" />
                  Redeem Voucher
                </button>
              </form>
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-400 rounded-2xl mb-4 shadow-lg shadow-cyan-500/50">
                <Key className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Already Have Access?
              </h2>
              <p className="text-blue-300 text-sm sm:text-base">
                Login to reconnect to your subscription
              </p>
            </div>

            <div className="flex gap-2 mb-6 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setLoginMethod("mpesa")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all font-semibold text-sm ${
                  loginMethod === "mpesa"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                    : "text-blue-300 hover:bg-white/10"
                }`}
              >
                <Receipt className="w-4 h-4" />
                M-Pesa Code
              </button>
              <button
                onClick={() => setLoginMethod("username")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all font-semibold text-sm ${
                  loginMethod === "username"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                    : "text-blue-300 hover:bg-white/10"
                }`}
              >
                <UserCircle className="w-4 h-4" />
                Username
              </button>
            </div>

            {loginMethod === "mpesa" && (
              <form onSubmit={handleMpesaLogin} className="space-y-4">
                <div>
                  <label className="block text-blue-300 text-sm font-medium mb-2">
                    M-Pesa Transaction Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., SH12ABC34D"
                    value={mpesaCode}
                    onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                    className="bg-white/10 border border-white/20 rounded-xl w-full p-3 sm:p-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-white placeholder-blue-300/50 transition-all font-mono"
                    disabled={loginLoading}
                  />
                  <p className="text-blue-300/70 text-xs mt-2">
                    Enter the M-Pesa code from your payment confirmation SMS
                  </p>
                </div>

                {loginSuccess && loginSuccessLocal && (
                  <div className="flex items-center justify-center gap-2 text-green-400 bg-green-500/10 rounded-lg p-3 border border-green-500/20 mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">{loginSuccessLocal}</span>
                  </div>
                )}

                {(loginError || authError) && (
                  <div className="flex items-center justify-center gap-2 text-amber-400 bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">{loginError || authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={userLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-500 text-white py-3 sm:py-4 rounded-xl hover:from-cyan-500 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30 font-semibold text-base"
                >
                  {userLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-5 h-5" />
                      Login with M-Pesa Code
                    </>
                  )}
                </button>
              </form>
            )}

            {loginMethod === "username" && (
              <form onSubmit={handleUsernameLogin} className="space-y-4">
                <div>
                  <label className="block text-blue-300 text-sm font-medium mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl w-full p-3 sm:p-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-white placeholder-blue-300/50 transition-all"
                    disabled={userLoading}
                  />
                </div>

                <div>
                  <label className="block text-blue-300 text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl w-full p-3 sm:p-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-white placeholder-blue-300/50 transition-all"
                    disabled={userLoading}
                  />
                </div>

                {(loginError || authError) && (
                  <div className="flex items-center justify-center gap-2 text-amber-400 bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">{loginError || authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={userLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-500 text-white py-3 sm:py-4 rounded-xl hover:from-cyan-500 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30 font-semibold text-base"
                >
                  {userLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <UserCircle className="w-5 h-5" />
                      Login with Username
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      {/* Payment Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 px-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative border border-white/10 animate-in fade-in zoom-in duration-200">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mb-4 shadow-lg shadow-blue-500/50">
                <CreditCard className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Subscribe to {selectedPlan.name}
              </h2>
              <p className="text-blue-300 text-sm sm:text-base">
                Complete your payment via M-Pesa STK push
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-blue-300">Plan Duration</span>
                <span className="text-white font-semibold">
                  {selectedPlan.durationValue}{" "}
                  {selectedPlan.durationType.toLowerCase()}(s)
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-300 text-sm">Total Amount</span>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  KES {selectedPlan.price}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-blue-300">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Device: {deviceName}</span>
                </div>
              </div>
            </div>

            <input
              type="tel"
              placeholder="Enter M-Pesa number (07xxxxxxxx)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl w-full p-3 sm:p-4 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-blue-300/50 transition-all"
            />

            {payLoading && (
              <div className="flex items-center justify-center gap-2 text-blue-400 mb-4 bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm sm:text-base">
                  Processing payment...
                </span>
              </div>
            )}

            {success && (
              <div className="flex items-center justify-center gap-2 text-green-400 mb-4 bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm sm:text-base">
                  STK push sent! Check your phone.
                </span>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center gap-2 text-red-400 mb-4 bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                <XCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={payLoading || !user}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 font-semibold"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansPage;
