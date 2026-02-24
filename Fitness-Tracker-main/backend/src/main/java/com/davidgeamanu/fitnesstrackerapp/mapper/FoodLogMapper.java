package com.davidgeamanu.fitnesstrackerapp.mapper;

import com.davidgeamanu.fitnesstrackerapp.dto.FoodLogResponse;
import com.davidgeamanu.fitnesstrackerapp.model.FoodLog;

public class FoodLogMapper {

    public static FoodLogResponse toDto(FoodLog log) {
        FoodLogResponse dto = new FoodLogResponse();
        dto.setId(log.getId());
        dto.setFoodName(log.getFood().getName());
        dto.setSource(log.getFood().getUser() == null ? "EXTERNAL" : "PERSONAL");
        dto.setGrams(log.getQuantityGrams().intValue());
        dto.setCalories(log.getCaloriesConsumed().floatValue());

        // Calculate macros based on quantity
        float ratio = log.getQuantityGrams().floatValue() / 100f;
        dto.setProtein(log.getFood().getProtein() != null ? log.getFood().getProtein() * ratio : 0f);
        dto.setFats(log.getFood().getFats() != null ? log.getFood().getFats() * ratio : 0f);
        dto.setCarbs(log.getFood().getCarbs() != null ? log.getFood().getCarbs() * ratio : 0f);

        dto.setTimestamp(log.getDateTime().toString());
        return dto;
    }
}