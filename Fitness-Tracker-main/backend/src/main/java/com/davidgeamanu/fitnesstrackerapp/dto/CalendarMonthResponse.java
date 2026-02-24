package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;

import java.util.Map;

@Data
public class CalendarMonthResponse {
    private Map<String, CalendarDayResponse> days;
    private MonthStats stats;

    @Data
    public static class MonthStats {
        private Integer workoutDays;
        private Integer calorieGoalMetDays;
        private Integer exerciseGoalMetDays;
        private Integer totalCalories;
        private Integer totalExerciseMinutes;
        private Integer daysWithData;
    }
}