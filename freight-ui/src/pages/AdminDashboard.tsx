console.log("ADMIN DASHBOARD LOADED");
import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Shipment } from "../types/models";

export default function AdminDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    // Fetch all shipments
    api
      .getShipments("")
      .then((data) => setShipments(data || []))
      .finally(() => setLoading(false));

    // Fetch all bookings
    api
      .getBookings("")
      .then((data) => setBookings(data || []))
      .catch(() => setBookings([]))
      .finally(() => setBookingsLoading(false));
  }, []);

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

      {/* Shipments Table */}
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
                  <td className="p-4">{(s as any).from_port || "-"}</td>
                  <td className="p-4">{(s as any).to_port || "-"}</td>
                  <td className="p-4">{s.lane_key}</td>
                  <td className="p-4">{s.volume_cbm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Booking History */}
      <div className="mt-12 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-900">
          Booking History
        </h3>

        {bookingsLoading ? (
          <div className="text-sm text-slate-500">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-sm text-slate-500">
            No bookings found.
          </div>
        ) : (
          <ul className="space-y-3 text-sm text-slate-700">
            {bookings.map((b, idx) => (
              <li
                key={b.booking_id || idx}
                className="border-b pb-3"
              >
                <div className="font-medium">
                  {b.booking_id || "Booking"}
                </div>
                <div className="text-slate-500">
                  Status: {b.status || "-"} | Vendor:{" "}
                  {b.created_by || "-"} | Lane:{" "}
                  {b.lane_key || "-"}
                </div>
                <div className="text-slate-500">
                  ASN(s): {b.asn_ids || "-"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}