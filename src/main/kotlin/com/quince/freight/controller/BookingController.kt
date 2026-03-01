package com.quince.freight.controller

import com.quince.freight.model.BookingRequest
import com.quince.freight.service.BookingService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
class BookingController(
    private val bookingService: BookingService
) {

    @PostMapping("/bookings")
    fun createBooking(@RequestBody request: BookingRequest): Map<String, Any?> {
        return bookingService.createBooking(request)
    }

    @GetMapping("/bookings")
    fun getBookings(
        @RequestParam(required = false) vendorCode: String?
    ): List<Map<String, Any>> {
        return bookingService.getBookings(vendorCode)
    }
}