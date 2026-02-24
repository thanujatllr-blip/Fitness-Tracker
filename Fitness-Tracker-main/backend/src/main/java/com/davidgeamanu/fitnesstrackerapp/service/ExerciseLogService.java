package com.davidgeamanu.fitnesstrackerapp.service;

import com.davidgeamanu.fitnesstrackerapp.model.ExerciseLog;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExerciseLogService {

    ExerciseLog createLog(Long exerciseId, Long userId, BigDecimal durationMinutes,
                          Integer sets, Integer reps, BigDecimal weightUsed);

    List<ExerciseLog> findByUserId(Long userId);

    List<ExerciseLog> findByUserIdAndDate(Long userId, LocalDate date);

    List<ExerciseLog> findByUserIdAndDateRange(Long userId, LocalDate startDate, LocalDate endDate);

    Optional<ExerciseLog> findById(Long id);

    void delete(Long id);

    /**
     * Create an exercise log for an external exercise (Wger) without saving it to personal exercises
     * This creates a "detached" exercise log that references the exercise data directly without
     * creating an Exercise entity in the database.
     *
     * @param userId User ID
     * @param exerciseName Name of the exercise
     * @param category Category (e.g., "Chest", "Back", "Leg")
     * @param exerciseType Exercise type (CARDIO, STRENGTH, FLEXIBILITY, HYBRID)
     * @param caloriesBurntPerMinute Calories per minute
     * @param durationMinutes Duration in minutes
     * @param sets Number of sets
     * @param reps Number of reps
     * @param weightUsed Weight used in kg
     * @return Created exercise log
     */
    ExerciseLog createExternalExerciseLog(Long userId, String exerciseName, String category,
                                          String exerciseType, Double caloriesBurntPerMinute,
                                          BigDecimal durationMinutes, Integer sets, Integer reps,
                                          BigDecimal weightUsed);
}