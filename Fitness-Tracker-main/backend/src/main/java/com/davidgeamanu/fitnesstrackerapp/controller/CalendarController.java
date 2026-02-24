package com.davidgeamanu.fitnesstrackerapp.controller;

import com.davidgeamanu.fitnesstrackerapp.dto.CalendarDayResponse;
import com.davidgeamanu.fitnesstrackerapp.dto.CalendarMonthResponse;
import com.davidgeamanu.fitnesstrackerapp.dto.StreakResponse;
import com.davidgeamanu.fitnesstrackerapp.model.User;
import com.davidgeamanu.fitnesstrackerapp.security.CurrentUser;
import com.davidgeamanu.fitnesstrackerapp.service.CalendarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
@Slf4j
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/month/{year}/{month}")
    public ResponseEntity<CalendarMonthResponse> getMonthData(
            @PathVariable int year,
            @PathVariable int month,
            @CurrentUser User user
    ) {
        log.info("Calendar month request: user={}, year={}, month={}", user.getId(), year, month);

        if (month < 1 || month > 12) {
            return ResponseEntity.badRequest().build();
        }

        CalendarMonthResponse response = calendarService.getMonthData(user.getId(), year, month);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/day/{date}")
    public ResponseEntity<CalendarDayResponse> getDayDetails(
            @PathVariable String date,
            @CurrentUser User user
    ) {
        log.info("Calendar day request: user={}, date={}", user.getId(), date);

        try {
            LocalDate localDate = LocalDate.parse(date);
            CalendarDayResponse response = calendarService.getDayDetails(user.getId(), localDate);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Invalid date format: {}", date, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/streaks")
    public ResponseEntity<StreakResponse> getStreaks(@CurrentUser User user) {
        log.info("Calendar streaks request: user={}", user.getId());

        StreakResponse response = calendarService.calculateStreaks(user.getId());
        return ResponseEntity.ok(response);
    }
}