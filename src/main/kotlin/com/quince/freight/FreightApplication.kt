package com.quince.freight

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class FreightApplication

fun main(args: Array<String>) {
	runApplication<FreightApplication>(*args)
}
