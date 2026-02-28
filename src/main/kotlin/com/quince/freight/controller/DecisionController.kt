package com.quince.freight.controller

import com.quince.freight.model.DecisionConfig
import com.quince.freight.service.DecisionService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class DecisionController(
    private val decisionService: DecisionService
) {

    @GetMapping("/api/decision-config")
    fun getDecisionConfig(
        @RequestParam laneKey: String
    ): DecisionConfig? {
        return decisionService.getDecisionConfig(laneKey)
    }
}