package com.davidgeamanu.fitnesstrackerapp.service;

import com.davidgeamanu.fitnesstrackerapp.model.UserGoals;

import java.math.BigDecimal;
import java.util.Optional;

public interface GoalsService {

    UserGoals createOrUpdate(Long userId, BigDecimal targetWeightKg,
                             BigDecimal dailyCalorieGoal, Integer weeklyExerciseGoalMinutes);

    Optional<UserGoals> getByUserId(Long userId);
}