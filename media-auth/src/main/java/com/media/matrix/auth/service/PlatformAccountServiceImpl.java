package com.media.matrix.auth.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.media.matrix.auth.mapper.PlatformAccountMapper;
import com.media.matrix.common.entity.PlatformAccount;
import com.media.matrix.common.exception.BusinessException;
import com.media.matrix.common.result.ResultCode;
import com.media.matrix.common.util.UserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class PlatformAccountServiceImpl implements PlatformAccountService {

    private final PlatformAccountMapper platformAccountMapper;
    private final OAuth2Service oAuth2Service;
    private final StringRedisTemplate stringRedisTemplate;

    private static final String OAUTH_STATE_KEY_PREFIX = "media:auth:oauth:state:";

    @Override
    public String getOAuthUrl(String platform) {
        String state = IdUtil.fastSimpleUUID();
        stringRedisTemplate.opsForValue().set(
                OAUTH_STATE_KEY_PREFIX + state,
                UserContext.getUserId().toString(),
                10,
                TimeUnit.MINUTES
        );
        return oAuth2Service.getAuthorizationUrl(platform, state);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PlatformAccount handleOAuthCallback(String platform, String code, String state) {
        String userIdStr = stringRedisTemplate.opsForValue().get(OAUTH_STATE_KEY_PREFIX + state);
        if (userIdStr == null) {
            throw new BusinessException(ResultCode.PLATFORM_OAUTH_ERROR, "state无效或已过期");
        }
        stringRedisTemplate.delete(OAUTH_STATE_KEY_PREFIX + state);

        PlatformAccount account = oAuth2Service.handleCallback(platform, code, state);

        PlatformAccount existing = platformAccountMapper.selectOne(new LambdaQueryWrapper<PlatformAccount>()
                .eq(PlatformAccount::getUserId, account.getUserId())
                .eq(PlatformAccount::getPlatform, platform)
                .eq(PlatformAccount::getPlatformUserId, account.getPlatformUserId()));

        if (existing != null) {
            existing.setPlatformUsername(account.getPlatformUsername());
            existing.setPlatformNickname(account.getPlatformNickname());
            existing.setPlatformAvatar(account.getPlatformAvatar());
            existing.setAccessToken(account.getAccessToken());
            existing.setRefreshToken(account.getRefreshToken());
            existing.setTokenExpireTime(account.getTokenExpireTime());
            existing.setScope(account.getScope());
            existing.setStatus(account.getStatus());
            platformAccountMapper.updateById(existing);
            return existing;
        } else {
            platformAccountMapper.insert(account);
            return account;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PlatformAccount refreshToken(Long accountId) {
        PlatformAccount account = platformAccountMapper.selectById(accountId);
        if (account == null) {
            throw new BusinessException(ResultCode.PLATFORM_ACCOUNT_NOT_EXIST);
        }

        if (!UserContext.getUserId().equals(account.getUserId()) && !UserContext.isAdmin()) {
            throw new BusinessException(ResultCode.FORBIDDEN);
        }

        PlatformAccount refreshed = oAuth2Service.refreshToken(account);
        platformAccountMapper.updateById(refreshed);
        return refreshed;
    }

    @Override
    public List<PlatformAccount> listAccounts() {
        Long userId = UserContext.getUserId();
        LambdaQueryWrapper<PlatformAccount> wrapper = new LambdaQueryWrapper<>();
        if (!UserContext.isAdmin()) {
            wrapper.eq(PlatformAccount::getUserId, userId);
        }
        wrapper.orderByDesc(PlatformAccount::getCreateTime);
        return platformAccountMapper.selectList(wrapper);
    }
}
