package com.davidgeamanu.fitnesstrackerapp.service;

import com.davidgeamanu.fitnesstrackerapp.model.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

public interface DashboardService {

    Map<String, Object> getDailyDashboard(Long userId, LocalDate date);

    Map<String, Object> getDailyCalorieIntake(Long userId, LocalDate date);

    Map<String, Object> getDailyExerciseProgress(Long userId, LocalDate date);

    Map<String, Object> getLatestWeightData(Long userId);

    Map<String, Object> getWeeklyDashboard(Long userId);

    List<Map<String, Object>> getWeeklyCalorieIntake(Long userId, LocalDate startDate, LocalDate endDate);

    List<Map<String, Object>> getWeeklyExerciseProgress(Long userId, LocalDate startDate, LocalDate endDate);

    Map<String, Object> getOverallSummary(Long userId);
}
