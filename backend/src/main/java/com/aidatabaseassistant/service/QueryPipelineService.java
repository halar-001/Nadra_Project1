package com.aidatabaseassistant.service;

import com.aidatabaseassistant.dto.ChatRequest;
import com.aidatabaseassistant.dto.ChatResponse;
import com.aidatabaseassistant.executor.QueryExecutorService;
import com.aidatabaseassistant.formatter.QueryResponse;
import com.aidatabaseassistant.model.schema.DatabaseSchema;
import com.aidatabaseassistant.policy.PolicyEngine;
import com.aidatabaseassistant.validation.SqlValidator;
import net.sf.jsqlparser.statement.select.Select;
import org.springframework.stereotype.Service;

@Service
public class QueryPipelineService {

    private final SchemaService schemaService;
    private final SqlGeneratorService sqlGeneratorService;
    private final SqlValidator sqlValidator;
    private final PolicyEngine policyEngine;
    private final QueryExecutorService queryExecutorService;
    private final ChatSessionService chatSessionService;
    private final ChatMessageService chatMessageService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public QueryPipelineService(SchemaService schemaService, SqlGeneratorService sqlGeneratorService,
                                SqlValidator sqlValidator, PolicyEngine policyEngine,
                                QueryExecutorService queryExecutorService,
                                ChatSessionService chatSessionService,
                                ChatMessageService chatMessageService,
                                com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.schemaService = schemaService;
        this.sqlGeneratorService = sqlGeneratorService;
        this.sqlValidator = sqlValidator;
        this.policyEngine = policyEngine;
        this.queryExecutorService = queryExecutorService;
        this.chatSessionService = chatSessionService;
        this.chatMessageService = chatMessageService;
        this.objectMapper = objectMapper;
    }

    public ChatResponse processQuery(ChatRequest request, String userEmail) {
        long startTime = System.currentTimeMillis();

        // 1. Fetch Session and Connection
        com.aidatabaseassistant.entity.ChatSession session = chatSessionService.getSessionEntity(request.getSessionId(), userEmail);
        Long connectionId = session.getDatabaseConnection().getId();
        
        // 2. Load History
        java.util.List<com.aidatabaseassistant.entity.ChatMessage> history = chatMessageService.getHistoryForPrompt(session);

        // 3. Fetch relevant schema
        DatabaseSchema schema = schemaService.selectRelevantSchema(connectionId, request.getMessage(), userEmail);

        // 4. Generate raw SQL via LLM using History
        String rawSql = sqlGeneratorService.generateSql(request, schema, history);

        // 5. Validate Syntax & Ensure Single SELECT
        Select selectStatement = sqlValidator.validateAndParse(rawSql);

        // 6. Enforce Policies & Inject Limits
        String safeSql = policyEngine.enforcePolicies(selectStatement);

        // 7. Execute Query & Format Response
        QueryResponse queryResult = queryExecutorService.executeQuery(connectionId, userEmail, safeSql);

        long executionTimeMs = System.currentTimeMillis() - startTime;
        
        // 8. Serialize Query Result to JSON
        String queryResultJson = "{}";
        try {
            queryResultJson = objectMapper.writeValueAsString(queryResult);
        } catch (Exception e) {
            // Ignore serialization error, leave as empty object
        }
        
        Integer rowCount = queryResult.getRows() != null ? queryResult.getRows().size() : 0;
        
        // 9. Persist Interaction
        chatMessageService.saveUserMessage(session, request.getMessage());
        chatMessageService.saveAssistantMessage(
            session, 
            "I found " + rowCount + " records.", 
            rawSql, 
            safeSql, 
            queryResultJson, 
            rowCount, 
            executionTimeMs
        );

        // 10. Return Response
        return new ChatResponse(safeSql, "auto-fallback-engine", executionTimeMs, queryResult);
    }
}
