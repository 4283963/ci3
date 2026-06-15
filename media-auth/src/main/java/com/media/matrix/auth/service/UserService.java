package com.media.matrix.auth.service;

import com.media.matrix.common.entity.SysUser;

import java.util.List;

public interface UserService {

    SysUser getUserInfo();

    List<SysUser> listUsers();
}
