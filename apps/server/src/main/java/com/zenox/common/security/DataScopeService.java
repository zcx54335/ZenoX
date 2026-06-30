package com.zenox.common.security;

import org.springframework.stereotype.Service;

@Service
public class DataScopeService {
  private final CurrentUser currentUser;

  public DataScopeService(CurrentUser currentUser) {
    this.currentUser = currentUser;
  }

  public DataScope current() {
    return new DataScope(currentUser.tenantId(), currentUser.userId(), currentUser.role());
  }
}
