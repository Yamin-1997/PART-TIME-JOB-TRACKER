<?php
/**
 * BaitoMate - Database Connection & Abstraction
 * Supports standard MySQL (XAMPP default) with automatic SQLite fallback
 */

require_once __DIR__ . '/config.php';

class Database {
    private static ?PDO $pdo = null;
    private static string $driver = 'mysql';

    public static function getConnection(): PDO {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        // MySQL configuration parameters (Default for XAMPP)
        $mysqlHost = getenv('DB_HOST') ?: '127.0.0.1';
        $mysqlPort = getenv('DB_PORT') ?: '3306';
        $mysqlDb   = getenv('DB_NAME') ?: 'baitomate_db';
        $mysqlUser = getenv('DB_USER') ?: 'root';
        $mysqlPass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

        // Attempt MySQL connection first
        try {
            $dsn = "mysql:host={$mysqlHost};port={$mysqlPort};dbname={$mysqlDb};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_TIMEOUT            => 2,
            ];

            self::$pdo = new PDO($dsn, $mysqlUser, $mysqlPass, $options);
            self::$driver = 'mysql';
            return self::$pdo;
        } catch (PDOException $e) {
            // If MySQL is not running or db not yet created (e.g. preview environment),
            // seamlessly use SQLite so the application works anywhere out of the box.
            return self::initSqliteFallback();
        }
    }

    public static function getDriver(): string {
        return self::$driver;
    }

    private static function initSqliteFallback(): PDO {
        $dbDir = APP_PATH . '/database';
        if (!is_dir($dbDir)) {
            mkdir($dbDir, 0777, true);
        }

        $sqliteFile = $dbDir . '/baitomate.sqlite';
        $isNew = !file_exists($sqliteFile) || filesize($sqliteFile) === 0;

        self::$pdo = new PDO("sqlite:{$sqliteFile}", null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        self::$driver = 'sqlite';

        if ($isNew) {
            self::seedSqliteDatabase(self::$pdo);
        }

        return self::$pdo;
    }

    private static function seedSqliteDatabase(PDO $pdo): void {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                school_name TEXT,
                visa_type TEXT DEFAULT 'Student (留学)',
                hourly_target INTEGER DEFAULT 1200,
                max_weekly_hours REAL DEFAULT 28.0,
                is_vacation_mode INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                company_name TEXT NOT NULL,
                job_title TEXT NOT NULL,
                hourly_wage INTEGER NOT NULL,
                transport_allowance INTEGER DEFAULT 0,
                color_hex TEXT DEFAULT '#2563eb',
                address TEXT,
                contact_person TEXT,
                notes TEXT,
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS shifts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                job_id INTEGER NOT NULL,
                shift_date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                break_minutes INTEGER DEFAULT 0,
                total_hours REAL NOT NULL,
                gross_pay INTEGER NOT NULL,
                transport_cost INTEGER DEFAULT 0,
                status TEXT DEFAULT 'completed', -- 'scheduled', 'completed', 'cancelled'
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                category TEXT NOT NULL,
                amount INTEGER NOT NULL,
                expense_date DATE NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT,
                category TEXT DEFAULT 'general',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        ");

        // Seed default demo international student user (Password: student123)
        $hashedPass = password_hash('student123', PASSWORD_DEFAULT);
        $pdo->prepare("
            INSERT INTO users (id, name, email, password_hash, school_name, visa_type, hourly_target, max_weekly_hours)
            VALUES (1, 'Alex Rivera', 'student@baitomate.jp', ?, 'Waseda University (早稲田大学)', 'Student (留学)', 1250, 28.0)
        ")->execute([$hashedPass]);

        // Seed 2 Part-time jobs (Typical Tokyo student baito)
        $pdo->exec("
            INSERT INTO jobs (id, user_id, company_name, job_title, hourly_wage, transport_allowance, color_hex, address, notes)
            VALUES 
            (1, 1, '7-Eleven Shinjuku Chuo', 'Convenience Store Clerk (レジ・品出し)', 1200, 600, '#2563eb', '1-5-2 Nishi-Shinjuku, Tokyo', 'Shift supervisor: Tanaka-san. Uniform provided.'),
            (2, 1, 'Cafe Miyabi Shibuya', 'Barista & Floor Staff (ホール・カフェ)', 1350, 500, '#10b981', '2-24-1 Dogenzaka, Shibuya, Tokyo', 'English menu assistance bonus +¥100/hr on weekends.')
        ");

        // Seed realistic shifts for current week and month
        $today = date('Y-m-d');
        $monday = date('Y-m-d', strtotime('monday this week'));
        $tuesday = date('Y-m-d', strtotime('tuesday this week'));
        $thursday = date('Y-m-d', strtotime('thursday this week'));
        $saturday = date('Y-m-d', strtotime('saturday this week'));
        $lastWeek1 = date('Y-m-d', strtotime('-7 days'));
        $lastWeek2 = date('Y-m-d', strtotime('-9 days'));

        $stmt = $pdo->prepare("
            INSERT INTO shifts (user_id, job_id, shift_date, start_time, end_time, break_minutes, total_hours, gross_pay, transport_cost, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        // Current week shifts: Total 19.5 hours (under 28-hour limit, safe status)
        $stmt->execute([1, 1, $monday, '09:00', '14:00', 30, 4.5, 5400, 600, 'completed', 'Morning rush replenishment']);
        $stmt->execute([1, 2, $tuesday, '16:00', '21:30', 30, 5.0, 6750, 500, 'completed', 'Dogenzaka dinner rush']);
        $stmt->execute([1, 1, $thursday, '17:00', '22:00', 0, 5.0, 6000, 600, 'completed', 'Evening cashier duties']);
        $stmt->execute([1, 2, $saturday, '11:00', '16:30', 30, 5.0, 6750, 500, 'scheduled', 'Weekend brunch service']);

        // Previous shifts
        $stmt->execute([1, 1, $lastWeek1, '09:00', '15:00', 60, 5.0, 6000, 600, 'completed', 'Stock audit shift']);
        $stmt->execute([1, 2, $lastWeek2, '14:00', '20:00', 45, 5.25, 7087, 500, 'completed', 'Cafe training session']);

        // Seed realistic student living expenses in Tokyo
        $pdo->exec("
            INSERT INTO expenses (user_id, category, amount, expense_date, description)
            VALUES 
            (1, 'Commute / Suica', 4200, '{$today}', 'Weekly Suica IC card top-up for Tokyo Metro'),
            (1, 'Meals & Groceries', 3450, '{$today}', 'Gyomu Supermarket weekly staple groceries'),
            (1, 'Study / JLPT Prep', 2600, '{$today}', 'Shinkanzen Master N2 Reading textbook'),
            (1, 'Mobile SIM', 3278, '{$today}', 'Rakuten Mobile monthly student plan')
        ");

        // Seed handy student notes
        $pdo->exec("
            INSERT INTO notes (user_id, title, content, category)
            VALUES 
            (1, 'Tokyo Min Wage & Legal Notice', 'Tokyo minimum wage is ¥1,163/hr as of 2024-2025. Remember to track weekly hours across BOTH jobs. Never exceed 28 hrs/week during school terms to protect student visa.', 'legal'),
            (1, 'Shift Swap Protocol at 7-Eleven', 'Inform Store Manager (Tencho) at least 48 hours before shift if changing with Suzuki-kun.', 'work')
        ");
    }
}
