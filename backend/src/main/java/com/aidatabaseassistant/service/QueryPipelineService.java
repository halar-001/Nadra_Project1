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
    private final com.aidatabaseassistant.formatter.ResponseFormatter responseFormatter;

    public QueryPipelineService(SchemaService schemaService, SqlGeneratorService sqlGeneratorService,
                                SqlValidator sqlValidator, PolicyEngine policyEngine,
                                QueryExecutorService queryExecutorService,
                                ChatSessionService chatSessionService,
                                ChatMessageService chatMessageService,
                                com.fasterxml.jackson.databind.ObjectMapper objectMapper,
                                com.aidatabaseassistant.formatter.ResponseFormatter responseFormatter) {
        this.schemaService = schemaService;
        this.sqlGeneratorService = sqlGeneratorService;
        this.sqlValidator = sqlValidator;
        this.policyEngine = policyEngine;
        this.queryExecutorService = queryExecutorService;
        this.chatSessionService = chatSessionService;
        this.chatMessageService = chatMessageService;
        this.objectMapper = objectMapper;
        this.responseFormatter = responseFormatter;
    }

    public ChatResponse processQuery(ChatRequest request, String userEmail) {
        long startTime = System.currentTimeMillis();

        // 1. Fetch Session and target Connection
        com.aidatabaseassistant.entity.ChatSession session;
        try {
            if (request.getSessionId() != null) {
                session = chatSessionService.getSessionEntity(request.getSessionId(), userEmail);
            } else {
                throw new RuntimeException("SessionId is null");
            }
        } catch (Exception e) {
            com.aidatabaseassistant.dto.CreateChatSessionRequest createReq =
                    new com.aidatabaseassistant.dto.CreateChatSessionRequest(request.getConnectionId(), "New Chat Session");
            com.aidatabaseassistant.dto.ChatSessionDto createdDto = chatSessionService.createSession(createReq, userEmail);
            session = chatSessionService.getSessionEntity(createdDto.getId(), userEmail);
        }

        Long connectionId = (request.getConnectionId() != null && request.getConnectionId() > 0)
                ? request.getConnectionId()
                : (session.getDatabaseConnection() != null ? session.getDatabaseConnection().getId() : 1L);
        
        // 2. Load History
        java.util.List<com.aidatabaseassistant.entity.ChatMessage> history = chatMessageService.getHistoryForPrompt(session);

        // 3. Fetch relevant schema
        DatabaseSchema schema = schemaService.selectRelevantSchema(connectionId, request.getMessage(), userEmail);

        // 4. Generate raw SQL via LLM using History
        SqlGeneratorService.GeneratedSqlResult sqlResult = sqlGeneratorService.generateSql(request, schema, history);
        String rawSql = sqlResult.getSql();
        String activeModelName = sqlResult.getProviderName();

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

        // 10. Generate Visualization & Return Response
        com.aidatabaseassistant.formatter.visualization.dto.VisualizationResponse visualization = responseFormatter.buildVisualization(queryResult);
        return new ChatResponse(session.getId(), safeSql, activeModelName, executionTimeMs, queryResult, visualization);
    }
}
