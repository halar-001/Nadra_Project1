package com.aidatabaseassistant.service;

import com.aidatabaseassistant.dto.ChatRequest;
import com.aidatabaseassistant.dto.ChatResponse;
import com.aidatabaseassistant.executor.QueryExecutorService;
import com.aidatabaseassistant.formatter.QueryResponse;
import com.aidatabaseassistant.model.schema.DatabaseSchema;
import com.aidatabaseassistant.policy.PolicyEngine;
import com.aidatabaseassistant.service.SchemaService;
import com.aidatabaseassistant.service.SqlGeneratorService;
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

    public QueryPipelineService(SchemaService schemaService, SqlGeneratorService sqlGeneratorService,
                                SqlValidator sqlValidator, PolicyEngine policyEngine,
                                QueryExecutorService queryExecutorService) {
        this.schemaService = schemaService;
        this.sqlGeneratorService = sqlGeneratorService;
        this.sqlValidator = sqlValidator;
        this.policyEngine = policyEngine;
        this.queryExecutorService = queryExecutorService;
    }

    public ChatResponse processQuery(ChatRequest request, String userEmail) {
        long startTime = System.currentTimeMillis();

        // 1. Fetch relevant schema (Phase 4)
        DatabaseSchema schema = schemaService.selectRelevantSchema(request.getConnectionId(), request.getMessage(), userEmail);

        // 2. Generate raw SQL via LLM (Phase 5)
        String rawSql = sqlGeneratorService.generateSql(request, schema);

        // 3. Validate Syntax & Ensure Single SELECT (Phase 6 - Module 1)
        Select selectStatement = sqlValidator.validateAndParse(rawSql);

        // 4. Enforce Policies & Inject Limits (Phase 6 - Module 2)
        String safeSql = policyEngine.enforcePolicies(selectStatement);

        // 5. Execute Query & Format Response (Phase 6 - Modules 3 & 4)
        QueryResponse queryResult = queryExecutorService.executeQuery(request.getConnectionId(), userEmail, safeSql);

        long executionTimeMs = System.currentTimeMillis() - startTime;

        return new ChatResponse(safeSql, "auto-fallback-engine", executionTimeMs, queryResult);
    }
}
