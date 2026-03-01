import { useEffect, useState } from "react";
import { api } from "../api/client";
import BookingStep1 from "./BookingStep1";
import BookingStep2 from "./BookingStep2";
import BookingStep3 from "./BookingStep3";
import StepIndicator from "./StepIndicator";
import type { Shipment, ScoredRate } from "../types/models";

export default function VendorDashboard() {
  const vendor = JSON.parse(localStorage.getItem("vendor") || "{}");

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [rates, setRates] = useState<ScoredRate[]>([]);
  const [selectedForwarder, setSelectedForwarder] = useState<string | null>(null);

  const [bookingLoading, setBookingLoading] = useState(false);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [createdBookingId, setCreatedBookingId] = useState<string>("");

  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const storedVendor = localStorage.getItem("vendor");
  
    if (!storedVendor) {
      setLoading(false);
      return;
    }
  
    const vendor = JSON.parse(storedVendor);
  
    api
      .getShipments(vendor.vendor_code)
      .then((data) => setShipments(data || []))
      .finally(() => setLoading(false));
  }, []);

  const selectedShipments = shipments.filter((s) =>
    selected.includes(s.asn_id)
  );

  const totalSelectedCbm = selectedShipments.reduce(
    (sum, s) => sum + Number(s.volume_cbm || 0),
    0
  );

  const handleContinue = async () => {
    if (selectedShipments.length === 0) return;

    const lane = selectedShipments[0].lane_key;

    const scoredRates = await api.getScoredRates(lane);

    setRates(scoredRates);
    setSelectedForwarder(
      scoredRates.find((r) => r.recommended)?.forwarder_id ||
        scoredRates[0].forwarder_id
    );

    setCurrentStep(2);
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
  };

  const handleConfirmBooking = async () => {
    if (!selectedForwarder || selectedShipments.length === 0) return;

    setBookingLoading(true);

    const response = await api.createBooking({
      laneKey: selectedShipments[0].lane_key,
      asnIds: selected,
      overrideForwarderId: selectedForwarder,
    });

    const bookingId =
      response?.booking_id || response?.bookingId || "";

    setCreatedBookingId(bookingId);

    if (bookingId) {
      setHistory((prev) => [bookingId, ...prev]);
    }

    setBookingLoading(false);
    setCurrentStep(3);
  };

  const handleReset = async () => {
    setSelected([]);
    setRates([]);
    setSelectedForwarder(null);
    setCreatedBookingId("");
    setCurrentStep(1);

    const refreshed = await api.getShipments(vendor.vendor_code);
    setShipments(refreshed || []);
  };

  const handleLogout = () => {
    localStorage.removeItem("vendor");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            {vendor.vendor_name || "Vendor"} Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Shipments ready for pickup
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          Logout
        </button>
      </div>

      <StepIndicator currentStep={currentStep} />

      {currentStep === 1 && (
        <BookingStep1
          shipments={shipments}
          loading={loading}
          selected={selected}
          setSelected={setSelected}
          totalSelectedCbm={totalSelectedCbm}
          onContinue={handleContinue}
          fadingRows={[]}
        />
      )}

      {currentStep === 2 && (
        <BookingStep2
          rates={rates}
          selectedForwarder={selectedForwarder}
          setSelectedForwarder={setSelectedForwarder}
          onConfirm={handleConfirmBooking}
          onBack={handleBackToStep1}
          bookingLoading={bookingLoading}
        />
      )}

      {currentStep === 3 && (
        <BookingStep3
          bookingId={createdBookingId}
          shipments={selectedShipments}
          forwarderName={
            rates.find((r) => r.forwarder_id === selectedForwarder)
              ?.forwarder_name || ""
          }
          totalCbm={totalSelectedCbm}
          onReset={handleReset}
        />
      )}

      {/* Booking History */}
      {history.length > 0 && (
        <div className="mt-12 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">
            Recent Bookings
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            {history.map((id) => (
              <li key={id} className="border-b pb-2">
                {id}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}