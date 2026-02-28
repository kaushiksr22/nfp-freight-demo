export interface Shipment {
    asn_id: string;
    vendor_code: string;
    vendor_name: string;
    cartons: number;
    volume_cbm: number;
    weight_kg: number;
    lane_key: string;
    status: string;
    pickup_date: string;
  }
  
  export interface Rate {
    id: string;
    forwarder_id: string;
    forwarder_name: string;
    lane_key: string;
    transit_days: number;
    charges_per_cbm: number;
    reliability_pct: number;
    validity: string;
  }
  
  export interface ScoredRate extends Rate {
    score: number;
    recommended: boolean;
  }