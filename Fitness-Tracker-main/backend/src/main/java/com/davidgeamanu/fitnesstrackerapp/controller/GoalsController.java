package com.davidgeamanu.fitnesstrackerapp.controller;

import com.davidgeamanu.fitnesstrackerapp.dto.GoalsRequest;
import com.davidgeamanu.fitnesstrackerapp.dto.GoalsResponse;
import com.davidgeamanu.fitnesstrackerapp.mapper.GoalsMapper;
import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.model.UserGoals;
import com.davidgeamanu.fitnesstrackerapp.security.CurrentUser;
import com.davidgeamanu.fitnesstrackerapp.service.GoalsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalsController {

    private final GoalsService goalsService;

    @PostMapping
    public ResponseEntity<?> createOrUpdateGoals(
            @RequestBody GoalsRequest request,
            @CurrentUser User user
    ) {
        try {
            UserGoals goals = goalsService.createOrUpdate(
                    user.getId(),
                    request.getTargetWeightKg(),
                    request.getDailyCalorieGoal(),
                    request.getWeeklyExerciseGoalMinutes()
            );
            return ResponseEntity.ok(GoalsMapper.toDto(goals));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getGoals(@CurrentUser User user) {
        var goalsOpt = goalsService.getByUserId(user.getId());

        if (goalsOpt.isEmpty()) {
            return ResponseEntity.status(404).body("No goals set");
        }

        return ResponseEntity.ok(GoalsMapper.toDto(goalsOpt.get()));
    }
}