package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BiometricsResponse {
    private Long id;
    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private String gender;
    private Integer age;
    private String lastUpdated;
    private BigDecimal bmi; // calculated field
}