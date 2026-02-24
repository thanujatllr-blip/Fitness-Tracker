package com.davidgeamanu.fitnesstrackerapp.controller;

import com.davidgeamanu.fitnesstrackerapp.dto.SmartScaleReadingResponse;
import com.davidgeamanu.fitnesstrackerapp.mapper.SmartScaleMapper;
import com.davidgeamanu.fitnesstrackerapp.model.SmartScaleReading;
import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.model.UserBiometrics;
import com.davidgeamanu.fitnesstrackerapp.repository.UserBiometricsRepository;
import com.davidgeamanu.fitnesstrackerapp.security.CurrentUser;
import com.davidgeamanu.fitnesstrackerapp.service.SmartScaleSimulatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/smart-scale")
@RequiredArgsConstructor
public class SmartScaleController {

    private final SmartScaleSimulatorService scaleService;
    private final UserBiometricsRepository biometricsRepository;

    /**
     * Simulate stepping on the smart scale
     * This is the main feature - generates a new weight reading!
     */
    @PostMapping("/simulate")
    public ResponseEntity<?> simulateWeighing(@CurrentUser User user) {
        try {
            SmartScaleReading reading = scaleService.simulateWeighing(user.getId());

            // Get biometrics for BMI calculation
            Optional<UserBiometrics> biometrics =
                    biometricsRepository.findFirstByUser_IdOrderByLastUpdatedDesc(user.getId());

            // Get recent readings for trend calculation
            List<SmartScaleReading> recentReadings =
                    scaleService.getRecentReadings(user.getId(), 10);

            SmartScaleReadingResponse response = SmartScaleMapper.toDto(reading, biometrics, recentReadings);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get all scale readings for the current user
     */
    @GetMapping("/readings")
    public ResponseEntity<List<SmartScaleReadingResponse>> getAllReadings(@CurrentUser User user) {
        Optional<UserBiometrics> biometrics =
                biometricsRepository.findFirstByUser_IdOrderByLastUpdatedDesc(user.getId());

        List<SmartScaleReading> allReadings = scaleService.getUserReadings(user.getId());

        return ResponseEntity.ok(
                allReadings.stream()
                        .map(reading -> SmartScaleMapper.toDto(reading, biometrics, allReadings))
                        .toList()
        );
    }

    /**
     * Get latest scale reading
     */
    @GetMapping("/readings/latest")
    public ResponseEntity<?> getLatestReading(@CurrentUser User user) {
        Optional<SmartScaleReading> reading = scaleService.getLatestReading(user.getId());

        if (reading.isEmpty()) {
            return ResponseEntity.status(404).body("No scale readings found");
        }

        Optional<UserBiometrics> biometrics =
                biometricsRepository.findFirstByUser_IdOrderByLastUpdatedDesc(user.getId());

        List<SmartScaleReading> recentReadings =
                scaleService.getRecentReadings(user.getId(), 10);

        return ResponseEntity.ok(SmartScaleMapper.toDto(reading.get(), biometrics, recentReadings));
    }

    /**
     * Get weekly weight trend (last 7 days)
     */
    @GetMapping("/readings/weekly-trend")
    public ResponseEntity<List<SmartScaleReadingResponse>> getWeeklyTrend(@CurrentUser User user) {
        Optional<UserBiometrics> biometrics =
                biometricsRepository.findFirstByUser_IdOrderByLastUpdatedDesc(user.getId());

        List<SmartScaleReading> weeklyReadings = scaleService.getWeeklyTrend(user.getId());
        List<SmartScaleReading> allReadings = scaleService.getUserReadings(user.getId());

        return ResponseEntity.ok(
                weeklyReadings.stream()
                        .map(reading -> SmartScaleMapper.toDto(reading, biometrics, allReadings))
                        .toList()
        );
    }

    /**
     * Get recent readings (for charts/graphs)
     */
    @GetMapping("/readings/recent")
    public ResponseEntity<List<SmartScaleReadingResponse>> getRecentReadings(
            @CurrentUser User user,
            @RequestParam(defaultValue = "10") int limit
    ) {
        Optional<UserBiometrics> biometrics =
                biometricsRepository.findFirstByUser_IdOrderByLastUpdatedDesc(user.getId());

        List<SmartScaleReading> recentReadings = scaleService.getRecentReadings(user.getId(), limit);

        return ResponseEntity.ok(
                recentReadings.stream()
                        .map(reading -> SmartScaleMapper.toDto(reading, biometrics, recentReadings))
                        .toList()
        );
    }
}