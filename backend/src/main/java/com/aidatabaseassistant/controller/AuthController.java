package com.aidatabaseassistant.controller;

import com.aidatabaseassistant.dto.LoginRequest;
import com.aidatabaseassistant.dto.LoginResponse;
import com.aidatabaseassistant.dto.RegisterRequest;

import com.aidatabaseassistant.dto.UserResponse;
import com.aidatabaseassistant.dto.ApiResponse;
import com.aidatabaseassistant.dto.UpdateProfileRequest;
import com.aidatabaseassistant.dto.ChangePasswordRequest;
import com.aidatabaseassistant.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.aidatabaseassistant.audit.event.AuditEvent;
import com.aidatabaseassistant.audit.model.EventType;
import com.aidatabaseassistant.audit.model.Severity;
import com.aidatabaseassistant.security.UserDetailsImpl;
import org.springframework.security.core.Authentication;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final ApplicationEventPublisher eventPublisher;

    public AuthController(AuthService authService, ApplicationEventPublisher eventPublisher) {
        this.authService = authService;
        this.eventPublisher = eventPublisher;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(Map.of("message", "Registration successful! You can now log in."));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User is not authenticated"));
        }
        UserResponse response = authService.getUserProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logout(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            eventPublisher.publishEvent(new AuditEvent.Builder(this)
                    .userId(userDetails.getId())
                    .eventType(EventType.LOGOUT)
                    .severity(Severity.INFO)
                    .description("User logged out successfully")
                    .build());
        }
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(Principal principal, @Valid @RequestBody UpdateProfileRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User is not authenticated"));
        }
        UserResponse response = authService.updateProfile(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Object>> changePassword(Principal principal, @Valid @RequestBody ChangePasswordRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User is not authenticated"));
        }
        authService.changePassword(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}
