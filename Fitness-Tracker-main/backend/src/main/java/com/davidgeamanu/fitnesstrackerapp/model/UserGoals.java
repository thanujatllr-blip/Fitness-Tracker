package com.davidgeamanu.fitnesstrackerapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "user_goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserGoals {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "target_weight_kg", precision = 5, scale = 2)
    private BigDecimal targetWeightKg;

    @Column(name = "daily_calorie_goal", precision = 8, scale = 2)
    private BigDecimal dailyCalorieGoal;

    @Column(name = "weekly_exercise_goal_minutes")
    private Integer weeklyExerciseGoalMinutes;

    @Column(name = "goal_created_date", nullable = false)
    private LocalDate goalCreatedDate;

    @PrePersist
    protected void onCreate() {
        if (goalCreatedDate == null) {
            goalCreatedDate = LocalDate.now();
        }
    }
}