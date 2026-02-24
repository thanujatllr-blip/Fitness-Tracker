package com.davidgeamanu.fitnesstrackerapp.controller;

import com.davidgeamanu.fitnesstrackerapp.dto.ExternalFoodLogCreateRequest;
import com.davidgeamanu.fitnesstrackerapp.dto.FoodLogCreateRequest;
import com.davidgeamanu.fitnesstrackerapp.dto.FoodLogResponse;
import com.davidgeamanu.fitnesstrackerapp.mapper.FoodLogMapper;
import com.davidgeamanu.fitnesstrackerapp.model.FoodLog;
import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.security.CurrentUser;
import com.davidgeamanu.fitnesstrackerapp.service.FoodLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/food-logs")
@RequiredArgsConstructor
@Slf4j
public class FoodLogController {

    private final FoodLogService foodLogService;

    /**
     * Create a food log from a personal/saved food
     * POST /api/food-logs
     */
    @PostMapping
    public ResponseEntity<?> createFoodLog(
            @CurrentUser User user,
            @RequestBody FoodLogCreateRequest request
    ) {
        try {
            FoodLog log = foodLogService.createLog(
                    user.getId(),
                    request.getFoodId(),
                    request.getQuantityGrams(),
                    request.getCaloriesConsumed()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(FoodLogMapper.toDto(log));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Create a food log from an external food (USDA, Wger) WITHOUT saving it to personal foods
     * POST /api/food-logs/external
     *
     * This endpoint logs a food directly from USDA/Wger without adding it to the user's
     * personal foods database. The food is stored as an "external" food (user = null)
     * and can be reused if the same food is logged again.
     */
    @PostMapping("/external")
    public ResponseEntity<?> createExternalFoodLog(
            @CurrentUser User user,
            @RequestBody ExternalFoodLogCreateRequest request
    ) {
        try {
            log.info("Creating external food log for user {}: {} ({}g)",
                    user.getId(), request.getFoodName(), request.getQuantityGrams());

            FoodLog log = foodLogService.createExternalFoodLog(
                    user.getId(),
                    request.getFoodName(),
                    request.getCalories(),
                    request.getProtein(),
                    request.getFats(),
                    request.getCarbs(),
                    request.getQuantityGrams()
            );


            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(FoodLogMapper.toDto(log));
        } catch (IllegalArgumentException e) {
            log.error("Validation error creating external food log: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Error creating external food log", e);
            return ResponseEntity.internalServerError().body("Failed to create food log");
        }
    }

    @GetMapping
    public ResponseEntity<List<FoodLogResponse>> getAllLogs(@CurrentUser User user) {
        return ResponseEntity.ok(
                foodLogService.findByUserId(user.getId())
                        .stream()
                        .map(FoodLogMapper::toDto)
                        .toList()
        );
    }

    @GetMapping("/today")
    public ResponseEntity<List<FoodLogResponse>> getTodayLogs(@CurrentUser User user) {
        return ResponseEntity.ok(
                foodLogService.findByUserIdAndDate(user.getId(), LocalDate.now())
                        .stream()
                        .map(FoodLogMapper::toDto)
                        .toList()
        );
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<FoodLogResponse>> getLogsByDate(
            @CurrentUser User user,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(
                foodLogService.findByUserIdAndDate(user.getId(), date)
                        .stream()
                        .map(FoodLogMapper::toDto)
                        .toList()
        );
    }

    @DeleteMapping("/{logId}")
    public ResponseEntity<?> deleteLog(@PathVariable Long logId, @CurrentUser User user) {
        try {
            // Check if log exists
            var logOpt = foodLogService.findById(logId);

            if (logOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Food log not found");
            }

            FoodLog log = logOpt.get();

            // Verify ownership: Users can ONLY delete their own logs
            if (!log.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("You can only delete your own food logs");
            }

            // Now safe to delete
            foodLogService.deleteLog(logId);
            return ResponseEntity.ok("Food log deleted successfully");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting food log");
        }
    }
}