package com.davidgeamanu.fitnesstrackerapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "daily_summary")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "summary_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "total_calories_consumed", nullable = false, precision = 8, scale = 2)
    private BigDecimal totalCaloriesConsumed = BigDecimal.ZERO;

    @Column(name = "total_calories_burned", nullable = false, precision = 8, scale = 2)
    private BigDecimal totalCaloriesBurned = BigDecimal.ZERO;

    @Column(name = "net_calories", nullable = false, precision = 8, scale = 2)
    private BigDecimal netCalories = BigDecimal.ZERO;

}