<?php
header('Content-Type: application/json');
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $email = $_GET['email'] ?? '';
    if (empty($email)) {
        echo json_encode(['status' => 'error', 'message' => 'Email required']);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT display_name, email FROM admins WHERE email = ?");
    $stmt->execute([$email]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($admin) {
        echo json_encode(['status' => 'success', 'data' => $admin]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Admin not found']);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $currentEmail = $data['currentEmail'] ?? '';
    $newEmail = $data['newEmail'] ?? '';
    $displayName = $data['displayName'] ?? '';
    $oldPassword = $data['oldPassword'] ?? '';
    $newPassword = $data['newPassword'] ?? '';
    
    if (empty($currentEmail) || empty($oldPassword)) {
        echo json_encode(['status' => 'error', 'message' => 'Current email and old password are required']);
        exit;
    }
    
    // Verify old password
    $stmt = $pdo->prepare("SELECT id, password_hash FROM admins WHERE email = ?");
    $stmt->execute([$currentEmail]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$admin || !password_verify($oldPassword, $admin['password_hash'])) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid current password']);
        exit;
    }
    
    $updateEmail = !empty($newEmail) ? $newEmail : $currentEmail;
    
    // Check if new email is already taken by another admin
    if ($updateEmail !== $currentEmail) {
        $checkStmt = $pdo->prepare("SELECT id FROM admins WHERE email = ? AND id != ?");
        $checkStmt->execute([$updateEmail, $admin['id']]);
        if ($checkStmt->fetch()) {
            echo json_encode(['status' => 'error', 'message' => 'Email is already in use']);
            exit;
        }
    }

    try {
        if (!empty($newPassword)) {
            $hash = password_hash($newPassword, PASSWORD_DEFAULT);
            $update = $pdo->prepare("UPDATE admins SET display_name = ?, email = ?, password_hash = ? WHERE id = ?");
            $update->execute([$displayName, $updateEmail, $hash, $admin['id']]);
        } else {
            $update = $pdo->prepare("UPDATE admins SET display_name = ?, email = ? WHERE id = ?");
            $update->execute([$displayName, $updateEmail, $admin['id']]);
        }
        echo json_encode(['status' => 'success', 'message' => 'Profile updated successfully', 'email' => $updateEmail]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
?>
