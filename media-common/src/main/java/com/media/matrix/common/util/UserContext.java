package com.media.matrix.common.util;

import com.media.matrix.common.constant.CommonConstant;

public class UserContext {

    private static final ThreadLocal<Long> USER_ID_HOLDER = new ThreadLocal<>();
    private static final ThreadLocal<String> USERNAME_HOLDER = new ThreadLocal<>();
    private static final ThreadLocal<Integer> ROLE_HOLDER = new ThreadLocal<>();

    public static void setUserId(Long userId) {
        USER_ID_HOLDER.set(userId);
    }

    public static Long getUserId() {
        return USER_ID_HOLDER.get();
    }

    public static void setUsername(String username) {
        USERNAME_HOLDER.set(username);
    }

    public static String getUsername() {
        return USERNAME_HOLDER.get();
    }

    public static void setRole(Integer role) {
        ROLE_HOLDER.set(role);
    }

    public static Integer getRole() {
        return ROLE_HOLDER.get();
    }

    public static void clear() {
        USER_ID_HOLDER.remove();
        USERNAME_HOLDER.remove();
        ROLE_HOLDER.remove();
    }

    public static boolean isAdmin() {
        Integer role = ROLE_HOLDER.get();
        return role != null && role == 1;
    }
}
