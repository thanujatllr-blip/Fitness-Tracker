package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ExerciseLogResponse {
    private Long id;
    private String exerciseName;
    private String category;
    private String source;  // PERSONAL or EXTERNAL
    private BigDecimal durationMinutes;
    private BigDecimal caloriesBurnt;
    private Integer sets;
    private Integer reps;
    private BigDecimal weightUsed;
    private String datePerformed;
}