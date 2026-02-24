package com.davidgeamanu.fitnesstrackerapp.controller;

import com.davidgeamanu.fitnesstrackerapp.dto.ExerciseCreateRequest;
import com.davidgeamanu.fitnesstrackerapp.dto.ExerciseResponse;
import com.davidgeamanu.fitnesstrackerapp.mapper.ExerciseMapper;
import com.davidgeamanu.fitnesstrackerapp.model.Exercise;
import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.repository.ExerciseRepository;
import com.davidgeamanu.fitnesstrackerapp.security.CurrentUser;
import com.davidgeamanu.fitnesstrackerapp.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.davidgeamanu.fitnesstrackerapp.dto.wger.WgerExercise;
import com.davidgeamanu.fitnesstrackerapp.service.WgerExerciseService;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
@Slf4j
public class ExerciseController {

    private final ExerciseService exerciseService;
    private final ExerciseRepository exerciseRepository;
    private final WgerExerciseService wgerExerciseService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getExercise(@PathVariable Long id) {
        Optional<Exercise> exerciseOpt = exerciseService.findById(id);

        if (exerciseOpt.isPresent()) {
            ExerciseResponse dto = ExerciseMapper.toDto(exerciseOpt.get());
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.status(404).body("Exercise not found");
        }
    }

    @GetMapping
    public ResponseEntity<List<ExerciseResponse>> getExercises(@CurrentUser User user) {
        return ResponseEntity.ok(
                exerciseService.findAllAccessible(user.getId())
                        .stream()
                        .map(ExerciseMapper::toDto)
                        .toList()
        );
    }

    // Get only EXTERNAL exercises (for External tab in UI)
    @GetMapping("/external")
    public ResponseEntity<List<ExerciseResponse>> getExternalExercises() {
        return ResponseEntity.ok(
                exerciseRepository.findByUserIsNull()
                        .stream()
                        .map(ExerciseMapper::toDto)
                        .toList()
        );
    }

    // Get only PERSONAL/CUSTOM exercises (for Personal tab in UI)
    @GetMapping("/personal")
    public ResponseEntity<List<ExerciseResponse>> getPersonalExercises(@CurrentUser User user) {
        return ResponseEntity.ok(
                exerciseRepository.findByUser_Id(user.getId())
                        .stream()
                        .map(ExerciseMapper::toDto)
                        .toList()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<ExerciseResponse>> searchExercises(
            @RequestParam String q,
            @CurrentUser User user
    ) {
        return ResponseEntity.ok(
                exerciseService.search(q, user.getId())
                        .stream()
                        .map(ExerciseMapper::toDto)
                        .toList()
        );
    }

    // Search only in EXTERNAL exercises
    @GetMapping("/search/external")
    public ResponseEntity<List<ExerciseResponse>> searchExternalExercises(@RequestParam String q) {
        return ResponseEntity.ok(
                exerciseRepository.findByUserIsNull()
                        .stream()
                        .filter(e -> e.getExerciseName().toLowerCase().contains(q.toLowerCase()))
                        .map(ExerciseMapper::toDto)
                        .toList()
        );
    }

    // Search only in PERSONAL exercises
    @GetMapping("/search/personal")
    public ResponseEntity<List<ExerciseResponse>> searchPersonalExercises(
            @RequestParam String q,
            @CurrentUser User user
    ) {
        return ResponseEntity.ok(
                exerciseRepository.findByUser_Id(user.getId())
                        .stream()
                        .filter(e -> e.getExerciseName().toLowerCase().contains(q.toLowerCase()))
                        .map(ExerciseMapper::toDto)
                        .toList()
        );
    }

    @PostMapping
    public ResponseEntity<?> createExercise(
            @RequestBody ExerciseCreateRequest request,
            @CurrentUser User user
    ) {
        try {
            Exercise exercise = ExerciseMapper.toEntity(request);
            Exercise saved = exerciseService.saveForUser(exercise, user.getId());
            return ResponseEntity.ok(ExerciseMapper.toDto(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExercise(@PathVariable Long id, @CurrentUser User user) {
        Optional<Exercise> exerciseOpt = exerciseService.findById(id);

        if (exerciseOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Exercise not found");
        }

        Exercise exercise = exerciseOpt.get();

        // Authorization: Users can only delete their own exercises
        if (exercise.getUser() == null || !exercise.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("You can only delete your own exercises");
        }

        exerciseService.delete(id);
        return ResponseEntity.ok("Deleted");
    }

    /**
     * Search Wger Workout Manager database
     * GET /api/exercises/search/wger?q=bench+press&limit=20
     *
     * Returns exercises with null ID (indicating they're from Wger, not in our database)
     */
    @GetMapping("/search/wger")
    public ResponseEntity<List<ExerciseResponse>> searchWgerExercises(
            @RequestParam String q,
            @RequestParam(required = false, defaultValue = "20") Integer limit
    ) {
        log.info("Wger search endpoint called: q='{}', limit={}", q, limit);

        try {
            List<WgerExercise> wgerExercises = wgerExerciseService.searchExercises(q, "2", limit);

            log.info("Received {} exercises from Wger service", wgerExercises.size());

            // Convert Wger exercises to our ExerciseResponse DTO
            List<ExerciseResponse> exercises = wgerExercises.stream()
                    .map(wgerExercise -> {
                        ExerciseResponse exercise = new ExerciseResponse();

                        // Null ID indicates external Wger exercise
                        exercise.setId(null);

                        exercise.setName(wgerExercise.getName());

                        // Map Wger category to our format
                        String categoryName = wgerExercise.getCategory() != null
                                ? wgerExercise.getCategory().getName()
                                : "Full Body";
                        exercise.setCategory(wgerExerciseService.mapCategoryToOurFormat(categoryName));

                        // Determine exercise type based on category
                        exercise.setExerciseType(determineExerciseType(categoryName));

                        // Estimate calories
                        exercise.setCaloriesBurntPerMinute(
                                wgerExerciseService.estimateCaloriesPerMinute(categoryName)
                        );

                        exercise.setSource("EXTERNAL");

                        return exercise;
                    })
                    .toList();

            log.info("Returning {} converted exercises to frontend", exercises.size());
            return ResponseEntity.ok(exercises);

        } catch (Exception e) {
            log.error("Error in Wger search endpoint", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get all Wger exercises (no search filter)
     * Useful for browsing/exploring exercises
     */
    @GetMapping("/wger/all")
    public ResponseEntity<List<ExerciseResponse>> getAllWgerExercises(
            @RequestParam(required = false, defaultValue = "50") Integer limit
    ) {
        log.info("Fetching all Wger exercises (limit: {})", limit);

        try {
            List<WgerExercise> wgerExercises = wgerExerciseService.getAllExercises("2", limit);

            List<ExerciseResponse> exercises = wgerExercises.stream()
                    .map(wgerExercise -> {
                        ExerciseResponse exercise = new ExerciseResponse();
                        exercise.setId(null);
                        exercise.setName(wgerExercise.getName());

                        String categoryName = wgerExercise.getCategory() != null
                                ? wgerExercise.getCategory().getName()
                                : "Full Body";
                        exercise.setCategory(wgerExerciseService.mapCategoryToOurFormat(categoryName));
                        exercise.setExerciseType(determineExerciseType(categoryName));
                        exercise.setCaloriesBurntPerMinute(
                                wgerExerciseService.estimateCaloriesPerMinute(categoryName)
                        );
                        exercise.setSource("EXTERNAL");

                        return exercise;
                    })
                    .toList();

            return ResponseEntity.ok(exercises);

        } catch (Exception e) {
            log.error("Error fetching all Wger exercises", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Helper: Determine exercise type from category
     * Only returns CARDIO or STRENGTH (matching database constraints)
     */
    private String determineExerciseType(String category) {
        if (category == null) {
            return "STRENGTH";
        }

        return switch (category.toLowerCase()) {
            case "cardio" -> "CARDIO";
            // Everything else is STRENGTH (including Chest, Arms, Back, Legs, Core, Full Body, Shoulders)
            default -> "STRENGTH";
        };
    }

}