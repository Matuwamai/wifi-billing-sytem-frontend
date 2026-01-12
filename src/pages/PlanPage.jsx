// import React, { useEffect, useState, useCallback } from "react";
import React, { useEffect, useState, useCallback } from "react";
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
  UserCircle,
  Receipt,
  AlertCircle,
  X,
} from "lucide-react";
// Notification Component
const Notification = ({ type, message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const config = {
    success: {
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-400",
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    error: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-400",
      icon: <XCircle className="w-5 h-5" />,
    },
    info: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    warning: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
      icon: <AlertCircle className="w-5 h-5" />,
    },
  }[type];

  return (
    <div
      className={`fixed top-4 right-4 ${config.bg} ${config.border} border rounded-xl p-4 max-w-sm z-50 animate-in slide-in-from-right fade-in duration-200 shadow-lg`}
    >
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="flex-1">
          <p className={`${config.text} text-sm font-medium`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Real-time status tracker
const useRealTimeStatus = () => {
  const [status, setStatus] = useState({
    message: "",
    type: "",
    visible: false,
  });

  const showStatus = useCallback((message, type = "info") => {
    console.log(`[STATUS ${type.toUpperCase()}]:`, message);
    setStatus({ message, type, visible: true });
  }, []);

  const hideStatus = useCallback(() => {
    setStatus((prev) => ({ ...prev, visible: false }));
  }, []);

  return { status, showStatus, hideStatus };
};

const PlansPage = () => {
  const dispatch = useDispatch();
  // ... other state declarations remain the same

  const { plans, loading: plansLoading } = useSelector((state) => state.plan);
  const {
    user,
    loading: userLoading,
    loginLoading = false,
    error: authError,
    subscription: userSubscription,
    session: userSession,
  } = useSelector((state) => state.auth || {});
  console.log(user);
  const {
    loading: payLoading,
    success: paymentSuccess,
    error: paymentError,
  } = useSelector((state) => state.payment);

  const { status, showStatus, hideStatus } = useRealTimeStatus();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMpesaLoginModal, setShowMpesaLoginModal] = useState(false);
  const [showUsernameLoginModal, setShowUsernameLoginModal] = useState(false);

  const [voucherCode, setVoucherCode] = useState("");
  const [voucherPhone, setVoucherPhone] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);

  const [mpesaCode, setMpesaCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [deviceHostname, setDeviceHostname] = useState(""); // NEW: For actual hostname
  const [selectedPlan, setSelectedPlan] = useState(null);

  // ... other state declarations remain the same

  // Initialize device info - UPDATED VERSION
  useEffect(() => {
    const detectDeviceInfo = async () => {
      console.log("[DEVICE INFO] Starting device detection...");

      // 1. First get user agent info for device type
      const userAgent = navigator.userAgent;
      let deviceType = "Unknown Device";

      if (/android/i.test(userAgent)) {
        deviceType = "Android Device";
      } else if (/iPad|iPhone|iPod/.test(userAgent)) {
        deviceType = "iOS Device";
      } else if (/Windows/.test(userAgent)) {
        deviceType = "Windows PC";
      } else if (/Mac/.test(userAgent)) {
        deviceType = "Mac";
      } else if (/Linux/.test(userAgent)) {
        deviceType = "Linux Device";
      }

      console.log("[DEVICE INFO] Detected device type:", deviceType);

      // 2. Try multiple methods to get actual hostname
      let detectedHostname = "";

      // Method 1: Try to get from browser APIs (limited due to security)
      try {
        // This works in some browsers/environments
        if (navigator.userAgentData && navigator.userAgentData.platform) {
          detectedHostname = navigator.userAgentData.platform;
          console.log(
            "[DEVICE INFO] Got hostname from userAgentData:",
            detectedHostname
          );
        }
      } catch (e) {
        console.log("[DEVICE INFO] userAgentData not available");
      }

      // Method 2: Try to get from network info (experimental)
      try {
        if (navigator.connection) {
          const connection = navigator.connection;
          console.log("[DEVICE INFO] Network info:", connection);
        }
      } catch (e) {
        console.log("[DEVICE INFO] Network API not available");
      }

      // Method 3: Try to get from WebRTC (might give local IP)
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel("");
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            setTimeout(() => {
              pc.getStats().then((stats) => {
                stats.forEach((report) => {
                  if (report.type === "local-candidate" && report.ip) {
                    console.log(
                      "[DEVICE INFO] Local IP from WebRTC:",
                      report.ip
                    );
                  }
                });
                pc.close();
              });
            }, 1000);
          });
      } catch (e) {
        console.log("[DEVICE INFO] WebRTC not available");
      }

      // Method 4: Use a combination of browser info for a better name
      if (!detectedHostname) {
        // Extract more details from user agent
        const ua = navigator.userAgent;
        let model = "";

        // Try to get specific model for Android
        if (/Android/.test(ua)) {
          const match = ua.match(/Android\s([^;]+)/);
          if (match) model = match[1].trim();

          // Try to get device model
          const deviceMatch = ua.match(/\(([^)]+)\)/);
          if (deviceMatch) {
            const deviceInfo = deviceMatch[1];
            // Extract common device patterns
            const knownDevices = {
              "SM-": "Samsung Galaxy",
              Pixel: "Google Pixel",
              iPhone: "iPhone",
              iPad: "iPad",
              Macintosh: "Mac",
            };

            for (const [key, value] of Object.entries(knownDevices)) {
              if (deviceInfo.includes(key)) {
                detectedHostname = value;
                break;
              }
            }
          }
        }

        // For iOS
        if (/iPhone|iPad|iPod/.test(ua)) {
          const match = ua.match(/(iPhone|iPad|iPod)\s+([^;]+)/);
          if (match) {
            detectedHostname = `${match[1]} ${match[2] || ""}`.trim();
          }
        }

        // For Windows
        if (/Windows/.test(ua)) {
          const match = ua.match(/Windows\s+([^;)]+)/);
          if (match) {
            detectedHostname = `Windows ${match[1].split(";")[0]}`.trim();
          }
        }

        // For Mac
        if (/Macintosh/.test(ua)) {
          const match = ua.match(/Mac OS X\s+([^;)]+)/);
          if (match) {
            detectedHostname = `Mac ${match[1]}`.trim();
          }
        }
      }

      // Method 5: If all else fails, use device type with random identifier
      if (!detectedHostname || detectedHostname.length < 2) {
        // Create a more descriptive name
        const randomId = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();
        detectedHostname = `${deviceType.replace(/\s+/g, "-")}-${randomId}`;
        console.log(
          "[DEVICE INFO] Generated fallback hostname:",
          detectedHostname
        );
      }

      // Clean up the hostname (remove special characters, limit length)
      let cleanHostname = detectedHostname
        .replace(/[^a-zA-Z0-9\-_]/g, "") // Remove special chars
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .substring(0, 30) // Limit length
        .toLowerCase(); // Convert to lowercase for consistency

      if (cleanHostname.length < 3) {
        cleanHostname = `device-${Math.random().toString(36).substring(2, 6)}`;
      }

      console.log("[DEVICE INFO] Final cleaned hostname:", cleanHostname);

      // 3. Generate MAC-like identifier
      const fingerprint =
        userAgent +
        navigator.language +
        screen.width +
        screen.height +
        navigator.platform +
        navigator.hardwareConcurrency;

      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        hash = (hash << 5) - hash + fingerprint.charCodeAt(i);
        hash = hash & hash;
      }

      const hex = Math.abs(hash).toString(16).padStart(12, "0").slice(0, 12);
      const generatedMac = hex
        .match(/.{1,2}/g)
        .join(":")
        .toUpperCase();

      console.log("[DEVICE INFO] Generated MAC:", generatedMac);

      // 4. Update state
      setDeviceName(deviceType);
      setDeviceHostname(cleanHostname); // This should be like "matu-s-a05"
      setMacAddress(generatedMac);

      // 5. If we have a clean hostname, use it as the suggested username
      // You can add this to your registration form if needed
      console.log("[DEVICE INFO] Suggested username:", cleanHostname);

      // Store in localStorage for later use
      localStorage.setItem("deviceHostname", cleanHostname);
      localStorage.setItem("deviceFingerprint", fingerprint);
    };

    detectDeviceInfo();
  }, []);

  // ... rest of your component code remains the same

  // When handling payment, send BOTH deviceName AND deviceHostname
  const handlePay = async () => {
    console.log("[PAYMENT] Starting payment process...");
    console.log("[PAYMENT] Device Hostname:", deviceHostname); // This should be "matu-s-a05"
    console.log("[PAYMENT] Device Type:", deviceName);
    console.log("[PAYMENT] MAC Address:", macAddress);

    if (!selectedPlan) {
      showStatus("No plan selected.", "error");
      return;
    }

    if (!phone || phone.length < 10) {
      showStatus("Enter a valid phone number (e.g. 07xxxxxxxx)", "error");
      return;
    }

    // Suggest using device hostname as username
    const suggestedUsername =
      deviceHostname ||
      deviceName.toLowerCase().replace(/\s+/g, "-") +
        "-" +
        Math.random().toString(36).substring(2, 6);

    console.log(
      "[PAYMENT] Suggested username for registration:",
      suggestedUsername
    );

    const paymentData = {
      phone,
      userId: user?.id || "",
      planId: selectedPlan.id,
      macAddress,
      deviceName, // The device type (Android Device, etc.)
      deviceHostname, // The actual hostname (matu-s-a05)
      suggestedUsername, // Suggest this as the username
    };

    console.log("[PAYMENT] Sending payment request with data:", paymentData);

    try {
      const resultAction = await dispatch(startPayment(paymentData));
      // ... rest of payment handling
    } catch (error) {
      // ... error handling
    }
  };
  const handleRedeemVoucher = async (e) => {
    e.preventDefault();
    console.log("[VOUCHER] Redeeming voucher:", voucherCode);

    if (!voucherCode || voucherCode.length < 10) {
      showStatus("Please enter a valid voucher code", "error");
      return;
    }

    if (!macAddress) {
      showStatus("Device identification failed. Please refresh.", "error");
      return;
    }

    setVoucherLoading(true);

    try {
      const voucherData = {
        voucherCode: voucherCode.toUpperCase().replace(/\s/g, ""),
        phone: voucherPhone || undefined,
        macAddress,
        deviceName,
      };

      console.log("[VOUCHER] Sending request with data:", voucherData);

      const result = await dispatch(redeemVoucher(voucherData)).unwrap();

      console.log("[VOUCHER SUCCESS] Server response:", result);
      showStatus(
        result.message ||
          "Voucher redeemed successfully! You're now connected.",
        "success"
      );
      setVoucherCode("");
      setVoucherPhone("");
    } catch (error) {
      console.error("[VOUCHER ERROR]", error);
      showStatus(
        error ||
          "Failed to redeem voucher. Please check the code and try again.",
        "error"
      );
    } finally {
      setVoucherLoading(false);
    }
  };
  const handleMpesaLogin = async (e) => {
    e.preventDefault();
    console.log("[MPESA LOGIN] Logging in with code:", mpesaCode);

    if (!mpesaCode || mpesaCode.length < 8) {
      showStatus("Please enter a valid M-Pesa transaction code", "error");
      return;
    }

    if (!macAddress) {
      showStatus("Device identification failed. Please refresh.", "error");
      return;
    }

    try {
      const loginData = {
        mpesaCode: mpesaCode.toUpperCase(),
        macAddress,
        ipAddress: window.location.hostname,
        deviceName,
      };

      console.log("[MPESA LOGIN] Sending request with data:", loginData);

      const result = await dispatch(loginWithMpesaCode(loginData)).unwrap();

      console.log("[MPESA LOGIN SUCCESS] Server response:", result);
      showStatus("Login successful!", "success");
    } catch (error) {
      console.error("[MPESA LOGIN ERROR]", error);
      showStatus(
        error ||
          "Failed to login. Please check your M-Pesa code and try again.",
        "error"
      );
    }
  };

  const handleUsernameLogin = async (e) => {
    e.preventDefault();
    console.log("[USERNAME LOGIN] Logging in with username:", username);

    if (!username || !password) {
      showStatus("Please enter both username and password", "error");
      return;
    }

    if (!macAddress) {
      showStatus("Device identification failed. Please refresh.", "error");
      return;
    }

    try {
      const loginData = {
        username,
        password,
        macAddress,
        ipAddress: window.location.hostname,
        deviceName,
      };

      console.log("[USERNAME LOGIN] Sending request (password hidden)");

      const result = await dispatch(loginWithUsername(loginData)).unwrap();

      console.log("[USERNAME LOGIN SUCCESS] Server response:", result);
      showStatus("Login successful!", "success");
    } catch (error) {
      console.error("[USERNAME LOGIN ERROR]", error);
      showStatus(
        error ||
          "Failed to login. Please check your credentials and try again.",
        "error"
      );
    }
  };

  const closePaymentModal = () => {
    console.log("[MODAL] Closing payment modal");
    setShowPaymentModal(false);
    setPhone("");
    setSelectedPlan(null);
    dispatch(resetPaymentState());
  };

  const closeMpesaLoginModal = () => {
    setShowMpesaLoginModal(false);
    setMpesaCode("");
  };

  const closeUsernameLoginModal = () => {
    setShowUsernameLoginModal(false);
    setUsername("");
    setPassword("");
  };

  const formatDuration = (value, type) => {
    const typeLabel = type.toLowerCase();
    return `${value} ${typeLabel}${value !== 1 ? "s" : ""}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-500"></div>
      </div>

      {status.visible && (
        <Notification
          type={status.type}
          message={status.message}
          onClose={hideStatus}
        />
      )}

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
        {/* ``{" "}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-8 sm:pb-12">
          {plansLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : !plans || plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-blue-200 text-lg">
                No plans available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className="group relative bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/20 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1"
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
                          {formatDuration(
                            plan.durationValue,
                            plan.durationType
                          )}
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
          )}
        </div>
        `` */}
        {/* Voucher Section - Always Visible */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    value={voucherPhone}
                    onChange={(e) => setVoucherPhone(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl w-full p-3 sm:p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-blue-300/50 transition-all"
                    disabled={voucherLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={voucherLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 sm:py-4 rounded-xl hover:from-purple-500 hover:to-pink-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 font-semibold text-base sm:text-lg"
              >
                {voucherLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redeeming...
                  </>
                ) : (
                  <>
                    <Ticket className="w-5 h-5" />
                    Redeem Voucher
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        {/* Login Options */}

        {/* <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-12 sm:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            M-Pesa Login Card
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-400 rounded-2xl mb-4 shadow-lg shadow-cyan-500/50">
                  <Receipt className="text-white w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  M-Pesa Login
                </h2>
                <p className="text-blue-300 text-sm sm:text-base">
                  Login using your M-Pesa transaction code
                </p>
              </div>

              <button
                onClick={() => setShowMpesaLoginModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-500 text-white py-3 sm:py-4 rounded-xl hover:from-cyan-500 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/30 font-semibold text-base"
              >
                <Receipt className="w-5 h-5" />
                Login with M-Pesa
              </button>
            </div>
            Username Login Card
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl mb-4 shadow-lg shadow-green-500/50">
                  <UserCircle className="text-white w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Username Login
                </h2>
                <p className="text-blue-300 text-sm sm:text-base">
                  Login with your username and password
                </p>
              </div>

              <button
                onClick={() => setShowUsernameLoginModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 sm:py-4 rounded-xl hover:from-green-500 hover:to-emerald-400 transition-all shadow-lg shadow-green-500/30 font-semibold text-base"
              >
                <UserCircle className="w-5 h-5" />
                Login with Username
              </button>
            </div>
          </div>
        </div> */}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 px-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative border border-white/10">
            <button
              onClick={closePaymentModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
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
                  {formatDuration(
                    selectedPlan.durationValue,
                    selectedPlan.durationType
                  )}
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

            <div className="flex gap-3 mt-6">
              <button
                onClick={closePaymentModal}
                disabled={payLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={payLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 font-semibold flex items-center justify-center gap-2"
              >
                {payLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay Now"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* M-Pesa Login Modal */}
      {showMpesaLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 px-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative border border-white/10 animate-in fade-in zoom-in duration-200">
            <button
              onClick={closeMpesaLoginModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-400 rounded-2xl mb-4 shadow-lg shadow-cyan-500/50">
                <Receipt className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                M-Pesa Login
              </h2>
              <p className="text-blue-300 text-sm sm:text-base">
                Enter your M-Pesa transaction code
              </p>
            </div>

            <form onSubmit={handleMpesaLogin}>
              <input
                type="text"
                placeholder="e.g., SH12ABC34D"
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                className="bg-white/10 border border-white/20 rounded-xl w-full p-3 sm:p-4 mb-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-white placeholder-blue-300/50 transition-all font-mono"
                disabled={userLoading}
              />
              <p className="text-blue-300/70 text-xs mb-4">
                Enter the M-Pesa code from your payment confirmation SMS
              </p>

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
                    Login
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Username Login Modal */}
      {/* {showUsernameLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 px-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative border border-white/10 animate-in fade-in zoom-in duration-200">
            <button
              onClick={closeUsernameLoginModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl mb-4 shadow-lg shadow-green-500/50">
                <UserCircle className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Username Login
              </h2>
              <p className="text-blue-300 text-sm sm:text-base">
                Enter your username and password
              </p>
            </div>

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
                  className="bg-white/10 border border-white/20 rounded-xl w-full p-3 sm:p-4 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-white placeholder-blue-300/50 transition-all"
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
                  className="bg-white/10 border border-white/20 rounded-xl w-full p-3 sm:p-4 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-white placeholder-blue-300/50 transition-all"
                  disabled={userLoading}
                />
              </div>

              <button
                type="submit"
                disabled={userLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 sm:py-4 rounded-xl hover:from-green-500 hover:to-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 font-semibold text-base"
              >
                {userLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <UserCircle className="w-5 h-5" />
                    Login
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default PlansPage;
