package com.zenox.auth.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zenox.auth.entity.RolePermission;
import com.zenox.common.enums.UserRole;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface RolePermissionMapper extends BaseMapper<RolePermission> {
  @Select("""
      SELECT permission_code
      FROM role_permission
      WHERE tenant_id = #{tenantId}
        AND role = #{role}
        AND deleted_at IS NULL
      ORDER BY permission_code ASC
      """)
  List<String> listPermissionCodes(@Param("tenantId") Long tenantId, @Param("role") UserRole role);

  @Select("""
      SELECT COUNT(*)
      FROM role_permission
      WHERE tenant_id = #{tenantId}
        AND role = #{role}
        AND permission_code = #{permissionCode}
        AND deleted_at IS NULL
      """)
  int countPermission(
      @Param("tenantId") Long tenantId,
      @Param("role") String role,
      @Param("permissionCode") String permissionCode
  );
}
