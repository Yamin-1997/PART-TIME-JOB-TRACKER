<?php
/**
 * BaitoMate - Root Entry Point
 * Redirects authenticated users to Dashboard, and guests to Login
 */
require_once __DIR__ . '/config/config.php';

if (!empty($_SESSION['user_id'])) {
    header('Location: ' . APP_URL . '/pages/dashboard.php');
    exit;
} else {
    header('Location: ' . APP_URL . '/auth/login.php');
    exit;
}
