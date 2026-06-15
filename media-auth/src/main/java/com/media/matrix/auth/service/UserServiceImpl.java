package com.media.matrix.auth.service;

import com.media.matrix.auth.mapper.SysUserMapper;
import com.media.matrix.common.entity.SysUser;
import com.media.matrix.common.exception.BusinessException;
import com.media.matrix.common.result.ResultCode;
import com.media.matrix.common.util.UserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final SysUserMapper sysUserMapper;

    @Override
    public SysUser getUserInfo() {
        Long userId = UserContext.getUserId();
        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_EXIST);
        }
        user.setPassword(null);
        return user;
    }

    @Override
    public List<SysUser> listUsers() {
        List<SysUser> users = sysUserMapper.selectList(null);
        users.forEach(user -> user.setPassword(null));
        return users;
    }
}
