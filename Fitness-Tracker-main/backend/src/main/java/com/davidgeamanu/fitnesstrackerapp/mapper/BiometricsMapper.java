package com.davidgeamanu.fitnesstrackerapp.mapper;

import com.davidgeamanu.fitnesstrackerapp.dto.BiometricsResponse;
import com.davidgeamanu.fitnesstrackerapp.model.UserBiometrics;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class BiometricsMapper {

    public static BiometricsResponse toDto(UserBiometrics biometrics) {
        BiometricsResponse dto = new BiometricsResponse();
        dto.setId(biometrics.getId());
        dto.setHeightCm(biometrics.getHeightCm());
        dto.setWeightKg(biometrics.getWeightKg());
        dto.setGender(biometrics.getGender());
        dto.setAge(biometrics.getAge());
        dto.setLastUpdated(biometrics.getLastUpdated().toString());

        // Calculate BMI: weight(kg) / (height(m))^2
        BigDecimal heightM = biometrics.getHeightCm().divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal bmi = biometrics.getWeightKg().divide(
                heightM.multiply(heightM), 2, RoundingMode.HALF_UP
        );
        dto.setBmi(bmi);

        return dto;
    }
}