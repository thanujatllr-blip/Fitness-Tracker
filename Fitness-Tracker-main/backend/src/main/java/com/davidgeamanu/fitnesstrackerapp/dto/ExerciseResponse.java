package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;

@Data
public class ExerciseResponse {
    private Long id;
    private String name;
    private String category;
    private String exerciseType; // CARDIO or STRENGTH
    private Double caloriesBurntPerMinute;
    private String source; // "PERSONAL" or "EXTERNAL"
}