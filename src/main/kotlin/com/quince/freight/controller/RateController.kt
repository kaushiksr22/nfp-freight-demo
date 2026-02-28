package com.quince.freight.controller

import com.quince.freight.model.RateResponse
import com.quince.freight.model.ScoredRate
import com.quince.freight.service.RateService
import com.quince.freight.service.DecisionService
import com.quince.freight.service.DecisionEngineService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class RateController(
    private val rateService: RateService,
    private val decisionService: DecisionService,
    private val decisionEngineService: DecisionEngineService
) {

    @GetMapping("/api/rates")
    fun getRates(
        @RequestParam laneKey: String
    ): List<RateResponse>? {
        return rateService.getRates(laneKey)
    }

    @GetMapping("/api/rates/scored")
    fun getScoredRates(
        @RequestParam laneKey: String
    ): List<ScoredRate> {

        val rates = rateService.getRates(laneKey) ?: emptyList()
        val config = decisionService.getDecisionConfig(laneKey)

        return decisionEngineService.scoreRates(
            rates = rates,
            costWeight = config?.cost_weight ?: 3,
            slaWeight = config?.sla_weight ?: 4,
            reliabilityWeight = config?.reliability_weight ?: 3
        )
    }
}