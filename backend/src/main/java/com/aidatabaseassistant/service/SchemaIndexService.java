package com.aidatabaseassistant.service;

import com.aidatabaseassistant.model.schema.ColumnMetadata;
import com.aidatabaseassistant.model.schema.DatabaseSchema;
import com.aidatabaseassistant.model.schema.TableMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SchemaIndexService {

    private static final Logger logger = LoggerFactory.getLogger(SchemaIndexService.class);

    // Map: connectionId -> (lowercase keyword -> Set of matching table names)
    private final Map<Long, Map<String, Set<String>>> schemaIndexes = new ConcurrentHashMap<>();

    /**
     * Builds an inverted keyword and vocabulary index for rapid table matching during AI schema retrieval.
     */
    public void buildIndex(Long connectionId, DatabaseSchema schema) {
        Map<String, Set<String>> index = new HashMap<>();

        if (schema == null || schema.getTables() == null) {
            return;
        }

        for (TableMetadata table : schema.getTables()) {
            String tableName = table.getTableName();
            if (tableName == null) continue;

            // Index table name directly and its normalized/singular roots
            addTokensToIndex(index, tableName, tableName);

            // Index all column names to point to this table
            for (ColumnMetadata col : table.getColumns()) {
                if (col.getColumnName() != null) {
                    addTokensToIndex(index, col.getColumnName(), tableName);
                }
            }
        }

        // Add domain synonym mapping to enrich rule-based retrieval before vector embedding upgrades
        enrichWithCommonSynonyms(index);

        schemaIndexes.put(connectionId, index);
        logger.info("Built vocabulary schema index for connection ID: {} with {} index keys", connectionId, index.size());
    }

    /**
     * Look up table names matching keywords inside a natural language prompt.
     */
    public Set<String> lookupTables(Long connectionId, String userPrompt) {
        Set<String> matchedTables = new HashSet<>();
        Map<String, Set<String>> index = schemaIndexes.get(connectionId);
        if (index == null || userPrompt == null || userPrompt.isBlank()) {
            return matchedTables;
        }

        // Tokenize prompt by alphanumeric word boundaries
        String[] words = userPrompt.toLowerCase().split("[^a-z0-9_]+");
        for (String word : words) {
            if (word.length() < 2) continue; // skip single letters

            // Match exact word
            if (index.containsKey(word)) {
                matchedTables.addAll(index.get(word));
            }

            // Try stem variations (singular / plural)
            String singular = toSingular(word);
            if (!singular.equals(word) && index.containsKey(singular)) {
                matchedTables.addAll(index.get(singular));
            }
            String plural = word + "s";
            if (index.containsKey(plural)) {
                matchedTables.addAll(index.get(plural));
            }
            String esPlural = word + "es";
            if (index.containsKey(esPlural)) {
                matchedTables.addAll(index.get(esPlural));
            }
        }

        logger.debug("Lookup for query [{}] against connection {} matched tables: {}", userPrompt, connectionId, matchedTables);
        return matchedTables;
    }

    public void removeIndex(Long connectionId) {
        schemaIndexes.remove(connectionId);
    }

    public boolean containsIndex(Long connectionId) {
        return schemaIndexes.containsKey(connectionId);
    }

    private void addTokensToIndex(Map<String, Set<String>> index, String phrase, String tableName) {
        // Break compound names like "department_id", "courseAssignment", or "student_details"
        String cleaned = phrase.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
        String[] tokens = cleaned.split("[^a-z0-9]+");

        for (String token : tokens) {
            if (token.isBlank() || isStopWord(token)) {
                continue;
            }
            index.computeIfAbsent(token, k -> new HashSet<>()).add(tableName);
            String singular = toSingular(token);
            if (!singular.equals(token)) {
                index.computeIfAbsent(singular, k -> new HashSet<>()).add(tableName);
            }
        }
    }

    private void enrichWithCommonSynonyms(Map<String, Set<String>> index) {
        // Example academic & enterprise domain mappings
        mapSynonym(index, "teacher", "instructor", "professor", "faculty");
        mapSynonym(index, "student", "pupil", "scholar");
        mapSynonym(index, "course", "class", "subject", "module");
        mapSynonym(index, "department", "faculty", "school");
        mapSynonym(index, "employee", "staff", "worker");
    }

    private void mapSynonym(Map<String, Set<String>> index, String baseKey, String... synonyms) {
        if (index.containsKey(baseKey)) {
            Set<String> targetTables = index.get(baseKey);
            for (String synonym : synonyms) {
                index.computeIfAbsent(synonym, k -> new HashSet<>()).addAll(targetTables);
                index.computeIfAbsent(synonym + "s", k -> new HashSet<>()).addAll(targetTables);
            }
        }
    }

    private String toSingular(String word) {
        if (word.endsWith("ies") && word.length() > 4) {
            return word.substring(0, word.length() - 3) + "y";
        }
        if (word.endsWith("es") && word.length() > 3 && (word.endsWith("shes") || word.endsWith("ches") || word.endsWith("xes") || word.endsWith("zes") || word.endsWith("ses"))) {
            return word.substring(0, word.length() - 2);
        }
        if (word.endsWith("s") && !word.endsWith("ss") && word.length() > 3) {
            return word.substring(0, word.length() - 1);
        }
        return word;
    }

    private boolean isStopWord(String token) {
        Set<String> stopWords = Set.of("the", "and", "for", "all", "with", "from", "who", "what", "where", "show", "get", "find", "list", "are", "have", "been", "was");
        return stopWords.contains(token);
    }
}
