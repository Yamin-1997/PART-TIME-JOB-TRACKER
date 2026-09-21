-- BaitoMate - MySQL Database Schema for XAMPP
-- Part-time Job & Shift Tracker for International Students in Japan
-- Compatible with MySQL 5.7+ / MySQL 8.0+ / MariaDB 10.4+

CREATE DATABASE IF NOT EXISTS `baitomate_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `baitomate_db`;

-- 1. Users Table (International Students)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `school_name` VARCHAR(180) NULL DEFAULT 'Language School / University',
  `visa_type` VARCHAR(80) NULL DEFAULT 'Student (留学)',
  `hourly_target` INT UNSIGNED NOT NULL DEFAULT 1200,
  `max_weekly_hours` DECIMAL(4,1) NOT NULL DEFAULT 28.0,
  `is_vacation_mode` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Jobs Table (User's Part-time Employers / Baito)
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `company_name` VARCHAR(150) NOT NULL,
  `job_title` VARCHAR(120) NOT NULL,
  `hourly_wage` INT UNSIGNED NOT NULL,
  `transport_allowance` INT UNSIGNED NOT NULL DEFAULT 0,
  `color_hex` VARCHAR(10) NOT NULL DEFAULT '#2563eb',
  `address` VARCHAR(255) NULL,
  `contact_person` VARCHAR(100) NULL,
  `notes` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_jobs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Shifts Table (Individual Work Records & 28-hr calculations)
CREATE TABLE IF NOT EXISTS `shifts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `job_id` INT UNSIGNED NOT NULL,
  `shift_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `break_minutes` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `total_hours` DECIMAL(5,2) NOT NULL,
  `gross_pay` INT UNSIGNED NOT NULL,
  `transport_cost` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'completed',
  `notes` TEXT NULL,
  `google_event_id` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_shifts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_shifts_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  INDEX `idx_user_date` (`user_id`, `shift_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Expenses Table (Living & Transit Expenses for Net Savings)
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `category` VARCHAR(80) NOT NULL,
  `amount` INT UNSIGNED NOT NULL,
  `expense_date` DATE NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_expenses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_user_expense_date` (`user_id`, `expense_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Notes Table (Workplace Japanese Phrases, Manager Contacts, Tax Info)
CREATE TABLE IF NOT EXISTS `notes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `content` TEXT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'general',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Demo User (Password: student123)
-- Hash generated with password_hash('student123', PASSWORD_DEFAULT)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `school_name`, `visa_type`, `hourly_target`, `max_weekly_hours`)
VALUES (1, 'Alex Rivera', 'student@baitomate.jp', '$2y$10$tZ2E2H4jVw2V8kUjA93Pau7bS3Z4FzH7Y/2e0q3c1Q6N9tV2u9I2C', 'Waseda University (早稲田大学)', 'Student (留学)', 1250, 28.0)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Sample Baito Jobs
INSERT INTO `jobs` (`id`, `user_id`, `company_name`, `job_title`, `hourly_wage`, `transport_allowance`, `color_hex`, `address`, `notes`)
VALUES 
(1, 1, '7-Eleven Shinjuku Chuo', 'Convenience Store Clerk (レジ・品出し)', 1200, 600, '#2563eb', '1-5-2 Nishi-Shinjuku, Tokyo', 'Shift supervisor: Tanaka-san. Uniform provided.'),
(2, 1, 'Cafe Miyabi Shibuya', 'Barista & Floor Staff (ホール・カフェ)', 1350, 500, '#10b981', '2-24-1 Dogenzaka, Shibuya, Tokyo', 'English menu assistance bonus +¥100/hr on weekends.')
ON DUPLICATE KEY UPDATE `id`=`id`;
