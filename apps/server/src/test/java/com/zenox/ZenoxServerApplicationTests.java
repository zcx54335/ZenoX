package com.zenox;

import org.junit.jupiter.api.Test;
class ZenoxServerApplicationTests {

  @Test
  void applicationClassExists() {
    ZenoxServerApplication application = new ZenoxServerApplication();
    org.assertj.core.api.Assertions.assertThat(application).isNotNull();
  }
}
