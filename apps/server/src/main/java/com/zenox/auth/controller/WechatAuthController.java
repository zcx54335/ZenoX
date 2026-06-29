package com.zenox.auth.controller;

import com.zenox.common.api.ApiResponse;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class WechatAuthController {

  @PostMapping("/wechat-login")
  public ApiResponse<Map<String, String>> wechatLoginPlaceholder() {
    return ApiResponse.ok(Map.of(
        "status", "planned",
        "message", "WeChat Mini Program login endpoint is reserved for a later integration."
    ));
  }
}
