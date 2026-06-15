package com.media.matrix.common.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("platform_account")
public class PlatformAccount extends BaseEntity {

    private Long userId;

    private String platform;

    private String platformUserId;

    private String platformUsername;

    private String platformNickname;

    private String platformAvatar;

    private String accessToken;

    private String refreshToken;

    private LocalDateTime tokenExpireTime;

    private String scope;

    private Integer status;
}
