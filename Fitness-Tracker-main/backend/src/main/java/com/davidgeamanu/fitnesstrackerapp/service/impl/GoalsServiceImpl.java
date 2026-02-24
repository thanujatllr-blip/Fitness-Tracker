package com.davidgeamanu.fitnesstrackerapp.service.impl;

import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.model.UserGoals;
import com.davidgeamanu.fitnesstrackerapp.repository.UserGoalsRepository;
import com.davidgeamanu.fitnesstrackerapp.repository.UserRepository;
import com.davidgeamanu.fitnesstrackerapp.service.GoalsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GoalsServiceImpl implements GoalsService {

    private final UserGoalsRepository goalsRepository;
    private final UserRepository userRepository;

    @Override
    public UserGoals createOrUpdate(Long userId, BigDecimal targetWeightKg,
                                    BigDecimal dailyCalorieGoal, Integer weeklyExerciseGoalMinutes) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Optional<UserGoals> existingGoals = goalsRepository.findByUser_Id(userId);

        UserGoals goals;
        if (existingGoals.isPresent()) {
            // UPDATE existing goals
            goals = existingGoals.get();
            goals.setTargetWeightKg(targetWeightKg);
            goals.setDailyCalorieGoal(dailyCalorieGoal);
            goals.setWeeklyExerciseGoalMinutes(weeklyExerciseGoalMinutes);
        } else {
            // CREATE new goals - ONLY set user, NOT userId
            // @MapsId will automatically set userId from user.id
            goals = UserGoals.builder()
                    .user(user)
                    .targetWeightKg(targetWeightKg)
                    .dailyCalorieGoal(dailyCalorieGoal)
                    .weeklyExerciseGoalMinutes(weeklyExerciseGoalMinutes)
                    .build();
        }

        return goalsRepository.save(goals);
    }

    @Override
    public Optional<UserGoals> getByUserId(Long userId) {
        return goalsRepository.findByUser_Id(userId);
    }
}