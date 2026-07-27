package com.aidatabaseassistant.service;

import com.aidatabaseassistant.dto.ConnectionResponse;
import com.aidatabaseassistant.dto.CreateConnectionRequest;
import com.aidatabaseassistant.dto.TestConnectionRequest;
import com.aidatabaseassistant.dto.TestConnectionResponse;
import com.aidatabaseassistant.dto.UpdateConnectionRequest;
import com.aidatabaseassistant.entity.DatabaseConnection;
import com.aidatabaseassistant.repository.DatabaseConnectionRepository;
import com.aidatabaseassistant.security.EncryptionService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:test_conn_db;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=sa",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "security.encryption.secret=test_secure_encryption_secret_key_256bit_val"
})
@Transactional
public class ConnectionManagementIntegrationTest {

    @Autowired
    private ConnectionService connectionService;

    @Autowired
    private EncryptionService encryptionService;

    @Autowired
    private DatabaseConnectionRepository connectionRepository;

    private static final String ADMIN_1 = "admin1@aidatabaseassistant.com";
    private static final String ADMIN_2 = "admin2@aidatabaseassistant.com";

    @Test
    public void testEncryptionAndDecryption() {
        String rawPassword = "SuperSecretMySqlPassword123!";
        String encrypted = encryptionService.encrypt(rawPassword);
        
        Assertions.assertNotNull(encrypted);
        Assertions.assertNotEquals(rawPassword, encrypted, "Password must not be stored or transmitted as plaintext");
        
        String decrypted = encryptionService.decrypt(encrypted);
        Assertions.assertEquals(rawPassword, decrypted, "Decryption must accurately recover original password");
    }

    @Test
    public void testLiveJdbcConnectionValidation() {
        // Test 1: Valid connection using running local H2 instance
        TestConnectionRequest validReq = new TestConnectionRequest("H2", "mem", 3306, "test_conn_db", "sa", "sa");
        TestConnectionResponse validResp = connectionService.testConnection(validReq);
        Assertions.assertTrue(validResp.isSuccess(), "Expected H2 test connection to succeed");
        Assertions.assertNull(validResp.getMessage());

        // Test 2: Invalid connection (unreachable host/port)
        TestConnectionRequest invalidReq = new TestConnectionRequest("MYSQL", "256.256.256.256", 1111, "non_existent_db", "user", "pass");
        TestConnectionResponse invalidResp = connectionService.testConnection(invalidReq);
        Assertions.assertFalse(invalidResp.isSuccess(), "Expected invalid host test connection to fail");
        Assertions.assertNotNull(invalidResp.getMessage());
    }

    @Test
    public void testConnectionCrudAndTenantIsolation() {
        // 1. Create connection for Admin 1
        CreateConnectionRequest createReq = new CreateConnectionRequest(
                "Production MySQL", "MYSQL", "localhost", 3306, "prod_db", "root", "secret_pass_1"
        );
        ConnectionResponse created = connectionService.createConnection(ADMIN_1, createReq);
        Assertions.assertNotNull(created.getId());
        Assertions.assertEquals("Production MySQL", created.getConnectionName());

        // Verify password in DB is encrypted and not plaintext
        Optional<DatabaseConnection> savedEntity = connectionRepository.findById(created.getId());
        Assertions.assertTrue(savedEntity.isPresent());
        Assertions.assertNotEquals("secret_pass_1", savedEntity.get().getEncryptedPassword());

        // 2. Test Duplicate Name Rejection for same user
        Assertions.assertThrows(RuntimeException.class, () -> {
            connectionService.createConnection(ADMIN_1, createReq);
        }, "Should reject duplicate connection name for the same user");

        // 3. Verify Admin 1 can retrieve connections
        List<ConnectionResponse> admin1Conns = connectionService.getAllConnections(ADMIN_1);
        Assertions.assertFalse(admin1Conns.isEmpty());
        Assertions.assertEquals("Production MySQL", admin1Conns.get(0).getConnectionName());

        // 4. Verify Tenant Ownership Isolation: Admin 2 cannot see or access Admin 1's connection!
        Assertions.assertThrows(RuntimeException.class, () -> {
            connectionService.getConnectionById(ADMIN_2, created.getId());
        }, "Admin 2 must not have access to Admin 1's connection details (403/Access Denied)");

        // 5. Update Connection credentials by Admin 1
        UpdateConnectionRequest updateReq = new UpdateConnectionRequest(
                "Updated MySQL DB", "MYSQL", "localhost", 3306, "prod_db", "root", "new_secret_pass_2"
        );
        ConnectionResponse updated = connectionService.updateConnection(ADMIN_1, created.getId(), updateReq);
        Assertions.assertEquals("Updated MySQL DB", updated.getConnectionName());

        // 6. Verify Tenant Isolation on Deletion: Admin 2 cannot delete Admin 1's connection!
        Assertions.assertThrows(RuntimeException.class, () -> {
            connectionService.deleteConnection(ADMIN_2, created.getId());
        }, "Admin 2 must not be permitted to delete Admin 1's connection");

        // 7. Legitimate deletion by Admin 1 succeeds
        connectionService.deleteConnection(ADMIN_1, created.getId());
        Assertions.assertTrue(connectionService.getAllConnections(ADMIN_1).isEmpty(), "Connection should be cleanly deleted");
    }
}
