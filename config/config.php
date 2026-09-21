<?php
/**
 * BaitoMate - Application Configuration
 * Part-time Job & Shift Tracker for International Students in Japan
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set default timezone to Japan Standard Time
date_default_timezone_set('Asia/Tokyo');

// Detect Base URL dynamically for both local XAMPP and custom dev servers
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME']);
$scriptDir = dirname($scriptName);

// Determine app root relative to server doc root
$parts = explode('/', trim($scriptDir, '/'));
$basePath = '';
if (!empty($parts[0]) && $parts[0] === 'baitomate') {
    $basePath = '/baitomate';
} elseif (in_array('pages', $parts) || in_array('auth', $parts) || in_array('api', $parts)) {
    // If inside a subfolder
    $parentDir = dirname($scriptDir);
    $basePath = ($parentDir === '/' || $parentDir === '\\' || $parentDir === '.') ? '' : $parentDir;
} else {
    $basePath = ($scriptDir === '/' || $scriptDir === '\\' || $scriptDir === '.') ? '' : $scriptDir;
}

define('APP_NAME', 'BaitoMate');
define('APP_TAGLINE', 'Part-time Work & Shift Tracker for Students in Japan');
define('APP_URL', rtrim($protocol . $host . $basePath, '/'));
define('APP_PATH', dirname(__DIR__));
define('LEGAL_WEEKLY_HOUR_LIMIT', 28.0); // Japanese Immigration student visa limit during semester
define('LEGAL_VACATION_HOUR_LIMIT', 40.0); // Legal limit during official university breaks

// Currency formatting helper (Japanese Yen)
function formatJPY($amount): string {
    return '¥' . number_format((float)$amount);
}

// Format date helper
function formatDateJST($dateStr, $format = 'M j, Y'): string {
    if (empty($dateStr)) return '-';
    $timestamp = strtotime($dateStr);
    return date($format, $timestamp);
}

// Authentication guard helper
function requireAuth(): array {
    if (empty($_SESSION['user_id'])) {
        header('Location: ' . APP_URL . '/auth/login.php');
        exit;
    }
    return [
        'id' => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'] ?? 'Student',
        'email' => $_SESSION['user_email'] ?? '',
        'school' => $_SESSION['user_school'] ?? 'Language / University',
        'visa' => $_SESSION['user_visa'] ?? 'Student Visa',
    ];
}

// Flash messaging helpers
function setFlashMessage(string $type, string $message): void {
    $_SESSION['flash'] = [
        'type' => $type, // 'success', 'danger', 'warning', 'info'
        'message' => $message,
    ];
}

function getFlashMessage(): ?array {
    if (isset($_SESSION['flash'])) {
        $flash = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $flash;
    }
    return null;
}
