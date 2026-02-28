package com.quince.freight.model

data class Shipment(
    val asn_id: String,
    val vendor_code: String,
    val vendor_name: String,
    val cartons: Any?,
    val volume_cbm: Any?,
    val weight_kg: Any?,
    val from_port: String,
    val to_port: String,
    val lane_key: String,
    val status: String,
    val pickup_date: String
)