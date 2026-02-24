package com.davidgeamanu.fitnesstrackerapp.controller;

import com.davidgeamanu.fitnesstrackerapp.dto.ExternalExerciseLogCreateRequest;
import com.davidgeamanu.fitnesstrackerapp.dto.ExerciseLogCreateRequest;
import com.davidgeamanu.fitnesstrackerapp.dto.ExerciseLogResponse;
import com.davidgeamanu.fitnesstrackerapp.mapper.ExerciseLogMapper;
import com.davidgeamanu.fitnesstrackerapp.model.ExerciseLog;
import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.security.CurrentUser;
import com.davidgeamanu.fitnesstrackerapp.service.ExerciseLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.List;

@RestController
@RequestMapping("/api/exercise-logs")
@RequiredArgsConstructor
@Slf4j
public class ExerciseLogController {

    private final ExerciseLogService exerciseLogService;

    @PostMapping
    public ResponseEntity<?> createExerciseLog(
            @RequestBody ExerciseLogCreateRequest request,
            @CurrentUser User user
    ) {
        try {
            ExerciseLog log = exerciseLogService.createLog(
                    request.getExerciseId(),
                    user.getId(),
                    request.getDurationMinutes(),
                    request.getSets(),
                    request.getReps(),
                    request.getWeightUsed()
            );
            return ResponseEntity.ok(ExerciseLogMapper.toDto(log));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Create an exercise log from an external exercise (Wger) WITHOUT saving it to personal exercises
     * POST /api/exercise-logs/external
     *
     * This endpoint logs an exercise directly from Wger without adding it to the user's
     * personal exercises database. The exercise is stored as an "external" exercise (user = null)
     * and can be reused if the same exercise is logged again.
     */
    @PostMapping("/external")
    public ResponseEntity<?> createExternalExerciseLog(
            @CurrentUser User user,
            @RequestBody ExternalExerciseLogCreateRequest request
    ) {
        try {
            log.info("Creating external exercise log for user {}: {} (duration: {}min, sets: {}, reps: {}, weight: {}kg)",
                    user.getId(), request.getExerciseName(), request.getDurationMinutes(),
                    request.getSets(), request.getReps(), request.getWeightUsed());

            ExerciseLog log = exerciseLogService.createExternalExerciseLog(
                    user.getId(),
                    request.getExerciseName(),
                    request.getCategory(),
                    request.getExerciseType(),
                    request.getCaloriesBurntPerMinute(),
                    request.getDurationMinutes(),
                    request.getSets(),
                    request.getReps(),
                    request.getWeightUsed()
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ExerciseLogMapper.toDto(log));
        } catch (IllegalArgumentException e) {
            log.error("Validation error creating external exercise log: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Error creating external exercise log", e);
            return ResponseEntity.internalServerError().body("Failed to create exercise log");
        }
    }

    @GetMapping
    public ResponseEntity<List<ExerciseLogResponse>> getExerciseLogs(@CurrentUser User user) {
        return ResponseEntity.ok(
                exerciseLogService.findByUserId(user.getId())
                        .stream()
                        .map(ExerciseLogMapper::toDto)
                        .toList()
        );
    }

    @GetMapping("/today")
    public ResponseEntity<List<ExerciseLogResponse>> getTodayLogs(@CurrentUser User user) {
        return ResponseEntity.ok(
                exerciseLogService.findByUserIdAndDate(user.getId(), LocalDate.now())
                        .stream()
                        .map(ExerciseLogMapper::toDto)
                        .toList()
        );
    }

    @GetMapping("/week")
    public ResponseEntity<List<ExerciseLogResponse>> getThisWeekLogs(@CurrentUser User user) {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = today.with(DayOfWeek.SUNDAY);

        return ResponseEntity.ok(
                exerciseLogService.findByUserIdAndDateRange(user.getId(), startOfWeek, endOfWeek)
                        .stream()
                        .map(ExerciseLogMapper::toDto)
                        .toList()
        );
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<ExerciseLogResponse>> getLogsByDate(
            @PathVariable String date,
            @CurrentUser User user
    ) {
        LocalDate localDate = LocalDate.parse(date);
        return ResponseEntity.ok(
                exerciseLogService.findByUserIdAndDate(user.getId(), localDate)
                        .stream()
                        .map(ExerciseLogMapper::toDto)
                        .toList()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExerciseLog(@PathVariable Long id, @CurrentUser User user) {
        var logOpt = exerciseLogService.findById(id);

        if (logOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Exercise log not found");
        }

        ExerciseLog log = logOpt.get();
        if (!log.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("You can only delete your own logs");
        }

        exerciseLogService.delete(id);
        return ResponseEntity.ok("Deleted");
    }
}