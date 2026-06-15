package com.media.matrix.common.dto;

import lombok.Data;

@Data
public class LoginVO {

    private Long userId;

    private String username;

    private String nickname;

    private String avatar;

    private Integer role;

    private String token;

    private Long expireTime;
}
