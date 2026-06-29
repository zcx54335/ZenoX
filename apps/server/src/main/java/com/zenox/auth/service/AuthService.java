package com.zenox.auth.service;

import com.zenox.auth.dto.LoginRequest;
import com.zenox.auth.dto.LoginResponse;
import com.zenox.auth.mapper.RolePermissionMapper;
import com.zenox.auth.security.JwtTokenService;
import com.zenox.common.enums.UserStatus;
import com.zenox.common.error.BusinessException;
import com.zenox.common.error.ErrorCode;
import com.zenox.user.entity.UserAccount;
import com.zenox.user.mapper.UserAccountMapper;
import java.time.LocalDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final JwtTokenService jwtTokenService;
  private final PasswordEncoder passwordEncoder;
  private final RolePermissionMapper rolePermissionMapper;
  private final UserAccountMapper userAccountMapper;

  public AuthService(
      JwtTokenService jwtTokenService,
      PasswordEncoder passwordEncoder,
      RolePermissionMapper rolePermissionMapper,
      UserAccountMapper userAccountMapper
  ) {
    this.jwtTokenService = jwtTokenService;
    this.passwordEncoder = passwordEncoder;
    this.rolePermissionMapper = rolePermissionMapper;
    this.userAccountMapper = userAccountMapper;
  }

  @Transactional
  public LoginResponse login(LoginRequest request) {
    UserAccount user = userAccountMapper.findByUsername(request.username());
    if (user == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid username or password");
    }
    if (user.getStatus() != UserStatus.ACTIVE) {
      throw new BusinessException(ErrorCode.FORBIDDEN, "User is disabled");
    }

    user.setLastLoginAt(LocalDateTime.now());
    userAccountMapper.updateById(user);

    String accessToken = jwtTokenService.createAccessToken(user.getId(), user.getTenantId(), user.getUsername(), user.getRole());
    String refreshToken = jwtTokenService.createRefreshToken(user.getId());
    var accessCodes = rolePermissionMapper.listPermissionCodes(user.getTenantId(), user.getRole());

    return new LoginResponse(
        accessToken,
        refreshToken,
        accessCodes,
        new LoginResponse.UserSession(user.getId(), user.getTenantId(), user.getUsername(), user.getDisplayName(), user.getRole())
    );
  }
}
