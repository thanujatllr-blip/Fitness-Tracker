package com.davidgeamanu.fitnesstrackerapp.mapper;

import com.davidgeamanu.fitnesstrackerapp.dto.SmartScaleReadingResponse;
import com.davidgeamanu.fitnesstrackerapp.model.SmartScaleReading;
import com.davidgeamanu.fitnesstrackerapp.model.UserBiometrics;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

public class SmartScaleMapper {

    /**
     * Convert SmartScaleReading to DTO with BMI and trend calculation
     */
    public static SmartScaleReadingResponse toDto(
            SmartScaleReading reading,
            Optional<UserBiometrics> biometrics,
            List<SmartScaleReading> recentReadings
    ) {
        SmartScaleReadingResponse dto = new SmartScaleReadingResponse();
        dto.setId(reading.getId());
        dto.setWeightKg(reading.getWeightKg());
        dto.setBodyFatPercentage(reading.getBodyFatPercentage());
        dto.setMuscleMassKg(reading.getMuscleMassKg());
        dto.setWaterPercentage(reading.getWaterPercentage());
        dto.setBoneMassKg(reading.getBoneMassKg());
        dto.setReadingTimestamp(reading.getReadingTimestamp().toString());
        dto.setSource(reading.getSource());

        // Calculate BMI if height is available
        if (biometrics.isPresent() && biometrics.get().getHeightCm() != null) {
            BigDecimal heightM = biometrics.get().getHeightCm()
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal bmi = reading.getWeightKg()
                    .divide(heightM.multiply(heightM), 2, RoundingMode.HALF_UP);
            dto.setBmi(bmi);
        }

        // Calculate weight trend
        dto.setWeightTrend(calculateWeightTrend(reading, recentReadings));

        return dto;
    }

    /**
     * Simplified version without trend calculation
     */
    public static SmartScaleReadingResponse toDto(SmartScaleReading reading, Optional<UserBiometrics> biometrics) {
        return toDto(reading, biometrics, List.of());
    }

    /**
     * Calculate weight trend based on recent readings
     * @param currentReading Current reading
     * @param recentReadings Recent readings (should include current)
     * @return "UP", "DOWN", or "STABLE"
     */
    private static String calculateWeightTrend(SmartScaleReading currentReading, List<SmartScaleReading> recentReadings) {
        if (recentReadings == null || recentReadings.size() < 2) {
            return "STABLE"; // Not enough data to determine trend
        }

        // Get current weight
        BigDecimal currentWeight = currentReading.getWeightKg();

        // Calculate average of previous readings (excluding current)
        BigDecimal previousAverage = recentReadings.stream()
                .filter(r -> !r.getId().equals(currentReading.getId())) // Exclude current
                .limit(5) // Last 5 readings
                .map(SmartScaleReading::getWeightKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(Math.min(5, recentReadings.size() - 1)), 2, RoundingMode.HALF_UP);

        // Compare current to average
        BigDecimal difference = currentWeight.subtract(previousAverage);

        // Threshold: 0.3kg difference is considered a trend
        BigDecimal threshold = BigDecimal.valueOf(0.3);

        if (difference.abs().compareTo(threshold) < 0) {
            return "STABLE";
        } else if (difference.compareTo(BigDecimal.ZERO) > 0) {
            return "UP";
        } else {
            return "DOWN";
        }
    }
}