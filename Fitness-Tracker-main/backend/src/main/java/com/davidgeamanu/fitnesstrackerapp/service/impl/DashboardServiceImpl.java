package com.davidgeamanu.fitnesstrackerapp.service.impl;

import com.davidgeamanu.fitnesstrackerapp.model.*;
import com.davidgeamanu.fitnesstrackerapp.repository.*;
import com.davidgeamanu.fitnesstrackerapp.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final FoodLogRepository foodLogRepository;
    private final ExerciseLogRepository exerciseLogRepository;
    private final UserGoalsRepository goalsRepository;
    private final SmartScaleReadingRepository scaleReadingRepository;
    private final UserBiometricsRepository biometricsRepository;

    // ============================================
    // DAILY STATISTICS
    // ============================================

    /**
     * Get complete daily dashboard summary
     */
    @Override
    public Map<String, Object> getDailyDashboard(Long userId, LocalDate date) {
        Map<String, Object> dashboard = new HashMap<>();

        // Smart Scale
        dashboard.put("smartScale", getLatestWeightData(userId));

        // Daily Calorie Intake
        dashboard.put("calorieIntake", getDailyCalorieIntake(userId, date));

        // Daily Exercise Progress
        dashboard.put("exerciseProgress", getDailyExerciseProgress(userId, date));

        return dashboard;
    }

    /**
     * Get daily calorie intake with goal comparison
     */
    @Override
    public Map<String, Object> getDailyCalorieIntake(Long userId, LocalDate date) {
        Map<String, Object> result = new HashMap<>();

        // Get user's calorie goal
        Optional<UserGoals> goals = goalsRepository.findByUser_Id(userId);
        BigDecimal dailyGoal = goals.map(UserGoals::getDailyCalorieGoal)
                .orElse(BigDecimal.valueOf(2000)); // Default 2000 kcal

        // Calculate total calories consumed today
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        List<FoodLog> todayLogs = foodLogRepository
                .findByUser_IdAndDateTimeBetweenOrderByDateTimeDesc(userId, startOfDay, endOfDay);

        BigDecimal totalCalories = todayLogs.stream()
                .map(FoodLog::getCaloriesConsumed)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate percentage
        double percentage = dailyGoal.doubleValue() > 0
                ? (totalCalories.doubleValue() / dailyGoal.doubleValue()) * 100
                : 0;

        result.put("consumed", totalCalories.setScale(0, RoundingMode.HALF_UP));
        result.put("goal", dailyGoal.setScale(0, RoundingMode.HALF_UP));
        result.put("percentage", Math.round(percentage));
        result.put("remaining", dailyGoal.subtract(totalCalories).setScale(0, RoundingMode.HALF_UP));

        return result;
    }

    /**
     * Get daily exercise progress with goal comparison
     * Now ALWAYS uses durationMinutes (which is auto-populated for both CARDIO and STRENGTH)
     */
    @Override
    public Map<String, Object> getDailyExerciseProgress(Long userId, LocalDate date) {
        Map<String, Object> result = new HashMap<>();

        // Get user's exercise goal (convert weekly to daily)
        Optional<UserGoals> goals = goalsRepository.findByUser_Id(userId);
        int weeklyGoalMinutes = goals.map(UserGoals::getWeeklyExerciseGoalMinutes)
                .orElse(150); // Default 150 min/week (WHO recommendation)

        int dailyGoal = weeklyGoalMinutes / 7; // Convert to daily average

        // Calculate total exercise minutes today
        List<ExerciseLog> todayLogs = exerciseLogRepository
                .findByUser_IdAndDatePerformed(userId, date);

        // Always use durationMinutes (populated for both CARDIO and STRENGTH)
        BigDecimal totalMinutes = todayLogs.stream()
                .map(ExerciseLog::getDurationMinutes)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate percentage
        double percentage = dailyGoal > 0
                ? (totalMinutes.doubleValue() / dailyGoal) * 100
                : 0;

        result.put("completed", totalMinutes.setScale(0, RoundingMode.HALF_UP));
        result.put("goal", dailyGoal);
        result.put("percentage", Math.round(percentage));
        result.put("remaining", Math.max(0, dailyGoal - totalMinutes.intValue()));

        return result;
    }

    /**
     * Get latest weight data from smart scale
     */
    @Override
    public Map<String, Object> getLatestWeightData(Long userId) {
        Map<String, Object> result = new HashMap<>();

        Optional<SmartScaleReading> latestReading =
                scaleReadingRepository.findFirstByUser_IdOrderByReadingTimestampDesc(userId);

        if (latestReading.isPresent()) {
            SmartScaleReading reading = latestReading.get();
            result.put("currentWeight", reading.getWeightKg());
            result.put("timestamp", reading.getReadingTimestamp());

            // Calculate weight change (compare to previous reading)
            List<SmartScaleReading> recentReadings =
                    scaleReadingRepository.findTop10ByUser_IdOrderByReadingTimestampDesc(userId);

            if (recentReadings.size() >= 2) {
                BigDecimal current = recentReadings.get(0).getWeightKg();
                BigDecimal previous = recentReadings.get(1).getWeightKg();
                BigDecimal change = current.subtract(previous);
                result.put("weightChange", change.setScale(1, RoundingMode.HALF_UP));
            }

            // Get BMI if height available
            Optional<UserBiometrics> biometrics =
                    biometricsRepository.findFirstByUser_IdOrderByLastUpdatedDesc(userId);

            if (biometrics.isPresent() && biometrics.get().getHeightCm() != null) {
                BigDecimal heightM = biometrics.get().getHeightCm()
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                BigDecimal bmi = reading.getWeightKg()
                        .divide(heightM.multiply(heightM), 1, RoundingMode.HALF_UP);
                result.put("bmi", bmi);
            }
        } else {
            result.put("currentWeight", null);
            result.put("message", "No weight data available. Use the smart scale!");
        }

        return result;
    }

    // ============================================
    // WEEKLY STATISTICS
    // ============================================

    /**
     * Get complete weekly dashboard summary
     */
    @Override
    public Map<String, Object> getWeeklyDashboard(Long userId) {
        Map<String, Object> dashboard = new HashMap<>();

        // Get current week (Monday to Sunday)
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        // Weekly Calorie Intake (bar chart data)
        dashboard.put("weeklyCalories", getWeeklyCalorieIntake(userId, startOfWeek, endOfWeek));

        // Weekly Exercise Progress (line chart data)
        dashboard.put("weeklyExercise", getWeeklyExerciseProgress(userId, startOfWeek, endOfWeek));

        return dashboard;
    }

    /**
     * Get weekly calorie intake - returns array for bar chart
     * Format: [{day: "Mon", calories: 1800}, {day: "Tue", calories: 2100}, ...]
     */
    @Override
    public List<Map<String, Object>> getWeeklyCalorieIntake(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Map<String, Object>> weeklyData = new ArrayList<>();

        for (int i = 0; i < 7; i++) {
            LocalDate currentDate = startDate.plusDays(i);
            LocalDateTime dayStart = currentDate.atStartOfDay();
            LocalDateTime dayEnd = currentDate.atTime(23, 59, 59);

            // Get logs for this day
            List<FoodLog> dayLogs = foodLogRepository
                    .findByUser_IdAndDateTimeBetweenOrderByDateTimeDesc(userId, dayStart, dayEnd);

            // Calculate total calories
            BigDecimal totalCalories = dayLogs.stream()
                    .map(FoodLog::getCaloriesConsumed)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> dayData = new HashMap<>();
            dayData.put("day", currentDate.getDayOfWeek().toString().substring(0, 3)); // Mon, Tue, etc.
            dayData.put("date", currentDate.toString());
            dayData.put("calories", totalCalories.setScale(0, RoundingMode.HALF_UP));

            weeklyData.add(dayData);
        }

        return weeklyData;
    }

    /**
     * Get weekly exercise progress
     * Returns Mon-Sun with actual workout minutes using durationMinutes
     * Format: [{day: "Mon", date: "2026-01-06", minutes: 125}, ...]
     */
    @Override
    public List<Map<String, Object>> getWeeklyExerciseProgress(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Map<String, Object>> weeklyData = new ArrayList<>();

        // Loop through each day of the current week (Mon-Sun)
        for (int i = 0; i < 7; i++) {
            LocalDate currentDate = startDate.plusDays(i);

            // Get all exercise logs for this specific day
            List<ExerciseLog> dayLogs = exerciseLogRepository
                    .findByUser_IdAndDatePerformed(userId, currentDate);

            // Sum duration minutes (populated for both cardio and strength)
            BigDecimal totalMinutes = dayLogs.stream()
                    .map(ExerciseLog::getDurationMinutes)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> dayData = new HashMap<>();
            dayData.put("day", currentDate.getDayOfWeek().toString().substring(0, 3)); // Mon, Tue, etc.
            dayData.put("date", currentDate.toString());
            dayData.put("minutes", totalMinutes.setScale(0, RoundingMode.HALF_UP));

            weeklyData.add(dayData);
        }

        return weeklyData;
    }

    // ============================================
    // SUMMARY STATISTICS
    // ============================================

    /**
     * Get overall summary stats (total logs, averages, etc.)
     */
    @Override
    public Map<String, Object> getOverallSummary(Long userId) {
        Map<String, Object> summary = new HashMap<>();

        // Total food logs
        long totalFoodLogs = foodLogRepository.findByUser_IdOrderByDateTimeDesc(userId).size();
        summary.put("totalMealsLogged", totalFoodLogs);

        // Total exercise logs
        long totalExerciseLogs = exerciseLogRepository.findByUser_IdOrderByDatePerformedDesc(userId).size();
        summary.put("totalWorkoutsLogged", totalExerciseLogs);

        // Total weight readings
        long totalWeightReadings = scaleReadingRepository.findByUser_IdOrderByReadingTimestampDesc(userId).size();
        summary.put("totalWeighIns", totalWeightReadings);

        // Average daily calories (last 30 days)
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDateTime thirtyDaysAgoStart = thirtyDaysAgo.atStartOfDay();
        LocalDateTime now = LocalDateTime.now();

        List<FoodLog> recentLogs = foodLogRepository
                .findByUser_IdAndDateTimeBetweenOrderByDateTimeDesc(userId, thirtyDaysAgoStart, now);

        if (!recentLogs.isEmpty()) {
            BigDecimal totalRecentCalories = recentLogs.stream()
                    .map(FoodLog::getCaloriesConsumed)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal avgDailyCalories = totalRecentCalories
                    .divide(BigDecimal.valueOf(30), 0, RoundingMode.HALF_UP);
            summary.put("avgDailyCalories", avgDailyCalories);
        }

        return summary;
    }
}