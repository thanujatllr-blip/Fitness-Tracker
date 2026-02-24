package com.davidgeamanu.fitnesstrackerapp.service;

import com.davidgeamanu.fitnesstrackerapp.dto.wger.WgerExercise;
import com.davidgeamanu.fitnesstrackerapp.dto.wger.WgerExerciseInfo;
import com.davidgeamanu.fitnesstrackerapp.dto.wger.WgerExerciseInfoSearchResponse;
import com.davidgeamanu.fitnesstrackerapp.dto.wger.WgerExerciseSearchResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.reactive.function.client.ExchangeStrategies;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Professional service for interacting with Wger Workout Manager API
 *
 * Wger API Documentation: https://wger.de/en/software/api
 * Base URL: https://wger.de/api/v2/
 *
 * This service uses the recommended /exerciseinfo/ endpoint which provides:
 * - Better data structure with nested translations
 * - Proper name search via name__search parameter
 * - More comprehensive exercise information
 *
 */
@Service
@Slf4j
public class WgerExerciseService {

    private static final String WGER_BASE_URL = "https://wger.de/api/v2";

    private WebClient getWebClient() {
        // Increase memory limit to 32MB to handle large JSON responses with HTML descriptions
        final int size = 32 * 1024 * 1024;
        final ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(codecs -> codecs.defaultCodecs().maxInMemorySize(size))
                .build();

        return WebClient.builder()
                .baseUrl(WGER_BASE_URL)
                .exchangeStrategies(strategies)
                .build();
    }

    /**
     * Search for exercises in Wger database using the professional exerciseinfo endpoint
     * This endpoint supports proper name searching via the name__search parameter
     *
     * @param query Search term (e.g., "bench press", "squat")
     * @param language Language code (default: "2" for English)
     * @param limit Number of results to return (default: 20)
     * @return List of exercises from Wger database (converted to legacy format for compatibility)
     */
    public List<WgerExercise> searchExercises(String query, String language, Integer limit) {
        if (query == null || query.trim().isEmpty()) {
            log.warn("Empty search query provided");
            return List.of();
        }

        try {
            log.info("Searching Wger API (exerciseinfo) for: {} (language: {}, limit: {})", query, language, limit);

            // Use /exerciseinfo/ endpoint which supports name__search parameter
            WgerExerciseInfoSearchResponse response = getWebClient()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/exerciseinfo/")
                            .queryParam("language__code", getLanguageCode(language))
                            .queryParam("name__search", query)
                            .queryParam("limit", limit != null ? limit : 20)
                            .build())
                    .retrieve()
                    .bodyToMono(WgerExerciseInfoSearchResponse.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();

            if (response != null && response.getResults() != null) {
                // Convert WgerExerciseInfo to WgerExercise for backward compatibility
                List<WgerExercise> exercises = response.getResults().stream()
                        .map(this::convertToLegacyFormat)
                        .collect(Collectors.toList());

                log.info("Successfully found {} exercises for query: {}", exercises.size(), query);

                // Log first exercise for debugging
                if (!exercises.isEmpty()) {
                    WgerExercise firstExercise = exercises.get(0);
                    log.debug("First exercise: id={}, name={}, category={}",
                            firstExercise.getId(),
                            firstExercise.getName(),
                            firstExercise.getCategory() != null ? firstExercise.getCategory().getName() : "none");
                }

                return exercises;
            } else {
                log.warn("Response or results list is null for query: {}", query);
                return List.of();
            }

        } catch (WebClientResponseException e) {
            log.error("HTTP error searching Wger API for query '{}': Status={}, Body={}",
                    query, e.getStatusCode(), e.getResponseBodyAsString());
            return List.of();
        } catch (Exception e) {
            log.error("Error searching Wger API for query '{}': {} - {}",
                    query, e.getClass().getSimpleName(), e.getMessage());
            return List.of();
        }
    }

    /**
     * Get all exercises (no search filter)
     * Uses exerciseinfo endpoint for better data structure
     *
     * @param language Language code (default: "2" for English)
     * @param limit Number of results (default: 50)
     * @return List of exercises
     */
    public List<WgerExercise> getAllExercises(String language, Integer limit) {
        try {
            log.info("Fetching all exercises from Wger API (exerciseinfo) (language: {}, limit: {})", language, limit);

            WgerExerciseInfoSearchResponse response = getWebClient()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/exerciseinfo/")
                            .queryParam("language__code", getLanguageCode(language))
                            .queryParam("limit", limit != null ? limit : 50)
                            .build())
                    .retrieve()
                    .bodyToMono(WgerExerciseInfoSearchResponse.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();

            if (response != null && response.getResults() != null) {
                List<WgerExercise> exercises = response.getResults().stream()
                        .map(this::convertToLegacyFormat)
                        .collect(Collectors.toList());

                log.info("Successfully fetched {} exercises", exercises.size());
                return exercises;
            }

            return List.of();

        } catch (Exception e) {
            log.error("Error fetching all exercises: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Get detailed information about a specific exercise
     *
     * @param exerciseId Wger exercise ID
     * @return Optional containing exercise details if found
     */
    public Optional<WgerExercise> getExerciseById(Long exerciseId) {
        try {
            log.info("Fetching Wger exercise details for id: {}", exerciseId);

            WgerExerciseInfo exerciseInfo = getWebClient()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/exerciseinfo/{id}/")
                            .build(exerciseId))
                    .retrieve()
                    .bodyToMono(WgerExerciseInfo.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();

            return Optional.ofNullable(exerciseInfo)
                    .map(this::convertToLegacyFormat);

        } catch (Exception e) {
            log.error("Error fetching Wger exercise {}: {}", exerciseId, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Get exercises by category
     *
     * @param categoryId Category ID (e.g., 8=Arms, 10=Abs, 11=Chest, 12=Back, 13=Shoulders, 14=Legs, 15=Calves)
     * @param limit Number of results
     * @return List of exercises in that category
     */
    public List<WgerExercise> getExercisesByCategory(Integer categoryId, Integer limit) {
        try {
            log.info("Fetching exercises by category: {}", categoryId);

            WgerExerciseInfoSearchResponse response = getWebClient()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/exerciseinfo/")
                            .queryParam("language__code", "en") // English
                            .queryParam("category", categoryId)
                            .queryParam("limit", limit != null ? limit : 20)
                            .build())
                    .retrieve()
                    .bodyToMono(WgerExerciseInfoSearchResponse.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();

            if (response != null && response.getResults() != null) {
                List<WgerExercise> exercises = response.getResults().stream()
                        .map(this::convertToLegacyFormat)
                        .collect(Collectors.toList());

                log.info("Found {} exercises in category {}", exercises.size(), categoryId);
                return exercises;
            }

            return List.of();

        } catch (Exception e) {
            log.error("Error fetching exercises by category {}: {}", categoryId, e.getMessage());
            return List.of();
        }
    }

    /**
     * Convert WgerExerciseInfo (from exerciseinfo endpoint) to WgerExercise (legacy format)
     * This maintains backward compatibility with existing controller code
     */
    private WgerExercise convertToLegacyFormat(WgerExerciseInfo info) {
        WgerExercise exercise = new WgerExercise();

        exercise.setId(info.getId());
        exercise.setUuid(info.getUuid());
        exercise.setName(info.getName()); // Gets name from first translation
        exercise.setDescription(info.getDescription()); // Gets description from first translation
        exercise.setLicenseAuthor(info.getLicenseAuthor());

        // Convert category
        if (info.getCategory() != null) {
            WgerExercise.WgerCategory category = new WgerExercise.WgerCategory();
            category.setId(info.getCategory().getId());
            category.setName(info.getCategory().getName());
            exercise.setCategoryRaw(category);
        }

        // Extract muscle IDs
        if (info.getMuscles() != null) {
            exercise.setMuscles(info.getMuscles().stream()
                    .map(WgerExerciseInfo.WgerMuscle::getId)
                    .collect(Collectors.toList()));
        }

        if (info.getMusclesSecondary() != null) {
            exercise.setMusclesSecondary(info.getMusclesSecondary().stream()
                    .map(WgerExerciseInfo.WgerMuscle::getId)
                    .collect(Collectors.toList()));
        }

        // Extract equipment IDs
        if (info.getEquipment() != null) {
            exercise.setEquipment(info.getEquipment().stream()
                    .map(WgerExerciseInfo.WgerEquipment::getId)
                    .collect(Collectors.toList()));
        }

        return exercise;
    }

    /**
     * Convert language ID to language code
     * Wger uses numeric IDs in some contexts and codes in others
     */
    private String getLanguageCode(String languageId) {
        if (languageId == null) {
            return "en";
        }

        return switch (languageId) {
            case "1" -> "de"; // German
            case "2" -> "en"; // English
            case "3" -> "bg"; // Bulgarian
            case "4" -> "es"; // Spanish
            case "5" -> "fr"; // French
            case "6" -> "ru"; // Russian
            case "7" -> "nl"; // Dutch
            case "8" -> "pt"; // Portuguese
            case "9" -> "el"; // Greek
            case "10" -> "cs"; // Czech
            case "11" -> "sv"; // Swedish
            case "12" -> "no"; // Norwegian
            default -> languageId; // Assume it's already a code
        };
    }

    /**
     * Map Wger category name to our app's category format
     */
    public String mapCategoryToOurFormat(String wgerCategory) {
        if (wgerCategory == null) {
            return "Full Body";
        }

        return switch (wgerCategory.toLowerCase()) {
            case "arms" -> "Arms";
            case "legs" -> "Legs";
            case "abs" -> "Core";
            case "chest" -> "Chest";
            case "back" -> "Back";
            case "shoulders" -> "Shoulders"; // or create a new "Shoulder" category
            case "calves" -> "Legs";
            case "cardio" -> "Cardio";
            default -> "Full Body";
        };
    }

    /**
     * Estimate calories burned per minute based on exercise type
     * This is a rough estimation - actual values depend on user weight, intensity, etc.
     */
    public Double estimateCaloriesPerMinute(String category) {
        if (category == null) {
            return 5.0; // Default
        }

        return switch (category.toLowerCase()) {
            case "cardio" -> 8.0;
            case "chest", "back", "legs" -> 6.0; // Compound movements
            case "arms", "shoulders" -> 4.5; // Isolation
            case "abs", "core" -> 4.0;
            default -> 5.0;
        };
    }

    /**
     * Strip HTML tags from Wger description
     */
    public String stripHtml(String html) {
        if (html == null) {
            return "";
        }
        return html.replaceAll("<[^>]*>", "").trim();
    }
}