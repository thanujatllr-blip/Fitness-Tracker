package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;

@Data
public class FoodResponse {
    private Long id;
    private String name;
    private Integer calories;
    private Float protein;
    private Float fats;
    private Float carbs;
    private String source; // "PERSONAL" or "EXTERNAL"
}
