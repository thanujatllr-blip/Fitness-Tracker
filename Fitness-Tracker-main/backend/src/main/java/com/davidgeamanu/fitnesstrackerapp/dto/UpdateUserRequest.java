package com.davidgeamanu.fitnesstrackerapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @JsonProperty("firstname")
    private String firstName;

    @JsonProperty("lastname")
    private String lastName;

    private String username;
    private String email;

    // Optional: password change
    private String password;
}