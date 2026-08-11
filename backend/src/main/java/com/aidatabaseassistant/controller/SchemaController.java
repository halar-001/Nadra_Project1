package com.aidatabaseassistant.controller;

import com.aidatabaseassistant.dto.ApiResponse;
import com.aidatabaseassistant.dto.SchemaSelectRequest;
import com.aidatabaseassistant.model.schema.DatabaseSchema;
import com.aidatabaseassistant.service.SchemaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/schema")
public class SchemaController {

    private final SchemaService schemaService;

    public SchemaController(SchemaService schemaService) {
        this.schemaService = schemaService;
    }

    @GetMapping("/{connectionId}")
    public ResponseEntity<ApiResponse<DatabaseSchema>> getSchema(
            Principal principal,
            @PathVariable Long connectionId) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User is not authenticated"));
        }
        DatabaseSchema schema = schemaService.getSchema(connectionId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Schema retrieved successfully", schema));
    }

    @PostMapping({"/refresh/{connectionId}", "/{connectionId}/refresh"})
    public ResponseEntity<ApiResponse<DatabaseSchema>> refreshSchema(
            Principal principal,
            @PathVariable Long connectionId) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User is not authenticated"));
        }
        DatabaseSchema schema = schemaService.refreshSchema(connectionId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Schema refreshed successfully", schema));
    }

    @PostMapping({"/select/{connectionId}", "/{connectionId}/select"})
    public ResponseEntity<ApiResponse<DatabaseSchema>> selectRelevantSchema(
            Principal principal,
            @PathVariable Long connectionId,
            @Valid @RequestBody SchemaSelectRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User is not authenticated"));
        }
        DatabaseSchema schema = schemaService.selectRelevantSchema(connectionId, request.getQuery(), principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Relevant schema subset selected successfully", schema));
    }
}
