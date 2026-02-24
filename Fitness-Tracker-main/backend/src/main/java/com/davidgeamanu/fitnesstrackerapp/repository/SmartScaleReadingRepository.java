package com.davidgeamanu.fitnesstrackerapp.repository;

import com.davidgeamanu.fitnesstrackerapp.model.SmartScaleReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SmartScaleReadingRepository extends JpaRepository<SmartScaleReading, Long> {

    // Get all readings for a user, most recent first
    List<SmartScaleReading> findByUser_IdOrderByReadingTimestampDesc(Long userId);

    // Get readings within a date range
    List<SmartScaleReading> findByUser_IdAndReadingTimestampBetweenOrderByReadingTimestampDesc(
            Long userId, LocalDateTime start, LocalDateTime end);

    // Get the most recent reading for a user
    Optional<SmartScaleReading> findFirstByUser_IdOrderByReadingTimestampDesc(Long userId);

    // Get recent readings (for trend analysis)
    List<SmartScaleReading> findTop10ByUser_IdOrderByReadingTimestampDesc(Long userId);
}