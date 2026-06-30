package com.zenox.user.service;

import com.zenox.common.security.CurrentUser;
import com.zenox.user.dto.CreateStudentRequest;
import com.zenox.user.entity.StudentProfile;
import com.zenox.user.mapper.StudentProfileMapper;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentService {
  private final CurrentUser currentUser;
  private final StudentProfileMapper studentProfileMapper;

  public StudentService(CurrentUser currentUser, StudentProfileMapper studentProfileMapper) {
    this.currentUser = currentUser;
    this.studentProfileMapper = studentProfileMapper;
  }

  public List<StudentProfile> list() {
    currentUser.requireTenantOwner();
    return studentProfileMapper.listByTenantId(currentUser.tenantId());
  }

  @Transactional
  public StudentProfile create(CreateStudentRequest request) {
    currentUser.requireTenantOwner();
    StudentProfile student = new StudentProfile();
    student.setTenantId(currentUser.tenantId());
    student.setName(request.name());
    student.setGrade(request.grade());
    student.setSchool(request.school());
    student.setSubject(request.subject());
    student.setParentName(request.parentName());
    student.setParentPhone(request.parentPhone());
    student.setRemainingLessons(request.remainingLessons() == null ? BigDecimal.ZERO : request.remainingLessons());
    student.setWeaknessNote(request.weaknessNote());
    studentProfileMapper.insert(student);
    return student;
  }

  @Transactional
  public void delete(Long studentId) {
    currentUser.requireTenantOwner();
    Long tenantId = currentUser.tenantId();
    studentProfileMapper.softDeleteClassMemberships(tenantId, studentId);
    studentProfileMapper.softDelete(tenantId, studentId);
  }
}
