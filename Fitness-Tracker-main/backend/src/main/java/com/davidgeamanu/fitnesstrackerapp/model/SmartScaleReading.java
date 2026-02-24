package com.davidgeamanu.fitnesstrackerapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "smart_scale_readings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmartScaleReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reading_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "weight_kg", nullable = false, precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "body_fat_percentage", precision = 4, scale = 2)
    private BigDecimal bodyFatPercentage;

    @Column(name = "muscle_mass_kg", precision = 5, scale = 2)
    private BigDecimal muscleMassKg;

    @Column(name = "water_percentage", precision = 4, scale = 2)
    private BigDecimal waterPercentage;

    @Column(name = "bone_mass_kg", precision = 4, scale = 2)
    private BigDecimal boneMassKg;

    @Column(name = "reading_timestamp", nullable = false)
    private LocalDateTime readingTimestamp;

    @Column(name = "source", length = 20)
    private String source; // "SIMULATED", "MANUAL", "DEVICE"

    @PrePersist
    protected void onCreate() {
        if (readingTimestamp == null) {
            readingTimestamp = LocalDateTime.now();
        }
        if (source == null) {
            source = "SIMULATED";
        }
    }
}