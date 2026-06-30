package com.zenox.common.security;

import com.zenox.common.error.BusinessException;
import com.zenox.common.error.ErrorCode;
import com.zenox.common.tenant.TenantContext;
import java.util.Objects;
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

  public String role() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null) {
      throw new BusinessException(ErrorCode.UNAUTHORIZED, "Login is required");
    }
    return authentication.getAuthorities().stream()
        .map(Object::toString)
        .filter(Objects::nonNull)
        .filter(authority -> authority.startsWith("ROLE_"))
        .map(authority -> authority.substring("ROLE_".length()))
        .findFirst()
        .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "User role is missing"));
  }

  public void requireTenantOwner() {
    String role = role();
    if (!"TENANT_OWNER".equals(role) && !"PLATFORM_ADMIN".equals(role)) {
      throw new BusinessException(ErrorCode.FORBIDDEN, "只有管理员可以执行该操作");
    }
  }
}
