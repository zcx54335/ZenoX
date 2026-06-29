package com.zenox.classroom.service;

import com.zenox.classroom.dto.CreateClassGroupRequest;
import com.zenox.classroom.entity.ClassGroup;
import com.zenox.classroom.mapper.ClassGroupMapper;
import com.zenox.common.security.CurrentUser;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClassGroupService {
  private final ClassGroupMapper classGroupMapper;
  private final CurrentUser currentUser;

  public ClassGroupService(ClassGroupMapper classGroupMapper, CurrentUser currentUser) {
    this.classGroupMapper = classGroupMapper;
    this.currentUser = currentUser;
  }

  public List<ClassGroup> list() {
    return classGroupMapper.listByTenantId(currentUser.tenantId());
  }

  @Transactional
  public ClassGroup create(CreateClassGroupRequest request) {
    ClassGroup classGroup = new ClassGroup();
    classGroup.setTenantId(currentUser.tenantId());
    classGroup.setName(request.name());
    classGroup.setSubject(request.subject());
    classGroup.setGrade(request.grade());
    classGroup.setDescription(request.description());
    classGroupMapper.insert(classGroup);
    return classGroup;
  }
}
