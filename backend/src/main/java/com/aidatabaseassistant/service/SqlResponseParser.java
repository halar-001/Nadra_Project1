package com.aidatabaseassistant.service;

import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SqlResponseParser {

    private static final Pattern MARKDOWN_SQL_PATTERN = Pattern.compile("```(?:sql)?\\s*(.*?)\\s*```", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);

    public String extractSql(String rawResponse) {
        if (rawResponse == null || rawResponse.trim().isEmpty()) {
            return "";
        }

        Matcher matcher = MARKDOWN_SQL_PATTERN.matcher(rawResponse);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        return rawResponse.trim();
    }
}
