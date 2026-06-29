package com.zenox.auth.dto;

import com.zenox.common.enums.UserRole;

public record LoginResponse(
    String accessToken,
    String refreshToken,
    UserSession user
) {
  public record UserSession(
      Long id,
      Long tenantId,
      String username,
      String displayName,
      UserRole role
  ) {
  }
}
