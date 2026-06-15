package com.media.matrix.auth.service;

import com.media.matrix.common.entity.PlatformAccount;

import java.util.Map;

public interface OAuth2Service {

    String getAuthorizationUrl(String platform, String state);

    PlatformAccount handleCallback(String platform, String code, String state);

    PlatformAccount refreshToken(PlatformAccount account);

    Map<String, String> getPlatformConfig(String platform);
}
