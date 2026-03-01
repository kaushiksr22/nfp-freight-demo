package com.quince.freight.controller

import com.quince.freight.model.Shipment
import com.quince.freight.service.ShipmentService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class ShipmentController(
    private val shipmentService: ShipmentService
) {

    @GetMapping("/api/shipments")
    fun getShipments(
        @RequestParam(required = false) vendorCode: String?
    ): List<Shipment> {
        return shipmentService.getShipments(vendorCode)
    }
}