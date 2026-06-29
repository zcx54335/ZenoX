package com.zenox.common.error;

public enum ErrorCode {
  BAD_REQUEST(40000, "Bad request"),
  UNAUTHORIZED(40100, "Unauthorized"),
  FORBIDDEN(40300, "Forbidden"),
  NOT_FOUND(40400, "Not found"),
  CONFLICT(40900, "Conflict"),
  INTERNAL_ERROR(50000, "Internal server error");

  private final int code;
  private final String message;

  ErrorCode(int code, String message) {
    this.code = code;
    this.message = message;
  }

  public int code() {
    return code;
  }

  public String message() {
    return message;
  }
}
