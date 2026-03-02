console.log("VENDOR DASHBOARD LOADED");
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import BookingStep1 from "./BookingStep1";
import BookingStep2 from "./BookingStep2";
import BookingStep3 from "./BookingStep3";
import StepIndicator from "./StepIndicator";
import type { Shipment, ScoredRate } from "../types/models";

type StoredUser = {
  id?: number;
  email?: string;
  role?: "vendor" | "admin";
  vendor_code?: string;
  vendor_name?: string;
  program_type?: string;
};

export default function VendorDashboard() {
  const storedUser = localStorage.getItem("vendor");
  const user: StoredUser | null = storedUser ? JSON.parse(storedUser) : null;

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [rates, setRates] = useState<ScoredRate[]>([]);
  const [selectedForwarder, setSelectedForwarder] = useState<string | null>(null);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [createdBookingId, setCreatedBookingId] = useState<string>("");

  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 p-10">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-slate-700">
          You are logged out. Please refresh and login again.
        </div>
      </div>
    );
  }

  if (user.role === "vendor" && user.program_type === "self-vddp") {
    return (
      <div className="min-h-screen bg-slate-50 p-10">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Self-Managed Vendor
          </h2>
          <p className="text-slate-600">
            You are enrolled under Self-VDDP program. 
            Please submit MAWB, in the VDDP freight form.
          </p>
        </div>
      </div>
    );
  }

  const vendorCodeForShipments =
    user.role === "vendor" ? user.vendor_code || "" : "";

  const selectedShipments = useMemo(
    () => shipments.filter((s) => selected.includes(s.asn_id)),
    [shipments, selected]
  );

  const totalSelectedCbm = useMemo(() => {
    return selectedShipments.reduce(
      (sum, s) => sum + Number(s.volume_cbm || 0),
      0
    );
  }, [selectedShipments]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const data = await api.getShipments(vendorCodeForShipments);
      setShipments(data || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    const vendorCodeForBookings =
      user.role === "vendor" ? user.vendor_code || "" : "";

    setBookingsLoading(true);
    try {
      const data = await api.getBookings(vendorCodeForBookings);
      setBookings(data || []);
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ FIXED CONTINUE
  const handleContinue = async () => {
    if (selected.length === 0) return;
  
    const selectedShipments = shipments.filter((s) =>
      selected.includes(s.asn_id)
    );
  
    // Lane validation
    const laneSet = new Set(selectedShipments.map((s) => s.lane_key));
    if (laneSet.size > 1) {
      alert("Selected ASNs must belong to the same lane.");
      return;
    }
  
    // Pickup date window validation
    const pickupDates = selectedShipments.map((s) => {
      const [day, month, year] = s.pickup_date.split("-");
      return new Date(`${year}-${month}-${day}`);
    });
  
    const minDate = new Date(Math.min(...pickupDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...pickupDates.map(d => d.getTime())));
  
    const diffDays =
      (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
  
    if (diffDays > 3) {
      alert("Pickup dates must be within a 3-day window for consolidation.");
      return;
    }
  
    const firstShipment = selectedShipments[0];
  
    const scoredRates = await api.getScoredRates(firstShipment.lane_key);
    if (!scoredRates || scoredRates.length === 0) return;
  
    setRates(scoredRates);
    setSelectedForwarder(
      scoredRates.find((r) => r.recommended)?.forwarder_id ||
        scoredRates[0].forwarder_id
    );
  
    setCurrentStep(2);
  };

  const handleConfirmBooking = async () => {
    if (!selectedForwarder || selected.length === 0) return;

    setBookingLoading(true);
    try {
      const firstShipment = shipments.find(
        (s) => s.asn_id === selected[0]
      );
      if (!firstShipment) return;

      const response = await api.createBooking({
        laneKey: firstShipment.lane_key,
        asnIds: selected,
        overrideForwarderId: selectedForwarder,
      });

      const bookingId = response?.booking_id || response?.bookingId || "";
      setCreatedBookingId(bookingId);
      setSelected([]); // clear selections

      setCurrentStep(3);
      await fetchShipments();
      await fetchBookings();
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReset = async () => {
    setSelected([]);
    setRates([]);
    setSelectedForwarder(null);
    setCreatedBookingId("");
    setCurrentStep(1);
    await fetchShipments();
    await fetchBookings();
  };

  const handleLogout = () => {
    localStorage.removeItem("vendor");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            {user.role === "admin"
              ? "Admin Dashboard"
              : `${user.vendor_name || "Vendor"} Dashboard`}
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
          onBack={() => setCurrentStep(1)}
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

      <div className="mt-12 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-900">
          Booking History
        </h3>

        {bookingsLoading ? (
          <div className="text-sm text-slate-500">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="text-sm text-slate-500">No bookings found.</div>
        ) : (
          <ul className="space-y-2 text-sm text-slate-700">
            {bookings.map((b, idx) => (
              <li key={b.booking_id || idx} className="border-b pb-2">
                <div className="font-medium">
                  {b.booking_id || "Booking"}
                </div>
                <div className="text-slate-500">
                  Status: {b.status || "-"} | Lane: {b.lane_key || "-"} | ASN(s):{" "}
                  {b.asn_ids || "-"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}