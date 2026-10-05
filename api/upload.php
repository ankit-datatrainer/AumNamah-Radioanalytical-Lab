<?php
header('Content-Type: application/json');
require 'auth.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Only a signed-in admin may upload
require_admin();

// Check if file was uploaded without errors
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded or upload error']);
    exit;
}

$file = $_FILES['image'];
$fileTmpName = $file['tmp_name'];
$fileSize = $file['size'];

if ($fileSize > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['error' => 'Image must be 5 MB or smaller.']);
    exit;
}

// Validate the real content, not the client-supplied name. The saved extension
// comes from the detected type, so "shell.php" or "page.html" can never be stored.
$allowedTypes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/gif'  => 'gif',
    'image/webp' => 'webp',
];
$fileType = mime_content_type($fileTmpName);
$imageInfo = @getimagesize($fileTmpName);
if (!isset($allowedTypes[$fileType]) || $imageInfo === false || ($imageInfo['mime'] ?? '') !== $fileType) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.']);
    exit;
}

// Ensure the uploads directory exists
$uploadDir = '../assets/images/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Keep a readable base name, but force the extension from the detected type
$baseName = pathinfo(basename($file['name']), PATHINFO_FILENAME);
$baseName = substr(preg_replace('/[^a-zA-Z0-9_-]/', '', $baseName), 0, 60) ?: 'image';
$uniqueName = uniqid() . '_' . $baseName . '.' . $allowedTypes[$fileType];
$destination = $uploadDir . $uniqueName;

// Move the file
if (move_uploaded_file($fileTmpName, $destination)) {
    // Return the relative path to be used in the frontend
    $url = 'assets/images/uploads/' . $uniqueName;
    echo json_encode(['url' => $url]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save uploaded file']);
}
?>
