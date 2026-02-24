package com.davidgeamanu.fitnesstrackerapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class LoginRequest {
    @JsonProperty("username")
    private String usernameOrEmail;
    private String password;
}
