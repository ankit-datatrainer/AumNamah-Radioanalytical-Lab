<?php
header('Content-Type: application/json');
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Email and password are required']);
    exit;
}

$stmt = $pdo->prepare("SELECT password_hash FROM admins WHERE email = ?");
$stmt->execute([$email]);
$hash = $stmt->fetchColumn();

if ($hash && password_verify($password, $hash)) {
    echo json_encode(['status' => 'success', 'message' => 'Login successful', 'email' => $email]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
}
?>
