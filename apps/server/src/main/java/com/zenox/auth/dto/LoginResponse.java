package com.zenox.auth.dto;

import com.zenox.common.enums.UserRole;
import java.util.List;

public record LoginResponse(
    String accessToken,
    String refreshToken,
    List<String> accessCodes,
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
