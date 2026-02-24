package com.davidgeamanu.fitnesstrackerapp.mapper;

import com.davidgeamanu.fitnesstrackerapp.dto.ExerciseCreateRequest;
import com.davidgeamanu.fitnesstrackerapp.dto.ExerciseResponse;
import com.davidgeamanu.fitnesstrackerapp.model.Exercise;

public class ExerciseMapper {

    public static Exercise toEntity(ExerciseCreateRequest dto) {
        Exercise exercise = new Exercise();
        exercise.setExerciseName(dto.getName());

        // Use provided category or default to "Full Body"
        exercise.setCategory(dto.getCategory() != null && !dto.getCategory().isEmpty()
                ? dto.getCategory()
                : "Full Body");

        // Use provided exercise type or infer from category
        if (dto.getExerciseType() != null && !dto.getExerciseType().isEmpty()) {
            exercise.setExerciseType(dto.getExerciseType());
        } else {
            // Auto-infer type from category if not provided
            exercise.setExerciseType(inferTypeFromCategory(dto.getCategory()));
        }

        exercise.setCaloriesBurntPerMinute(dto.getCaloriesBurned() != null ?
                dto.getCaloriesBurned().doubleValue() : 5.0);
        return exercise;
    }

    public static ExerciseResponse toDto(Exercise exercise) {
        ExerciseResponse dto = new ExerciseResponse();
        dto.setId(exercise.getId());
        dto.setName(exercise.getExerciseName());
        dto.setCategory(exercise.getCategory());
        dto.setExerciseType(exercise.getExerciseType());
        dto.setCaloriesBurntPerMinute(exercise.getCaloriesBurntPerMinute());
        dto.setSource(exercise.getUser() == null ? "EXTERNAL" : "PERSONAL");
        return dto;
    }

    /**
     * Infer exercise type from category
     * Only returns CARDIO or STRENGTH
     */
    private static String inferTypeFromCategory(String category) {
        if (category == null) return "STRENGTH";

        return switch (category.toUpperCase()) {
            case "CARDIO" -> "CARDIO";
            // All body-part categories are STRENGTH by default
            default -> "STRENGTH"; // Chest, Arms, Back, Legs, Core, Full Body, Shoulders
        };
    }
}