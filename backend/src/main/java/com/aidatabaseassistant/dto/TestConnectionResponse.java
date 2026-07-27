package com.aidatabaseassistant.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

public class TestConnectionResponse {

    private boolean success;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String message;

    public TestConnectionResponse() {
    }

    public TestConnectionResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public static TestConnectionResponse ok() {
        return new TestConnectionResponse(true, null);
    }

    public static TestConnectionResponse fail(String message) {
        return new TestConnectionResponse(false, message);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
