package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BiometricsRequest {
    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private String gender;
    private Integer age;
}