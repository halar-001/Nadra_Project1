package com.aidatabaseassistant.controller;

import com.aidatabaseassistant.dto.ChatRequest;
import com.aidatabaseassistant.dto.ChatResponse;
import com.aidatabaseassistant.model.schema.DatabaseSchema;
import com.aidatabaseassistant.service.SchemaService;
import com.aidatabaseassistant.service.SqlGeneratorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final SqlGeneratorService sqlGeneratorService;
    private final SchemaService schemaService;

    public ChatController(SqlGeneratorService sqlGeneratorService, SchemaService schemaService) {
        this.sqlGeneratorService = sqlGeneratorService;
        this.schemaService = schemaService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> generateSql(
            @Valid @RequestBody ChatRequest request,
            Authentication authentication) {
        
        long startTime = System.currentTimeMillis();
        String userEmail = authentication.getName();
        
        // 1. Fetch filtered/relevant schema based on the user's question
        DatabaseSchema schema = schemaService.selectRelevantSchema(
                request.getConnectionId(), request.getMessage(), userEmail);
                
        // 2. Generate SQL using the AI pipeline
        String generatedSql = sqlGeneratorService.generateSql(request, schema);
        
        long executionTimeMs = System.currentTimeMillis() - startTime;
        
        ChatResponse response = new ChatResponse(
                generatedSql,
                "auto-fallback-engine",
                executionTimeMs
        );
        
        return ResponseEntity.ok(response);
    }
}
