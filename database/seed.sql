-- Seed Data for ai_db_assistant database

-- Initial Roles & Admin User (Password: admin123 hashed)
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@aidatabaseassistant.com', '$2a$10$e7xX3Vn5zJz38GZ93X.69e.8xWj21l5a8d9a.Z7x1y2w3v4u5t6s', 'ADMIN')
ON DUPLICATE KEY UPDATE id=id;
