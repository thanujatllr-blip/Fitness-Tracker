package com.davidgeamanu.fitnesstrackerapp.service.impl;

import com.davidgeamanu.fitnesstrackerapp.dto.CalendarDayResponse;
import com.davidgeamanu.fitnesstrackerapp.dto.CalendarMonthResponse;
import com.davidgeamanu.fitnesstrackerapp.dto.StreakResponse;
import com.davidgeamanu.fitnesstrackerapp.model.ExerciseLog;
import com.davidgeamanu.fitnesstrackerapp.model.FoodLog;
import com.davidgeamanu.fitnesstrackerapp.model.UserBiometrics;
import com.davidgeamanu.fitnesstrackerapp.model.UserGoals;
import com.davidgeamanu.fitnesstrackerapp.repository.ExerciseLogRepository;
import com.davidgeamanu.fitnesstrackerapp.repository.FoodLogRepository;
import com.davidgeamanu.fitnesstrackerapp.repository.UserBiometricsRepository;
import com.davidgeamanu.fitnesstrackerapp.repository.UserGoalsRepository;
import com.davidgeamanu.fitnesstrackerapp.service.CalendarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CalendarServiceImpl implements CalendarService {

    private final FoodLogRepository foodLogRepository;
    private final ExerciseLogRepository exerciseLogRepository;
    private final UserGoalsRepository userGoalsRepository;
    private final UserBiometricsRepository userBiometricsRepository;

    @Override
    public CalendarMonthResponse getMonthData(Long userId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        log.info("Fetching calendar data for user {} for {}-{}", userId, year, month);

        // Get user goals
        UserGoals goals = userGoalsRepository.findByUser_Id(userId).orElse(null);
        Integer calorieGoal = goals != null ? goals.getDailyCalorieGoal().intValue() : 2000;
        Integer dailyExerciseGoal = goals != null ? goals.getWeeklyExerciseGoalMinutes() / 7 : 60;

        // Determine weight goal direction
        boolean wantsToGainWeight = isUserTryingToGainWeight(userId, goals);

        // Fetch food logs
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        List<FoodLog> foodLogs = foodLogRepository.findByUser_IdAndDateTimeBetween(userId, startDateTime, endDateTime);

        // Fetch exercise logs
        List<ExerciseLog> exerciseLogs = exerciseLogRepository
                .findByUser_IdAndDatePerformedBetweenOrderByDatePerformedDesc(userId, startDate, endDate);

        // Group by date
        Map<LocalDate, List<FoodLog>> foodByDate = foodLogs.stream()
                .collect(Collectors.groupingBy(log -> log.getDateTime().toLocalDate()));

        Map<LocalDate, List<ExerciseLog>> exerciseByDate = exerciseLogs.stream()
                .collect(Collectors.groupingBy(ExerciseLog::getDatePerformed));

        // Build day responses
        Map<String, CalendarDayResponse> days = new HashMap<>();
        Set<LocalDate> allDates = new HashSet<>();
        allDates.addAll(foodByDate.keySet());
        allDates.addAll(exerciseByDate.keySet());

        for (LocalDate date : allDates) {
            List<FoodLog> dayFoodLogs = foodByDate.getOrDefault(date, Collections.emptyList());
            List<ExerciseLog> dayExerciseLogs = exerciseByDate.getOrDefault(date, Collections.emptyList());

            CalendarDayResponse dayResponse = buildDayResponse(date, dayFoodLogs, dayExerciseLogs, calorieGoal, dailyExerciseGoal);
            days.put(date.toString(), dayResponse);
        }

        // Calculate month stats with weight-aware calorie goal logic
        CalendarMonthResponse.MonthStats stats = calculateMonthStats(days, wantsToGainWeight);

        CalendarMonthResponse response = new CalendarMonthResponse();
        response.setDays(days);
        response.setStats(stats);
        return response;
    }

    @Override
    public CalendarDayResponse getDayDetails(Long userId, LocalDate date) {
        log.info("Fetching day details for user {} on {}", userId, date);

        // Get user goals
        UserGoals goals = userGoalsRepository.findByUser_Id(userId).orElse(null);
        Integer calorieGoal = goals != null ? goals.getDailyCalorieGoal().intValue() : 2000;
        Integer dailyExerciseGoal = goals != null ? goals.getWeeklyExerciseGoalMinutes() / 7 : 60;

        // Fetch food logs for the day
        LocalDateTime startDateTime = date.atStartOfDay();
        LocalDateTime endDateTime = date.atTime(23, 59, 59);
        List<FoodLog> foodLogs = foodLogRepository.findByUser_IdAndDateTimeBetween(userId, startDateTime, endDateTime);

        // Fetch exercise logs for the day
        List<ExerciseLog> exerciseLogs = exerciseLogRepository
                .findByUser_IdAndDatePerformedBetweenOrderByDatePerformedDesc(userId, date, date);

        return buildDayResponse(date, foodLogs, exerciseLogs, calorieGoal, dailyExerciseGoal);
    }

    @Override
    public StreakResponse calculateStreaks(Long userId) {
        log.info("Calculating workout streaks for user {}", userId);

        // Get all distinct workout dates
        List<LocalDate> workoutDates = exerciseLogRepository.findDistinctDatePerformedByUserId(userId);

        if (workoutDates.isEmpty()) {
            return buildEmptyStreakResponse();
        }

        // Sort dates
        Collections.sort(workoutDates);

        // Find all streaks
        List<Streak> streaks = new ArrayList<>();
        Streak currentStreak = new Streak();
        currentStreak.dates.add(workoutDates.get(0));

        for (int i = 1; i < workoutDates.size(); i++) {
            LocalDate prevDate = workoutDates.get(i - 1);
            LocalDate currDate = workoutDates.get(i);

            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(prevDate, currDate);

            if (daysBetween == 1) {
                currentStreak.dates.add(currDate);
            } else {
                streaks.add(currentStreak);
                currentStreak = new Streak();
                currentStreak.dates.add(currDate);
            }
        }
        streaks.add(currentStreak);

        // Find longest streak
        Streak longestStreak = streaks.stream()
                .max(Comparator.comparingInt(s -> s.dates.size()))
                .orElse(new Streak());

        // Find current streak
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        Streak lastStreak = streaks.get(streaks.size() - 1);
        LocalDate lastStreakEnd = lastStreak.dates.get(lastStreak.dates.size() - 1);

        Streak actualCurrentStreak;
        if (lastStreakEnd.equals(today) || lastStreakEnd.equals(yesterday)) {
            actualCurrentStreak = lastStreak;
        } else {
            actualCurrentStreak = new Streak();
        }

        // Build response
        StreakResponse response = new StreakResponse();
        response.setCurrentStreak(buildStreakInfo(actualCurrentStreak));
        response.setLongestStreak(buildStreakInfo(longestStreak));
        return response;
    }

    /**
     * Determine if user is trying to gain weight
     * Logic: current weight < target weight = wants to gain weight
     */
    private boolean isUserTryingToGainWeight(Long userId, UserGoals goals) {
        if (goals == null || goals.getTargetWeightKg() == null) {
            return false; // Default to weight loss if no goal set
        }

        // Get latest biometrics
        Optional<UserBiometrics> latestBio = userBiometricsRepository
                .findTopByUser_IdOrderByLastUpdatedDesc(userId);

        if (latestBio.isEmpty()) {
            return false; // Can't determine, default to weight loss
        }

        BigDecimal currentWeight = latestBio.get().getWeightKg();
        BigDecimal targetWeight = goals.getTargetWeightKg();

        // If target > current, user wants to gain weight
        return targetWeight.compareTo(currentWeight) > 0;
    }

    /**
     * Check if calorie goal is met based on weight goal direction
     */
    private boolean isCalorieGoalMet(int calories, int calorieGoal, boolean wantsToGainWeight) {
        if (calories == 0) return false; // No data

        if (wantsToGainWeight) {
            // Gain weight: need to eat AT LEAST the goal
            return calories >= calorieGoal;
        } else {
            // Lose weight: need to eat AT MOST the goal
            return calories <= calorieGoal;
        }
    }

    private CalendarDayResponse buildDayResponse(LocalDate date, List<FoodLog> foodLogs,
                                                 List<ExerciseLog> exerciseLogs,
                                                 Integer calorieGoal, Integer exerciseGoal) {
        // Calculate totals
        int totalCalories = foodLogs.stream()
                .mapToInt(log -> log.getCaloriesConsumed() != null ? log.getCaloriesConsumed().intValue() : 0)
                .sum();

        int totalExerciseMinutes = exerciseLogs.stream()
                .mapToInt(log -> {
                    BigDecimal duration = log.getDurationMinutes();
                    if (duration != null) {
                        return duration.intValue();
                    }
                    // For strength training, estimate duration from sets
                    if (log.getSets() != null && log.getSets() > 0) {
                        return log.getSets() * 5; // Rough estimate: 5 min per set
                    }
                    return 0;
                })
                .sum();

        // Get meal names
        List<String> meals = foodLogs.stream()
                .map(log -> log.getFood().getName())
                .distinct()
                .collect(Collectors.toList());

        // Get exercise descriptions
        List<String> exercises = exerciseLogs.stream()
                .map(log -> {
                    String name = log.getExercise().getExerciseName();
                    BigDecimal duration = log.getDurationMinutes();
                    if (duration != null && duration.intValue() > 0) {
                        return name + " - " + duration.intValue() + " min";
                    }
                    if (log.getSets() != null && log.getSets() > 0) {
                        return name + " - " + log.getSets() + " × " + log.getReps();
                    }
                    return name;
                })
                .collect(Collectors.toList());

        CalendarDayResponse response = new CalendarDayResponse();
        response.setDate(date.toString());
        response.setWorkout(!exerciseLogs.isEmpty());
        response.setCalories(totalCalories);
        response.setCalorieGoal(calorieGoal);
        response.setExerciseMinutes(totalExerciseMinutes);
        response.setExerciseGoal(exerciseGoal);
        response.setMeals(meals);
        response.setExercises(exercises);
        return response;
    }

    private CalendarMonthResponse.MonthStats calculateMonthStats(Map<String, CalendarDayResponse> days, boolean wantsToGainWeight) {
        int workoutDays = (int) days.values().stream()
                .filter(CalendarDayResponse::getWorkout)
                .count();

        // Weight-aware calorie goal checking
        int calorieGoalMetDays = (int) days.values().stream()
                .filter(d -> isCalorieGoalMet(d.getCalories(), d.getCalorieGoal(), wantsToGainWeight))
                .count();

        int exerciseGoalMetDays = (int) days.values().stream()
                .filter(d -> d.getExerciseMinutes() >= d.getExerciseGoal())
                .count();

        int totalCalories = days.values().stream()
                .mapToInt(CalendarDayResponse::getCalories)
                .sum();

        int totalExerciseMinutes = days.values().stream()
                .mapToInt(CalendarDayResponse::getExerciseMinutes)
                .sum();

        CalendarMonthResponse.MonthStats stats = new CalendarMonthResponse.MonthStats();
        stats.setWorkoutDays(workoutDays);
        stats.setCalorieGoalMetDays(calorieGoalMetDays);
        stats.setExerciseGoalMetDays(exerciseGoalMetDays);
        stats.setTotalCalories(totalCalories);
        stats.setTotalExerciseMinutes(totalExerciseMinutes);
        stats.setDaysWithData(days.size());
        return stats;
    }

    private StreakResponse buildEmptyStreakResponse() {
        StreakResponse response = new StreakResponse();

        StreakResponse.StreakInfo emptyStreak = new StreakResponse.StreakInfo();
        emptyStreak.setDays(0);
        emptyStreak.setDates(Collections.emptySet());

        response.setCurrentStreak(emptyStreak);
        response.setLongestStreak(emptyStreak);
        return response;
    }

    private StreakResponse.StreakInfo buildStreakInfo(Streak streak) {
        StreakResponse.StreakInfo info = new StreakResponse.StreakInfo();

        if (streak.dates.isEmpty()) {
            info.setDays(0);
            info.setDates(Collections.emptySet());
            return info;
        }

        Set<String> dateStrings = streak.dates.stream()
                .map(LocalDate::toString)
                .collect(Collectors.toSet());

        info.setDays(streak.dates.size());
        info.setStartDate(streak.dates.get(0));
        info.setEndDate(streak.dates.get(streak.dates.size() - 1));
        info.setDates(dateStrings);
        return info;
    }

    private static class Streak {
        List<LocalDate> dates = new ArrayList<>();
    }
}