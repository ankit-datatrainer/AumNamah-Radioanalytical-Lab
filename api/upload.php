<?php
header('Content-Type: application/json');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Check if file was uploaded without errors
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded or upload error']);
    exit;
}

$file = $_FILES['image'];
$fileName = basename($file['name']);
$fileTmpName = $file['tmp_name'];
$fileSize = $file['size'];
$fileType = mime_content_type($fileTmpName);

// Validate file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($fileType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.']);
    exit;
}

// Ensure the uploads directory exists
$uploadDir = '../assets/images/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Create a unique filename to prevent overwriting
$uniqueName = uniqid() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "", $fileName);
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
