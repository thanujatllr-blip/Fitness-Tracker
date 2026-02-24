package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class FoodLogCreateRequest {
    private Long foodId; // null if external food
    //private String externalId; // null if personal food
    private BigDecimal quantityGrams;
    private BigDecimal caloriesConsumed; // Optional, will be calculated if not provided
}
