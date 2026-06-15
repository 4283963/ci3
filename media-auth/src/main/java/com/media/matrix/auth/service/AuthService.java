package com.media.matrix.auth.service;

import com.media.matrix.common.dto.LoginDTO;
import com.media.matrix.common.dto.LoginVO;

public interface AuthService {

    LoginVO login(LoginDTO loginDTO);

    void logout(String token);
}
