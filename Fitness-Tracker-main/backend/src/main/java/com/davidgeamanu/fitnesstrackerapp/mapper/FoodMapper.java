package com.davidgeamanu.fitnesstrackerapp.mapper;

import com.davidgeamanu.fitnesstrackerapp.dto.FoodCreateRequest;
import com.davidgeamanu.fitnesstrackerapp.dto.FoodResponse;
import com.davidgeamanu.fitnesstrackerapp.model.Food;

public class FoodMapper {

    public static Food toEntity(FoodCreateRequest dto) {
        Food food = new Food();
        food.setName(dto.getName());
        food.setCaloriesPer100g(dto.getCalories());
        food.setProtein(dto.getProtein());
        food.setFats(dto.getFats());
        food.setCarbs(dto.getCarbs());
        return food;
    }

    public static FoodResponse toDto(Food food) {
        FoodResponse dto = new FoodResponse();
        dto.setId(food.getId());
        dto.setName(food.getName());
        dto.setCalories(food.getCaloriesPer100g());
        dto.setProtein(food.getProtein());
        dto.setFats(food.getFats());
        dto.setCarbs(food.getCarbs());
        dto.setSource(food.getUser() == null ? "EXTERNAL" : "PERSONAL");
        return dto;
    }
}
