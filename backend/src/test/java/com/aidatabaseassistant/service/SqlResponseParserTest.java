package com.aidatabaseassistant.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SqlResponseParserTest {

    private final SqlResponseParser parser = new SqlResponseParser();

    @Test
    public void testExtractSqlWithMarkdown() {
        String raw = "Sure! Here is your SQL:\n```sql\nSELECT * FROM students;\n```\nHope that helps!";
        String extracted = parser.extractSql(raw);
        assertEquals("SELECT * FROM students;", extracted);
    }

    @Test
    public void testExtractSqlWithMarkdownNoSqlTag() {
        String raw = "```\nSELECT name FROM users WHERE id = 1;\n```";
        String extracted = parser.extractSql(raw);
        assertEquals("SELECT name FROM users WHERE id = 1;", extracted);
    }

    @Test
    public void testExtractSqlWithoutMarkdown() {
        String raw = "SELECT * FROM departments;";
        String extracted = parser.extractSql(raw);
        assertEquals("SELECT * FROM departments;", extracted);
    }

    @Test
    public void testExtractSqlEmpty() {
        String raw = "   ";
        String extracted = parser.extractSql(raw);
        assertEquals("", extracted);
    }
}
