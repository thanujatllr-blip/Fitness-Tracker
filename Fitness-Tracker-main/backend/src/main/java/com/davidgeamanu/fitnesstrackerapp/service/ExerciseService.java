package com.davidgeamanu.fitnesstrackerapp.service;

import com.davidgeamanu.fitnesstrackerapp.model.Exercise;

import java.util.List;
import java.util.Optional;

public interface ExerciseService {

    Exercise saveForUser(Exercise exercise, Long userId);

    List<Exercise> findAllAccessible(Long userId);

    List<Exercise> search(String query, Long userId);

    Optional<Exercise> findById(Long id);

    void delete(Long id);
}