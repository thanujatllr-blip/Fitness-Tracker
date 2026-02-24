package com.davidgeamanu.fitnesstrackerapp.mapper;

import com.davidgeamanu.fitnesstrackerapp.dto.GoalsResponse;
import com.davidgeamanu.fitnesstrackerapp.model.UserGoals;

public class GoalsMapper {

    public static GoalsResponse toDto(UserGoals goals) {
        GoalsResponse dto = new GoalsResponse();
        dto.setTargetWeightKg(goals.getTargetWeightKg());
        dto.setDailyCalorieGoal(goals.getDailyCalorieGoal());
        dto.setWeeklyExerciseGoalMinutes(goals.getWeeklyExerciseGoalMinutes());
        dto.setGoalCreatedDate(goals.getGoalCreatedDate().toString());
        return dto;
    }
}