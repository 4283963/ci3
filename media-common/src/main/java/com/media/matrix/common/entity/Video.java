package com.media.matrix.common.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("video")
public class Video extends BaseEntity {

    private Long userId;

    private String originalName;

    private String storagePath;

    private String fileUrl;

    private Long fileSize;

    private String fileType;

    private Integer duration;

    private String coverUrl;

    private String title;

    private String description;

    private String tags;

    private Integer status;
}
