package com.davidgeamanu.fitnesstrackerapp.service.impl;

import com.davidgeamanu.fitnesstrackerapp.model.Exercise;
import com.davidgeamanu.fitnesstrackerapp.model.ExerciseLog;
import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.repository.ExerciseLogRepository;
import com.davidgeamanu.fitnesstrackerapp.repository.ExerciseRepository;
import com.davidgeamanu.fitnesstrackerapp.repository.UserRepository;
import com.davidgeamanu.fitnesstrackerapp.service.ExerciseLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExerciseLogServiceImpl implements ExerciseLogService {

    private final ExerciseLogRepository exerciseLogRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    @Override
    public ExerciseLog createLog(Long exerciseId, Long userId, BigDecimal durationMinutes,
                                 Integer sets, Integer reps, BigDecimal weightUsed) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found"));

        ExerciseLog log = ExerciseLog.builder()
                .user(user)
                .exercise(exercise)
                .durationMinutes(durationMinutes)
                .sets(sets)
                .reps(reps)
                .weightUsed(weightUsed)
                .build();

        return exerciseLogRepository.save(log);
    }

    @Override
    public List<ExerciseLog> findByUserId(Long userId) {
        return exerciseLogRepository.findByUser_IdOrderByDatePerformedDesc(userId);
    }

    @Override
    public List<ExerciseLog> findByUserIdAndDate(Long userId, LocalDate date) {
        // Use date range method with same start and end date
        return exerciseLogRepository.findByUser_IdAndDatePerformedBetweenOrderByDatePerformedDesc(
                userId, date, date
        );
    }

    @Override
    public List<ExerciseLog> findByUserIdAndDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return exerciseLogRepository.findByUser_IdAndDatePerformedBetweenOrderByDatePerformedDesc(
                userId, startDate, endDate
        );
    }

    @Override
    public Optional<ExerciseLog> findById(Long id) {
        return exerciseLogRepository.findById(id);
    }

    @Override
    public void delete(Long id) {
        exerciseLogRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ExerciseLog createExternalExerciseLog(Long userId, String exerciseName, String category,
                                                 String exerciseType, Double caloriesBurntPerMinute,
                                                 BigDecimal durationMinutes, Integer sets, Integer reps,
                                                 BigDecimal weightUsed) {
        // Validate inputs
        if (exerciseName == null || exerciseName.trim().isEmpty()) {
            throw new IllegalArgumentException("Exercise name is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if this external exercise already exists (to avoid duplicates)
        // External exercises have user = null
        Optional<Exercise> existingExercise = exerciseRepository.findByUserIsNull().stream()
                .filter(e -> e.getExerciseName().equalsIgnoreCase(exerciseName.trim()))
                .findFirst();

        Exercise exercise;
        if (existingExercise.isPresent()) {
            // Reuse existing external exercise
            exercise = existingExercise.get();
        } else {
            // Create new external exercise (user = null means it's from Wger)
            exercise = Exercise.builder()
                    .exerciseName(exerciseName.trim())
                    .category(category != null ? category : "Full Body")
                    .exerciseType(exerciseType != null ? exerciseType : "STRENGTH")
                    .caloriesBurntPerMinute(caloriesBurntPerMinute != null ? caloriesBurntPerMinute : 5.0)
                    .user(null)  // null = external exercise from Wger
                    .build();

            exercise = exerciseRepository.save(exercise);
        }

        // Create the exercise log
        ExerciseLog log = ExerciseLog.builder()
                .user(user)
                .exercise(exercise)
                .durationMinutes(durationMinutes)
                .sets(sets != null ? sets : 0)
                .reps(reps != null ? reps : 0)
                .weightUsed(weightUsed != null ? weightUsed : BigDecimal.ZERO)
                .build();

        return exerciseLogRepository.save(log);
    }
}