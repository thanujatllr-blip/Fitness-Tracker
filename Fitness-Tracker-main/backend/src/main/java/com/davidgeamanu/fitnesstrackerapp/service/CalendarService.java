package com.davidgeamanu.fitnesstrackerapp.service;

import com.davidgeamanu.fitnesstrackerapp.dto.CalendarDayResponse;
import com.davidgeamanu.fitnesstrackerapp.dto.CalendarMonthResponse;
import com.davidgeamanu.fitnesstrackerapp.dto.StreakResponse;

import java.time.LocalDate;

public interface CalendarService {
    CalendarMonthResponse getMonthData(Long userId, int year, int month);

    CalendarDayResponse getDayDetails(Long userId, LocalDate date);

    StreakResponse calculateStreaks(Long userId);
}