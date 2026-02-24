package com.davidgeamanu.fitnesstrackerapp.service.impl;

import com.davidgeamanu.fitnesstrackerapp.model.Food;
import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.repository.FoodRepository;
import com.davidgeamanu.fitnesstrackerapp.repository.UserRepository;
import com.davidgeamanu.fitnesstrackerapp.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FoodServiceImpl implements FoodService {

    private final FoodRepository foodRepository;
    private final UserRepository userRepository;

    @Override
    public Food saveForUser(Food food, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        food.setUser(user);

        // Check if the food already exists for this user
        boolean exists = foodRepository.findByUser_Id(userId)
                .stream()
                .anyMatch(f -> f.getName().equalsIgnoreCase(food.getName()));

        if (exists) {
            throw new IllegalArgumentException("Food with this name already exists for this user");
        }

        return foodRepository.save(food);
    }

    @Override
    public List<Food> findAllAccessible(Long userId) {
        // Returns only: user's own foods + external foods (NOT other users' foods)
        return foodRepository.findAccessibleByUser(userId);
    }

    @Override
    public List<Food> search(String query, Long userId) {
        // Search only in user's own foods + external foods
        return foodRepository.findAccessibleByUser(userId)
                .stream()
                .filter(f -> f.getName().toLowerCase().contains(query.toLowerCase()))
                .toList();
    }

    @Override
    public Optional<Food> findById(Long id) {
        return foodRepository.findById(id);
    }

    @Override
    public void delete(Long id) {
        foodRepository.deleteById(id);
    }
}