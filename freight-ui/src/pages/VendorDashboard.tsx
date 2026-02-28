import { useEffect, useState } from "react";
import { api } from "../api/client";

interface Shipment {
  asn_id: string;
  vendor_code: string;
  vendor_name: string;
  cartons: number;
  volume_cbm: number;
  weight_kg: number;
  origin_city: string;
  from_port: string;
  to_port: string;
  lane_key: string;
  destination_id: string;
  status: string;
  pickup_date: string;
}

interface ScoredRate {
  id: string;
  forwarder_id: string;
  forwarder_name: string;
  charges_per_cbm: number;
  transit_days: number;
  reliability_pct: number;
  score?: number;
  recommended?: boolean;
}

export default function VendorDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [rates, setRates] = useState<ScoredRate[]>([]);
  const [showDecision, setShowDecision] = useState(false);
  const [selectedForwarder, setSelectedForwarder] = useState<string | null>(null);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [fadingRows, setFadingRows] = useState<string[]>([]);

  useEffect(() => {
    api
      .getShipments("V001")
      .then((data) => setShipments(data || []))
      .catch(() => setErrorMsg("Failed to load shipments."))
      .finally(() => setLoading(false));
  }, []);

  const toggleSelection = (asnId: string) => {
    setSelected((prev) =>
      prev.includes(asnId)
        ? prev.filter((id) => id !== asnId)
        : [...prev, asnId]
    );
  };

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

    try {
      const scoredRates = await api.getScoredRates(lane);

      if (!scoredRates || scoredRates.length === 0) {
        setErrorMsg("No rates returned from backend.");
        return;
      }

      setRates(scoredRates);
      setSelectedForwarder(
        scoredRates.find((r) => r.recommended)?.forwarder_id ||
        scoredRates[0].forwarder_id
      );
      setShowDecision(true);
    } catch {
      setErrorMsg("Something went wrong while fetching rates.");
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedForwarder || selectedShipments.length === 0) return;

    setBookingLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const response = await api.createBooking({
        laneKey: selectedShipments[0].lane_key,
        asnIds: selected,
        overrideForwarderId: selectedForwarder,
      });

      const bookingId =
        response?.booking_id || response?.bookingId || "";

      setFadingRows(selected);

      setTimeout(() => {
        setShipments((prev) =>
          prev.filter((s) => !selected.includes(s.asn_id))
        );
        setSelected([]);
        setRates([]);
        setShowDecision(false);
        setSelectedForwarder(null);
        setFadingRows([]);
      }, 400);

      setSuccessMsg(
        bookingId
          ? `Booking ${bookingId} created successfully.`
          : "Booking created successfully."
      );

      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setErrorMsg("Booking failed. Please try again.");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          Vendor Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Shipments ready for pickup
        </p>
      </div>

      {/* Success / Error Banner */}
      {successMsg && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          {errorMsg}
        </div>
      )}

      {/* Shipments Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-500">Loading shipments...</div>
        ) : shipments.length === 0 ? (
          <div className="p-6 text-slate-500">
            No shipments ready for pickup.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-4"></th>
                <th className="p-4 text-left">ASN</th>
                <th className="p-4 text-left">Origin</th>
                <th className="p-4 text-left">Destination</th>
                <th className="p-4 text-left">Lane</th>
                <th className="p-4 text-left">CBM</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => {
                const isFading = fadingRows.includes(s.asn_id);
                return (
                  <tr
                    key={s.asn_id}
                    className={`border-t transition-all duration-300 ${
                      isFading ? "opacity-0 scale-95" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(s.asn_id)}
                        onChange={() => toggleSelection(s.asn_id)}
                      />
                    </td>
                    <td className="p-4">{s.asn_id}</td>
                    <td className="p-4">{s.origin_city}</td>
                    <td className="p-4">{s.destination_id}</td>
                    <td className="p-4">{s.lane_key}</td>
                    <td className="p-4">{s.volume_cbm}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Selection Panel */}
      {selected.length > 0 && (
        <div className="mt-8 bg-white border rounded-xl shadow-sm p-6 flex justify-between">
          <div>
            <p className="font-medium">
              {selected.length} shipment(s) selected
            </p>
            <p className="text-sm text-slate-500">
              Total CBM: {totalSelectedCbm}
            </p>
          </div>
          <button
            onClick={handleContinue}
            className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800"
          >
            Continue
          </button>
        </div>
      )}

      {/* Forwarder Comparison Panel */}
      {showDecision && rates.length > 0 && (
        <div className="mt-8 bg-white border rounded-xl shadow-sm p-8">
          <h2 className="text-lg font-semibold mb-6">
            Select Forwarder
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {rates.map((rate) => {
              const isRecommended = rate.recommended;
              const isSelected =
                selectedForwarder === rate.forwarder_id;

              return (
                <label
                  key={rate.forwarder_id}
                  className={`cursor-pointer rounded-lg border p-6 transition ${
                    isRecommended
                      ? "border-green-400 bg-green-50"
                      : "border-slate-200 bg-white"
                  } ${
                    isSelected ? "ring-2 ring-slate-900" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-900">
                        {rate.forwarder_name}
                      </p>
                      {isRecommended && (
                        <p className="text-xs text-green-700 mt-1">
                          Recommended
                        </p>
                      )}
                      <p className="text-sm text-slate-600 mt-2">
                        ${rate.charges_per_cbm} / CBM
                      </p>
                      <p className="text-sm text-slate-600">
                        {rate.transit_days} days transit
                      </p>
                      <p className="text-sm text-slate-600">
                        {(rate.reliability_pct * 100).toFixed(0)}% reliability
                      </p>
                    </div>

                    <input
                      type="radio"
                      name="forwarder"
                      checked={isSelected}
                      onChange={() =>
                        setSelectedForwarder(rate.forwarder_id)
                      }
                    />
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleConfirmBooking}
              disabled={bookingLoading}
              className={`px-6 py-2 rounded-lg ${
                bookingLoading
                  ? "bg-slate-300 text-slate-600"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {bookingLoading ? "Confirming..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}