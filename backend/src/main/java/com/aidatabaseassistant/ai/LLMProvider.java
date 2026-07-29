package com.aidatabaseassistant.ai;

public interface LLMProvider {
    /**
     * Generates a response from the LLM based on the given prompt.
     * @param prompt The prompt string (usually containing schema and user question).
     * @return The raw response from the LLM.
     */
    String generate(String prompt);

    /**
     * @return The name of the LLM Provider (e.g., "Gemini", "Groq").
     */
    String getName();
}
