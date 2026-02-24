package com.davidgeamanu.fitnesstrackerapp.repository;

import com.davidgeamanu.fitnesstrackerapp.model.FoodLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FoodLogRepository extends JpaRepository<FoodLog, Long> {

    List<FoodLog> findByUser_IdOrderByDateTimeDesc(Long userId);

    List<FoodLog> findByUser_IdAndDateTimeBetween(
            Long userId,
            LocalDateTime start,
            LocalDateTime end
    );

    List<FoodLog> findByUser_IdAndDateTimeBetweenOrderByDateTimeDesc(
            Long userId,
            LocalDateTime start,
            LocalDateTime end
    );

    @Query("SELECT fl FROM FoodLog fl WHERE fl.user.id = :userId AND FUNCTION('DATE', fl.dateTime) = CURRENT_DATE ORDER BY fl.dateTime DESC")
    List<FoodLog> findTodayLogsForUser(@Param("userId") Long userId);
}