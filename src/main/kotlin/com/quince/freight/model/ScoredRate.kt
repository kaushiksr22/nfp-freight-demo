package com.quince.freight.model

data class ScoredRate(
    val id: String,
    val forwarder_id: String,
    val forwarder_name: String?,
    val lane_key: String,
    val transit_days: Double,
    val charges_per_cbm: Double,
    val reliability_pct: Double,
    val score: Double,
    val recommended: Boolean
)