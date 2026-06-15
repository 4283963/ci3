package com.media.matrix.common.constant;

public class CommonConstant {

    public static final String TOKEN_HEADER = "Authorization";

    public static final String TOKEN_PREFIX = "Bearer ";

    public static final String USER_ID = "userId";

    public static final String USERNAME = "username";

    public static final String ROLE = "role";

    public static final String PLATFORM_DOUYIN = "douyin";

    public static final String PLATFORM_KUAISHOU = "kuaishou";

    public static final String PLATFORM_XIAOHONGSHU = "xiaohongshu";

    public static final Integer TASK_STATUS_PENDING = 0;

    public static final Integer TASK_STATUS_QUEUED = 1;

    public static final Integer TASK_STATUS_EXECUTING = 2;

    public static final Integer TASK_STATUS_SUCCESS = 3;

    public static final Integer TASK_STATUS_FAILED = 4;

    public static final Integer TASK_STATUS_CANCELLED = 5;

    public static final String REDIS_DELAY_QUEUE_KEY = "media:distribute:delay:queue";

    public static final String REDIS_LOCK_KEY_PREFIX = "media:distribute:lock:";

    public static final String REDIS_TOKEN_KEY_PREFIX = "media:auth:token:";

    public static final Long DEFAULT_DELAY_SECONDS = 30L;

    public static final String BUCKET_VIDEO = "video";
}
