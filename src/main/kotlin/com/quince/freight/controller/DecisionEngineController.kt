package com.quince.freight.controller

import com.quince.freight.model.ScoredRate
import com.quince.freight.service.RateService
import com.quince.freight.service.DecisionService
import com.quince.freight.service.DecisionEngineService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class DecisionEngineController(
    private val rateService: RateService,
    private val decisionService: DecisionService,
    private val decisionEngineService: DecisionEngineService
) {

    @GetMapping("/api/decision-engine/score")
    fun scoreRates(
        @RequestParam("lane_key") laneKey: String
    ): List<ScoredRate> {

        val rates = rateService.getRates(laneKey) ?: emptyList()
        val config = decisionService.getDecisionConfig(laneKey)

        return decisionEngineService.scoreRates(
            rates,
            config?.cost_weight ?: 3,
            config?.sla_weight ?: 4,
            config?.reliability_weight ?: 3
        )
    }
}