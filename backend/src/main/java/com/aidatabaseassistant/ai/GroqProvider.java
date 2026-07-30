package com.aidatabaseassistant.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.List;

@Service
@Order(2)
public class GroqProvider implements LLMProvider {

    private final String apiKey;
    private final String apiUrl;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GroqProvider(
            @Value("${groq.api.key}") String apiKey,
            @Value("${groq.api.url}") String apiUrl,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    @Override
    public String generate(String prompt) {
        if ("dummy".equals(apiKey)) {
            throw new RuntimeException("Groq API key is not configured");
        }
        
        try {
            Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                    Map.of(
                        "role", "user",
                        "content", prompt
                    )
                ),
                "temperature", 0.1
            );

            String responseStr = restClient.post()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode rootNode = objectMapper.readTree(responseStr);
            JsonNode textNode = rootNode.path("choices").path(0)
                    .path("message").path("content");
            
            if (textNode.isMissingNode()) {
                throw new RuntimeException("Unexpected response format from Groq: " + responseStr);
            }
            return textNode.asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate SQL via Groq: " + e.getMessage(), e);
        }
    }

    @Override
    public String getName() {
        return "llama-3.3-70b-versatile (Groq)";
    }
}
