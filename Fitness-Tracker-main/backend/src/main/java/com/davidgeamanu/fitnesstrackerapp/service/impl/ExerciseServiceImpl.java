package com.davidgeamanu.fitnesstrackerapp.service.impl;

import com.davidgeamanu.fitnesstrackerapp.model.Exercise;
import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.repository.ExerciseRepository;
import com.davidgeamanu.fitnesstrackerapp.repository.UserRepository;
import com.davidgeamanu.fitnesstrackerapp.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExerciseServiceImpl implements ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    @Override
    public Exercise saveForUser(Exercise exercise, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        exercise.setUser(user);

        // Ensure exercise_type is set (required field)
        if (exercise.getExerciseType() == null || exercise.getExerciseType().isEmpty()) {
            // Auto-infer from category if not provided
            exercise.setExerciseType(inferTypeFromCategory(exercise.getCategory()));
        }

        // Check if the exercise already exists for this user
        boolean exists = exerciseRepository.findByUser_Id(userId)
                .stream()
                .anyMatch(e -> e.getExerciseName().equalsIgnoreCase(exercise.getExerciseName()));

        if (exists) {
            throw new IllegalArgumentException("Exercise with this name already exists for this user");
        }

        return exerciseRepository.save(exercise);
    }

    @Override
    public List<Exercise> findAllAccessible(Long userId) {
        // Returns only: user's own exercises + external exercises (NOT other users' exercises)
        return exerciseRepository.findAccessibleByUser(userId);
    }

    @Override
    public List<Exercise> search(String query, Long userId) {
        // Search only in user's own exercises + external exercises
        return exerciseRepository.findAccessibleByUser(userId)
                .stream()
                .filter(e -> e.getExerciseName().toLowerCase().contains(query.toLowerCase()))
                .toList();
    }

    @Override
    public Optional<Exercise> findById(Long id) {
        return exerciseRepository.findById(id);
    }

    @Override
    public void delete(Long id) {
        exerciseRepository.deleteById(id);
    }

    /**
     * Auto-infer exercise type from category
     * Only returns CARDIO or STRENGTH (removed HYBRID/FLEXIBILITY)
     */
    private String inferTypeFromCategory(String category) {
        if (category == null) return "STRENGTH";

        return switch (category.toUpperCase()) {
            case "CARDIO" -> "CARDIO";
            // All body-part categories default to STRENGTH
            default -> "STRENGTH"; // Chest, Arms, Back, Legs, Core, Full Body, Shoulders
        };
    }
}