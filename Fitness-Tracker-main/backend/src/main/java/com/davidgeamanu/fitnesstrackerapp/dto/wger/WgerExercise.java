package com.davidgeamanu.fitnesstrackerapp.dto.wger;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Individual exercise from Wger API
 *
 * Example:
 * {
 *   "id": 345,
 *   "uuid": "c788d643-150a-4ac7-97ef-84643c6419bf",
 *   "name": "Bench press",
 *   "exercise_base": 123,
 *   "description": "Lie on bench...",
 *   "category": 10,  // <-- Can be just an integer ID
 *   // OR
 *   "category": {    // <-- Or a full object
 *     "id": 11,
 *     "name": "Chest"
 *   },
 *   "muscles": [4],
 *   "muscles_secondary": [2, 5],
 *   "equipment": [1],
 *   "language": {
 *     "id": 2,
 *     "short_name": "en",
 *     "full_name": "English"
 *   },
 *   "license": {...},
 *   "license_author": "wger.de",
 *   "variations": []
 * }
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WgerExercise {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("uuid")
    private String uuid;

    @JsonProperty("name")
    private String name;

    @JsonProperty("exercise_base")
    private Long exerciseBase;

    @JsonProperty("description")
    private String description;

    // Handle category as either Integer ID or WgerCategory object
    @JsonProperty("category")
    private Object categoryRaw;

    @JsonProperty("muscles")
    private List<Integer> muscles;

    @JsonProperty("muscles_secondary")
    private List<Integer> musclesSecondary;

    @JsonProperty("equipment")
    private List<Integer> equipment;

    @JsonProperty("language")
    private WgerLanguage language;

    @JsonProperty("license_author")
    private String licenseAuthor;

    @JsonProperty("variations")
    private List<Long> variations;

    /**
     * Get category - handles both Integer ID and WgerCategory object
     */
    public WgerCategory getCategory() {
        if (categoryRaw == null) {
            return null;
        }

        // If it's already a WgerCategory object
        if (categoryRaw instanceof WgerCategory) {
            return (WgerCategory) categoryRaw;
        }

        // If it's just an Integer ID, create a WgerCategory with name
        if (categoryRaw instanceof Integer) {
            WgerCategory cat = new WgerCategory();
            cat.setId((Integer) categoryRaw);
            cat.setName(getCategoryNameById((Integer) categoryRaw));
            return cat;
        }

        // Handle cases where Jackson might parse as a different number type
        if (categoryRaw instanceof Number) {
            WgerCategory cat = new WgerCategory();
            int id = ((Number) categoryRaw).intValue();
            cat.setId(id);
            cat.setName(getCategoryNameById(id));
            return cat;
        }

        return null;
    }

    /**
     * Map category IDs to names based on Wger API documentation
     * https://wger.de/api/v2/exercisecategory/
     */
    private String getCategoryNameById(Integer id) {
        if (id == null) return "Unknown";

        return switch (id) {
            case 8 -> "Arms";
            case 9 -> "Legs";
            case 10 -> "Abs";
            case 11 -> "Chest";
            case 12 -> "Back";
            case 13 -> "Shoulders";
            case 14 -> "Calves";
            default -> "Compound";
        };
    }

    /**
     * Category information
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class WgerCategory {
        @JsonProperty("id")
        private Integer id;

        @JsonProperty("name")
        private String name;
    }

    /**
     * Language information
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class WgerLanguage {
        @JsonProperty("id")
        private Integer id;

        @JsonProperty("short_name")
        private String shortName;

        @JsonProperty("full_name")
        private String fullName;
    }
}