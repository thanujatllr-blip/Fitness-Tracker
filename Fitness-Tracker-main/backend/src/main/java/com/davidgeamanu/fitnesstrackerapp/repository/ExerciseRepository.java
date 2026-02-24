package com.davidgeamanu.fitnesstrackerapp.repository;

import com.davidgeamanu.fitnesstrackerapp.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    // Get only user's OWN exercises + EXTERNAL exercises (NOT other users' exercises)
    @Query("SELECT e FROM Exercise e WHERE e.user.id = :userId OR e.user IS NULL")
    List<Exercise> findAccessibleByUser(@Param("userId") Long userId);

    // Get only user's own custom exercises
    List<Exercise> findByUser_Id(Long userId);

    // Get only external/system exercises
    List<Exercise> findByUserIsNull();

    // Get exercises by category
    List<Exercise> findByCategory(String category);
}