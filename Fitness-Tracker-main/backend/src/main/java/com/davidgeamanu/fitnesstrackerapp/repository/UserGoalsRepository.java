package com.davidgeamanu.fitnesstrackerapp.repository;

import com.davidgeamanu.fitnesstrackerapp.model.UserGoals;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserGoalsRepository extends JpaRepository<UserGoals, Long> {

    Optional<UserGoals> findByUser_Id(Long userId);
}
