package com.davidgeamanu.fitnesstrackerapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "calorie_intake_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_id", nullable = false)
    private Food food;

    @Column(name = "quantity_grams", nullable = false)
    private BigDecimal quantityGrams;

    @Column(name = "date_time")
    private LocalDateTime dateTime;

    @Column(name = "calories_consumed")
    private BigDecimal caloriesConsumed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @PrePersist
    protected void onCreate() {
        if (dateTime == null) {
            dateTime = LocalDateTime.now();
        }
        // Calculate calories based on quantity
        if (food != null && caloriesConsumed == null) {
            double cals = (food.getCaloriesPer100g() * quantityGrams.doubleValue()) / 100.0;
            caloriesConsumed = BigDecimal.valueOf(cals);
        }
    }
}