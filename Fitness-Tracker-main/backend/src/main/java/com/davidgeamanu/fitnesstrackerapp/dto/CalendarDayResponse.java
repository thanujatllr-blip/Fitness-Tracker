package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;

import java.util.List;

@Data
public class CalendarDayResponse {
    private String date;
    private Boolean workout;
    private Integer calories;
    private Integer calorieGoal;
    private Integer exerciseMinutes;
    private Integer exerciseGoal;
    private List<String> meals;
    private List<String> exercises;
}