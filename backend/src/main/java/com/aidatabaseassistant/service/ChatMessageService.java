package com.aidatabaseassistant.service;

import com.aidatabaseassistant.dto.ChatMessageDto;
import com.aidatabaseassistant.entity.ChatMessage;
import com.aidatabaseassistant.entity.ChatRole;
import com.aidatabaseassistant.entity.ChatSession;
import com.aidatabaseassistant.repository.ChatMessageRepository;
import com.aidatabaseassistant.repository.ChatSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChatMessageService {

    private static final int MAX_MESSAGES = 30;

    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;

    public ChatMessageService(ChatMessageRepository chatMessageRepository, ChatSessionRepository chatSessionRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.chatSessionRepository = chatSessionRepository;
    }

    @Transactional
    public void saveUserMessage(ChatSession session, String messageText) {
        ChatMessage message = new ChatMessage.Builder()
                .chatSession(session)
                .role(ChatRole.USER)
                .message(messageText)
                .build();
        
        chatMessageRepository.save(message);
        
        session.setMessageCount(session.getMessageCount() + 1);
        session.setLastMessageAt(LocalDateTime.now());

        // Auto-update session title if it currently has a default title
        if (messageText != null && !messageText.isBlank()) {
            String currentTitle = session.getTitle();
            if (currentTitle == null || currentTitle.startsWith("New Chat")) {
                String trimmed = messageText.trim();
                String autoTitle = trimmed.length() > 36 
                        ? trimmed.substring(0, 36).trim() + "..." 
                        : trimmed;
                autoTitle = Character.toUpperCase(autoTitle.charAt(0)) + (autoTitle.length() > 1 ? autoTitle.substring(1) : "");
                session.setTitle(autoTitle);
            }
        }

        chatSessionRepository.save(session);
    }

    @Transactional
    public void saveAssistantMessage(ChatSession session, String responseMessage, String generatedSql, 
                                     String validatedSql, String queryResultJson, Integer rowCount, Long executionTimeMs) {
        ChatMessage message = new ChatMessage.Builder()
                .chatSession(session)
                .role(ChatRole.ASSISTANT)
                .message(responseMessage)
                .generatedSql(generatedSql)
                .validatedSql(validatedSql)
                .queryResult(queryResultJson)
                .rowCount(rowCount)
                .executionTimeMs(executionTimeMs)
                .build();

        chatMessageRepository.save(message);

        session.setMessageCount(session.getMessageCount() + 1);
        session.setLastMessageAt(LocalDateTime.now());
        chatSessionRepository.save(session);
        
        enforceRetentionPolicy(session);
    }

    @Transactional
    protected void enforceRetentionPolicy(ChatSession session) {
        if (session.getMessageCount() > MAX_MESSAGES) {
            List<ChatMessage> history = chatMessageRepository.findByChatSessionOrderByCreatedAtAsc(session);
            
            // Delete the oldest user message
            ChatMessage oldestUser = history.stream()
                    .filter(m -> m.getRole() == ChatRole.USER)
                    .findFirst().orElse(null);
                    
            // Delete the oldest assistant message
            ChatMessage oldestAssistant = history.stream()
                    .filter(m -> m.getRole() == ChatRole.ASSISTANT)
                    .findFirst().orElse(null);

            int deletedCount = 0;
            if (oldestUser != null) {
                chatMessageRepository.delete(oldestUser);
                deletedCount++;
            }
            if (oldestAssistant != null) {
                chatMessageRepository.delete(oldestAssistant);
                deletedCount++;
            }

            session.setMessageCount(session.getMessageCount() - deletedCount);
            chatSessionRepository.save(session);
        }
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getSessionHistory(ChatSession session) {
        return chatMessageRepository.findByChatSessionOrderByCreatedAtAsc(session)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ChatMessageDto mapToDto(ChatMessage message) {
        return new ChatMessageDto(
                message.getId(),
                message.getRole(),
                message.getMessage(),
                message.getGeneratedSql(),
                message.getValidatedSql(),
                message.getQueryResult(),
                message.getRowCount(),
                message.getExecutionTimeMs(),
                message.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<ChatMessage> getHistoryForPrompt(ChatSession session) {
        return chatMessageRepository.findByChatSessionOrderByCreatedAtAsc(session);
    }

    public List<ChatMessage> getHistoryForSession(ChatSession session) {
        return chatMessageRepository.findByChatSessionOrderByCreatedAtAsc(session);
    }

    public ChatMessage getMessageById(UUID id) {
        return chatMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chat message not found"));
    }
}
