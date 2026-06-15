package com.media.matrix.auth.service;

import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.media.matrix.common.constant.CommonConstant;
import com.media.matrix.common.entity.PlatformAccount;
import com.media.matrix.common.exception.BusinessException;
import com.media.matrix.common.result.ResultCode;
import com.media.matrix.common.util.UserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OAuth2ServiceImpl implements OAuth2Service {

    @Value("${oauth2.douyin.client-id}")
    private String douyinClientId;

    @Value("${oauth2.douyin.client-secret}")
    private String douyinClientSecret;

    @Value("${oauth2.douyin.redirect-uri}")
    private String douyinRedirectUri;

    @Value("${oauth2.kuaishou.client-id}")
    private String kuaishouClientId;

    @Value("${oauth2.kuaishou.client-secret}")
    private String kuaishouClientSecret;

    @Value("${oauth2.kuaishou.redirect-uri}")
    private String kuaishouRedirectUri;

    @Value("${oauth2.xiaohongshu.client-id}")
    private String xiaohongshuClientId;

    @Value("${oauth2.xiaohongshu.client-secret}")
    private String xiaohongshuClientSecret;

    @Value("${oauth2.xiaohongshu.redirect-uri}")
    private String xiaohongshuRedirectUri;

    private static final String DOUYIN_AUTH_URL = "https://open.douyin.com/platform/oauth/connect";
    private static final String DOUYIN_TOKEN_URL = "https://open.douyin.com/oauth/access_token/";
    private static final String DOUYIN_REFRESH_URL = "https://open.douyin.com/oauth/refresh_token/";
    private static final String DOUYIN_USER_INFO_URL = "https://open.douyin.com/oauth/userinfo/";

    private static final String KUAISHOU_AUTH_URL = "https://open.kuaishou.com/oauth2/authorize";
    private static final String KUAISHOU_TOKEN_URL = "https://open.kuaishou.com/oauth2/access_token";
    private static final String KUAISHOU_REFRESH_URL = "https://open.kuaishou.com/oauth2/refresh_token";
    private static final String KUAISHOU_USER_INFO_URL = "https://open.kuaishou.com/openapi/v1/user/info";

    private static final String XIAOHONGSHU_AUTH_URL = "https://edith.xiaohongshu.com/api/oauth2/authorize";
    private static final String XIAOHONGSHU_TOKEN_URL = "https://edith.xiaohongshu.com/api/oauth2/qrcode/access_token";
    private static final String XIAOHONGSHU_REFRESH_URL = "https://edith.xiaohongshu.com/api/oauth2/qrcode/refresh_token";
    private static final String XIAOHONGSHU_USER_INFO_URL = "https://edith.xiaohongshu.com/api/sns/v1/user/info";

    @Override
    public String getAuthorizationUrl(String platform, String state) {
        Map<String, String> config = getPlatformConfig(platform);
        String clientId = config.get("clientId");
        String redirectUri = config.get("redirectUri");
        String scope = getPlatformScope(platform);

        return switch (platform) {
            case CommonConstant.PLATFORM_DOUYIN -> DOUYIN_AUTH_URL +
                    "?client_key=" + clientId +
                    "&response_type=code" +
                    "&scope=" + scope +
                    "&redirect_uri=" + redirectUri +
                    "&state=" + state;
            case CommonConstant.PLATFORM_KUAISHOU -> KUAISHOU_AUTH_URL +
                    "?client_id=" + clientId +
                    "&response_type=code" +
                    "&scope=" + scope +
                    "&redirect_uri=" + redirectUri +
                    "&state=" + state;
            case CommonConstant.PLATFORM_XIAOHONGSHU -> XIAOHONGSHU_AUTH_URL +
                    "?client_id=" + clientId +
                    "&response_type=code" +
                    "&scope=" + scope +
                    "&redirect_uri=" + redirectUri +
                    "&state=" + state;
            default -> throw new BusinessException(ResultCode.PARAM_ERROR, "不支持的平台: " + platform);
        };
    }

    @Override
    public PlatformAccount handleCallback(String platform, String code, String state) {
        Map<String, String> config = getPlatformConfig(platform);
        String clientId = config.get("clientId");
        String clientSecret = config.get("clientSecret");
        String redirectUri = config.get("redirectUri");

        JSONObject tokenResponse = getTokenResponse(platform, code, clientId, clientSecret, redirectUri);

        String accessToken = tokenResponse.getStr(getAccessTokenKey(platform));
        String refreshToken = tokenResponse.getStr(getRefreshTokenKey(platform));
        Long expiresIn = tokenResponse.getLong(getExpiresInKey(platform));
        String scope = tokenResponse.getStr("scope");

        JSONObject userInfo = getUserInfo(platform, accessToken);

        PlatformAccount account = new PlatformAccount();
        account.setUserId(UserContext.getUserId());
        account.setPlatform(platform);
        account.setPlatformUserId(userInfo.getStr(getUserIdKey(platform)));
        account.setPlatformUsername(userInfo.getStr(getUsernameKey(platform)));
        account.setPlatformNickname(userInfo.getStr(getNicknameKey(platform)));
        account.setPlatformAvatar(userInfo.getStr(getAvatarKey(platform)));
        account.setAccessToken(accessToken);
        account.setRefreshToken(refreshToken);
        account.setTokenExpireTime(LocalDateTime.now().plusSeconds(expiresIn != null ? expiresIn : 86400));
        account.setScope(scope);
        account.setStatus(1);

        return account;
    }

    @Override
    public PlatformAccount refreshToken(PlatformAccount account) {
        Map<String, String> config = getPlatformConfig(account.getPlatform());
        String clientId = config.get("clientId");
        String clientSecret = config.get("clientSecret");

        JSONObject tokenResponse = getRefreshTokenResponse(account.getPlatform(), account.getRefreshToken(), clientId, clientSecret);

        String accessToken = tokenResponse.getStr(getAccessTokenKey(account.getPlatform()));
        String refreshToken = tokenResponse.getStr(getRefreshTokenKey(account.getPlatform()));
        Long expiresIn = tokenResponse.getLong(getExpiresInKey(account.getPlatform()));

        account.setAccessToken(accessToken);
        account.setRefreshToken(refreshToken);
        account.setTokenExpireTime(LocalDateTime.now().plusSeconds(expiresIn != null ? expiresIn : 86400));

        return account;
    }

    @Override
    public Map<String, String> getPlatformConfig(String platform) {
        Map<String, String> config = new HashMap<>();
        switch (platform) {
            case CommonConstant.PLATFORM_DOUYIN -> {
                config.put("clientId", douyinClientId);
                config.put("clientSecret", douyinClientSecret);
                config.put("redirectUri", douyinRedirectUri);
            }
            case CommonConstant.PLATFORM_KUAISHOU -> {
                config.put("clientId", kuaishouClientId);
                config.put("clientSecret", kuaishouClientSecret);
                config.put("redirectUri", kuaishouRedirectUri);
            }
            case CommonConstant.PLATFORM_XIAOHONGSHU -> {
                config.put("clientId", xiaohongshuClientId);
                config.put("clientSecret", xiaohongshuClientSecret);
                config.put("redirectUri", xiaohongshuRedirectUri);
            }
            default -> throw new BusinessException(ResultCode.PARAM_ERROR, "不支持的平台: " + platform);
        }
        return config;
    }

    private String getPlatformScope(String platform) {
        return switch (platform) {
            case CommonConstant.PLATFORM_DOUYIN -> "user_info,video.create,video.list";
            case CommonConstant.PLATFORM_KUAISHOU -> "user_info,video_publish,video_list";
            case CommonConstant.PLATFORM_XIAOHONGSHU -> "user_info,note.create,note.list";
            default -> "user_info";
        };
    }

    private JSONObject getTokenResponse(String platform, String code, String clientId, String clientSecret, String redirectUri) {
        String tokenUrl = switch (platform) {
            case CommonConstant.PLATFORM_DOUYIN -> DOUYIN_TOKEN_URL +
                    "?client_key=" + clientId +
                    "&client_secret=" + clientSecret +
                    "&code=" + code +
                    "&grant_type=authorization_code" +
                    "&redirect_uri=" + redirectUri;
            case CommonConstant.PLATFORM_KUAISHOU -> KUAISHOU_TOKEN_URL +
                    "?client_id=" + clientId +
                    "&client_secret=" + clientSecret +
                    "&code=" + code +
                    "&grant_type=authorization_code" +
                    "&redirect_uri=" + redirectUri;
            case CommonConstant.PLATFORM_XIAOHONGSHU -> XIAOHONGSHU_TOKEN_URL +
                    "?client_id=" + clientId +
                    "&client_secret=" + clientSecret +
                    "&code=" + code +
                    "&grant_type=authorization_code" +
                    "&redirect_uri=" + redirectUri;
            default -> throw new BusinessException(ResultCode.PARAM_ERROR, "不支持的平台: " + platform);
        };

        HttpResponse response = HttpRequest.post(tokenUrl)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .execute();

        if (!response.isOk()) {
            throw new BusinessException(ResultCode.PLATFORM_OAUTH_ERROR, "获取Token失败: " + response.body());
        }

        JSONObject result = JSONUtil.parseObj(response.body());
        if (hasError(platform, result)) {
            throw new BusinessException(ResultCode.PLATFORM_OAUTH_ERROR, getErrorMessage(platform, result));
        }

        return getData(platform, result);
    }

    private JSONObject getRefreshTokenResponse(String platform, String refreshToken, String clientId, String clientSecret) {
        String refreshUrl = switch (platform) {
            case CommonConstant.PLATFORM_DOUYIN -> DOUYIN_REFRESH_URL +
                    "?client_key=" + clientId +
                    "&client_secret=" + clientSecret +
                    "&refresh_token=" + refreshToken +
                    "&grant_type=refresh_token";
            case CommonConstant.PLATFORM_KUAISHOU -> KUAISHOU_REFRESH_URL +
                    "?client_id=" + clientId +
                    "&client_secret=" + clientSecret +
                    "&refresh_token=" + refreshToken +
                    "&grant_type=refresh_token";
            case CommonConstant.PLATFORM_XIAOHONGSHU -> XIAOHONGSHU_REFRESH_URL +
                    "?client_id=" + clientId +
                    "&client_secret=" + clientSecret +
                    "&refresh_token=" + refreshToken +
                    "&grant_type=refresh_token";
            default -> throw new BusinessException(ResultCode.PARAM_ERROR, "不支持的平台: " + platform);
        };

        HttpResponse response = HttpRequest.post(refreshUrl)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .execute();

        if (!response.isOk()) {
            throw new BusinessException(ResultCode.PLATFORM_OAUTH_ERROR, "刷新Token失败: " + response.body());
        }

        JSONObject result = JSONUtil.parseObj(response.body());
        if (hasError(platform, result)) {
            throw new BusinessException(ResultCode.PLATFORM_OAUTH_ERROR, getErrorMessage(platform, result));
        }

        return getData(platform, result);
    }

    private JSONObject getUserInfo(String platform, String accessToken) {
        String userInfoUrl = switch (platform) {
            case CommonConstant.PLATFORM_DOUYIN -> DOUYIN_USER_INFO_URL +
                    "?access_token=" + accessToken +
                    "&open_id=";
            case CommonConstant.PLATFORM_KUAISHOU -> KUAISHOU_USER_INFO_URL +
                    "?access_token=" + accessToken +
                    "&app_id=";
            case CommonConstant.PLATFORM_XIAOHONGSHU -> XIAOHONGSHU_USER_INFO_URL;
            default -> throw new BusinessException(ResultCode.PARAM_ERROR, "不支持的平台: " + platform);
        };

        HttpRequest request = HttpRequest.get(userInfoUrl)
                .header("Authorization", "Bearer " + accessToken);

        HttpResponse response = request.execute();

        if (!response.isOk()) {
            throw new BusinessException(ResultCode.PLATFORM_OAUTH_ERROR, "获取用户信息失败: " + response.body());
        }

        JSONObject result = JSONUtil.parseObj(response.body());
        if (hasError(platform, result)) {
            throw new BusinessException(ResultCode.PLATFORM_OAUTH_ERROR, getErrorMessage(platform, result));
        }

        return getData(platform, result);
    }

    private String getAccessTokenKey(String platform) {
        return switch (platform) {
            case CommonConstant.PLATFORM_DOUYIN, CommonConstant.PLATFORM_KUAISHOU, CommonConstant.PLATFORM_XIAOHONGSHU -> "access_token";
            default -> "access_token";
        };
    }

    private String getRefreshTokenKey(String platform) {
        return switch (platform) {
            case CommonConstant.PLATFORM_DOUYIN, CommonConstant.PLATFORM_KUAISHOU, CommonConstant.PLATFORM_XIAOHONGSHU -> "refresh_token";
            default -> "refresh_token";
        };
    }

    private String getExpiresInKey(String platform) {
        return switch (platform) {
            case CommonConstant.PLATFORM_DOUYIN, CommonConstant.PLATFORM_KUAISHOU, CommonConstant.PLATFORM_XIAOHONGSHU -> "expires_in";
            default -> "expires_in";
        };
    }

    private String getUserIdKey(String platform) {
        return switch (platform) {
            case CommonConstant.PLATFORM_DOUYIN -> "open_id";
            case CommonConstant.PLATFORM_KUAISHOU -> "open_id";
            case CommonConstant.PLATFORM_XIAOHONGSHU -> "user_id";
            default -> "user_id";
        };
    }

    private String getUsernameKey(String platform) {
        return switch (platform) {
            case CommonConstant.PLATFORM_DOUYIN, CommonConstant.PLATFORM_KUAISHOU, CommonConstant.PLATFORM_XIAOHONGSHU -> "username";
            default -> "username";
        };
    }

    private String getNicknameKey(String platform) {
        return switch (platform) {
            case CommonConstant.PLATFORM_DOUYIN, CommonConstant.PLATFORM_KUAISHOU, CommonConstant.PLATFORM_XIAOHONGSHU -> "nickname";
            default -> "nickname";
        };
    }

    private String getAvatarKey(String platform) {
        return switch (platform) {
            case CommonConstant.PLATFORM_DOUYIN, CommonConstant.PLATFORM_KUAISHOU, CommonConstant.PLATFORM_XIAOHONGSHU -> "avatar";
            default -> "avatar";
        };
    }

    private boolean hasError(String platform, JSONObject result) {
        return switch (platform) {
            case CommonConstant.PLATFORM_DOUYIN -> result.getInt("error_code", 0) != 0;
            case CommonConstant.PLATFORM_KUAISHOU -> result.getInt("result", 0) != 0;
            case CommonConstant.PLATFORM_XIAOHONGSHU -> result.getInt("code", 0) != 0;
            default -> false;
        };
    }

    private String getErrorMessage(String platform, JSONObject result) {
        return switch (platform) {
            case CommonConstant.PLATFORM_DOUYIN -> result.getStr("description", "未知错误");
            case CommonConstant.PLATFORM_KUAISHOU -> result.getStr("error_msg", "未知错误");
            case CommonConstant.PLATFORM_XIAOHONGSHU -> result.getStr("msg", "未知错误");
            default -> "未知错误";
        };
    }

    private JSONObject getData(String platform, JSONObject result) {
        return switch (platform) {
            case CommonConstant.PLATFORM_DOUYIN, CommonConstant.PLATFORM_KUAISHOU, CommonConstant.PLATFORM_XIAOHONGSHU -> {
                JSONObject data = result.getJSONObject("data");
                yield data != null ? data : result;
            }
            default -> result;
        };
    }
}
