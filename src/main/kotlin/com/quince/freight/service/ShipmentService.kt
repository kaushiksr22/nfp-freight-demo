package com.quince.freight.service

import com.quince.freight.model.Shipment
import io.netty.handler.ssl.SslContextBuilder
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import reactor.netty.http.client.HttpClient
import reactor.netty.transport.ProxyProvider
import org.springframework.http.client.reactive.ReactorClientHttpConnector

@Service
class ShipmentService(
    @Value("\${apps.script.base-url}") private val baseUrl: String
) {

    private val httpClient = HttpClient.create()
        .followRedirect(true)

    private val webClient = WebClient.builder()
        .clientConnector(ReactorClientHttpConnector(httpClient))
        .build()

    fun getShipments(vendorCode: String): List<Shipment>? {
        val response = webClient.get()
            .uri("$baseUrl?action=shipments&vendor_code=$vendorCode")
            .retrieve()
            .bodyToMono(Array<Shipment>::class.java)
            .block()

        return response?.toList() 
    }
    fun getShipmentsFromAsnIds(asnIds: List<String>): List<Shipment> {

    val response = webClient.get()
        .uri("$baseUrl?action=shipmentsByIds&asn_ids=${asnIds.joinToString(",")}")
        .retrieve()
        .bodyToMono(Array<Shipment>::class.java)
        .block()

    return response?.toList() ?: emptyList()
    }
}