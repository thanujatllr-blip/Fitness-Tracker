package com.davidgeamanu.fitnesstrackerapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "exercises")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exercise_id")
    private Long id;

    @Column(name = "exercise_name", nullable = false)
    private String exerciseName;

    // Body part targeting: Chest, Arms, Back, Legs, Core, Full Body, Cardio, Shoulders
    @Column(name = "category", nullable = false)
    private String category;

    // CARDIO or STRENGTH (determines UI behavior)
    @Column(name = "exercise_type", nullable = false)
    private String exerciseType; // CARDIO or STRENGTH

    @Column(name = "calories_burnt_per_minute", nullable = false)
    private Double caloriesBurntPerMinute;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}