package com.aidatabaseassistant.formatter;

import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class ResultFormatter {

    public QueryResponse format(ResultSet rs, long executionTimeMs) throws SQLException {
        ResultSetMetaData metaData = rs.getMetaData();
        int columnCount = metaData.getColumnCount();

        List<String> columns = new ArrayList<>();
        for (int i = 1; i <= columnCount; i++) {
            columns.add(metaData.getColumnLabel(i));
        }

        List<List<Object>> rows = new ArrayList<>();
        int rowCount = 0;
        while (rs.next()) {
            List<Object> row = new ArrayList<>();
            for (int i = 1; i <= columnCount; i++) {
                row.add(rs.getObject(i));
            }
            rows.add(row);
            rowCount++;
        }

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("rowCount", rowCount);
        metadata.put("executionTimeMs", executionTimeMs);

        return new QueryResponse(columns, rows, metadata);
    }
}
