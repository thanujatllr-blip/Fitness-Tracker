package com.davidgeamanu.fitnesstrackerapp.repository;

import com.davidgeamanu.fitnesstrackerapp.model.ExerciseLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExerciseLogRepository extends JpaRepository<ExerciseLog, Long> {

    List<ExerciseLog> findByUser_IdAndDatePerformed(Long userId, LocalDate datePerformed);

    List<ExerciseLog> findByUser_IdOrderByDatePerformedDesc(Long userId);

    List<ExerciseLog> findByUser_IdAndDatePerformedBetweenOrderByDatePerformedDesc(
            Long userId,
            LocalDate start,
            LocalDate end
    );


    // Find distinct workout dates for streak calculation
    @Query("SELECT DISTINCT e.datePerformed FROM ExerciseLog e WHERE e.user.id = :userId ORDER BY e.datePerformed ASC")
    List<LocalDate> findDistinctDatePerformedByUserId(@Param("userId") Long userId);

}
