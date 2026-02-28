package com.quince.freight.service

import com.quince.freight.model.RateResponse
import com.quince.freight.model.ScoredRate
import org.springframework.stereotype.Service
import kotlin.math.pow

@Service
class DecisionEngineService {

    fun scoreRates(
        rates: List<RateResponse>,
        costWeight: Int,
        slaWeight: Int,
        reliabilityWeight: Int
    ): List<ScoredRate> {

        if (rates.isEmpty()) return emptyList()

        // Convert safely to Double
        val costs = rates.map { (it.charges_per_cbm as Number).toDouble() }
        val slas = rates.map { (it.transit_days as Number).toDouble() }
        val reliabilities = rates.map { (it.reliability_pct as Number).toDouble() }

        val minCost = costs.minOrNull()!!
        val maxCost = costs.maxOrNull()!!
        val minSla = slas.minOrNull()!!
        val maxSla = slas.maxOrNull()!!
        val minRel = reliabilities.minOrNull()!!
        val maxRel = reliabilities.maxOrNull()!!

        val scored = rates.map { rate ->

            val cost = (rate.charges_per_cbm as Number).toDouble()
            val sla = (rate.transit_days as Number).toDouble()
            val reliability = (rate.reliability_pct as Number).toDouble()

            val costNorm = if (maxCost == minCost) 0.0
            else (cost - minCost) / (maxCost - minCost)

            val slaNorm = if (maxSla == minSla) 0.0
            else (sla - minSla) / (maxSla - minSla)

            val relNorm = if (maxRel == minRel) 0.0
            else (maxRel - reliability) / (maxRel - minRel)

            val score =
                (costNorm.pow(costWeight)) *
                (slaNorm.pow(slaWeight)) /
                ((1 - relNorm).pow(reliabilityWeight))

            ScoredRate(
                id = rate.id,
                forwarder_id = rate.forwarder_id,
                forwarder_name = rate.forwarder_name,
                lane_key = rate.lane_key,
                transit_days = sla,
                charges_per_cbm = cost,
                reliability_pct = reliability,
                score = score,
                recommended = false
            )
        }.sortedBy { it.score }

        // Mark lowest score as recommended
        return scored.mapIndexed { index, item ->
            if (index == 0) item.copy(recommended = true)
            else item
        }
    }
}