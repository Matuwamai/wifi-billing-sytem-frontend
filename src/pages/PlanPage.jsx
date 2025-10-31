import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlans } from "../services/plan/planSlice.js";
import {
  startPayment,
  resetPaymentState,
} from "../services/payment/paymentSlice.js";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

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
      alert("Enter a valid phone number (e.g. 07xxxxxxxx)");
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
  //   const { plans, loading: plansLoading } = useSelector((state) => state.plan);
  console.log("Plans from Redux:", plans);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Available Wi-Fi Plans
      </h1>

      {plansLoading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      )}

      {!plansLoading && plans.length === 0 && (
        <p className="text-center text-gray-600">No plans available.</p>
      )}

      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
        {Array.isArray(plans) &&
          plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {plan.name}
              </h2>
              <p className="text-gray-500 mb-4">{plan.description}</p>
              <div className="text-gray-700 mb-4">
                <p>
                  <strong>Duration:</strong> {plan.durationValue}{" "}
                  {plan.durationType}(s)
                </p>
                <p>
                  <strong>Price:</strong> KES {plan.price}
                </p>
              </div>
              <button
                onClick={() => handleBuy(plan)}
                className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
              >
                Buy Now
              </button>
            </div>
          ))}
      </div>

      {/* 📲 Payment Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Pay for {selectedPlan.name}
            </h2>
            <input
              type="tel"
              placeholder="Enter your Mpesa number (07xxxxxxxx)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-gray-300 rounded-lg w-full p-3 mb-4 focus:ring focus:ring-blue-300"
            />

            {/* Payment status UI */}
            {payLoading && (
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing STK Push...</span>
              </div>
            )}

            {success && (
              <div className="flex items-center justify-center gap-2 text-green-600 mb-3">
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  Payment initiated successfully! Approve on your phone.
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
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={payLoading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
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
