package com.aidatabaseassistant.service;

import com.aidatabaseassistant.dto.*;
import com.aidatabaseassistant.entity.Role;
import com.aidatabaseassistant.entity.RoleName;
import com.aidatabaseassistant.entity.User;
import com.aidatabaseassistant.repository.RoleRepository;
import com.aidatabaseassistant.repository.UserRepository;
import com.aidatabaseassistant.security.JwtService;
import com.aidatabaseassistant.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        Role viewerRole = roleRepository.findByRoleName(RoleName.ROLE_VIEWER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

        String otp = generateOtp();

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(false) // disabled until OTP is verified
                .otp(otp)
                .otpExpiry(LocalDateTime.now().plusMinutes(10))
                .build();

        user.getRoles().add(viewerRole);
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    public void verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEnabled()) {
            throw new RuntimeException("User is already verified");
        }

        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        user.setEnabled(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        if (!userDetails.isEnabled()) {
            throw new RuntimeException("Account is not verified. Please verify your email via OTP.");
        }

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

        return LoginResponse.builder()
                .token(jwt)
                .user(userResponse)
                .build();
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // 6-digit OTP
        return String.valueOf(otp);
    }
}
