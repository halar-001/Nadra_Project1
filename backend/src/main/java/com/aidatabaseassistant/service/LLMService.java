package com.aidatabaseassistant.service;

import com.aidatabaseassistant.ai.LLMProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LLMService {

    private static final Logger logger = LoggerFactory.getLogger(LLMService.class);
    
    // Providers are injected automatically and sorted by @Order
    private final List<LLMProvider> providers;

    public LLMService(List<LLMProvider> providers) {
        this.providers = providers;
    }

    public static class LLMResponse {
        private final String content;
        private final String providerName;

        public LLMResponse(String content, String providerName) {
            this.content = content;
            this.providerName = providerName;
        }

        public String getContent() { return content; }
        public String getProviderName() { return providerName; }
    }

    public LLMResponse generate(String prompt) {
        for (LLMProvider provider : providers) {
            try {
                logger.info("Attempting to generate SQL using AI Provider: {}", provider.getName());
                String content = provider.generate(prompt);
                return new LLMResponse(content, provider.getName());
            } catch (Exception e) {
                logger.warn("AI Provider {} failed: {}", provider.getName(), e.getMessage());
                // Continue to the next provider
            }
        }
        
        logger.error("All AI providers failed to generate SQL.");
        throw new RuntimeException("All AI providers failed to generate a response.");
    }
}
