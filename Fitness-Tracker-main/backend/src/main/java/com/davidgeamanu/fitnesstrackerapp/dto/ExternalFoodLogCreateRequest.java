package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ExternalFoodLogCreateRequest {
    private String foodName;
    private BigDecimal calories; // per 100g
    private BigDecimal protein; // per 100g
    private BigDecimal fats; // per 100g
    private BigDecimal carbs; // per 100g
    private BigDecimal quantityGrams;
}