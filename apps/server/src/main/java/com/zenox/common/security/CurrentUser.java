package com.zenox.common.security;

import com.zenox.common.error.BusinessException;
import com.zenox.common.error.ErrorCode;
import com.zenox.common.tenant.TenantContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {

  public Long userId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || authentication.getName() == null) {
      throw new BusinessException(ErrorCode.UNAUTHORIZED, "Login is required");
    }
    return Long.valueOf(authentication.getName());
  }

  public Long tenantId() {
    Long tenantId = TenantContext.getTenantId();
    if (tenantId == null) {
      throw new BusinessException(ErrorCode.UNAUTHORIZED, "Tenant context is missing");
    }
    return tenantId;
  }
}
