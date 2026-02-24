package com.davidgeamanu.fitnesstrackerapp.mapper;

import com.davidgeamanu.fitnesstrackerapp.dto.ExerciseLogResponse;
import com.davidgeamanu.fitnesstrackerapp.model.ExerciseLog;

public class ExerciseLogMapper {

    public static ExerciseLogResponse toDto(ExerciseLog log) {
        ExerciseLogResponse dto = new ExerciseLogResponse();
        dto.setId(log.getId());
        dto.setExerciseName(log.getExercise().getExerciseName());
        dto.setCategory(log.getExercise().getCategory());
        dto.setSource(log.getExercise().getUser() == null ? "EXTERNAL" : "PERSONAL");
        dto.setDurationMinutes(log.getDurationMinutes());
        dto.setCaloriesBurnt(log.getCaloriesBurnt());
        dto.setSets(log.getSets());
        dto.setReps(log.getReps());
        dto.setWeightUsed(log.getWeightUsed());
        dto.setDatePerformed(log.getDatePerformed().toString());
        return dto;
    }
}