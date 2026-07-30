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
    private final com.aidatabaseassistant.service.ChatSessionService chatSessionService;
    private final com.aidatabaseassistant.service.ChatMessageService chatMessageService;

    public ChatController(QueryPipelineService queryPipelineService, 
                          com.aidatabaseassistant.service.ChatSessionService chatSessionService,
                          com.aidatabaseassistant.service.ChatMessageService chatMessageService) {
        this.queryPipelineService = queryPipelineService;
        this.chatSessionService = chatSessionService;
        this.chatMessageService = chatMessageService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> generateSql(
            @Valid @RequestBody ChatRequest request,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        ChatResponse response = queryPipelineService.processQuery(request, userEmail);
        return ResponseEntity.ok(response);
    }
    
    // Session Management Endpoints
    
    @PostMapping("/sessions")
    public ResponseEntity<com.aidatabaseassistant.dto.ChatSessionDto> createSession(
            @Valid @RequestBody com.aidatabaseassistant.dto.CreateChatSessionRequest request,
            Authentication authentication) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(chatSessionService.createSession(request, authentication.getName()));
    }

    @GetMapping("/sessions")
    public ResponseEntity<java.util.List<com.aidatabaseassistant.dto.ChatSessionDto>> getUserSessions(
            Authentication authentication) {
        return ResponseEntity.ok(chatSessionService.getUserSessions(authentication.getName()));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<com.aidatabaseassistant.dto.ChatSessionDto> getSession(
            @PathVariable java.util.UUID sessionId,
            Authentication authentication) {
        return ResponseEntity.ok(chatSessionService.getSession(sessionId, authentication.getName()));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> deleteSession(
            @PathVariable java.util.UUID sessionId,
            Authentication authentication) {
        chatSessionService.deleteSession(sessionId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/sessions/{sessionId}")
    public ResponseEntity<com.aidatabaseassistant.dto.ChatSessionDto> renameSession(
            @PathVariable java.util.UUID sessionId,
            @RequestBody java.util.Map<String, String> body,
            Authentication authentication) {
        String title = body.get("title");
        return ResponseEntity.ok(chatSessionService.renameSession(sessionId, title, authentication.getName()));
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<java.util.List<com.aidatabaseassistant.dto.ChatMessageDto>> getSessionMessages(
            @PathVariable java.util.UUID sessionId,
            Authentication authentication) {
        // Fetch session first to verify ownership
        com.aidatabaseassistant.entity.ChatSession session = chatSessionService.getSessionEntity(sessionId, authentication.getName());
        return ResponseEntity.ok(chatMessageService.getSessionHistory(session));
    }
}
