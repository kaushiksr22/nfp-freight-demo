import type { ScoredRate } from "../types/models";

interface Props {
  rates: ScoredRate[];
  selectedForwarder: string | null;
  setSelectedForwarder: (id: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  bookingLoading: boolean;
}

export default function BookingStep2({
  rates,
  selectedForwarder,
  setSelectedForwarder,
  onConfirm,
  onBack,
  bookingLoading,
}: Props) {
  const recommended = rates.find((r) => r.recommended);

  return (
    <div className="mt-8 bg-white border rounded-xl shadow-sm p-8">
      <h2 className="text-lg font-semibold mb-6">
        Select Forwarder
      </h2>

      {/* AI Explanation */}
      {recommended && (
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-5 text-sm text-slate-700">
          <p className="font-medium text-slate-900 mb-2">
            Why this forwarder is recommended
          </p>
          <p>
            Based on weighted scoring across cost, transit time and
            reliability, <b>{recommended.forwarder_name}</b> offers
            the best balance for this lane.
          </p>
        </div>
      )}

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

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          Back
        </button>

        <button
          onClick={onConfirm}
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
  );
}