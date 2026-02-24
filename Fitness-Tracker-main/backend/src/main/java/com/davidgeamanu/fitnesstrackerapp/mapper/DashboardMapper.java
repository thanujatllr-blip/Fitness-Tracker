package com.davidgeamanu.fitnesstrackerapp.mapper;

import com.davidgeamanu.fitnesstrackerapp.dto.DashboardResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Mapper for converting DashboardService Map data to DashboardResponse DTO
 */
public class DashboardMapper {

    /**
     * Convert the Map structure from DashboardService.getDailyDashboard()
     * into a type-safe DashboardResponse DTO
     */
    public static DashboardResponse toDto(Map<String, Object> dashboardData) {
        return DashboardResponse.builder()
                .smartScale(mapSmartScaleData(dashboardData.get("smartScale")))
                .calorieIntake(mapCalorieIntakeData(dashboardData.get("calorieIntake")))
                .exerciseProgress(mapExerciseProgressData(dashboardData.get("exerciseProgress")))
                .build();
    }

    /**
     * Map smart scale data from service Map to DTO
     */
    @SuppressWarnings("unchecked")
    private static DashboardResponse.SmartScaleData mapSmartScaleData(Object data) {
        if (!(data instanceof Map)) {
            return null;
        }

        Map<String, Object> map = (Map<String, Object>) data;

        return DashboardResponse.SmartScaleData.builder()
                .currentWeight((BigDecimal) map.get("currentWeight"))
                .weightChange((BigDecimal) map.get("weightChange"))
                .bmi((BigDecimal) map.get("bmi"))
                .timestamp(map.get("timestamp") != null ? map.get("timestamp").toString() : null)
                .message((String) map.get("message"))
                .build();
    }

    /**
     * Map calorie intake data from service Map to DTO
     */
    @SuppressWarnings("unchecked")
    private static DashboardResponse.CalorieIntakeData mapCalorieIntakeData(Object data) {
        if (!(data instanceof Map)) {
            return null;
        }

        Map<String, Object> map = (Map<String, Object>) data;

        return DashboardResponse.CalorieIntakeData.builder()
                .consumed((BigDecimal) map.get("consumed"))
                .goal((BigDecimal) map.get("goal"))
                .percentage(((Number) map.get("percentage")).intValue())
                .remaining((BigDecimal) map.get("remaining"))
                .build();
    }

    /**
     * Map exercise progress data from service Map to DTO
     */
    @SuppressWarnings("unchecked")
    private static DashboardResponse.ExerciseProgressData mapExerciseProgressData(Object data) {
        if (!(data instanceof Map)) {
            return null;
        }

        Map<String, Object> map = (Map<String, Object>) data;

        return DashboardResponse.ExerciseProgressData.builder()
                .completed((BigDecimal) map.get("completed"))
                .goal(((Number) map.get("goal")).intValue())
                .percentage(((Number) map.get("percentage")).intValue())
                .remaining(((Number) map.get("remaining")).intValue())
                .build();
    }
}