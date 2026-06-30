package com.zenox.common.security;

public class DataScope {
  private final Long tenantId;
  private final Long userId;
  private final String role;

  public DataScope(Long tenantId, Long userId, String role) {
    this.tenantId = tenantId;
    this.userId = userId;
    this.role = role;
  }

  public Long getTenantId() {
    return tenantId;
  }

  public Long getUserId() {
    return userId;
  }

  public String getRole() {
    return role;
  }

  public boolean isAdmin() {
    return "TENANT_OWNER".equals(role) || "PLATFORM_ADMIN".equals(role);
  }

  public boolean isTeacher() {
    return "TEACHER".equals(role);
  }

  public boolean isStudent() {
    return "STUDENT".equals(role);
  }

  public boolean isParent() {
    return "PARENT".equals(role);
  }
}
