const BASE_URL = "http://localhost:8080/api";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API Error");
  }

  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request("/login?email=" + email + "&password=" + password),

  getShipments: (vendorCode?: string) => {
    if (!vendorCode) {
      return request(`/shipments`);
    }
  
    return request(`/shipments?vendorCode=${vendorCode}`);
  },

  getRates: (laneKey: string) =>
    request(`/rates?lane_key=${laneKey}`),

  getDecisionConfig: (laneKey: string) =>
    request(`/decision-config?lane_key=${laneKey}`),

  getScoredRates: (laneKey: string) =>
    request(`/decision-engine/score?lane_key=${laneKey}`),

  createBooking: (payload: {
    laneKey: string;
    asnIds: string[];
    overrideForwarderId?: string;
  }) =>
    request(`/bookings`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

getBookings: (vendorCode: string) =>
        request(`/bookings?vendorCode=${vendorCode}`),  
};