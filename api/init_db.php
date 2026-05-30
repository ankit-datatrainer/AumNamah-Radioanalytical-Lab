<?php
require 'db.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        blog_id VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT,
        content LONGTEXT,
        feature_image VARCHAR(255),
        status VARCHAR(20) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);

    // Create admins table
    $sqlAdmin = "CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        display_name VARCHAR(100) DEFAULT 'System Admin',
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sqlAdmin);

    // Seed default admin if table is empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM admins");
    if ($stmt->fetchColumn() == 0) {
        $default_name = 'System Admin';
        $default_email = 'info@aumnamahral.com';
        $default_password = 'Blog@2026';
        $hash = password_hash($default_password, PASSWORD_DEFAULT);
        
        $insert = $pdo->prepare("INSERT INTO admins (display_name, email, password_hash) VALUES (?, ?, ?)");
        $insert->execute([$default_name, $default_email, $hash]);
    }

    echo "Database and tables initialized successfully.";
} catch (PDOException $e) {
    echo "Initialization failed: " . $e->getMessage();
}
?>
