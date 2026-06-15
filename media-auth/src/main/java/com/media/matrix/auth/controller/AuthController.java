package com.media.matrix.auth.controller;

import com.media.matrix.auth.service.AuthService;
import com.media.matrix.auth.service.UserService;
import com.media.matrix.common.constant.CommonConstant;
import com.media.matrix.common.dto.LoginDTO;
import com.media.matrix.common.dto.LoginVO;
import com.media.matrix.common.entity.SysUser;
import com.media.matrix.common.result.Result;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO loginDTO) {
        return Result.success(authService.login(loginDTO));
    }

    @PostMapping("/logout")
    public Result<Void> logout(HttpServletRequest request) {
        String token = request.getHeader(CommonConstant.TOKEN_HEADER);
        if (token != null && token.startsWith(CommonConstant.TOKEN_PREFIX)) {
            token = token.substring(CommonConstant.TOKEN_PREFIX.length());
        }
        authService.logout(token);
        return Result.success();
    }

    @GetMapping("/user-info")
    public Result<SysUser> getUserInfo() {
        return Result.success(userService.getUserInfo());
    }
}
