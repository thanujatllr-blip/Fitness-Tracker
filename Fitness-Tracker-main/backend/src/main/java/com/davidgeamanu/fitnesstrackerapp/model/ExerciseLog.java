package com.davidgeamanu.fitnesstrackerapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "exercise_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    // NULLABLE - For CARDIO: user provides this. For STRENGTH: auto-calculated from sets/reps
    @Column(name = "duration_minutes")
    private BigDecimal durationMinutes;

    // STRENGTH fields (required for strength exercises)
    @Column(name = "sets", nullable = false)
    private Integer sets; // Default 0 for cardio

    @Column(name = "reps", nullable = false)
    private Integer reps; // Default 0 for cardio

    @Column(name = "weight_used", nullable = false)
    private BigDecimal weightUsed; // Default 0 for cardio

    // Auto-calculated for STRENGTH exercises (active lifting time only)
    @Column(name = "estimated_duration_minutes")
    private BigDecimal estimatedDurationMinutes;

    @Column(name = "calories_burnt", nullable = false)
    private BigDecimal caloriesBurnt;

    @Column(name = "date_performed", nullable = false)
    private LocalDate datePerformed;

    @PrePersist
    protected void onCreate() {
        if (datePerformed == null) {
            datePerformed = LocalDate.now();
        }

        // Auto-calculate calories and duration based on exercise type
        if (exercise != null) {
            String type = exercise.getExerciseType();

            if ("CARDIO".equals(type)) {
                // CARDIO: User provides durationMinutes
                if (durationMinutes != null) {
                    caloriesBurnt = BigDecimal.valueOf(
                            durationMinutes.doubleValue() * exercise.getCaloriesBurntPerMinute()
                    );
                }

                // Sets/reps/weight default to 0 for cardio
                if (sets == null) sets = 0;
                if (reps == null) reps = 0;
                if (weightUsed == null) weightUsed = BigDecimal.ZERO;

                // No estimated duration for cardio
                estimatedDurationMinutes = null;

            } else if ("STRENGTH".equals(type)) {
                // STRENGTH: Calculate duration from sets/reps
                // Formula: (sets * reps * 3 seconds per rep) + (sets * 90 seconds rest)
                // = sets * (reps * 3/60 + 1.5) minutes
                if (sets != null && reps != null && sets > 0 && reps > 0) {
                    double estimatedMinutes = sets * (reps * 0.05 + 1.5);
                    estimatedDurationMinutes = BigDecimal.valueOf(estimatedMinutes);

                    durationMinutes = estimatedDurationMinutes;

                    // Calculate calories based on estimated active time
                    caloriesBurnt = BigDecimal.valueOf(
                            estimatedMinutes * exercise.getCaloriesBurntPerMinute()
                    );
                }
            }
        }

        // Ensure calories is never null
        if (caloriesBurnt == null) {
            caloriesBurnt = BigDecimal.ZERO;
        }
    }
}