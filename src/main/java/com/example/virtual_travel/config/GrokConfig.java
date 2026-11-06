package com.example.virtual_travel.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class GrokConfig {

    @Value("${xai.api.url}")
    private String apiUrl;

    @Value("${xai.api.key}")
    private String apiKey;

    @Bean
    public WebClient grokWebClient() {
        return WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}