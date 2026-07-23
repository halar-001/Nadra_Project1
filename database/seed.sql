-- Seed Data for ai_db_assistant database

-- 1. Populate Roles
INSERT INTO roles (id, role_name) VALUES
(1, 'ROLE_ADMIN'),
(2, 'ROLE_VIEWER'),
(3, 'ROLE_USER')
ON DUPLICATE KEY UPDATE role_name=VALUES(role_name);

-- 2. Pre-seed 2 Admin Accounts (Password hash BCrypt: 'Admin@12345')
-- BCrypt Hash: $2a$10$e7xX3Vn5zJz38GZ93X.69e.8xWj21l5a8d9a.Z7x1y2w3v4u5t6s
INSERT INTO users (id, full_name, email, password, enabled) VALUES
(1, 'System Administrator 1', 'admin1@aidatabaseassistant.com', '$2a$10$e7xX3Vn5zJz38GZ93X.69e.8xWj21l5a8d9a.Z7x1y2w3v4u5t6s', TRUE),
(2, 'System Administrator 2', 'admin2@aidatabaseassistant.com', '$2a$10$e7xX3Vn5zJz38GZ93X.69e.8xWj21l5a8d9a.Z7x1y2w3v4u5t6s', TRUE)
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 3. Assign ROLE_ADMIN to Admin accounts
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),
(2, 1)
ON DUPLICATE KEY UPDATE role_id=VALUES(role_id);
