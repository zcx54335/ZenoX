package com.zenox.auth.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class PermissionInterceptor implements HandlerInterceptor {
  private final PermissionService permissionService;

  public PermissionInterceptor(PermissionService permissionService) {
    this.permissionService = permissionService;
  }

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
    if (!(handler instanceof HandlerMethod handlerMethod)) {
      return true;
    }

    RequirePermission permission = AnnotationUtils.findAnnotation(handlerMethod.getMethod(), RequirePermission.class);
    if (permission == null) {
      permission = AnnotationUtils.findAnnotation(handlerMethod.getBeanType(), RequirePermission.class);
    }
    if (permission == null) {
      return true;
    }

    if (!permission.value().isBlank()) {
      permissionService.requirePermission(permission.value());
    }
    if (permission.anyOf().length > 0) {
      permissionService.requireAnyPermission(permission.anyOf());
    }
    return true;
  }
}
