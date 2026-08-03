package com.aidatabaseassistant.controller;

import com.aidatabaseassistant.dto.ChatRequest;
import com.aidatabaseassistant.executor.QueryExecutorService;
import com.aidatabaseassistant.formatter.QueryResponse;
import com.aidatabaseassistant.model.schema.DatabaseSchema;
import com.aidatabaseassistant.service.LLMService;
import com.aidatabaseassistant.service.SchemaCacheService;
import com.aidatabaseassistant.service.SchemaSelectorService;
import com.aidatabaseassistant.service.SchemaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = { com.aidatabaseassistant.AiDatabaseAssistantApplication.class, ChatIntegrationTest.TestConfig.class })
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:test_chat_db;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=sa",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "security.jwt.secret=thisisaverysecuresecretkeyforjwtauthenticationthatisverylong12345",
        "security.encryption.secret=test_master_secret_key_for_integration_testing_only"
})
public class ChatIntegrationTest {

    @TestConfiguration
    static class TestConfig {
        @Bean
        @Primary
        public LLMService dummyLlmService() {
            return new LLMService(List.of()) {
                @Override
                public LLMResponse generate(String prompt) {
                    return new LLMResponse("```sql\nSELECT * FROM students;\n```", "auto-fallback-engine");
                }
            };
        }

        @Bean
        @Primary
        public QueryExecutorService dummyQueryExecutor() {
            return new QueryExecutorService(null, null) {
                @Override
                public QueryResponse executeQuery(Long connectionId, String userEmail, String sql) {
                    return new QueryResponse(List.of("id", "name"), List.of(List.of(1, "Test Student")), java.util.Map.of("rowCount", 1, "executionTimeMs", 5));
                }
            };
        }

        @Bean
        @Primary
        public SchemaService dummySchemaService(SchemaCacheService cache, SchemaSelectorService selector) {
            return new SchemaService(cache, selector) {
                @Override
                public DatabaseSchema selectRelevantSchema(Long connectionId, String query, String userEmail) {
                    return new DatabaseSchema(1L, "dummy_db", "MySQL");
                }
            };
        }

        @Bean
        @Primary
        public com.aidatabaseassistant.service.ChatSessionService dummyChatSessionService() {
            return new com.aidatabaseassistant.service.ChatSessionService(null, null, null, null) {
                @Override
                public com.aidatabaseassistant.entity.ChatSession getSessionEntity(java.util.UUID sessionId, String userEmail) {
                    com.aidatabaseassistant.entity.User user = new com.aidatabaseassistant.entity.User();
                    user.setId(1L);
                    user.setEmail(userEmail);
                    com.aidatabaseassistant.entity.DatabaseConnection connection = new com.aidatabaseassistant.entity.DatabaseConnection();
                    connection.setId(1L);
                    return new com.aidatabaseassistant.entity.ChatSession(user, connection, "Test Session");
                }
            };
        }

        @Bean
        @Primary
        public com.aidatabaseassistant.service.ChatMessageService dummyChatMessageService() {
            return new com.aidatabaseassistant.service.ChatMessageService(null, null) {
                @Override
                public void saveUserMessage(com.aidatabaseassistant.entity.ChatSession session, String messageText) {}
                
                @Override
                public void saveAssistantMessage(com.aidatabaseassistant.entity.ChatSession session, String responseMessage, String generatedSql, 
                                                 String validatedSql, String queryResultJson, Integer rowCount, Long executionTimeMs) {}
                
                @Override
                public java.util.List<com.aidatabaseassistant.entity.ChatMessage> getHistoryForPrompt(com.aidatabaseassistant.entity.ChatSession session) {
                    return java.util.Collections.emptyList();
                }
            };
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "testuser@nadra.gov.pk")
    public void testGenerateSqlEndpoint() throws Exception {
        ChatRequest request = new ChatRequest();
        request.setSessionId(java.util.UUID.randomUUID());
        request.setMessage("Show all users");

        mockMvc.perform(post("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.generatedSql").value("SELECT * FROM students LIMIT 400"))
                .andExpect(jsonPath("$.model").value("auto-fallback-engine"))
                .andExpect(jsonPath("$.executionTimeMs").isNumber())
                .andExpect(jsonPath("$.queryResult.metadata.rowCount").value(1));
    }

    @Test
    public void testGenerateSqlEndpointWithoutAuth() throws Exception {
        ChatRequest request = new ChatRequest();
        request.setSessionId(java.util.UUID.randomUUID());
        request.setMessage("Show all users");

        mockMvc.perform(post("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
