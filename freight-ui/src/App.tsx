import { useEffect, useState } from "react";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("vendor");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  if (user.role === "admin") {
    return <AdminDashboard />;
  }

  return <VendorDashboard />;
}