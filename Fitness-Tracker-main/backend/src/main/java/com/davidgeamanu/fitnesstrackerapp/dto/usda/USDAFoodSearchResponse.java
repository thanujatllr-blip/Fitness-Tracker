package com.davidgeamanu.fitnesstrackerapp.dto.usda;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

/**
 * Response from USDA FoodData Central search endpoint
 * Maps to: GET /foods/search
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class USDAFoodSearchResponse {
    private List<USDAFood> foods;
    private int totalHits;
    private int currentPage;
    private int totalPages;
}