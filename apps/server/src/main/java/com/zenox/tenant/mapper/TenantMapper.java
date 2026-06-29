package com.zenox.tenant.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zenox.tenant.entity.Tenant;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TenantMapper extends BaseMapper<Tenant> {
}
