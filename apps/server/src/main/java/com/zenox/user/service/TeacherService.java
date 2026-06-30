package com.zenox.user.service;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.zenox.common.enums.UserRole;
import com.zenox.common.enums.UserStatus;
import com.zenox.common.error.BusinessException;
import com.zenox.common.error.ErrorCode;
import com.zenox.common.security.CurrentUser;
import com.zenox.user.dto.CreateTeacherRequest;
import com.zenox.user.dto.TeacherProfileSummary;
import com.zenox.user.entity.UserAccount;
import com.zenox.user.mapper.UserAccountMapper;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeacherService {
  private final CurrentUser currentUser;
  private final UserAccountMapper userAccountMapper;

  public TeacherService(CurrentUser currentUser, UserAccountMapper userAccountMapper) {
    this.currentUser = currentUser;
    this.userAccountMapper = userAccountMapper;
  }

  public List<TeacherProfileSummary> list() {
    currentUser.requireTenantOwner();
    return userAccountMapper.listTeachersByTenantId(currentUser.tenantId());
  }

  @Transactional
  public TeacherProfileSummary create(CreateTeacherRequest request) {
    currentUser.requireTenantOwner();
    if (userAccountMapper.countActiveUsername(request.username()) > 0) {
      throw new BusinessException(ErrorCode.CONFLICT, "老师账号已存在");
    }
    Long tenantId = currentUser.tenantId();
    Long userId = IdWorker.getId();
    UserAccount user = new UserAccount();
    user.setId(userId);
    user.setTenantId(tenantId);
    user.setUsername(request.username());
    user.setPasswordHash("{noop}" + (request.password() == null || request.password().isBlank() ? "123456" : request.password()));
    user.setDisplayName(request.displayName());
    user.setRole(UserRole.TEACHER);
    user.setStatus(UserStatus.ACTIVE);
    userAccountMapper.insert(user);
    userAccountMapper.insertTeacherProfile(
        IdWorker.getId(),
        tenantId,
        userId,
        request.displayName(),
        request.subject(),
        request.phone(),
        request.bio()
    );
    return userAccountMapper.listTeachersByTenantId(tenantId).stream()
        .filter(teacher -> userId.equals(teacher.userId()))
        .findFirst()
        .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR, "老师创建后读取失败"));
  }

  @Transactional
  public void delete(Long teacherUserId) {
    currentUser.requireTenantOwner();
    Long tenantId = currentUser.tenantId();
    userAccountMapper.softDeleteTeacherClassBindings(tenantId, teacherUserId);
    userAccountMapper.softDeleteTeacherProfile(tenantId, teacherUserId);
    userAccountMapper.softDeleteTeacherUser(tenantId, teacherUserId);
  }
}
