package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ExerciseLogCreateRequest {
    private Long exerciseId;
    private BigDecimal durationMinutes;
    private Integer sets;
    private Integer reps;
    private BigDecimal weightUsed;
}