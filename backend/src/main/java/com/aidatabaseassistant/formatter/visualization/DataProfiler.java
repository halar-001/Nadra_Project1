package com.aidatabaseassistant.formatter.visualization;

import com.aidatabaseassistant.formatter.QueryResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DataProfiler {

    public static class ColumnProfile {
        public String name;
        public boolean isNumeric;
        public boolean isDate;
        
        public ColumnProfile(String name) {
            this.name = name;
        }
    }

    public Map<Integer, ColumnProfile> profile(QueryResponse queryResponse) {
        Map<Integer, ColumnProfile> profiles = new HashMap<>();
        List<String> columns = queryResponse.getColumns();
        List<List<Object>> rows = queryResponse.getRows();

        for (int i = 0; i < columns.size(); i++) {
            ColumnProfile cp = new ColumnProfile(columns.get(i));
            // Default assumption based on first non-null row
            cp.isNumeric = false;
            cp.isDate = false;
            
            for (List<Object> row : rows) {
                if (row.size() > i) {
                    Object val = row.get(i);
                    if (val != null) {
                        if (val instanceof Number) {
                            cp.isNumeric = true;
                        } else if (val instanceof java.util.Date || val instanceof java.time.temporal.Temporal) {
                            cp.isDate = true;
                        } else if (val instanceof String) {
                            // simple check if string is parseable as number
                            try {
                                Double.parseDouble((String) val);
                                cp.isNumeric = true;
                            } catch (NumberFormatException e) {
                                // Not a number
                            }
                        }
                        break; // Profiling first non-null row is enough for basic chart recommendation
                    }
                }
            }
            profiles.put(i, cp);
        }
        return profiles;
    }
}
