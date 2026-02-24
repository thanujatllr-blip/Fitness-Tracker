package com.davidgeamanu.fitnesstrackerapp.controller;

import com.davidgeamanu.fitnesstrackerapp.dto.DashboardResponse;
import com.davidgeamanu.fitnesstrackerapp.mapper.DashboardMapper;
import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.security.CurrentUser;
import com.davidgeamanu.fitnesstrackerapp.service.impl.DashboardServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * REST Controller for dashboard data
 * Provides endpoints for daily and weekly fitness overview
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardServiceImpl dashboardService;

    /**
     * GET /api/dashboard
     * Returns complete daily dashboard data for today
     *
     * Response structure:
     * {
     *   "smartScale": { currentWeight, weightChange, bmi, timestamp },
     *   "calorieIntake": { consumed, goal, percentage, remaining },
     *   "exerciseProgress": { completed, goal, percentage, remaining }
     * }
     */
    @GetMapping
    public ResponseEntity<DashboardResponse> getDailyDashboard(@CurrentUser User user) {
        LocalDate today = LocalDate.now();
        Map<String, Object> dashboardData = dashboardService.getDailyDashboard(user.getId(), today);
        return ResponseEntity.ok(DashboardMapper.toDto(dashboardData));
    }

    /**
     * GET /api/dashboard/daily
     * Alias for /api/dashboard - returns today's dashboard
     */
    @GetMapping("/daily")
    public ResponseEntity<DashboardResponse> getDailyDashboardAlias(@CurrentUser User user) {
        LocalDate today = LocalDate.now();
        Map<String, Object> dashboardData = dashboardService.getDailyDashboard(user.getId(), today);
        return ResponseEntity.ok(DashboardMapper.toDto(dashboardData));
    }

    /**
     * GET /api/dashboard/date?date=2026-01-05
     * Returns daily dashboard for a specific date
     */
    @GetMapping("/date")
    public ResponseEntity<DashboardResponse> getDailyDashboardForDate(
            @CurrentUser User user,
            @RequestParam String date
    ) {
        LocalDate targetDate = LocalDate.parse(date);
        Map<String, Object> dashboardData = dashboardService.getDailyDashboard(user.getId(), targetDate);
        return ResponseEntity.ok(DashboardMapper.toDto(dashboardData));
    }

    /**
     * GET /api/dashboard/weekly
     * Returns complete weekly dashboard data
     *
     * Response structure:
     * {
     *   "weeklyCalories": [{day: "Mon", calories: 1800}, ...],
     *   "weeklyExercise": [{day: "Mon", minutes: 125}, ...]
     * }
     */
    @GetMapping("/weekly")
    public ResponseEntity<Map<String, Object>> getWeeklyDashboard(@CurrentUser User user) {
        return ResponseEntity.ok(dashboardService.getWeeklyDashboard(user.getId()));
    }

    /**
     * GET /api/dashboard/summary
     * Overall statistics (total logs, averages, etc.)
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getOverallSummary(@CurrentUser User user) {
        return ResponseEntity.ok(dashboardService.getOverallSummary(user.getId()));
    }

    /**
     * GET /api/dashboard/calorie-intake/today
     * Just the calorie intake data for today
     */
    @GetMapping("/calorie-intake/today")
    public ResponseEntity<Map<String, Object>> getTodayCalorieIntake(@CurrentUser User user) {
        return ResponseEntity.ok(
                dashboardService.getDailyCalorieIntake(user.getId(), LocalDate.now())
        );
    }

    /**
     * GET /api/dashboard/calorie-intake/date?date=2026-01-05
     * Calorie intake for specific date
     */
    @GetMapping("/calorie-intake/date")
    public ResponseEntity<Map<String, Object>> getCalorieIntakeForDate(
            @CurrentUser User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(dashboardService.getDailyCalorieIntake(user.getId(), date));
    }

    /**
     * GET /api/dashboard/exercise-progress/today
     * Just the exercise progress for today
     */
    @GetMapping("/exercise-progress/today")
    public ResponseEntity<Map<String, Object>> getTodayExerciseProgress(@CurrentUser User user) {
        return ResponseEntity.ok(
                dashboardService.getDailyExerciseProgress(user.getId(), LocalDate.now())
        );
    }

    /**
     * GET /api/dashboard/exercise-progress/date?date=2026-01-05
     * Exercise progress for specific date
     */
    @GetMapping("/exercise-progress/date")
    public ResponseEntity<Map<String, Object>> getExerciseProgressForDate(
            @CurrentUser User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(dashboardService.getDailyExerciseProgress(user.getId(), date));
    }

    /**
     * GET /api/dashboard/weight/latest
     * Latest smart scale reading
     */
    @GetMapping("/weight/latest")
    public ResponseEntity<Map<String, Object>> getLatestWeight(@CurrentUser User user) {
        return ResponseEntity.ok(dashboardService.getLatestWeightData(user.getId()));
    }
}