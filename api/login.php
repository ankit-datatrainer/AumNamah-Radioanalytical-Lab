<?php
header('Content-Type: application/json');
require 'auth.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET: is the current browser signed in? (used by the admin pages)
if ($method === 'GET') {
    if (is_admin()) {
        echo json_encode(['status' => 'success', 'loggedIn' => true, 'email' => $_SESSION['admin_email']]);
    } else {
        echo json_encode(['status' => 'error', 'loggedIn' => false, 'message' => 'Not signed in']);
    }
    exit;
}

// DELETE: sign out
if ($method === 'DELETE') {
    $_SESSION = [];
    session_destroy();
    echo json_encode(['status' => 'success']);
    exit;
}

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Basic brute-force throttle: 5 failures per session -> 15 minute lockout
$_SESSION['login_failures'] = $_SESSION['login_failures'] ?? 0;
$_SESSION['login_locked_until'] = $_SESSION['login_locked_until'] ?? 0;
if ($_SESSION['login_locked_until'] > time()) {
    http_response_code(429);
    echo json_encode(['status' => 'error', 'message' => 'Too many failed attempts. Try again in 15 minutes.']);
    exit;
}

require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Email and password are required']);
    exit;
}

$stmt = $pdo->prepare("SELECT email, password_hash FROM admins WHERE email = ?");
$stmt->execute([$email]);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if ($admin && password_verify($password, $admin['password_hash'])) {
    session_regenerate_id(true);
    $_SESSION['admin_email'] = $admin['email'];
    $_SESSION['login_failures'] = 0;
    echo json_encode(['status' => 'success', 'message' => 'Login successful', 'email' => $admin['email']]);
} else {
    $_SESSION['login_failures']++;
    if ($_SESSION['login_failures'] >= 5) {
        $_SESSION['login_locked_until'] = time() + 15 * 60;
        $_SESSION['login_failures'] = 0;
    }
    sleep(1);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
}
?>
