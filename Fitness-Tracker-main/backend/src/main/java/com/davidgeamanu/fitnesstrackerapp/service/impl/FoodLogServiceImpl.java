package com.davidgeamanu.fitnesstrackerapp.service.impl;

import com.davidgeamanu.fitnesstrackerapp.model.Food;
import com.davidgeamanu.fitnesstrackerapp.model.FoodLog;
import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.repository.FoodLogRepository;
import com.davidgeamanu.fitnesstrackerapp.repository.FoodRepository;
import com.davidgeamanu.fitnesstrackerapp.repository.UserRepository;
import com.davidgeamanu.fitnesstrackerapp.service.FoodLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FoodLogServiceImpl implements FoodLogService {

    private final FoodLogRepository foodLogRepository;
    private final FoodRepository foodRepository;
    private final UserRepository userRepository;

    @Override
    public FoodLog createLog(Long userId, Long foodId, BigDecimal quantityGrams, BigDecimal caloriesConsumed) {
        // Validate inputs
        if (quantityGrams == null || quantityGrams.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Food food = foodRepository.findById(foodId)
                .orElseThrow(() -> new IllegalArgumentException("Food not found"));

        // Calculate calories if not provided
        if (caloriesConsumed == null) {
            // Formula: (calories_per_100g * quantity_grams) / 100
            BigDecimal caloriesPer100g = BigDecimal.valueOf(food.getCaloriesPer100g());
            caloriesConsumed = caloriesPer100g
                    .multiply(quantityGrams)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        FoodLog log = FoodLog.builder()
                .user(user)
                .food(food)
                .quantityGrams(quantityGrams)
                .caloriesConsumed(caloriesConsumed)
                .dateTime(LocalDateTime.now())
                .build();

        return foodLogRepository.save(log);
    }

    @Override
    @Transactional
    public FoodLog createExternalFoodLog(Long userId, String foodName, BigDecimal calories,
                                         BigDecimal protein, BigDecimal fats, BigDecimal carbs,
                                         BigDecimal quantityGrams) {
        // Validate inputs
        if (quantityGrams == null || quantityGrams.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        if (foodName == null || foodName.trim().isEmpty()) {
            throw new IllegalArgumentException("Food name is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if this external food already exists (to avoid duplicates)
        // External foods have user = null
        Optional<Food> existingFood = foodRepository.findByUserIsNull().stream()
                .filter(f -> f.getName().equalsIgnoreCase(foodName.trim()))
                .findFirst();

        Food food;
        if (existingFood.isPresent()) {
            // Reuse existing external food
            food = existingFood.get();
        } else {
            // Create new external food (user = null means it's from USDA/Wger)
            food = Food.builder()
                    .name(foodName.trim())
                    .caloriesPer100g(calories.intValue())  // Integer in entity
                    .protein(protein.floatValue())         // Float in entity
                    .fats(fats.floatValue())               // Float in entity (field name is 'fats')
                    .carbs(carbs.floatValue())             // Float in entity (field name is 'carbs')
                    .user(null)                            // null = external food from USDA/Wger
                    .build();

            food = foodRepository.save(food);
        }

        // Calculate calories consumed based on quantity
        BigDecimal caloriesConsumed = BigDecimal.valueOf(food.getCaloriesPer100g())
                .multiply(quantityGrams)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        // Create the food log
        FoodLog log = FoodLog.builder()
                .user(user)
                .food(food)
                .quantityGrams(quantityGrams)
                .caloriesConsumed(caloriesConsumed)
                .dateTime(LocalDateTime.now())
                .build();

        return foodLogRepository.save(log);
    }

    @Override
    public List<FoodLog> findByUserId(Long userId) {
        return foodLogRepository.findByUser_IdOrderByDateTimeDesc(userId);
    }

    @Override
    public List<FoodLog> findByUserIdAndDate(Long userId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        return foodLogRepository.findByUser_IdAndDateTimeBetweenOrderByDateTimeDesc(userId, startOfDay, endOfDay);
    }

    @Override
    public Optional<FoodLog> findById(Long id) {
        return foodLogRepository.findById(id);
    }

    @Override
    public void deleteLog(Long logId) {
        foodLogRepository.deleteById(logId);
    }
}