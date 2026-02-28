package com.quince.freight.model

data class DecisionConfig(
    val lane_key: String,
    val cost_weight: Int,
    val sla_weight: Int,
    val reliability_weight: Int
)