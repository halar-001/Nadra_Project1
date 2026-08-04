package com.aidatabaseassistant.service;

import com.aidatabaseassistant.model.schema.DatabaseSchema;
import org.springframework.stereotype.Service;

@Service
public class SchemaService {

    private final SchemaCacheService schemaCacheService;
    private final SchemaSelectorService schemaSelectorService;

    public SchemaService(SchemaCacheService schemaCacheService, SchemaSelectorService schemaSelectorService) {
        this.schemaCacheService = schemaCacheService;
        this.schemaSelectorService = schemaSelectorService;
    }

    public DatabaseSchema getSchema(Long connectionId, String userEmail) {
        return schemaCacheService.getSchema(connectionId, userEmail);
    }

    public DatabaseSchema refreshSchema(Long connectionId, String userEmail) {
        return schemaCacheService.refreshSchema(connectionId, userEmail);
    }

    public DatabaseSchema selectRelevantSchema(Long connectionId, String query, String userEmail) {
        return schemaSelectorService.selectRelevantSchema(connectionId, query, userEmail);
    }
}
