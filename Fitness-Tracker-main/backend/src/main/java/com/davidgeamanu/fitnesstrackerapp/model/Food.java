package com.davidgeamanu.fitnesstrackerapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "food", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "food_name"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "food_id")
    private Long id;

    @Column(name = "food_name", nullable = false, columnDefinition = "TEXT")
    private String name;

    @Column(name = "calories_per_100g", nullable = false)
    private Integer caloriesPer100g;

    @Column(name = "protein")
    private Float protein;

    @Column(name = "fats")
    private Float fats;

    @Column(name = "carbohydrates")
    private Float carbs;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

}