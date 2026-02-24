package com.davidgeamanu.fitnesstrackerapp.dto.usda;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class USDANutrient {
    private Integer nutrientId;
    private String nutrientName;
    private Double value;
    private String unitName;
}