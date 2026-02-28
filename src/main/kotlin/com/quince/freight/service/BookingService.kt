package com.quince.freight.service

import com.quince.freight.model.BookingRequest
import com.quince.freight.model.Shipment
import com.quince.freight.model.ScoredRate
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.http.client.reactive.ReactorClientHttpConnector
import reactor.netty.http.client.HttpClient
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import kotlin.math.abs

@Service
class BookingService(
    private val shipmentService: ShipmentService,
    private val rateService: RateService,
    private val decisionService: DecisionService,
    private val decisionEngineService: DecisionEngineService,
    @Value("\${apps.script.base-url}") private val baseUrl: String
) {

    private val httpClient = HttpClient.create().followRedirect(true)

    private val webClient = WebClient.builder()
        .clientConnector(ReactorClientHttpConnector(httpClient))
        .build()

    fun createBooking(request: BookingRequest): Map<String, Any?> {

        val shipments = shipmentService.getShipmentsFromAsnIds(request.asnIds)

        if (shipments.isEmpty()) {
            throw RuntimeException("No valid ASNs found")
        }

        // Validate same lane
        val laneKeys = shipments.map { it.lane_key }.distinct()
        if (laneKeys.size > 1) {
            throw RuntimeException("ASNs must belong to same lane")
        }

        // Validate pickup window <= 3 days
        val formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy")
        val pickupDates = shipments.map {
            LocalDate.parse(it.pickup_date, formatter)
        }

        val minDate = pickupDates.minOrNull()!!
        val maxDate = pickupDates.maxOrNull()!!
        if (abs(maxDate.toEpochDay() - minDate.toEpochDay()) > 3) {
            throw RuntimeException("Pickup dates exceed 3 day window")
        }

        val totalCbm = shipments.sumOf {
            (it.volume_cbm as Number).toDouble()
        }

        val rates = rateService.getRates(request.laneKey) ?: emptyList()
        val config = decisionService.getDecisionConfig(request.laneKey)

        val scoredRates = decisionEngineService.scoreRates(
            rates,
            config?.cost_weight ?: 3,
            config?.sla_weight ?: 4,
            config?.reliability_weight ?: 3
        )

        val selectedRate: ScoredRate = if (request.overrideForwarderId != null) {
            scoredRates.first {
                it.forwarder_id == request.overrideForwarderId
            }
        } else {
            scoredRates.first { it.recommended }
        }


    // Build URL manually (simple and stable)
    val url =
        "$baseUrl?action=createBooking" +
        "&lane_key=${request.laneKey}" +
        "&forwarder_id=${selectedRate.forwarder_id}" +
        "&rate_id=${selectedRate.id}" +
        "&asn_ids=${request.asnIds.joinToString(",")}" +
        "&total_volume_cbm=$totalCbm" +
        "&created_by=system"

    val response = webClient.get()
        .uri(url)
        .retrieve()
        .bodyToMono(Map::class.java)
        .block()

    return response as? Map<String, Any?> ?: mapOf("success" to true)
    }
}