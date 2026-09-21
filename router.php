<?php
/**
 * BaitoMate - CLI / Development Router for PHP Built-in Server
 */
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$file = __DIR__ . $uri;

// Serve static assets directly
if ($uri !== '/' && file_exists($file) && !is_dir($file)) {
    $ext = pathinfo($file, PATHINFO_EXTENSION);
    if ($ext !== 'php') {
        return false; // Let PHP built-in server handle standard static file MIME types
    }
}

// Handle root directory
if ($uri === '/' || $uri === '') {
    require_once __DIR__ . '/index.php';
    return true;
}

// Handle direct PHP file execution
if (file_exists($file . '.php')) {
    require_once $file . '.php';
    return true;
}

if (file_exists($file) && !is_dir($file)) {
    require_once $file;
    return true;
}

// Fallback to index.php
require_once __DIR__ . '/index.php';
return true;
