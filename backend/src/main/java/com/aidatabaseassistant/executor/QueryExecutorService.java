package com.aidatabaseassistant.executor;

import com.aidatabaseassistant.formatter.QueryResponse;
import com.aidatabaseassistant.formatter.ResultFormatter;
import com.aidatabaseassistant.service.ConnectionService;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@Service
public class QueryExecutorService {

    private final ConnectionService connectionService;
    private final ResultFormatter resultFormatter;

    public QueryExecutorService(ConnectionService connectionService, ResultFormatter resultFormatter) {
        this.connectionService = connectionService;
        this.resultFormatter = resultFormatter;
    }

    public QueryResponse executeQuery(Long connectionId, String userEmail, String sql) {
        long startTime = System.currentTimeMillis();
        
        try (Connection conn = connectionService.getDynamicJdbcConnection(connectionId, userEmail)) {
            
            // Set a strict timeout to prevent hung queries (10 seconds)
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setQueryTimeout(10);
                
                try (ResultSet rs = stmt.executeQuery()) {
                    long executionTimeMs = System.currentTimeMillis() - startTime;
                    return resultFormatter.format(rs, executionTimeMs);
                }
            }
            
        } catch (SQLException e) {
            throw new RuntimeException("Database Execution Error: " + e.getMessage(), e);
        }
    }
}
