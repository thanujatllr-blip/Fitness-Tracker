package com.davidgeamanu.fitnesstrackerapp.repository;

import com.davidgeamanu.fitnesstrackerapp.model.UserBiometrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBiometricsRepository extends JpaRepository<UserBiometrics, Long> {

    List<UserBiometrics> findByUser_IdOrderByLastUpdatedDesc(Long userId);

    Optional<UserBiometrics> findFirstByUser_IdOrderByLastUpdatedDesc(Long userId);

    /**
     * Find the most recent biometrics entry for a user
     * Used to determine current weight for weight goal calculations
     */
    Optional<UserBiometrics> findTopByUser_IdOrderByLastUpdatedDesc(Long userId);
}