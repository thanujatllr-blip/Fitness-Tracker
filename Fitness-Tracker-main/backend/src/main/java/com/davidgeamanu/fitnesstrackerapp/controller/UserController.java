// controller/UserController.java
package com.davidgeamanu.fitnesstrackerapp.controller;

import com.davidgeamanu.fitnesstrackerapp.dto.*;
import com.davidgeamanu.fitnesstrackerapp.mapper.UserMapper;
import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.model.UserBiometrics;
import com.davidgeamanu.fitnesstrackerapp.security.CurrentUser;
import com.davidgeamanu.fitnesstrackerapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Returns DTO with authorization check
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id, @CurrentUser User currentUser) {

        // Authorization: Users can only view their own profile
        if (!currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).body("You can only view your own profile");
        }

        Optional<User> user = userService.findById(id);

        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(UserMapper.toDto(user.get()));
    }

    @GetMapping("/check-username")
    public ResponseEntity<Boolean> checkUsername(@RequestParam String username) {
        return ResponseEntity.ok(userService.existsByUsername(username));
    }

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(userService.existsByEmail(email));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User newUser = userService.register(request);

            // Create login request to generate token
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setUsernameOrEmail(newUser.getUsername());
            loginRequest.setPassword(request.getPassword());

            String token = userService.loginAndGenerateToken(loginRequest);

            return ResponseEntity.ok(new LoginResponse(token, UserMapper.toDto(newUser)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.login(request);
            String token = userService.loginAndGenerateToken(request);

            return ResponseEntity.ok(new LoginResponse(token, UserMapper.toDto(user)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@CurrentUser User user) {
        return ResponseEntity.ok(UserMapper.toDto(user));
    }

    /**
     * Update current user's profile
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            @RequestBody UpdateUserRequest request,
            @CurrentUser User currentUser
    ) {
        try {
            User updatedUser = userService.updateProfile(currentUser.getId(), request);
            return ResponseEntity.ok(UserMapper.toDto(updatedUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



}