package com.davidgeamanu.fitnesstrackerapp.service;

import com.davidgeamanu.fitnesstrackerapp.model.Food;

import java.util.List;
import java.util.Optional;

public interface FoodService {

    Food saveForUser(Food food, Long userId);

    List<Food> findAllAccessible(Long userId);

    List<Food> search(String query, Long userId);

    Optional<Food> findById(Long id);

    void delete(Long id);
}

