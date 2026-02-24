package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;

@Data
public class FoodLogResponse {
    private Long id;
    private String foodName;
    private String source; // PERSONAL / EXTERNAL
    private Integer grams;
    private Float calories;
    private Float protein;
    private Float fats;
    private Float carbs;
    private String timestamp;
}
