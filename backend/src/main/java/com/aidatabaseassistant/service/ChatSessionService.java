package com.aidatabaseassistant.service;

import com.aidatabaseassistant.dto.ChatSessionDto;
import com.aidatabaseassistant.dto.CreateChatSessionRequest;
import com.aidatabaseassistant.entity.ChatSession;
import com.aidatabaseassistant.entity.DatabaseConnection;
import com.aidatabaseassistant.entity.User;
import com.aidatabaseassistant.repository.ChatMessageRepository;
import com.aidatabaseassistant.repository.ChatSessionRepository;
import com.aidatabaseassistant.repository.DatabaseConnectionRepository;
import com.aidatabaseassistant.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChatSessionService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final DatabaseConnectionRepository connectionRepository;
    private final UserRepository userRepository;

    public ChatSessionService(ChatSessionRepository chatSessionRepository, ChatMessageRepository chatMessageRepository, DatabaseConnectionRepository connectionRepository, UserRepository userRepository) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.connectionRepository = connectionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ChatSessionDto createSession(CreateChatSessionRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DatabaseConnection connection = connectionRepository.findByIdAndUserId(request.getConnectionId(), user.getId())
                .orElseThrow(() -> new AccessDeniedException("Database connection not found or unauthorized"));

        String title = request.getTitle() != null && !request.getTitle().isBlank() 
                ? request.getTitle() 
                : "New Chat - " + connection.getDatabaseName();

        ChatSession session = new ChatSession(user, connection, title);
        session = chatSessionRepository.save(session);

        return mapToDto(session);
    }

    @Transactional(readOnly = true)
    public List<ChatSessionDto> getUserSessions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return chatSessionRepository.findByUserOrderByUpdatedAtDesc(user)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChatSession getSessionEntity(UUID sessionId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return chatSessionRepository.findByIdAndUser(sessionId, user)
                .orElseThrow(() -> new AccessDeniedException("Chat session not found or unauthorized"));
    }

    @Transactional(readOnly = true)
    public ChatSessionDto getSession(UUID sessionId, String userEmail) {
        return mapToDto(getSessionEntity(sessionId, userEmail));
    }

    @Transactional
    public ChatSessionDto renameSession(UUID sessionId, String newTitle, String userEmail) {
        ChatSession session = getSessionEntity(sessionId, userEmail);
        session.setTitle(newTitle);
        session = chatSessionRepository.save(session);
        return mapToDto(session);
    }

    @Transactional
    public void deleteSession(UUID sessionId, String userEmail) {
        ChatSession session = getSessionEntity(sessionId, userEmail);
        // Delete all messages first
        chatMessageRepository.deleteByChatSession(session);
        // Delete session
        chatSessionRepository.delete(session);
    }

    private ChatSessionDto mapToDto(ChatSession session) {
        return new ChatSessionDto(
                session.getId(),
                session.getDatabaseConnection().getId(),
                session.getTitle(),
                session.getMessageCount(),
                session.getStatus(),
                session.getLastMessageAt()
        );
    }
}
