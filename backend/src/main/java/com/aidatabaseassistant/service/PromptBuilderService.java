package com.aidatabaseassistant.service;

import com.aidatabaseassistant.model.schema.ColumnMetadata;
import com.aidatabaseassistant.model.schema.DatabaseSchema;
import com.aidatabaseassistant.model.schema.RelationshipMetadata;
import com.aidatabaseassistant.model.schema.TableMetadata;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class PromptBuilderService {

    public String build(String userQuestion, DatabaseSchema schema, java.util.List<com.aidatabaseassistant.entity.ChatMessage> chatHistory) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("You are an expert ").append(schema.getDatabaseType()).append(" SQL assistant.\n\n");
        prompt.append("Rules:\n");
        prompt.append("- Generate ONLY a single SELECT query.\n");
        prompt.append("- Never use INSERT, UPDATE, DELETE, DROP, ALTER, or TRUNCATE.\n");
        prompt.append("- Use table aliases.\n");
        prompt.append("- Use explicit JOIN conditions.\n");
        prompt.append("- Do not explain the query. Output strictly the SQL.\n\n");
        
        prompt.append("Schema:\n");
        for (TableMetadata table : schema.getTables()) {
            prompt.append("Table ").append(table.getTableName()).append("(");
            String columns = table.getColumns().stream()
                    .map(ColumnMetadata::getColumnName)
                    .collect(Collectors.joining(", "));
            prompt.append(columns).append(")\n");
        }
        
        prompt.append("\nRelationships:\n");
        if (schema.getRelationships() == null || schema.getRelationships().isEmpty()) {
            prompt.append("None explicitly defined.\n");
        } else {
            for (RelationshipMetadata rel : schema.getRelationships()) {
                prompt.append(rel.getParentTable()).append(".").append(rel.getParentColumn())
                      .append(" -> ")
                      .append(rel.getChildTable()).append(".").append(rel.getChildColumn())
                      .append("\n");
            }
        }
        
        if (chatHistory != null && !chatHistory.isEmpty()) {
            prompt.append("\nConversation History:\n");
            for (com.aidatabaseassistant.entity.ChatMessage msg : chatHistory) {
                prompt.append(msg.getRole() == com.aidatabaseassistant.entity.ChatRole.USER ? "User: " : "Assistant: ")
                      .append(msg.getMessage()).append("\n");
                if (msg.getRole() == com.aidatabaseassistant.entity.ChatRole.ASSISTANT && msg.getValidatedSql() != null) {
                    prompt.append("SQL Context: ").append(msg.getValidatedSql()).append("\n");
                }
            }
        }
        
        prompt.append("\nUser Question:\n").append(userQuestion).append("\n");
        
        return prompt.toString();
    }
}
