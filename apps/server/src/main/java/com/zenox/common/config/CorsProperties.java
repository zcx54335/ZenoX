package com.zenox.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "zenox.cors")
public record CorsProperties(String allowedOrigins) {
}
