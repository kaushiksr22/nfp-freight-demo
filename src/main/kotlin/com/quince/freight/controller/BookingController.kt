package com.quince.freight.controller

import com.quince.freight.model.BookingRequest
import com.quince.freight.service.BookingService
import org.springframework.web.bind.annotation.*

@RestController
class BookingController(
    private val bookingService: BookingService
) {

    @PostMapping("/api/bookings")
    fun createBooking(
        @RequestBody request: BookingRequest
    ): Map<String, Any?> {
        return bookingService.createBooking(request)
    }
}