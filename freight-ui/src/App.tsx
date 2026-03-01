import { useState } from "react";
import VendorDashboard from "./pages/VendorDashboard";
import Login from "./pages/Login";

export default function App() {
  const [vendor, setVendor] = useState(
    localStorage.getItem("vendor")
      ? JSON.parse(localStorage.getItem("vendor")!)
      : null
  );

  if (!vendor) {
    return <Login onLogin={setVendor} />;
  }

  return <VendorDashboard />;
}