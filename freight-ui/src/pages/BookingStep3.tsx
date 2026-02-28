import type { Shipment } from "../types/models";

interface Props {
  bookingId: string;
  shipments: Shipment[];
  forwarderName: string;
  totalCbm: number;
  onReset: () => void;
}

export default function BookingStep3({
  bookingId,
  shipments,
  forwarderName,
  totalCbm,
  onReset,
}: Props) {
  return (
    <div className="mt-8 bg-white border border-slate-200 rounded-xl shadow-sm p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">
          Booking Confirmed
        </h2>
        <p className="text-slate-500 mt-1">
          Your shipment has been successfully booked.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <p className="text-green-800 font-medium">
          Booking ID: {bookingId}
        </p>
      </div>

      <div className="space-y-4 text-sm text-slate-700">
        <div>
          <p className="font-medium text-slate-900 mb-1">
            Selected Shipments
          </p>
          <ul className="list-disc list-inside">
            {shipments.map((s) => (
              <li key={s.asn_id}>
                {s.asn_id} — {s.origin_city} → {s.destination_id}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p>
            <span className="font-medium">Forwarder:</span>{" "}
            {forwarderName}
          </p>
          <p>
            <span className="font-medium">Total CBM:</span>{" "}
            {totalCbm}
          </p>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={onReset}
          className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}