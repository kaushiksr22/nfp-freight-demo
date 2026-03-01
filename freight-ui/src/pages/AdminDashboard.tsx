console.log("ADMIN DASHBOARD LOADED");
import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Shipment } from "../types/models";

export default function AdminDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getShipments() // empty = fetch all
      .then((data) => setShipments(data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("vendor");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            All eligible shipments
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          Logout
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-500">Loading shipments...</div>
        ) : shipments.length === 0 ? (
          <div className="p-6 text-slate-500">
            No shipments available.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-4 text-left">ASN</th>
                <th className="p-4 text-left">Vendor</th>
                <th className="p-4 text-left">Origin</th>
                <th className="p-4 text-left">Destination</th>
                <th className="p-4 text-left">Lane</th>
                <th className="p-4 text-left">CBM</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.asn_id} className="border-t hover:bg-slate-50">
                  <td className="p-4">{s.asn_id}</td>
                  <td className="p-4">{s.vendor_code}</td>
                  <td className="p-4">{s.origin_city}</td>
                  <td className="p-4">{s.destination_id}</td>
                  <td className="p-4">{s.lane_key}</td>
                  <td className="p-4">{s.volume_cbm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}