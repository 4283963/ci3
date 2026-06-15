package com.media.matrix.auth.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.media.matrix.auth.mapper.SysUserMapper;
import com.media.matrix.common.constant.CommonConstant;
import com.media.matrix.common.dto.LoginDTO;
import com.media.matrix.common.dto.LoginVO;
import com.media.matrix.common.entity.SysUser;
import com.media.matrix.common.exception.BusinessException;
import com.media.matrix.common.result.ResultCode;
import com.media.matrix.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final SysUserMapper sysUserMapper;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public LoginVO login(LoginDTO loginDTO) {
        SysUser user = sysUserMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, loginDTO.getUsername()));

        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_EXIST);
        }

        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.USER_PASSWORD_ERROR);
        }

        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new BusinessException(ResultCode.USER_DISABLED);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        stringRedisTemplate.opsForValue().set(
                CommonConstant.REDIS_TOKEN_KEY_PREFIX + token,
                user.getId().toString(),
                jwtUtil.getExpire(),
                TimeUnit.SECONDS
        );

        LoginVO loginVO = new LoginVO();
        loginVO.setUserId(user.getId());
        loginVO.setUsername(user.getUsername());
        loginVO.setNickname(user.getNickname());
        loginVO.setAvatar(user.getAvatar());
        loginVO.setRole(user.getRole());
        loginVO.setToken(token);
        loginVO.setExpireTime(System.currentTimeMillis() + jwtUtil.getExpire() * 1000);

        return loginVO;
    }

    @Override
    public void logout(String token) {
        stringRedisTemplate.delete(CommonConstant.REDIS_TOKEN_KEY_PREFIX + token);
    }
}
