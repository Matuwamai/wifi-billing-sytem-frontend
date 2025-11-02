import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlans } from "../services/plan/planSlice.js";
import {
  startPayment,
  resetPaymentState,
} from "../services/payment/paymentSlice.js";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Wifi,
  CreditCard,
  Clock,
} from "lucide-react";

const PlansPage = () => {
  const dispatch = useDispatch();
  const { plans, loading: plansLoading } = useSelector((state) => state.plan);
  const { user } = useSelector((state) => state.auth);
  const {
    loading: payLoading,
    success,
    error,
  } = useSelector((state) => state.payment);

  const [phone, setPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  const handleBuy = (plan) => {
    if (!user) return alert("Please log in first.");
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handlePay = async () => {
    if (!phone || phone.length < 10) {
      alert("Enter a valid phone number (07xxxxxxxx)");
      return;
    }
    await dispatch(
      startPayment({ phone, userId: user.id, planId: selectedPlan.id })
    );
  };

  const closeModal = () => {
    setShowModal(false);
    setPhone("");
    setSelectedPlan(null);
    dispatch(resetPaymentState());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Hero Section */}
      <div className="text-center py-12">
        <Wifi className="mx-auto text-blue-600 w-12 h-12 mb-3" />
        <h1 className="text-3xl font-bold text-gray-800">
          Choose Your Internet Plan
        </h1>
        <p className="text-gray-500 mt-2">
          Flexible Wi-Fi subscriptions for every need — pay easily via Mpesa.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {plansLoading && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        )}

        {!plansLoading && (!plans || plans.length === 0) && (
          <p className="text-center text-gray-600">
            No available plans at the moment.
          </p>
        )}

        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8">
          {Array.isArray(plans) &&
            plans.map((plan) => (
              <div
                key={plan.id}
                className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-3 text-blue-600">
                  <Clock className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">{plan.name}</h2>
                </div>
                <p className="text-gray-500 mb-4 h-12">
                  {plan.description || "Fast and reliable internet connection."}
                </p>
                <div className="text-gray-700 mb-5 space-y-1">
                  <p>
                    <strong>Duration:</strong> {plan.durationValue}{" "}
                    {plan.durationType.toLowerCase()}(s)
                  </p>
                  <p>
                    <strong>Price:</strong>{" "}
                    <span className="text-blue-700 font-semibold">
                      KES {plan.price}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleBuy(plan)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition"
                >
                  <CreditCard className="w-4 h-4" />
                  Subscribe Now
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
              Subscribe to {selectedPlan.name}
            </h2>
            <p className="text-center text-gray-500 mb-6">
              You’ll receive an STK push on your phone.
            </p>

            <input
              type="tel"
              placeholder="Enter Mpesa number (07xxxxxxxx)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-gray-300 rounded-lg w-full p-3 mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
            />

            {payLoading && (
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing payment...</span>
              </div>
            )}

            {success && (
              <div className="flex items-center justify-center gap-2 text-green-600 mb-3">
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  STK Push sent! Approve on your phone to complete payment.
                </span>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center gap-2 text-red-600 mb-3">
                <XCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={payLoading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
              >
                Pay KES {selectedPlan.price}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansPage;
