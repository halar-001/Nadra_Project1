package com.aidatabaseassistant.service;

import com.aidatabaseassistant.dto.ChatRequest;
import com.aidatabaseassistant.model.schema.DatabaseSchema;
import org.springframework.stereotype.Service;

@Service
public class SqlGeneratorService {

    private final PromptBuilderService promptBuilder;
    private final LLMService llmService;
    private final SqlResponseParser parser;

    public SqlGeneratorService(PromptBuilderService promptBuilder, LLMService llmService, SqlResponseParser parser) {
        this.promptBuilder = promptBuilder;
        this.llmService = llmService;
        this.parser = parser;
    }

    public static class GeneratedSqlResult {
        private final String sql;
        private final String providerName;

        public GeneratedSqlResult(String sql, String providerName) {
            this.sql = sql;
            this.providerName = providerName;
        }

        public String getSql() { return sql; }
        public String getProviderName() { return providerName; }
    }

    public GeneratedSqlResult generateSql(ChatRequest request, DatabaseSchema schema, java.util.List<com.aidatabaseassistant.entity.ChatMessage> chatHistory) {
        String prompt = promptBuilder.build(request.getMessage(), schema, chatHistory);
        LLMService.LLMResponse response = llmService.generate(prompt);
        String sql = parser.extractSql(response.getContent());
        return new GeneratedSqlResult(sql, response.getProviderName());
    }
}
