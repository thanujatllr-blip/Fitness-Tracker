package com.davidgeamanu.fitnesstrackerapp.controller;

import com.davidgeamanu.fitnesstrackerapp.dto.FoodCreateRequest;
import com.davidgeamanu.fitnesstrackerapp.dto.FoodResponse;
import com.davidgeamanu.fitnesstrackerapp.mapper.FoodMapper;
import com.davidgeamanu.fitnesstrackerapp.model.Food;
import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.repository.FoodRepository;
import com.davidgeamanu.fitnesstrackerapp.security.CurrentUser;
import com.davidgeamanu.fitnesstrackerapp.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.davidgeamanu.fitnesstrackerapp.dto.usda.USDAFood;
import com.davidgeamanu.fitnesstrackerapp.service.USDAFoodService;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
@Slf4j
public class FoodController {

    private final FoodService foodService;
    private final FoodRepository foodRepository;
    private final USDAFoodService usdaFoodService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getFood(@PathVariable Long id) {
        Optional<Food> foodOpt = foodService.findById(id);

        if (foodOpt.isPresent()) {
            FoodResponse dto = FoodMapper.toDto(foodOpt.get());
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.status(404).body("Food not found");
        }
    }

    @GetMapping
    public ResponseEntity<List<FoodResponse>> getFoods(@CurrentUser User user) {
        return ResponseEntity.ok(
                foodService.findAllAccessible(user.getId())
                        .stream()
                        .map(FoodMapper::toDto)
                        .toList()
        );
    }

    // Get external foods for External tab
    @GetMapping("/external")
    public ResponseEntity<List<FoodResponse>> getExternalFoods() {
        return ResponseEntity.ok(
                foodRepository.findByUserIsNull()
                        .stream()
                        .map(FoodMapper::toDto)
                        .toList()
        );
    }

    // Get only PERSONAL/CUSTOM foods (for Personal tab in UI)
    @GetMapping("/personal")
    public ResponseEntity<List<FoodResponse>> getPersonalFoods(@CurrentUser User user) {
        return ResponseEntity.ok(
                foodRepository.findByUser_Id(user.getId())
                        .stream()
                        .map(FoodMapper::toDto)
                        .toList()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<FoodResponse>> searchFoods(
            @RequestParam String q,
            @CurrentUser User user
    ) {
        return ResponseEntity.ok(
                foodService.search(q, user.getId())
                        .stream()
                        .map(FoodMapper::toDto)
                        .toList()
        );
    }

    // Search only in EXTERNAL foods
    @GetMapping("/search/external")
    public ResponseEntity<List<FoodResponse>> searchExternalFoods(@RequestParam String q) {
        return ResponseEntity.ok(
                foodRepository.findByUserIsNull()
                        .stream()
                        .filter(f -> f.getName().toLowerCase().contains(q.toLowerCase()))
                        .map(FoodMapper::toDto)
                        .toList()
        );
    }

    // Search only in PERSONAL foods
    @GetMapping("/search/personal")
    public ResponseEntity<List<FoodResponse>> searchPersonalFoods(
            @RequestParam String q,
            @CurrentUser User user
    ) {
        return ResponseEntity.ok(
                foodRepository.findByUser_Id(user.getId())
                        .stream()
                        .filter(f -> f.getName().toLowerCase().contains(q.toLowerCase()))
                        .map(FoodMapper::toDto)
                        .toList()
        );
    }

    @PostMapping
    public ResponseEntity<?> createFood(
            @RequestBody FoodCreateRequest request,
            @CurrentUser User user
    ) {
        try {
            Food food = FoodMapper.toEntity(request);
            Food saved = foodService.saveForUser(food, user.getId());
            return ResponseEntity.ok(FoodMapper.toDto(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFood(@PathVariable Long id, @CurrentUser User user) {
        Optional<Food> foodOpt = foodService.findById(id);

        if (foodOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Food not found");
        }

        Food food = foodOpt.get();

        // Authorization: Users can only delete their own foods
        if (food.getUser() == null || !food.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("You can only delete your own foods");
        }

        foodService.delete(id);
        return ResponseEntity.ok("Deleted");
    }

    /**
     * Search USDA FoodData Central database
     * GET /api/foods/search/usda?q=chicken&limit=20
     *
     * Returns foods with null ID (indicating they're from USDA, not in our database)
     */
    @GetMapping("/search/usda")
    public ResponseEntity<List<FoodResponse>> searchUSDAFoods(
            @RequestParam String q,
            @RequestParam(required = false, defaultValue = "20") Integer limit
    ) {
        log.info("USDA search endpoint called: q='{}', limit={}", q, limit);

        try {
            List<USDAFood> usdaFoods = usdaFoodService.searchFoods(q, limit);

            log.info("Received {} foods from USDA service", usdaFoods.size());

            // Convert USDA foods to our FoodResponse DTO
            List<FoodResponse> foods = usdaFoods.stream()
                    .map(usdaFood -> {
                        FoodResponse food = new FoodResponse();

                        // Null ID indicates external USDA food
                        food.setId(null);

                        food.setName(usdaFood.getDescription());
                        food.setCalories(usdaFoodService.extractCalories(usdaFood));
                        food.setProtein(usdaFoodService.extractProtein(usdaFood));
                        food.setFats(usdaFoodService.extractFats(usdaFood));
                        food.setCarbs(usdaFoodService.extractCarbs(usdaFood));
                        food.setSource("EXTERNAL");

                        return food;
                    })
                    .toList();

            log.info("Returning {} converted foods to frontend", foods.size());
            return ResponseEntity.ok(foods);

        } catch (Exception e) {
            log.error("Error in USDA search endpoint", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}