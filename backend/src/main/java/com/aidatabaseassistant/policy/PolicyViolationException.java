package com.aidatabaseassistant.policy;

public class PolicyViolationException extends RuntimeException {
    public PolicyViolationException(String message) {
        super(message);
    }
}
