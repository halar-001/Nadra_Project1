package com.aidatabaseassistant.repository;

import com.aidatabaseassistant.entity.ChatMessage;
import com.aidatabaseassistant.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatSessionOrderByCreatedAtAsc(ChatSession chatSession);
    List<ChatMessage> findByChatSessionOrderByCreatedAtDesc(ChatSession chatSession);
    void deleteByChatSession(ChatSession chatSession);
}
