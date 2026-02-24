package com.davidgeamanu.fitnesstrackerapp.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class StreakResponse {
    private StreakInfo currentStreak;
    private StreakInfo longestStreak;

    @Data
    public static class StreakInfo {
        private Integer days;
        private LocalDate startDate;
        private LocalDate endDate;
        private Set<String> dates;
    }
}