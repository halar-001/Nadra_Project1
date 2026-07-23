package com.aidatabaseassistant.config;

import com.aidatabaseassistant.entity.Role;
import com.aidatabaseassistant.entity.RoleName;
import com.aidatabaseassistant.entity.User;
import com.aidatabaseassistant.repository.RoleRepository;
import com.aidatabaseassistant.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Roles
        if (roleRepository.count() == 0) {
            roleRepository.save(Role.builder().roleName(RoleName.ROLE_ADMIN).build());
            roleRepository.save(Role.builder().roleName(RoleName.ROLE_USER).build());
            roleRepository.save(Role.builder().roleName(RoleName.ROLE_VIEWER).build());
        }

        // 2. Seed Admin Users
        Role adminRole = roleRepository.findByRoleName(RoleName.ROLE_ADMIN).get();
        String adminPassword = passwordEncoder.encode("Admin@12345");

        List<String> adminEmails = List.of("taimoorajmal00@gmail.com", "halarkhan00000@gmail.com");

        for (int i = 0; i < adminEmails.size(); i++) {
            String email = adminEmails.get(i);
            if (!userRepository.existsByEmail(email)) {
                User admin = User.builder()
                        .fullName("Admin " + (i + 1))
                        .email(email)
                        .password(adminPassword)
                        .enabled(true)
                        .build();
                admin.getRoles().add(adminRole);
                userRepository.save(admin);
            }
        }
    }
}
