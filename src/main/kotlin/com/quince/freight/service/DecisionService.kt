package com.quince.freight.service

import com.quince.freight.model.DecisionConfig
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.http.client.reactive.ReactorClientHttpConnector
import reactor.netty.http.client.HttpClient

@Service
class DecisionService(
    @Value("\${apps.script.base-url}") private val baseUrl: String
) {

    private val httpClient = HttpClient.create()
        .followRedirect(true)

    private val webClient = WebClient.builder()
        .clientConnector(ReactorClientHttpConnector(httpClient))
        .build()

    fun getDecisionConfig(laneKey: String): DecisionConfig? {
        return webClient.get()
            .uri("$baseUrl?action=decisionConfig&lane_key=$laneKey")
            .retrieve()
            .bodyToMono(DecisionConfig::class.java)
            .block()
    }
}