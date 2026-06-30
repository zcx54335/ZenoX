package com.zenox.auth.security;

import com.zenox.auth.mapper.RolePermissionMapper;
import com.zenox.common.error.BusinessException;
import com.zenox.common.error.ErrorCode;
import com.zenox.common.security.CurrentUser;
import org.springframework.stereotype.Service;

@Service
public class PermissionService {
  private final CurrentUser currentUser;
  private final RolePermissionMapper rolePermissionMapper;

  public PermissionService(CurrentUser currentUser, RolePermissionMapper rolePermissionMapper) {
    this.currentUser = currentUser;
    this.rolePermissionMapper = rolePermissionMapper;
  }

  public boolean hasPermission(String permissionCode) {
    if (permissionCode == null || permissionCode.isBlank()) {
      return true;
    }
    return rolePermissionMapper.countPermission(currentUser.tenantId(), currentUser.role(), permissionCode) > 0;
  }

  public boolean hasAnyPermission(String[] permissionCodes) {
    if (permissionCodes == null || permissionCodes.length == 0) {
      return true;
    }
    for (String permissionCode : permissionCodes) {
      if (hasPermission(permissionCode)) {
        return true;
      }
    }
    return false;
  }

  public void requirePermission(String permissionCode) {
    if (!hasPermission(permissionCode)) {
      throw new BusinessException(ErrorCode.FORBIDDEN, "当前账号没有该操作权限");
    }
  }

  public void requireAnyPermission(String[] permissionCodes) {
    if (!hasAnyPermission(permissionCodes)) {
      throw new BusinessException(ErrorCode.FORBIDDEN, "当前账号没有该操作权限");
    }
  }
}
