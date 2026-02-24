package com.davidgeamanu.fitnesstrackerapp.dto.usda;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class USDAFood {
    private Long fdcId;
    private String description;
    private String dataType;
    private List<USDANutrient> foodNutrients;
}