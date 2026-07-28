package com.aidatabaseassistant.service;

import com.aidatabaseassistant.dto.ConnectionResponse;
import com.aidatabaseassistant.model.schema.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.*;

@Service
public class SchemaReaderService {

    private static final Logger logger = LoggerFactory.getLogger(SchemaReaderService.class);
    private static final Set<String> IGNORED_SCHEMAS = Set.of("INFORMATION_SCHEMA", "PG_CATALOG", "PG_TOAST", "SYS", "SYSTEM");

    private final ConnectionService connectionService;

    public SchemaReaderService(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    /**
     * Connects via Dynamic JDBC and extracts tables, columns, keys, indexes, and relationships using DatabaseMetaData.
     * Never executes vendor-specific commands like SHOW TABLES.
     */
    public DatabaseSchema readSchema(Long connectionId, String userEmail) {
        ConnectionResponse connectionDetails = connectionService.getConnectionById(userEmail, connectionId);
        
        DatabaseSchema schema = new DatabaseSchema(
                connectionId,
                connectionDetails.getDatabaseName(),
                connectionDetails.getDatabaseType()
        );

        try (Connection jdbcConnection = connectionService.getDynamicJdbcConnection(connectionId, userEmail)) {
            DatabaseMetaData metaData = jdbcConnection.getMetaData();

            // 1. Read Tables and Views
            readTablesAndViews(metaData, schema);

            // 2. Read Columns for all Tables
            readColumns(metaData, schema);

            // 3. Read Primary Keys and Indexes
            readPrimaryKeysAndIndexes(metaData, schema);

            // 4. Read Relationships & Infer Cardinality (ONE_TO_ONE, ONE_TO_MANY, MANY_TO_MANY)
            readRelationships(metaData, schema);

        } catch (SQLException e) {
            logger.error("Failed to read schema metadata for connection ID: {}", connectionId, e);
            throw new RuntimeException("Error reading database schema: " + e.getMessage(), e);
        }

        return schema;
    }

    private void readTablesAndViews(DatabaseMetaData metaData, DatabaseSchema schema) throws SQLException {
        String[] tableTypes = {"TABLE", "VIEW"};
        try (ResultSet rs = metaData.getTables(null, null, "%", tableTypes)) {
            while (rs.next()) {
                String schemaName = rs.getString("TABLE_SCHEM");
                String tableName = rs.getString("TABLE_NAME");
                String tableType = rs.getString("TABLE_TYPE");

                if (isIgnoredSchemaOrTable(schemaName, tableName)) {
                    continue;
                }

                schema.addTable(new TableMetadata(tableName, tableType));
            }
        }
    }

    private void readColumns(DatabaseMetaData metaData, DatabaseSchema schema) throws SQLException {
        for (TableMetadata table : schema.getTables()) {
            try (ResultSet rs = metaData.getColumns(null, null, table.getTableName(), "%")) {
                while (rs.next()) {
                    String columnName = rs.getString("COLUMN_NAME");
                    String dataType = rs.getString("TYPE_NAME");
                    int length = rs.getInt("COLUMN_SIZE");
                    boolean nullable = (rs.getInt("NULLABLE") == DatabaseMetaData.columnNullable);
                    String defaultValue = rs.getString("COLUMN_DEF");
                    String autoIncStr = rs.getString("IS_AUTOINCREMENT");
                    boolean autoIncrement = "YES".equalsIgnoreCase(autoIncStr);

                    ColumnMetadata column = new ColumnMetadata(
                            columnName,
                            dataType,
                            length,
                            nullable,
                            defaultValue != null ? defaultValue.trim() : null,
                            autoIncrement
                    );
                    table.addColumn(column);
                }
            }
        }
    }

    private void readPrimaryKeysAndIndexes(DatabaseMetaData metaData, DatabaseSchema schema) throws SQLException {
        for (TableMetadata table : schema.getTables()) {
            // Read Primary Keys
            try (ResultSet rsPk = metaData.getPrimaryKeys(null, null, table.getTableName())) {
                while (rsPk.next()) {
                    String pkCol = rsPk.getString("COLUMN_NAME");
                    if (pkCol != null) {
                        table.addPrimaryKey(pkCol);
                    }
                }
            } catch (SQLException e) {
                logger.warn("Could not read primary keys for table {}: {}", table.getTableName(), e.getMessage());
            }

            // Read Indexes
            try (ResultSet rsIdx = metaData.getIndexInfo(null, null, table.getTableName(), false, false)) {
                while (rsIdx.next()) {
                    String indexName = rsIdx.getString("INDEX_NAME");
                    String columnName = rsIdx.getString("COLUMN_NAME");
                    boolean nonUnique = rsIdx.getBoolean("NON_UNIQUE");

                    if (columnName != null && indexName != null && !indexName.toUpperCase().startsWith("PRIMARY") && !indexName.toUpperCase().startsWith("SYS_")) {
                        table.addIndex(new IndexMetadata(indexName, columnName, nonUnique));
                    }
                }
            } catch (SQLException e) {
                logger.warn("Could not read indexes for table {}: {}", table.getTableName(), e.getMessage());
            }
        }
    }

    private void readRelationships(DatabaseMetaData metaData, DatabaseSchema schema) throws SQLException {
        List<RelationshipMetadata> directRelationships = new ArrayList<>();
        Map<String, List<RelationshipMetadata>> childTableFkMap = new HashMap<>();

        for (TableMetadata table : schema.getTables()) {
            String tableName = table.getTableName();
            List<RelationshipMetadata> fksInTable = new ArrayList<>();

            try (ResultSet rsFk = metaData.getImportedKeys(null, null, tableName)) {
                while (rsFk.next()) {
                    String parentTable = rsFk.getString("PKTABLE_NAME");
                    String parentColumn = rsFk.getString("PKCOLUMN_NAME");
                    String childColumn = rsFk.getString("FKCOLUMN_NAME");

                    // Determine if ONE_TO_ONE vs ONE_TO_MANY
                    boolean isUniqueOrSinglePk = false;
                    if (table.getPrimaryKeys().size() == 1 && table.getPrimaryKeys().contains(childColumn)) {
                        isUniqueOrSinglePk = true;
                    } else {
                        for (IndexMetadata idx : table.getIndexes()) {
                            if (!idx.isNonUnique() && childColumn.equalsIgnoreCase(idx.getColumnName())) {
                                isUniqueOrSinglePk = true;
                                break;
                            }
                        }
                    }

                    RelationshipType type = isUniqueOrSinglePk ? RelationshipType.ONE_TO_ONE : RelationshipType.ONE_TO_MANY;
                    RelationshipMetadata rel = new RelationshipMetadata(parentTable, parentColumn, tableName, childColumn, type);
                    
                    directRelationships.add(rel);
                    fksInTable.add(rel);
                }
            } catch (SQLException e) {
                logger.warn("Could not read imported keys for table {}: {}", tableName, e.getMessage());
            }

            if (!fksInTable.isEmpty()) {
                childTableFkMap.put(tableName.toLowerCase(), fksInTable);
            }
        }

        // Add all direct relationships to the schema
        for (RelationshipMetadata rel : directRelationships) {
            schema.addRelationship(rel);
        }

        // Detect MANY_TO_MANY junction tables without AI
        // A junction table connects 2+ distinct parent tables and is primarily composed of those FK keys
        for (Map.Entry<String, List<RelationshipMetadata>> entry : childTableFkMap.entrySet()) {
            List<RelationshipMetadata> fks = entry.getValue();
            if (fks.size() >= 2) {
                TableMetadata junctionTable = schema.findTable(entry.getKey());
                if (junctionTable != null) {
                    int totalCols = junctionTable.getColumns().size();
                    int fkCols = fks.size();
                    // If foreign keys make up most of the table or are all part of primary key / indexes
                    if (fkCols >= 2 && totalCols <= (fkCols + 3)) {
                        for (int i = 0; i < fks.size(); i++) {
                            for (int j = i + 1; j < fks.size(); j++) {
                                RelationshipMetadata r1 = fks.get(i);
                                RelationshipMetadata r2 = fks.get(j);
                                if (!r1.getParentTable().equalsIgnoreCase(r2.getParentTable())) {
                                    RelationshipMetadata m2m = new RelationshipMetadata(
                                            r1.getParentTable(),
                                            r1.getParentColumn(),
                                            r2.getParentTable(),
                                            r2.getParentColumn(),
                                            RelationshipType.MANY_TO_MANY
                                    );
                                    // avoid duplicates
                                    if (!containsRelationship(schema.getRelationships(), m2m)) {
                                        schema.addRelationship(m2m);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private boolean containsRelationship(List<RelationshipMetadata> rels, RelationshipMetadata target) {
        for (RelationshipMetadata r : rels) {
            if (r.getParentTable().equalsIgnoreCase(target.getParentTable()) &&
                r.getChildTable().equalsIgnoreCase(target.getChildTable()) &&
                r.getRelationshipType() == target.getRelationshipType()) {
                return true;
            }
        }
        return false;
    }

    private boolean isIgnoredSchemaOrTable(String schemaName, String tableName) {
        if (schemaName != null && IGNORED_SCHEMAS.contains(schemaName.toUpperCase())) {
            return true;
        }
        if (tableName == null) {
            return true;
        }
        String upperName = tableName.toUpperCase();
        return upperName.startsWith("SYS_") || upperName.startsWith("SYSTEM_") || upperName.startsWith("PG_");
    }
}
