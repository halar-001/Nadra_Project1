package com.aidatabaseassistant.controller;

import com.aidatabaseassistant.dto.*;
import com.aidatabaseassistant.service.ConnectionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    private final ConnectionService connectionService;

    public ConnectionController(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    @PostMapping("/test")
    public ResponseEntity<TestConnectionResponse> testConnection(@Valid @RequestBody TestConnectionRequest request) {
        TestConnectionResponse response = connectionService.testConnection(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ConnectionResponse>> createConnection(
            Principal principal,
            @Valid @RequestBody CreateConnectionRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User is not authenticated"));
        }
        ConnectionResponse response = connectionService.createConnection(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Database connection saved securely", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ConnectionResponse>>> getAllConnections(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User is not authenticated"));
        }
        List<ConnectionResponse> response = connectionService.getAllConnections(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Connections retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ConnectionResponse>> getConnectionById(
            Principal principal,
            @PathVariable Long id) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User is not authenticated"));
        }
        ConnectionResponse response = connectionService.getConnectionById(principal.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Connection details retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ConnectionResponse>> updateConnection(
            Principal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateConnectionRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User is not authenticated"));
        }
        ConnectionResponse response = connectionService.updateConnection(principal.getName(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Database connection updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteConnection(
            Principal principal,
            @PathVariable Long id) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User is not authenticated"));
        }
        connectionService.deleteConnection(principal.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Database connection deleted successfully", null));
    }
}
