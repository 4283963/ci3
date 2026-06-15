package com.media.matrix.common.dto;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class DistributeTaskDTO implements Serializable {

    private Long taskId;

    private Long userId;

    private Long videoId;

    private Long accountId;

    private String platform;

    private String title;

    private String description;

    private String tags;

    private LocalDateTime scheduleTime;

    private Long delay;
}
