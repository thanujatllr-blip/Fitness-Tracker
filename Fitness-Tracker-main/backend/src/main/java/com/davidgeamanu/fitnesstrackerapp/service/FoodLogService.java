package com.davidgeamanu.fitnesstrackerapp.service;

import com.davidgeamanu.fitnesstrackerapp.model.FoodLog;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FoodLogService {

    /**
     * Create a food log entry
     * @param userId User ID
     * @param foodId Food ID
     * @param quantityGrams Quantity in grams
     * @param caloriesConsumed Calories (optional - will be calculated if null)
     * @return Created food log
     */
    FoodLog createLog(Long userId, Long foodId, BigDecimal quantityGrams, BigDecimal caloriesConsumed);

    /**
     * Find all food logs for a user
     */
    List<FoodLog> findByUserId(Long userId);

    /**
     * Find food logs for a specific date
     */
    List<FoodLog> findByUserIdAndDate(Long userId, LocalDate date);

    /**
     * Find a food log by ID
     */
    Optional<FoodLog> findById(Long id);

    /**
     * Delete a food log
     */
    void deleteLog(Long logId);

    /**
     * Create a food log for an external food (USDA, Wger) without saving it to personal foods
     */
    FoodLog createExternalFoodLog(Long userId, String foodName, BigDecimal calories,
                                  BigDecimal protein, BigDecimal fats, BigDecimal carbs,
                                  BigDecimal quantityGrams);
}