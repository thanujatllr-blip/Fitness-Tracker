package com.davidgeamanu.fitnesstrackerapp.service;

import com.davidgeamanu.fitnesstrackerapp.dto.*;
import com.davidgeamanu.fitnesstrackerapp.model.User;
import java.util.Optional;

public interface UserService {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findById(Long id);

    User register(RegisterRequest request);

    User login(LoginRequest request);

    String loginAndGenerateToken(LoginRequest request);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    User save(User user);

    User updateProfile(Long userId, UpdateUserRequest request);

}
