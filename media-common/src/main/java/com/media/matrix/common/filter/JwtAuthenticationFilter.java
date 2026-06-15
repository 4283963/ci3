package com.media.matrix.common.filter;

import com.media.matrix.common.constant.CommonConstant;
import com.media.matrix.common.result.Result;
import com.media.matrix.common.result.ResultCode;
import com.media.matrix.common.util.JwtUtil;
import com.media.matrix.common.util.UserContext;
import cn.hutool.json.JSONUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader(CommonConstant.TOKEN_HEADER);

        if (authHeader != null && authHeader.startsWith(CommonConstant.TOKEN_PREFIX)) {
            String token = authHeader.substring(CommonConstant.TOKEN_PREFIX.length());

            if (!jwtUtil.validateToken(token)) {
                writeErrorResponse(response, ResultCode.TOKEN_INVALID);
                return;
            }

            String redisKey = CommonConstant.REDIS_TOKEN_KEY_PREFIX + token;
            Boolean hasKey = stringRedisTemplate.hasKey(redisKey);
            if (Boolean.FALSE.equals(hasKey)) {
                writeErrorResponse(response, ResultCode.TOKEN_EXPIRED);
                return;
            }

            Long userId = jwtUtil.getUserIdFromToken(token);
            String username = jwtUtil.getUsernameFromToken(token);
            Integer role = jwtUtil.getRoleFromToken(token);

            UserContext.setUserId(userId);
            UserContext.setUsername(username);
            UserContext.setRole(role);

            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + (role == 1 ? "ADMIN" : "USER"));
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            Collections.singletonList(authority)
                    );
            authentication.setDetails(userId);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            UserContext.clear();
        }
    }

    private void writeErrorResponse(HttpServletResponse response, ResultCode resultCode) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(JSONUtil.toJsonStr(Result.fail(resultCode)));
    }
}
