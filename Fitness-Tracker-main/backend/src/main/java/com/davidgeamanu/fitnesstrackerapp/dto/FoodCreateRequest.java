package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;

@Data
public class FoodCreateRequest {
    private String name;
    private Integer calories;
    private Float protein;
    private Float fats;
    private Float carbs;
}
