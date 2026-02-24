package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class GoalsRequest {
    private BigDecimal targetWeightKg;
    private BigDecimal dailyCalorieGoal;
    private Integer weeklyExerciseGoalMinutes;
}