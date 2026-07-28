package com.aidatabaseassistant.service;

import com.aidatabaseassistant.model.schema.DatabaseSchema;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SchemaCacheService {

    private static final Logger logger = LoggerFactory.getLogger(SchemaCacheService.class);

    // Key: connectionId -> Value: DatabaseSchema
    private final Map<Long, DatabaseSchema> schemaCache = new ConcurrentHashMap<>();

    private final SchemaReaderService schemaReaderService;
    private final SchemaIndexService schemaIndexService;
    private final ConnectionService connectionService;

    public SchemaCacheService(SchemaReaderService schemaReaderService, 
                              SchemaIndexService schemaIndexService,
                              ConnectionService connectionService) {
        this.schemaReaderService = schemaReaderService;
        this.schemaIndexService = schemaIndexService;
        this.connectionService = connectionService;
    }

    /**
     * Returns schema from in-memory cache if present. Otherwise reads from external DB and caches it.
     * Enforces strict user ownership validation before returning cached schemas.
     */
    public DatabaseSchema getSchema(Long connectionId, String userEmail) {
        // Enforce zero-trust tenant ownership validation before inspecting memory cache
        connectionService.getConnectionById(userEmail, connectionId);

        if (contains(connectionId)) {
            logger.info("Schema Cache HIT for connection ID: {} (Tenant Verified: {})", connectionId, userEmail);
            DatabaseSchema cachedSchema = schemaCache.get(connectionId);
            cachedSchema.setFromCache(true);
            return cachedSchema;
        }

        logger.info("Schema Cache MISS for connection ID: {}. Reading metadata via SchemaReaderService...", connectionId);
        DatabaseSchema readSchema = schemaReaderService.readSchema(connectionId, userEmail);
        readSchema.setFromCache(false);
        
        putSchema(connectionId, readSchema);
        return readSchema;
    }

    /**
     * Stores schema directly into cache and builds inverted keyword vocabulary index.
     */
    public void putSchema(Long connectionId, DatabaseSchema schema) {
        if (connectionId != null && schema != null) {
            schemaCache.put(connectionId, schema);
            schemaIndexService.buildIndex(connectionId, schema);
            logger.debug("Cached database schema for connection ID: {}", connectionId);
        }
    }

    /**
     * Removes cached schema and its associated keyword index.
     */
    public void removeSchema(Long connectionId) {
        if (connectionId != null) {
            schemaCache.remove(connectionId);
            schemaIndexService.removeIndex(connectionId);
            logger.info("Evicted schema from cache for connection ID: {}", connectionId);
        }
    }

    /**
     * Forces real-time metadata reload from external database socket and updates cache & vocabulary index.
     */
    public DatabaseSchema refreshSchema(Long connectionId, String userEmail) {
        // Enforce zero-trust tenant ownership validation before force refreshing
        connectionService.getConnectionById(userEmail, connectionId);

        logger.info("Forcing schema refresh for connection ID: {} by user: {}", connectionId, userEmail);
        removeSchema(connectionId);

        DatabaseSchema freshSchema = schemaReaderService.readSchema(connectionId, userEmail);
        freshSchema.setFromCache(false);

        putSchema(connectionId, freshSchema);
        return freshSchema;
    }

    /**
     * Checks whether cache currently holds metadata for the given connection ID.
     */
    public boolean contains(Long connectionId) {
        return connectionId != null && schemaCache.containsKey(connectionId);
    }
}
