package com.aidatabaseassistant.service;

import com.aidatabaseassistant.dto.CreateConnectionRequest;
import com.aidatabaseassistant.dto.ConnectionResponse;
import com.aidatabaseassistant.entity.User;
import com.aidatabaseassistant.model.schema.*;
import com.aidatabaseassistant.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Connection;
import java.sql.Statement;
import java.util.List;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:test_schema_db;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=sa",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "security.encryption.secret=test_master_secret_key_for_integration_testing_only"
})
public class SchemaManagementIntegrationTest {

    @Autowired
    private SchemaService schemaService;

    @Autowired
    private ConnectionService connectionService;

    @Autowired
    private UserRepository userRepository;

    private static final String TENANT_A_EMAIL = "tenant_a_schema@nadra.gov.pk";
    private static final String TENANT_B_EMAIL = "tenant_b_schema@nadra.gov.pk";

    private void seedTestUsers() {
        if (userRepository.findByEmail(TENANT_A_EMAIL).isEmpty()) {
            User userA = new User();
            userA.setEmail(TENANT_A_EMAIL);
            userA.setFullName("Tenant A Schema Admin");
            userA.setPassword("$2a$10$abcdefghijklmnopqrstuv");
            userA.setEnabled(true);
            userRepository.save(userA);
        }
        if (userRepository.findByEmail(TENANT_B_EMAIL).isEmpty()) {
            User userB = new User();
            userB.setEmail(TENANT_B_EMAIL);
            userB.setFullName("Tenant B Unauthorized");
            userB.setPassword("$2a$10$abcdefghijklmnopqrstuv");
            userB.setEnabled(true);
            userRepository.save(userB);
        }
    }

    private void initExternalTestDatabase(Long connectionId, String email) throws Exception {
        try (Connection conn = connectionService.getDynamicJdbcConnection(connectionId, email);
             Statement stmt = conn.createStatement()) {
            
            stmt.execute("CREATE TABLE departments (" +
                         "department_id INT PRIMARY KEY, " +
                         "name VARCHAR(100) NOT NULL);");

            stmt.execute("CREATE TABLE teachers (" +
                         "teacher_id INT PRIMARY KEY, " +
                         "name VARCHAR(100), " +
                         "department_id INT, " +
                         "FOREIGN KEY (department_id) REFERENCES departments(department_id));");

            stmt.execute("CREATE TABLE courses (" +
                         "course_id INT PRIMARY KEY, " +
                         "title VARCHAR(100), " +
                         "credits INT);");

            stmt.execute("CREATE TABLE course_assignment (" +
                         "teacher_id INT, " +
                         "course_id INT, " +
                         "PRIMARY KEY (teacher_id, course_id), " +
                         "FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id), " +
                         "FOREIGN KEY (course_id) REFERENCES courses(course_id));");
        }
    }

    @Test
    public void testSchemaReaderCacheAndSelectorLifecycle() throws Exception {
        seedTestUsers();

        // 1. Create connection profile for Tenant A
        CreateConnectionRequest req = new CreateConnectionRequest(
                "University H2 DB", "H2", "localhost", 3306, "uni_test_db", "sa", ""
        );
        ConnectionResponse connResp = connectionService.createConnection(TENANT_A_EMAIL, req);
        Long connId = connResp.getId();

        // 2. Initialize schema tables in external target DB
        initExternalTestDatabase(connId, TENANT_A_EMAIL);

        // 3. Test Schema Reading & Cache MISS on initial call
        DatabaseSchema initialSchema = schemaService.getSchema(connId, TENANT_A_EMAIL);
        Assertions.assertNotNull(initialSchema);
        Assertions.assertFalse(initialSchema.isFromCache(), "Initial retrieval must be a Cache MISS (read from JDBC metadata)");
        Assertions.assertEquals(4, initialSchema.getTables().size(), "Should discover exactly 4 tables (departments, teachers, courses, course_assignment)");

        TableMetadata teacherTable = initialSchema.findTable("teachers");
        Assertions.assertNotNull(teacherTable);
        Assertions.assertTrue(teacherTable.getPrimaryKeys().contains("TEACHER_ID") || teacherTable.getPrimaryKeys().contains("teacher_id") || teacherTable.getPrimaryKeys().contains("teacher_id".toUpperCase()));

        // 4. Verify Relationship & M2M Cardinality Inference
        List<RelationshipMetadata> rels = initialSchema.getRelationships();
        Assertions.assertFalse(rels.isEmpty());
        boolean m2mDetected = rels.stream().anyMatch(r -> r.getRelationshipType() == RelationshipType.MANY_TO_MANY);
        Assertions.assertTrue(m2mDetected, "Should automatically infer MANY_TO_MANY cardinality across junction table course_assignment");

        // 5. Test Cache HIT on subsequent read
        DatabaseSchema cachedSchema = schemaService.getSchema(connId, TENANT_A_EMAIL);
        Assertions.assertTrue(cachedSchema.isFromCache(), "Second call must hit SchemaCacheService in memory (0ms overhead)");
        Assertions.assertEquals(initialSchema.getTables().size(), cachedSchema.getTables().size());

        // 6. Test Force Refresh Schema
        DatabaseSchema refreshedSchema = schemaService.refreshSchema(connId, TENANT_A_EMAIL);
        Assertions.assertFalse(refreshedSchema.isFromCache(), "Force refresh must evict cache and perform fresh JDBC read");

        // 7. Test Intelligent Schema Selector & Vocabulary Synonyms
        // Query asks for "instructor" (synonym for teacher) and "courses"
        DatabaseSchema prunedSchema = schemaService.selectRelevantSchema(connId, "Find courses taught by instructor Smith", TENANT_A_EMAIL);
        Assertions.assertNotNull(prunedSchema);
        Assertions.assertTrue(prunedSchema.getTables().size() < initialSchema.getTables().size() && prunedSchema.getTables().size() >= 2,
                "Selector should prune irrelevant tables while retaining target teachers, courses, and required bridging tables");

        // 8. Test Zero-Trust Tenant Security Isolation
        Assertions.assertThrows(RuntimeException.class, () -> {
            schemaService.getSchema(connId, TENANT_B_EMAIL);
        }, "Tenant B must be completely blocked from accessing or inspecting Tenant A's external database schema");
    }
}
