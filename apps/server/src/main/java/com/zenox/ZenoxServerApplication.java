package com.zenox;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan("com.zenox")
@SpringBootApplication
public class ZenoxServerApplication {

  public static void main(String[] args) {
    SpringApplication.run(ZenoxServerApplication.class, args);
  }
}
