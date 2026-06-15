package com.media.matrix.auth.service;

import com.media.matrix.common.entity.PlatformAccount;

import java.util.List;

public interface PlatformAccountService {

    String getOAuthUrl(String platform);

    PlatformAccount handleOAuthCallback(String platform, String code, String state);

    PlatformAccount refreshToken(Long accountId);

    List<PlatformAccount> listAccounts();
}
