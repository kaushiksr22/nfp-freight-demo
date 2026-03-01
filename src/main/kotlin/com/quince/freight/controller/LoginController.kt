package com.quince.freight.controller

import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.http.client.reactive.ReactorClientHttpConnector
import reactor.netty.http.client.HttpClient

@RestController
class LoginController(

    @Value("\${apps.script.base-url}")
    private val baseUrl: String

) {

    private val webClient = WebClient.builder()
        .clientConnector(
            ReactorClientHttpConnector(
                HttpClient.create().followRedirect(true)
            )
        )
        .build()

    @GetMapping("/api/login")
    fun login(
        @RequestParam email: String,
        @RequestParam password: String
    ): Any? {

        return webClient.get()
            .uri("$baseUrl?action=login&email=$email&password=$password")
            .retrieve()
            .bodyToMono(Any::class.java)
            .block()
    }
}