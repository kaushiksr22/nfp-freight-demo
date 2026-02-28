package com.quince.freight.model

data class BookingRequest(
    val laneKey: String,
    val asnIds: List<String>,
    val overrideForwarderId: String?
)