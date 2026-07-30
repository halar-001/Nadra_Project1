package com.aidatabaseassistant.controller;

import com.aidatabaseassistant.dto.ChatRequest;
import com.aidatabaseassistant.dto.ChatResponse;
import com.aidatabaseassistant.service.QueryPipelineService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final QueryPipelineService queryPipelineService;

    public ChatController(QueryPipelineService queryPipelineService) {
        this.queryPipelineService = queryPipelineService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> generateSql(
            @Valid @RequestBody ChatRequest request,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        
        // The QueryPipelineService handles Schema Fetching, AI Generation, Validation, Policy Enforcement, and Execution
        ChatResponse response = queryPipelineService.processQuery(request, userEmail);
        
        return ResponseEntity.ok(response);
    }
}
