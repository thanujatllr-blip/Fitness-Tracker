package com.davidgeamanu.fitnesstrackerapp.repository;

import com.davidgeamanu.fitnesstrackerapp.model.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {

    // Get only user's OWN foods + EXTERNAL foods (NOT other users' foods)
    @Query("SELECT f FROM Food f WHERE f.user.id = :userId OR f.user IS NULL")
    List<Food> findAccessibleByUser(@Param("userId") Long userId);

    // Get only user's own custom foods
    List<Food> findByUser_Id(Long userId);

    // Get only external/system foods
    List<Food> findByUserIsNull();
}