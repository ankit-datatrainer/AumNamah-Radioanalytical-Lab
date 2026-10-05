<?php
// Server-side admin session helpers.
// Every API action that changes data must call require_admin() — the
// sessionStorage flag in the admin pages is only a UI hint, not security.

if (session_status() === PHP_SESSION_NONE) {
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_name('ral_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => $secure,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

if (!function_exists('is_admin')) {
    function is_admin() {
        return !empty($_SESSION['admin_email']);
    }
}

if (!function_exists('require_admin')) {
    function require_admin() {
        if (!is_admin()) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['status' => 'error', 'error' => 'Unauthorized', 'message' => 'Please sign in again.']);
            exit;
        }
    }
}
