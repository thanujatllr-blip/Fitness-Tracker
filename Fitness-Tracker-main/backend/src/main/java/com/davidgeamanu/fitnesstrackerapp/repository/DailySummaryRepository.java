package com.davidgeamanu.fitnesstrackerapp.repository;

import com.davidgeamanu.fitnesstrackerapp.model.DailySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailySummaryRepository extends JpaRepository<DailySummary, Long> {

    Optional<DailySummary> findByUser_IdAndDate(Long userId, LocalDate date);

    List<DailySummary> findByUser_IdAndDateBetweenOrderByDateDesc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<DailySummary> findByUser_IdOrderByDateDesc(Long userId);
}