package com.quince.freight.service

import com.quince.freight.model.RateResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.http.client.reactive.ReactorClientHttpConnector
import reactor.netty.http.client.HttpClient

@Service
class RateService(
    @Value("\${apps.script.base-url}") private val baseUrl: String
) {

    private val httpClient = HttpClient.create()
        .followRedirect(true)

    private val webClient = WebClient.builder()
        .clientConnector(ReactorClientHttpConnector(httpClient))
        .build()

    fun getRates(laneKey: String): List<RateResponse>? {
        val response = webClient.get()
            .uri("$baseUrl?action=rates&lane_key=$laneKey")
            .retrieve()
            .bodyToMono(Array<RateResponse>::class.java)
            .block()

        return response?.toList()
    }
}