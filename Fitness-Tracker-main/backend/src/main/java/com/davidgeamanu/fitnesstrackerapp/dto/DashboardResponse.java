package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private SmartScaleData smartScale;
    private CalorieIntakeData calorieIntake;
    private ExerciseProgressData exerciseProgress;

    /**
     * Smart Scale reading data
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SmartScaleData {
        private BigDecimal currentWeight;
        private BigDecimal weightChange;
        private BigDecimal bmi;
        private String timestamp;
        private String message; // For cases where no data exists
    }

    /**
     * Daily calorie intake data
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CalorieIntakeData {
        private BigDecimal consumed;
        private BigDecimal goal;
        private Integer percentage;
        private BigDecimal remaining;
    }

    /**
     * Daily exercise progress data
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExerciseProgressData {
        private BigDecimal completed;
        private Integer goal;
        private Integer percentage;
        private Integer remaining;
    }
}