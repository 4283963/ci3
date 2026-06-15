package com.media.matrix.auth.controller;

import com.media.matrix.auth.service.PlatformAccountService;
import com.media.matrix.common.entity.PlatformAccount;
import com.media.matrix.common.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
public class PlatformAccountController {

    private final PlatformAccountService platformAccountService;

    @GetMapping("/oauth-url/{platform}")
    public Result<Map<String, String>> getOAuthUrl(@PathVariable String platform) {
        String url = platformAccountService.getOAuthUrl(platform);
        Map<String, String> result = new HashMap<>();
        result.put("oauthUrl", url);
        return Result.success(result);
    }

    @GetMapping("/callback/{platform}")
    public Result<PlatformAccount> handleOAuthCallback(
            @PathVariable String platform,
            @RequestParam String code,
            @RequestParam String state) {
        return Result.success(platformAccountService.handleOAuthCallback(platform, code, state));
    }

    @GetMapping("/list")
    public Result<List<PlatformAccount>> listAccounts() {
        return Result.success(platformAccountService.listAccounts());
    }

    @PostMapping("/refresh/{id}")
    public Result<PlatformAccount> refreshToken(@PathVariable Long id) {
        return Result.success(platformAccountService.refreshToken(id));
    }
}
