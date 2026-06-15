package com.media.matrix.common.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("distribute_task")
public class DistributeTask extends BaseEntity {

    private Long userId;

    private Long videoId;

    private Long accountId;

    private String platform;

    private String title;

    private String description;

    private String tags;

    private LocalDateTime scheduleTime;

    private Integer status;

    private String platformVideoId;

    private String platformVideoUrl;

    private Integer viewCount;

    private Integer likeCount;

    private Integer commentCount;

    private Integer shareCount;

    private String errorMsg;

    private LocalDateTime executeTime;

    private LocalDateTime completeTime;
}
