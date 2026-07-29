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

    public String generateSql(ChatRequest request, DatabaseSchema schema) {
        String prompt = promptBuilder.build(request.getMessage(), schema);
        String raw = llmService.generate(prompt);
        return parser.extractSql(raw);
    }
}
