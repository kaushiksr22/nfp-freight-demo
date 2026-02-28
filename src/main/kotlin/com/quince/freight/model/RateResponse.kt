package com.quince.freight.model

data class RateResponse(
    val id: String,
    val forwarder_id: String,
    val forwarder_name: String?,
    val lane_key: String,
    val transit_days: Any?,
    val charges_per_cbm: Any?,
    val reliability_pct: Any?,
    val validity: String?
)