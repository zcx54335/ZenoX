package com.zenox.auth.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;

class AuthServiceTests {

  @Test
  void delegatingPasswordEncoderAcceptsSeedNoopPassword() {
    var encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();

    assertThat(encoder.matches("123456", "{noop}123456")).isTrue();
  }
}
