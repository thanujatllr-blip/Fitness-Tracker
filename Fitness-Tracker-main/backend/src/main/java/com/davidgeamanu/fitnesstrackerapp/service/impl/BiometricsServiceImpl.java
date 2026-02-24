package com.davidgeamanu.fitnesstrackerapp.service.impl;

import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.model.UserBiometrics;
import com.davidgeamanu.fitnesstrackerapp.repository.UserBiometricsRepository;
import com.davidgeamanu.fitnesstrackerapp.repository.UserRepository;
import com.davidgeamanu.fitnesstrackerapp.service.BiometricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BiometricsServiceImpl implements BiometricsService {

    private final UserBiometricsRepository biometricsRepository;
    private final UserRepository userRepository;

    @Override
    public UserBiometrics createOrUpdate(Long userId, BigDecimal heightCm, BigDecimal weightKg,
                                         String gender, Integer age) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserBiometrics biometrics = UserBiometrics.builder()
                .user(user)
                .heightCm(heightCm)
                .weightKg(weightKg)
                .gender(gender)
                .age(age)
                .build();

        return biometricsRepository.save(biometrics);
    }

    @Override
    public Optional<UserBiometrics> getLatest(Long userId) {
        return biometricsRepository.findFirstByUser_IdOrderByLastUpdatedDesc(userId);
    }

    @Override
    public List<UserBiometrics> getHistory(Long userId) {
        return biometricsRepository.findByUser_IdOrderByLastUpdatedDesc(userId);
    }
}