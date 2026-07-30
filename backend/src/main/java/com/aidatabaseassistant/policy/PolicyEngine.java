package com.aidatabaseassistant.policy;

import net.sf.jsqlparser.statement.select.Limit;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.util.TablesNamesFinder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public class PolicyEngine {

    // Default system tables that should NEVER be queried by the AI
    private static final Set<String> BLOCKED_TABLES = Set.of(
            "database_connections", "audit_logs", "system_metrics", "refresh_tokens"
    );

    private static final long MAX_ROWS_LIMIT = 400L;

    /**
     * Applies business rules to the validated Select statement.
     * Blocks access to system tables and forcibly injects a LIMIT clause.
     * @param select The validated JSqlParser Select statement
     * @return The policy-modified SQL string ready for execution
     * @throws PolicyViolationException if a forbidden table is queried
     */
    public String enforcePolicies(Select select) {
        // 1. Enforce Table Blocking Policy
        TablesNamesFinder tablesNamesFinder = new TablesNamesFinder();
        List<String> queriedTables = tablesNamesFinder.getTableList((net.sf.jsqlparser.statement.Statement) select);

        for (String table : queriedTables) {
            // Remove backticks/quotes if present and convert to lowercase for checking
            String normalizedTable = table.replaceAll("`|\"|'", "").toLowerCase();
            if (BLOCKED_TABLES.contains(normalizedTable)) {
                throw new PolicyViolationException("Access to system table '" + normalizedTable + "' is strictly forbidden by policy.");
            }
        }

        // 2. Enforce Row Limit Policy
        if (select.getSelectBody() instanceof PlainSelect plainSelect) {
            Limit currentLimit = plainSelect.getLimit();
            if (currentLimit == null) {
                // No limit provided, force our max limit
                Limit newLimit = new Limit();
                newLimit.setRowCount(new net.sf.jsqlparser.expression.LongValue(MAX_ROWS_LIMIT));
                plainSelect.setLimit(newLimit);
            } else {
                // A limit exists, ensure it doesn't exceed MAX_ROWS_LIMIT
                try {
                    long requestedLimit = Long.parseLong(currentLimit.getRowCount().toString());
                    if (requestedLimit > MAX_ROWS_LIMIT) {
                        currentLimit.setRowCount(new net.sf.jsqlparser.expression.LongValue(MAX_ROWS_LIMIT));
                    }
                } catch (NumberFormatException e) {
                    // Fallback if parsing fails
                    currentLimit.setRowCount(new net.sf.jsqlparser.expression.LongValue(MAX_ROWS_LIMIT));
                }
            }
        }

        // Return the modified AST as a clean string
        return select.toString();
    }
}
