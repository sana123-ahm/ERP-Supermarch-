-- Create database
CREATE DATABASE IF NOT EXISTS erp_supermarche CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user and grant privileges
-- Replace 'your_password' with the password you set in application.properties
CREATE USER IF NOT EXISTS 'erp_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON erp_supermarche.* TO 'erp_user'@'localhost';
FLUSH PRIVILEGES;

-- Tables will be created automatically by Hibernate (spring.jpa.hibernate.ddl-auto=update)
-- Initial admin data will be inserted by DataInitializer.java on first run
