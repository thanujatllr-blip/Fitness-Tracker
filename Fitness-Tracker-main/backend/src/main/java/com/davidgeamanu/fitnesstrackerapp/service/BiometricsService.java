package com.davidgeamanu.fitnesstrackerapp.service;

import com.davidgeamanu.fitnesstrackerapp.model.UserBiometrics;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface BiometricsService {

    UserBiometrics createOrUpdate(Long userId, BigDecimal heightCm, BigDecimal weightKg,
                                  String gender, Integer age);

    Optional<UserBiometrics> getLatest(Long userId);

    List<UserBiometrics> getHistory(Long userId);
}