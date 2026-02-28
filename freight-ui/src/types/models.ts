export interface Shipment {
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
  
  export interface Rate {
    id: string;
    forwarder_id: string;
    forwarder_name: string;
    lane_key: string;
    transit_days: number;
    charges_per_cbm: number;
    reliability_pct: number;
    validity: string;
    score?: number;
    recommended?: boolean;
  }
  
  export interface ScoredRate extends Rate {
    score: number;
    recommended: boolean;
  }