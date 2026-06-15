-- 自媒体矩阵视频分发系统 - 数据库初始化脚本

CREATE DATABASE IF NOT EXISTS media_matrix DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE media_matrix;

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码(BCrypt加密)',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(255) COMMENT '头像URL',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
    role TINYINT DEFAULT 0 COMMENT '角色: 0-普通用户, 1-管理员',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    INDEX idx_username(username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 平台账号表
CREATE TABLE IF NOT EXISTS platform_account (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    platform VARCHAR(20) NOT NULL COMMENT '平台: douyin, kuaishou, xiaohongshu',
    platform_user_id VARCHAR(100) COMMENT '平台用户ID',
    platform_username VARCHAR(100) COMMENT '平台用户名',
    platform_nickname VARCHAR(100) COMMENT '平台昵称',
    platform_avatar VARCHAR(500) COMMENT '平台头像',
    access_token TEXT COMMENT '访问令牌',
    refresh_token TEXT COMMENT '刷新令牌',
    token_expire_time DATETIME COMMENT '令牌过期时间',
    scope VARCHAR(500) COMMENT '授权范围',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-有效, 0-无效',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    INDEX idx_user_id(user_id),
    INDEX idx_platform(platform),
    INDEX idx_user_platform(user_id, platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='平台账号表';

-- 视频表
CREATE TABLE IF NOT EXISTS video (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    original_name VARCHAR(255) COMMENT '原始文件名',
    storage_path VARCHAR(500) COMMENT '存储路径',
    file_url VARCHAR(500) COMMENT '文件访问URL',
    file_size BIGINT COMMENT '文件大小(字节)',
    file_type VARCHAR(50) COMMENT '文件类型',
    duration INT COMMENT '视频时长(秒)',
    cover_url VARCHAR(500) COMMENT '封面URL',
    title VARCHAR(200) COMMENT '视频标题',
    description TEXT COMMENT '视频描述',
    tags VARCHAR(500) COMMENT '标签(逗号分隔)',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-可用, 0-不可用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    INDEX idx_user_id(user_id),
    INDEX idx_create_time(create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频表';

-- 分发任务表
CREATE TABLE IF NOT EXISTS distribute_task (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    video_id BIGINT NOT NULL COMMENT '视频ID',
    account_id BIGINT NOT NULL COMMENT '平台账号ID',
    platform VARCHAR(20) NOT NULL COMMENT '平台',
    title VARCHAR(200) COMMENT '发布标题',
    description TEXT COMMENT '发布描述',
    tags VARCHAR(500) COMMENT '发布标签',
    schedule_time DATETIME COMMENT '计划发布时间',
    status TINYINT DEFAULT 0 COMMENT '状态: 0-待发布,1-已入队,2-发布中,3-发布成功,4-发布失败,5-已取消',
    platform_video_id VARCHAR(100) COMMENT '平台返回的视频ID',
    platform_video_url VARCHAR(500) COMMENT '平台视频链接',
    view_count INT DEFAULT 0 COMMENT '播放量',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    share_count INT DEFAULT 0 COMMENT '分享数',
    error_msg TEXT COMMENT '错误信息',
    execute_time DATETIME COMMENT '执行时间',
    complete_time DATETIME COMMENT '完成时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    INDEX idx_user_id(user_id),
    INDEX idx_video_id(video_id),
    INDEX idx_account_id(account_id),
    INDEX idx_status(status),
    INDEX idx_schedule_time(schedule_time),
    INDEX idx_create_time(create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分发任务表';

-- 插入初始管理员用户 (密码: admin123)
INSERT INTO sys_user (username, password, nickname, role, status) VALUES
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', 1, 1);

-- 插入测试用户 (密码: 123456)
INSERT INTO sys_user (username, password, nickname, role, status) VALUES
('test', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '测试用户', 0, 1);
