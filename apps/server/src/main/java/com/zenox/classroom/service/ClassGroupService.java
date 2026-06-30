package com.zenox.classroom.service;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.zenox.classroom.dto.AddClassStudentRequest;
import com.zenox.classroom.dto.AddClassTeacherRequest;
import com.zenox.classroom.dto.ClassRosterResponse;
import com.zenox.classroom.dto.CreateClassGroupRequest;
import com.zenox.classroom.entity.ClassGroup;
import com.zenox.classroom.mapper.ClassGroupMapper;
import com.zenox.common.error.BusinessException;
import com.zenox.common.error.ErrorCode;
import com.zenox.common.security.CurrentUser;
import com.zenox.common.security.DataScope;
import com.zenox.common.security.DataScopeService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClassGroupService {
  private final ClassGroupMapper classGroupMapper;
  private final CurrentUser currentUser;
  private final DataScopeService dataScopeService;

  public ClassGroupService(ClassGroupMapper classGroupMapper, CurrentUser currentUser, DataScopeService dataScopeService) {
    this.classGroupMapper = classGroupMapper;
    this.currentUser = currentUser;
    this.dataScopeService = dataScopeService;
  }

  public List<ClassGroup> list() {
    return classGroupMapper.listByScope(dataScopeService.current());
  }

  @Transactional
  public ClassGroup create(CreateClassGroupRequest request) {
    currentUser.requireTenantOwner();
    ClassGroup classGroup = new ClassGroup();
    classGroup.setTenantId(currentUser.tenantId());
    classGroup.setName(request.name());
    classGroup.setSubject(request.subject());
    classGroup.setGrade(request.grade());
    classGroup.setDescription(request.description());
    classGroupMapper.insert(classGroup);
    return classGroup;
  }

  public ClassRosterResponse roster(Long classGroupId) {
    Long tenantId = currentUser.tenantId();
    DataScope scope = dataScopeService.current();
    ClassGroup classGroup = requireVisibleClassGroup(classGroupId, scope);
    return new ClassRosterResponse(
        classGroup,
        classGroupMapper.listClassStudents(tenantId, classGroupId),
        classGroupMapper.listClassTeachers(tenantId, classGroupId),
        scope.isAdmin() ? classGroupMapper.listAvailableStudents(tenantId, classGroupId) : List.of(),
        scope.isAdmin() ? classGroupMapper.listAvailableTeachers(tenantId, classGroupId) : List.of()
    );
  }

  @Transactional
  public ClassRosterResponse addStudent(Long classGroupId, AddClassStudentRequest request) {
    currentUser.requireTenantOwner();
    Long tenantId = currentUser.tenantId();
    requireClassGroup(classGroupId, tenantId);
    if (classGroupMapper.countStudentByTenant(tenantId, request.studentId()) == 0) {
      throw new BusinessException(ErrorCode.NOT_FOUND, "学生不存在或不属于当前工作室");
    }
    if (classGroupMapper.countActiveStudentMember(tenantId, classGroupId, request.studentId()) > 0) {
      return roster(classGroupId);
    }
    if (!Boolean.TRUE.equals(request.confirmCrossClass())
        && classGroupMapper.countOtherActiveStudentMemberships(tenantId, classGroupId, request.studentId()) > 0) {
      throw new BusinessException(ErrorCode.CONFLICT, "该学生已经在其他班级中，确认后仍可加入当前班级");
    }
    Long existingId = classGroupMapper.findStudentMemberIdIncludingDeleted(tenantId, classGroupId, request.studentId());
    if (existingId == null) {
      classGroupMapper.insertStudentMember(IdWorker.getId(), tenantId, classGroupId, request.studentId());
    } else {
      classGroupMapper.restoreStudentMember(existingId, tenantId);
    }
    return roster(classGroupId);
  }

  @Transactional
  public ClassRosterResponse removeStudent(Long classGroupId, Long studentId) {
    currentUser.requireTenantOwner();
    Long tenantId = currentUser.tenantId();
    requireClassGroup(classGroupId, tenantId);
    classGroupMapper.removeStudentMember(tenantId, classGroupId, studentId);
    return roster(classGroupId);
  }

  @Transactional
  public ClassRosterResponse addTeacher(Long classGroupId, AddClassTeacherRequest request) {
    currentUser.requireTenantOwner();
    Long tenantId = currentUser.tenantId();
    requireClassGroup(classGroupId, tenantId);
    if (classGroupMapper.countTeacherByTenant(tenantId, request.teacherUserId()) == 0) {
      throw new BusinessException(ErrorCode.NOT_FOUND, "老师不存在或不属于当前工作室");
    }
    if (classGroupMapper.countActiveClassTeacher(tenantId, classGroupId, request.teacherUserId()) > 0) {
      return roster(classGroupId);
    }
    Long existingId = classGroupMapper.findClassTeacherIdIncludingDeleted(tenantId, classGroupId, request.teacherUserId());
    if (existingId == null) {
      classGroupMapper.insertClassTeacher(IdWorker.getId(), tenantId, classGroupId, request.teacherUserId());
    } else {
      classGroupMapper.restoreClassTeacher(existingId, tenantId);
    }
    return roster(classGroupId);
  }

  @Transactional
  public ClassRosterResponse removeTeacher(Long classGroupId, Long teacherUserId) {
    currentUser.requireTenantOwner();
    Long tenantId = currentUser.tenantId();
    requireClassGroup(classGroupId, tenantId);
    classGroupMapper.removeClassTeacher(tenantId, classGroupId, teacherUserId);
    return roster(classGroupId);
  }

  private ClassGroup requireClassGroup(Long classGroupId, Long tenantId) {
    ClassGroup classGroup = classGroupMapper.findByIdAndTenantId(classGroupId, tenantId);
    if (classGroup == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND, "班级不存在");
    }
    return classGroup;
  }

  private ClassGroup requireVisibleClassGroup(Long classGroupId, DataScope scope) {
    ClassGroup classGroup = classGroupMapper.findByIdAndScope(classGroupId, scope);
    if (classGroup == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND, "班级不存在");
    }
    return classGroup;
  }
}
