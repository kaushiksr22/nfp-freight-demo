import type { Shipment } from "../types/models";

interface Props {
  shipments: Shipment[];
  loading: boolean;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  totalSelectedCbm: number;
  onContinue: () => void;
  fadingRows: string[];
}

export default function BookingStep1({
  shipments,
  loading,
  selected,
  setSelected,
  totalSelectedCbm,
  onContinue,
  fadingRows,
}: Props) {
  const toggleSelection = (asnId: string) => {
    setSelected((prev) =>
      prev.includes(asnId)
        ? prev.filter((id) => id !== asnId)
        : [...prev, asnId]
    );
  };

  return (
    <>
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
            onClick={onContinue}
            className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800"
          >
            Continue
          </button>
        </div>
      )}
    </>
  );
}