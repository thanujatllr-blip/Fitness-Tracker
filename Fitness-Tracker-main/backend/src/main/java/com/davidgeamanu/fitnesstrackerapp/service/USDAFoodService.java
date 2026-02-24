package com.davidgeamanu.fitnesstrackerapp.service;

import com.davidgeamanu.fitnesstrackerapp.dto.usda.USDAFood;
import com.davidgeamanu.fitnesstrackerapp.dto.usda.USDAFoodSearchResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.reactive.function.client.ExchangeStrategies;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class USDAFoodService {

    @Value("${usda.api.key}")
    private String apiKey;

    @Value("${usda.api.base-url:https://api.nal.usda.gov/fdc/v1}")
    private String baseUrl;

    // Use lazy initialization to avoid consuming response twice
    /*
    private WebClient getWebClient() {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }
    */
    private WebClient getWebClient() {
        final int size = 16 * 1024 * 1024; // 16MB
        final ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(codecs -> codecs.defaultCodecs().maxInMemorySize(size))
                .build();

        return WebClient.builder()
                .baseUrl(baseUrl)
                .exchangeStrategies(strategies) // Apply the strategies
                .build();
    }


    /**
     * Search for foods in USDA database
     */
    public List<USDAFood> searchFoods(String query, Integer pageSize) {
        if (query == null || query.trim().isEmpty()) {
            log.warn("Empty search query provided");
            return List.of();
        }

        try {
            log.info("Searching USDA API for: {} (pageSize: {})", query, pageSize);

            USDAFoodSearchResponse response = getWebClient()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/foods/search")
                            .queryParam("query", query)
                            .queryParam("api_key", apiKey)
                            .queryParam("pageSize", pageSize != null ? pageSize : 20)
                            .queryParam("dataType", "Foundation,SR Legacy")
                            .build())
                    .retrieve()
                    .bodyToMono(USDAFoodSearchResponse.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();

            if (response != null && response.getFoods() != null) {
                log.info("Successfully found {} foods for query: {}", response.getFoods().size(), query);

                // Log first food for debugging
                if (!response.getFoods().isEmpty()) {
                    USDAFood firstFood = response.getFoods().get(0);
                    log.debug("First food: fdcId={}, description={}, nutrients={}",
                            firstFood.getFdcId(),
                            firstFood.getDescription(),
                            firstFood.getFoodNutrients() != null ? firstFood.getFoodNutrients().size() : 0);
                }

                return response.getFoods();
            } else {
                log.warn("Response or foods list is null for query: {}", query);
                return List.of();
            }

        } catch (WebClientResponseException e) {
            log.error("HTTP error searching USDA API for query '{}': Status={}, Body={}",
                    query, e.getStatusCode(), e.getResponseBodyAsString());
            return List.of();
        } catch (Exception e) {
            log.error("Error searching USDA API for query '{}': {} - {}",
                    query, e.getClass().getSimpleName(), e.getMessage());
            return List.of();
        }
    }

    /**
     * Get detailed information about a specific food
     */
    public Optional<USDAFood> getFoodById(Long fdcId) {
        try {
            log.info("Fetching USDA food details for fdcId: {}", fdcId);

            USDAFood food = getWebClient()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/food/{fdcId}")
                            .queryParam("api_key", apiKey)
                            .build(fdcId))
                    .retrieve()
                    .bodyToMono(USDAFood.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();

            return Optional.ofNullable(food);

        } catch (Exception e) {
            log.error("Error fetching USDA food {}: {}", fdcId, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Extract calories from USDA food nutrients
     * Nutrient ID 1008 = Energy (kcal)
     */
    public Integer extractCalories(USDAFood food) {
        if (food == null || food.getFoodNutrients() == null) {
            return 0;
        }
        return food.getFoodNutrients().stream()
                .filter(n -> n.getNutrientId() != null && n.getNutrientId() == 1008)
                .findFirst()
                .map(n -> n.getValue() != null ? n.getValue().intValue() : 0)
                .orElse(0);
    }

    /**
     * Extract protein from USDA food nutrients
     * Nutrient ID 1003 = Protein
     */
    public Float extractProtein(USDAFood food) {
        if (food == null || food.getFoodNutrients() == null) {
            return 0f;
        }
        return food.getFoodNutrients().stream()
                .filter(n -> n.getNutrientId() != null && n.getNutrientId() == 1003)
                .findFirst()
                .map(n -> n.getValue() != null ? n.getValue().floatValue() : 0f)
                .orElse(0f);
    }

    /**
     * Extract fats from USDA food nutrients
     * Nutrient ID 1004 = Total lipid (fat)
     */
    public Float extractFats(USDAFood food) {
        if (food == null || food.getFoodNutrients() == null) {
            return 0f;
        }
        return food.getFoodNutrients().stream()
                .filter(n -> n.getNutrientId() != null && n.getNutrientId() == 1004)
                .findFirst()
                .map(n -> n.getValue() != null ? n.getValue().floatValue() : 0f)
                .orElse(0f);
    }

    /**
     * Extract carbohydrates from USDA food nutrients
     * Nutrient ID 1005 = Carbohydrate, by difference
     */
    public Float extractCarbs(USDAFood food) {
        if (food == null || food.getFoodNutrients() == null) {
            return 0f;
        }
        return food.getFoodNutrients().stream()
                .filter(n -> n.getNutrientId() != null && n.getNutrientId() == 1005)
                .findFirst()
                .map(n -> n.getValue() != null ? n.getValue().floatValue() : 0f)
                .orElse(0f);
    }
}