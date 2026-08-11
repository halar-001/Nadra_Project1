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
@Order(1)
public class GeminiProvider implements LLMProvider {
    
    private final String apiKey;
    private final String apiUrl;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GeminiProvider(
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.api.url}") String apiUrl,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    @Override
    public String generate(String prompt) {
        if ("dummy".equals(apiKey)) {
            throw new RuntimeException("Gemini API key is not configured");
        }
        
        try {
            // Gemini payload: { "contents": [{ "parts": [{"text": "prompt"}] }] }
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("text", prompt)
                    ))
                )
            );

            String urlWithKey = apiUrl + "?key=" + apiKey;

            String responseStr = restClient.post()
                    .uri(urlWithKey)
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode rootNode = objectMapper.readTree(responseStr);
            JsonNode textNode = rootNode.path("candidates").path(0)
                    .path("content").path("parts").path(0).path("text");
            
            if (textNode.isMissingNode()) {
                throw new RuntimeException("Unexpected response format from Gemini: " + responseStr);
            }
            return textNode.asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate SQL via Gemini: " + e.getMessage(), e);
        }
    }

    @Override
    public String getName() {
        return "gemini-1.5-flash";
    }
}
