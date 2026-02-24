package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * Request DTO for logging external/Wger exercises without saving them to personal exercises
 *
 * This is used when a user logs an exercise from Wger that they don't want to save
 * to their personal database.
 */
@Data
public class ExternalExerciseLogCreateRequest {
    // Exercise details (from Wger)
    private String exerciseName;
    private String category;
    private String exerciseType;  // CARDIO or STRENGTH only
    private Double caloriesBurntPerMinute;

    // Log details
    private BigDecimal durationMinutes;
    private Integer sets;
    private Integer reps;
    private BigDecimal weightUsed;
}