package com.quince.freight.service

import com.quince.freight.model.Shipment
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import reactor.netty.http.client.HttpClient
import org.springframework.http.client.reactive.ReactorClientHttpConnector

@Service
class ShipmentService(
    @Value("\${apps.script.base-url}") 
    private val baseUrl: String
) {

    private val httpClient = HttpClient.create()
        .followRedirect(true)

    private val webClient = WebClient.builder()
        .clientConnector(ReactorClientHttpConnector(httpClient))
        .build()

    /**
     * If vendorCode is null/blank → return ALL shipments (Admin view)
     * If vendorCode exists → return vendor-specific shipments
     */
    fun getShipments(vendorCode: String?): List<Shipment> {

        val uri = if (vendorCode.isNullOrBlank()) {
            "$baseUrl?action=shipments"
        } else {
            "$baseUrl?action=shipments&vendor_code=$vendorCode"
        }

        val response = webClient.get()
            .uri(uri)
            .retrieve()
            .bodyToMono(Array<Shipment>::class.java)
            .block()

        return response?.toList() ?: emptyList()
    }

    /**
     * Used during booking confirmation flow
     * Fetch shipments by ASN IDs
     */
    fun getShipmentsFromAsnIds(asnIds: List<String>): List<Shipment> {

        val response = webClient.get()
            .uri("$baseUrl?action=shipmentsByIds&asn_ids=${asnIds.joinToString(",")}")
            .retrieve()
            .bodyToMono(Array<Shipment>::class.java)
            .block()

        return response?.toList() ?: emptyList()
    }
}