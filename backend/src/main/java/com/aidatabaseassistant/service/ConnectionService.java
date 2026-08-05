package com.aidatabaseassistant.service;

import com.aidatabaseassistant.dto.*;
import com.aidatabaseassistant.entity.DatabaseConnection;
import com.aidatabaseassistant.entity.User;
import com.aidatabaseassistant.repository.DatabaseConnectionRepository;
import com.aidatabaseassistant.repository.UserRepository;
import com.aidatabaseassistant.security.EncryptionService;
import com.aidatabaseassistant.audit.service.AuditFacade;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ConnectionService {

    private final DatabaseConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final EncryptionService encryptionService;
    private final com.aidatabaseassistant.repository.ChatSessionRepository chatSessionRepository;
    private final com.aidatabaseassistant.repository.ChatMessageRepository chatMessageRepository;
    private final AuditFacade auditFacade;

    public ConnectionService(DatabaseConnectionRepository connectionRepository, UserRepository userRepository, EncryptionService encryptionService, com.aidatabaseassistant.repository.ChatSessionRepository chatSessionRepository, com.aidatabaseassistant.repository.ChatMessageRepository chatMessageRepository, AuditFacade auditFacade) {
        this.connectionRepository = connectionRepository;
        this.userRepository = userRepository;
        this.encryptionService = encryptionService;
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.auditFacade = auditFacade;
    }

    public TestConnectionResponse testConnection(String userEmail, TestConnectionRequest request) {
        String url = buildJdbcUrl(request.getDatabaseType(), request.getHost(), request.getPort(), request.getDatabaseName());
        Long userId = userEmail != null ? getUserByEmail(userEmail).getId() : null;
        try {
            DriverManager.setLoginTimeout(5); // 5-second timeout for testing
            try (Connection conn = DriverManager.getConnection(url, request.getUsername(), request.getPassword())) {
                if (conn.isValid(2)) {
                    if (userId != null) auditFacade.logConnectionTested(userId, null, true, null);
                    return TestConnectionResponse.ok();
                }
                if (userId != null) auditFacade.logConnectionTested(userId, null, false, "Connection opened but failed validity test.");
                return TestConnectionResponse.fail("Connection opened but failed validity test.");
            }
        } catch (SQLException e) {
            if (userId != null) auditFacade.logConnectionTested(userId, null, false, e.getMessage());
            return TestConnectionResponse.fail("Connection failed: " + e.getMessage());
        }
    }

    public List<ConnectionResponse> getAllConnections(String userEmail) {
        User user = getUserByEmail(userEmail);
        return connectionRepository.findByUserId(user.getId()).stream()
                .map(ConnectionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<AdminConnectionResponse> getAllConnectionsForAdmin() {
        return connectionRepository.findAll().stream()
                .map(AdminConnectionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ConnectionResponse getConnectionById(String userEmail, Long id) {
        User user = getUserByEmail(userEmail);
        DatabaseConnection conn = connectionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Database connection not found or access denied"));
        return ConnectionResponse.fromEntity(conn);
    }

    public ConnectionResponse createConnection(String userEmail, CreateConnectionRequest request) {
        User user = getUserByEmail(userEmail);

        if (connectionRepository.existsByConnectionNameAndUserId(request.getConnectionName(), user.getId())) {
            throw new RuntimeException("A connection with the name '" + request.getConnectionName() + "' already exists for your account.");
        }

        String encryptedPassword = encryptionService.encrypt(request.getPassword());

        DatabaseConnection conn = DatabaseConnection.builder()
                .user(user)
                .connectionName(request.getConnectionName())
                .databaseType(request.getDatabaseType().toUpperCase())
                .host(request.getHost())
                .port(request.getPort())
                .databaseName(request.getDatabaseName())
                .username(request.getUsername())
                .encryptedPassword(encryptedPassword)
                .build();

        DatabaseConnection saved = connectionRepository.save(conn);
        auditFacade.logConnectionCreated(user.getId(), saved.getId());
        return ConnectionResponse.fromEntity(saved);
    }

    public ConnectionResponse updateConnection(String userEmail, Long id, UpdateConnectionRequest request) {
        User user = getUserByEmail(userEmail);

        DatabaseConnection conn = connectionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Database connection not found or access denied"));

        if (!conn.getConnectionName().equalsIgnoreCase(request.getConnectionName()) 
                && connectionRepository.existsByConnectionNameAndUserId(request.getConnectionName(), user.getId())) {
            throw new RuntimeException("A connection with the name '" + request.getConnectionName() + "' already exists for your account.");
        }

        conn.setConnectionName(request.getConnectionName());
        conn.setDatabaseType(request.getDatabaseType().toUpperCase());
        conn.setHost(request.getHost());
        conn.setPort(request.getPort());
        conn.setDatabaseName(request.getDatabaseName());
        conn.setUsername(request.getUsername());
        conn.setEncryptedPassword(encryptionService.encrypt(request.getPassword()));

        DatabaseConnection updated = connectionRepository.save(conn);
        auditFacade.logConnectionUpdated(user.getId(), updated.getId());
        return ConnectionResponse.fromEntity(updated);
    }

    public void deleteConnection(String userEmail, Long id) {
        User user = getUserByEmail(userEmail);

        DatabaseConnection conn = connectionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Database connection not found or access denied"));

        // Delete associated chat messages and sessions to avoid Foreign Key violation
        List<com.aidatabaseassistant.entity.ChatSession> sessions = chatSessionRepository.findByDatabaseConnection(conn);
        for (com.aidatabaseassistant.entity.ChatSession s : sessions) {
            chatMessageRepository.deleteByChatSession(s);
            chatSessionRepository.delete(s);
        }

        connectionRepository.delete(conn);
        auditFacade.logConnectionDeleted(user.getId(), conn.getId());
    }

    /**
     * Helper method to create a dynamic JDBC connection for subsequent AI query executions.
     * Enforces user ownership verification and decrypts credentials securely on-the-fly.
     */
    public Connection getDynamicJdbcConnection(Long connectionId, String userEmail) throws SQLException {
        User user = getUserByEmail(userEmail);
        DatabaseConnection dbConn = connectionRepository.findByIdAndUserId(connectionId, user.getId())
                .orElseThrow(() -> new RuntimeException("Database connection not found or access denied (403 Forbidden)"));

        String rawPassword = encryptionService.decrypt(dbConn.getEncryptedPassword());
        String url = buildJdbcUrl(dbConn.getDatabaseType(), dbConn.getHost(), dbConn.getPort(), dbConn.getDatabaseName());
        
        DriverManager.setLoginTimeout(10);
        return DriverManager.getConnection(url, dbConn.getUsername(), rawPassword);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    private String buildJdbcUrl(String databaseType, String host, int port, String databaseName) {
        String type = databaseType != null ? databaseType.toUpperCase() : "MYSQL";
        return switch (type) {
            case "MYSQL" -> "jdbc:mysql://" + host + ":" + port + "/" + databaseName + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&connectTimeout=5000";
            case "POSTGRESQL", "POSTGRES" -> "jdbc:postgresql://" + host + ":" + port + "/" + databaseName + "?connectTimeout=5";
            case "SQLSERVER", "MSSQL" -> "jdbc:sqlserver://" + host + ":" + port + ";databaseName=" + databaseName + ";encrypt=true;trustServerCertificate=true;loginTimeout=5";
            case "ORACLE" -> "jdbc:oracle:thin:@" + host + ":" + port + ":" + databaseName;
            case "H2" -> "jdbc:h2:mem:" + databaseName + ";DB_CLOSE_DELAY=-1";
            default -> "jdbc:mysql://" + host + ":" + port + "/" + databaseName + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&connectTimeout=5000";
        };
    }
}
