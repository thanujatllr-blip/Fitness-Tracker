package com.davidgeamanu.fitnesstrackerapp.controller;

import com.davidgeamanu.fitnesstrackerapp.dto.BiometricsRequest;
import com.davidgeamanu.fitnesstrackerapp.dto.BiometricsResponse;
import com.davidgeamanu.fitnesstrackerapp.mapper.BiometricsMapper;
import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.model.UserBiometrics;
import com.davidgeamanu.fitnesstrackerapp.security.CurrentUser;
import com.davidgeamanu.fitnesstrackerapp.service.BiometricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/biometrics")
@RequiredArgsConstructor
public class BiometricsController {

    private final BiometricsService biometricsService;

    @PostMapping
    public ResponseEntity<?> createOrUpdateBiometrics(
            @RequestBody BiometricsRequest request,
            @CurrentUser User user
    ) {
        try {
            UserBiometrics biometrics = biometricsService.createOrUpdate(
                    user.getId(),
                    request.getHeightCm(),
                    request.getWeightKg(),
                    request.getGender(),
                    request.getAge()
            );
            return ResponseEntity.ok(BiometricsMapper.toDto(biometrics));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestBiometrics(@CurrentUser User user) {
        var biometricsOpt = biometricsService.getLatest(user.getId());

        if (biometricsOpt.isEmpty()) {
            return ResponseEntity.status(404).body("No biometrics found");
        }

        return ResponseEntity.ok(BiometricsMapper.toDto(biometricsOpt.get()));
    }

    @GetMapping("/history")
    public ResponseEntity<List<BiometricsResponse>> getBiometricsHistory(@CurrentUser User user) {
        return ResponseEntity.ok(
                biometricsService.getHistory(user.getId())
                        .stream()
                        .map(BiometricsMapper::toDto)
                        .toList()
        );
    }
}