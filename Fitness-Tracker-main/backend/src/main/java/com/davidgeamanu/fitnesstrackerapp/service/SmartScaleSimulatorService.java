package com.davidgeamanu.fitnesstrackerapp.service;

import com.davidgeamanu.fitnesstrackerapp.model.SmartScaleReading;
import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.model.UserBiometrics;
import com.davidgeamanu.fitnesstrackerapp.repository.SmartScaleReadingRepository;
import com.davidgeamanu.fitnesstrackerapp.repository.UserBiometricsRepository;
import com.davidgeamanu.fitnesstrackerapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class SmartScaleSimulatorService {

    private final SmartScaleReadingRepository scaleReadingRepository;
    private final UserBiometricsRepository biometricsRepository;
    private final UserRepository userRepository;
    private final Random random = new Random();

    /**
     * Simulate stepping on a smart scale - generates realistic weight reading
     * and updates user biometrics
     */
    @Transactional
    public SmartScaleReading simulateWeighing(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Get current weight from latest biometrics or reading
        BigDecimal currentWeight = getCurrentWeight(userId);

        // Generate realistic weight with small daily fluctuation
        BigDecimal simulatedWeight = generateRealisticWeight(currentWeight);

        // Generate additional body composition metrics (optional)
        BigDecimal bodyFat = estimateBodyFatPercentage(simulatedWeight);
        BigDecimal muscleMass = estimateMuscleMass(simulatedWeight, bodyFat);
        BigDecimal waterPercentage = estimateWaterPercentage();
        BigDecimal boneMass = estimateBoneMass(simulatedWeight);

        // Create scale reading
        SmartScaleReading reading = SmartScaleReading.builder()
                .user(user)
                .weightKg(simulatedWeight)
                .bodyFatPercentage(bodyFat)
                .muscleMassKg(muscleMass)
                .waterPercentage(waterPercentage)
                .boneMassKg(boneMass)
                .readingTimestamp(LocalDateTime.now())
                .source("SIMULATED")
                .build();

        SmartScaleReading savedReading = scaleReadingRepository.save(reading);

        // Update user biometrics with new weight
        updateUserBiometrics(userId, simulatedWeight);

        return savedReading;
    }

    /**
     * Get current weight from latest biometrics or scale reading
     */
    private BigDecimal getCurrentWeight(Long userId) {
        // Try to get from latest biometrics
        Optional<UserBiometrics> latestBiometrics =
                biometricsRepository.findFirstByUser_IdOrderByLastUpdatedDesc(userId);

        if (latestBiometrics.isPresent() && latestBiometrics.get().getWeightKg() != null) {
            return latestBiometrics.get().getWeightKg();
        }

        // Try to get from latest scale reading
        Optional<SmartScaleReading> latestReading =
                scaleReadingRepository.findFirstByUser_IdOrderByReadingTimestampDesc(userId);

        if (latestReading.isPresent()) {
            return latestReading.get().getWeightKg();
        }

        // Default: 70kg if no previous data
        return BigDecimal.valueOf(70.0);
    }

    /**
     * Generate realistic weight with daily fluctuation
     * Daily weight can fluctuate ±0.5kg due to water retention, food, etc.
     */
    private BigDecimal generateRealisticWeight(BigDecimal baseWeight) {
        // Fluctuation between -0.5kg and +0.5kg (realistic daily variation)
        double fluctuation = (random.nextDouble() - 0.5) * 1.0; // -0.5 to +0.5 kg

        double newWeight = baseWeight.doubleValue() + fluctuation;

        // Ensure weight stays positive and reasonable
        if (newWeight < 30.0) newWeight = 30.0;
        if (newWeight > 300.0) newWeight = 300.0;

        return BigDecimal.valueOf(newWeight).setScale(1, RoundingMode.HALF_UP);
    }

    /**
     * Estimate body fat percentage based on weight
     * This is a rough estimation - real scales use bioelectrical impedance
     */
    private BigDecimal estimateBodyFatPercentage(BigDecimal weight) {
        // Rough estimate: 15-25% for average person
        double baseBF = 20.0;
        double variation = (random.nextDouble() - 0.5) * 4.0; // ±2%
        double bodyFat = baseBF + variation;

        return BigDecimal.valueOf(bodyFat).setScale(1, RoundingMode.HALF_UP);
    }

    /**
     * Estimate muscle mass based on weight and body fat
     */
    private BigDecimal estimateMuscleMass(BigDecimal weight, BigDecimal bodyFat) {
        double fatMass = weight.doubleValue() * (bodyFat.doubleValue() / 100.0);
        double leanMass = weight.doubleValue() - fatMass;
        double muscleMass = leanMass * 0.75; // Muscle is ~75% of lean mass

        return BigDecimal.valueOf(muscleMass).setScale(1, RoundingMode.HALF_UP);
    }

    /**
     * Estimate water percentage (typically 50-65%)
     */
    private BigDecimal estimateWaterPercentage() {
        double water = 55.0 + (random.nextDouble() - 0.5) * 10.0; // 50-60%
        return BigDecimal.valueOf(water).setScale(1, RoundingMode.HALF_UP);
    }

    /**
     * Estimate bone mass (typically 2-4kg for adults)
     */
    private BigDecimal estimateBoneMass(BigDecimal weight) {
        double boneMass = 2.5 + (random.nextDouble() * 1.5); // 2.5-4kg
        return BigDecimal.valueOf(boneMass).setScale(1, RoundingMode.HALF_UP);
    }

    /**
     * Update user biometrics with new weight reading
     */
    private void updateUserBiometrics(Long userId, BigDecimal newWeight) {
        Optional<UserBiometrics> existingBiometrics =
                biometricsRepository.findFirstByUser_IdOrderByLastUpdatedDesc(userId);

        if (existingBiometrics.isPresent()) {
            // Update existing biometrics
            UserBiometrics biometrics = existingBiometrics.get();
            biometrics.setWeightKg(newWeight);
            biometrics.setLastUpdated(LocalDateTime.now());
            biometricsRepository.save(biometrics);
        }
        // Note: If no biometrics exist, don't create new ones
        // User needs to set up their profile first (height, age, gender)
    }

    /**
     * Get all scale readings for a user
     */
    public List<SmartScaleReading> getUserReadings(Long userId) {
        return scaleReadingRepository.findByUser_IdOrderByReadingTimestampDesc(userId);
    }

    /**
     * Get recent readings for trend analysis
     */
    public List<SmartScaleReading> getRecentReadings(Long userId, int limit) {
        if (limit <= 10) {
            return scaleReadingRepository.findTop10ByUser_IdOrderByReadingTimestampDesc(userId);
        }
        return scaleReadingRepository.findByUser_IdOrderByReadingTimestampDesc(userId);
    }

    /**
     * Get latest reading
     */
    public Optional<SmartScaleReading> getLatestReading(Long userId) {
        return scaleReadingRepository.findFirstByUser_IdOrderByReadingTimestampDesc(userId);
    }

    /**
     * Get weight trend (last 7 days)
     */
    public List<SmartScaleReading> getWeeklyTrend(Long userId) {
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime now = LocalDateTime.now();
        return scaleReadingRepository.findByUser_IdAndReadingTimestampBetweenOrderByReadingTimestampDesc(
                userId, weekAgo, now);
    }
}