package com.davidgeamanu.fitnesstrackerapp.dto.wger;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Response from Wger API /exerciseinfo endpoint
 *
 * Example response:
 * {
 *   "count": 300,
 *   "next": "https://wger.de/api/v2/exerciseinfo/?page=2",
 *   "previous": null,
 *   "results": [...]
 * }
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WgerExerciseInfoSearchResponse {

    @JsonProperty("count")
    private Integer count;

    @JsonProperty("next")
    private String next;

    @JsonProperty("previous")
    private String previous;

    @JsonProperty("results")
    private List<WgerExerciseInfo> results;
}