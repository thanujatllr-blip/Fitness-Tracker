package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SmartScaleReadingResponse {
    private Long id;
    private BigDecimal weightKg;
    private BigDecimal bodyFatPercentage;
    private BigDecimal muscleMassKg;
    private BigDecimal waterPercentage;
    private BigDecimal boneMassKg;
    private BigDecimal bmi; // Calculated if height available
    private String readingTimestamp;
    private String source; // "SIMULATED", "MANUAL", "DEVICE"
    private String weightTrend; // "UP", "DOWN", "STABLE"
}