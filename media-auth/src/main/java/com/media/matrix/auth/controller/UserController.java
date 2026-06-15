package com.media.matrix.auth.controller;

import com.media.matrix.auth.service.UserService;
import com.media.matrix.common.entity.SysUser;
import com.media.matrix.common.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/list")
    public Result<List<SysUser>> listUsers() {
        return Result.success(userService.listUsers());
    }
}
