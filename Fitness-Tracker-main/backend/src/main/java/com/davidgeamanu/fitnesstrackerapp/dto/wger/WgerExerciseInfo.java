package com.davidgeamanu.fitnesstrackerapp.dto.wger;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Exercise info from Wger API /exerciseinfo/ endpoint
 * This is the recommended endpoint for accessing exercise data with better structure
 *
 * Example response:
 * {
 *   "id": 123,
 *   "uuid": "c788d643-150a-4ac7-97ef-84643c6419bf",
 *   "category": { "id": 10, "name": "Abs" },
 *   "translations": [
 *     {
 *       "id": 1,
 *       "uuid": "...",
 *       "name": "Crunches",
 *       "description": "Lie on your back...",
 *       "language": { "id": 2, "short_name": "en", "full_name": "English" }
 *     }
 *   ],
 *   "muscles": [...],
 *   "muscles_secondary": [...],
 *   "equipment": [...]
 * }
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WgerExerciseInfo {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("uuid")
    private String uuid;

    @JsonProperty("created")
    private String created;

    @JsonProperty("last_update")
    private String lastUpdate;

    @JsonProperty("category")
    private WgerCategory category;

    @JsonProperty("muscles")
    private List<WgerMuscle> muscles;

    @JsonProperty("muscles_secondary")
    private List<WgerMuscle> musclesSecondary;

    @JsonProperty("equipment")
    private List<WgerEquipment> equipment;

    @JsonProperty("translations")
    private List<WgerTranslation> translations;

    @JsonProperty("license_author")
    private String licenseAuthor;

    @JsonProperty("variations")
    private Integer variations;

    /**
     * Get the name in the first available translation
     * Prioritizes the specified language
     */
    public String getName() {
        if (translations == null || translations.isEmpty()) {
            return "Unknown Exercise";
        }
        return translations.get(0).getName();
    }

    /**
     * Get the description in the first available translation
     */
    public String getDescription() {
        if (translations == null || translations.isEmpty()) {
            return "";
        }
        return translations.get(0).getDescription();
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
     * Translation information (name, description in specific language)
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class WgerTranslation {
        @JsonProperty("id")
        private Long id;

        @JsonProperty("uuid")
        private String uuid;

        @JsonProperty("name")
        private String name;

        @JsonProperty("description")
        private String description;

        //@JsonProperty("language")
        //private WgerLanguage language;

        @JsonProperty("language")
        private Object language;
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

    /**
     * Muscle information
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class WgerMuscle {
        @JsonProperty("id")
        private Integer id;

        @JsonProperty("name")
        private String name;

        @JsonProperty("name_en")
        private String nameEn;

        @JsonProperty("is_front")
        private Boolean isFront;
    }

    /**
     * Equipment information
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class WgerEquipment {
        @JsonProperty("id")
        private Integer id;

        @JsonProperty("name")
        private String name;
    }
}