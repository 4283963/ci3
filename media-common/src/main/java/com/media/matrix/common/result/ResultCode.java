package com.media.matrix.common.result;

import lombok.Getter;

@Getter
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    FAIL(500, "操作失败"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),

    USER_NOT_EXIST(1001, "用户不存在"),
    USER_PASSWORD_ERROR(1002, "密码错误"),
    USER_DISABLED(1003, "用户已禁用"),
    TOKEN_INVALID(1004, "Token无效"),
    TOKEN_EXPIRED(1005, "Token已过期"),

    PLATFORM_ACCOUNT_NOT_EXIST(2001, "平台账号不存在"),
    PLATFORM_ACCOUNT_EXPIRED(2002, "平台授权已过期"),
    PLATFORM_OAUTH_ERROR(2003, "平台授权失败"),

    VIDEO_UPLOAD_ERROR(3001, "视频上传失败"),
    VIDEO_NOT_EXIST(3002, "视频不存在"),

    TASK_CREATE_ERROR(4001, "任务创建失败"),
    TASK_NOT_EXIST(4002, "任务不存在"),
    TASK_EXECUTE_ERROR(4003, "任务执行失败");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
