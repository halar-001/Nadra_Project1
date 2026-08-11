package com.aidatabaseassistant.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import com.aidatabaseassistant.audit.service.AuditFacade;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.aidatabaseassistant.dto.ChangePasswordRequest;
import com.aidatabaseassistant.dto.LoginRequest;
import com.aidatabaseassistant.dto.LoginResponse;
import com.aidatabaseassistant.dto.RegisterRequest;
import com.aidatabaseassistant.dto.UpdateProfileRequest;
import com.aidatabaseassistant.dto.UserResponse;

import com.aidatabaseassistant.entity.Role;
import com.aidatabaseassistant.entity.RoleName;
import com.aidatabaseassistant.entity.User;
import com.aidatabaseassistant.repository.RoleRepository;
import com.aidatabaseassistant.repository.UserRepository;
import com.aidatabaseassistant.security.JwtService;
import com.aidatabaseassistant.security.UserDetailsImpl;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuditFacade auditFacade;
    
    public AuthService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager, AuditFacade auditFacade) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.auditFacade = auditFacade;
    }

    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        Role viewerRole = roleRepository.findByRoleName(RoleName.ROLE_VIEWER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .build();

        user.getRoles().add(viewerRole);
        user = userRepository.save(user);
        auditFacade.logRegister(user.getId());
    }



    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String jwt = jwtService.generateToken(userDetails);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        UserResponse userResponse = UserResponse.builder()
                .id(userDetails.getId())
                .fullName(userRepository.findByEmail(request.getEmail()).get().getFullName())
                .email(userDetails.getUsername())
                .enabled(userDetails.isEnabled())
                .roles(roles)
                .build();

        auditFacade.logLogin(userDetails.getId(), true);

        return LoginResponse.builder()
                .token(jwt)
                .user(userResponse)
                .build();
    }

    public UserResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> roles = user.getRoles().stream()
                .map(role -> role.getRoleName().name())
                .collect(Collectors.toList());

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .enabled(user.isEnabled())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .build();
    }

    public UserResponse updateProfile(String currentEmail, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use by another account");
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        userRepository.save(user);

        return getUserProfile(user.getEmail());
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        auditFacade.logPasswordChanged(user.getId());
    }


}
