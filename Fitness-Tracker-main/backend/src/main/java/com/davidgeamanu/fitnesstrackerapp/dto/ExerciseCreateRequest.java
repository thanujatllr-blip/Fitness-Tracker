package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;

@Data
public class ExerciseCreateRequest {
    private String name;
    private String category; // 'Chest', 'Arms', 'Back', 'Legs', 'Core', 'Full Body', 'Shoulders', 'Cardio'
    private String exerciseType; // CARDIO, STRENGTH
    private Float caloriesBurned; //per minute
}