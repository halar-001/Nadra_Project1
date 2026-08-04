package com.aidatabaseassistant.service;

import com.aidatabaseassistant.model.schema.DatabaseSchema;
import com.aidatabaseassistant.model.schema.RelationshipMetadata;
import com.aidatabaseassistant.model.schema.TableMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SchemaSelectorService {

    private static final Logger logger = LoggerFactory.getLogger(SchemaSelectorService.class);

    private final SchemaCacheService schemaCacheService;
    private final SchemaIndexService schemaIndexService;

    public SchemaSelectorService(SchemaCacheService schemaCacheService, SchemaIndexService schemaIndexService) {
        this.schemaCacheService = schemaCacheService;
        this.schemaIndexService = schemaIndexService;
    }

    /**
     * Intelligently selects only relevant tables and relationships for an inbound natural language prompt.
     * Prevents overwhelming the Phase 5 LLM Prompt Builder with 80+ enterprise tables.
     */
    public DatabaseSchema selectRelevantSchema(Long connectionId, String userPrompt, String userEmail) {
        // 1. Ensure schema is loaded & cached
        DatabaseSchema fullSchema = schemaCacheService.getSchema(connectionId, userEmail);

        if (userPrompt == null || userPrompt.isBlank()) {
            return fullSchema;
        }

        // 2. Query SchemaIndexService for initial keyword matches
        Set<String> matchedTableNames = new HashSet<>(schemaIndexService.lookupTables(connectionId, userPrompt));

        // If index matched nothing (e.g., vague prompt), fall back to returning tables or top tables
        if (matchedTableNames.isEmpty()) {
            logger.info("No explicit table keywords matched for prompt [{}]. Returning full schema fallback.", userPrompt);
            return fullSchema;
        }

        logger.info("Initial keyword index matched tables: {} for prompt [{}]", matchedTableNames, userPrompt);

        // 3. Perform Relational Graph Expansion (Auto-include required junction/bridge tables)
        expandWithBridgeTables(matchedTableNames, fullSchema.getRelationships(), fullSchema.getTables());

        // 4. Construct lightweight pruned DatabaseSchema
        DatabaseSchema prunedSchema = new DatabaseSchema(
                fullSchema.getConnectionId(),
                fullSchema.getDatabaseName(),
                fullSchema.getDatabaseType()
        );
        prunedSchema.setFromCache(fullSchema.isFromCache());

        for (TableMetadata table : fullSchema.getTables()) {
            if (containsIgnoreCase(matchedTableNames, table.getTableName())) {
                prunedSchema.addTable(table);
            }
        }

        // 5. Include only relationships linking the pruned tables
        for (RelationshipMetadata rel : fullSchema.getRelationships()) {
            boolean parentIncluded = containsIgnoreCase(matchedTableNames, rel.getParentTable());
            boolean childIncluded = containsIgnoreCase(matchedTableNames, rel.getChildTable());
            if (parentIncluded && childIncluded) {
                prunedSchema.addRelationship(rel);
            }
        }

        logger.info("Pruned schema from {} tables down to {} relevant tables for connection ID: {}",
                fullSchema.getTables().size(), prunedSchema.getTables().size(), connectionId);

        return prunedSchema;
    }

    /**
     * Finds junction/joining tables that bridge two distinct matched tables (e.g. course_assignment connecting teachers and courses).
     */
    private void expandWithBridgeTables(Set<String> matchedTableNames, List<RelationshipMetadata> allRels, List<TableMetadata> allTables) {
        Set<String> toAdd = new HashSet<>();

        // Map: childTable -> Set of parentTables it points to
        Map<String, Set<String>> parentLinks = new HashMap<>();
        for (RelationshipMetadata rel : allRels) {
            if (rel.getChildTable() != null && rel.getParentTable() != null) {
                parentLinks.computeIfAbsent(rel.getChildTable().toLowerCase(), k -> new HashSet<>()).add(rel.getParentTable().toLowerCase());
            }
        }

        // Check every candidate table to see if it links two already matched tables
        for (TableMetadata table : allTables) {
            String candidateName = table.getTableName().toLowerCase();
            if (containsIgnoreCase(matchedTableNames, candidateName)) {
                continue; // already in set
            }
            Set<String> parents = parentLinks.get(candidateName);
            if (parents != null && parents.size() >= 2) {
                int countMatchedParents = 0;
                for (String p : parents) {
                    if (containsIgnoreCase(matchedTableNames, p)) {
                        countMatchedParents++;
                    }
                }
                // If this unselected table bridges 2+ selected tables, it's an essential join table! Add it!
                if (countMatchedParents >= 2) {
                    toAdd.add(table.getTableName());
                    logger.debug("Auto-expanding relevant set with bridge table: {}", table.getTableName());
                }
            }
        }

        matchedTableNames.addAll(toAdd);
    }

    private boolean containsIgnoreCase(Set<String> set, String target) {
        if (target == null) return false;
        for (String s : set) {
            if (s.equalsIgnoreCase(target)) {
                return true;
            }
        }
        return false;
    }
}
