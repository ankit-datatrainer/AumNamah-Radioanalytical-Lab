<?php
// Setup script: only runnable from the command line or by a signed-in admin.
if (PHP_SAPI !== 'cli') {
    require 'auth.php';
    require_admin();
}
require 'db.php';
require 'slug_helper.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        blog_id VARCHAR(50) UNIQUE NOT NULL,
        slug VARCHAR(255) UNIQUE,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT,
        content LONGTEXT,
        feature_image VARCHAR(255),
        meta_title VARCHAR(255),
        meta_description VARCHAR(320),
        meta_keywords VARCHAR(500),
        status VARCHAR(20) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);

    // Add SEO columns to existing installations that predate this change
    $existingColumns = $pdo->query("SHOW COLUMNS FROM blogs")->fetchAll(PDO::FETCH_COLUMN);
    $seoColumns = [
        'slug' => "ALTER TABLE blogs ADD COLUMN slug VARCHAR(255) UNIQUE AFTER blog_id",
        'meta_title' => "ALTER TABLE blogs ADD COLUMN meta_title VARCHAR(255) AFTER feature_image",
        'meta_description' => "ALTER TABLE blogs ADD COLUMN meta_description VARCHAR(320) AFTER meta_title",
        'meta_keywords' => "ALTER TABLE blogs ADD COLUMN meta_keywords VARCHAR(500) AFTER meta_description",
    ];
    foreach ($seoColumns as $column => $alterSql) {
        if (!in_array($column, $existingColumns)) {
            $pdo->exec($alterSql);
        }
    }

    // Backfill readable slugs generated from the post title.
    // Covers rows with no slug yet, and rows from the earlier migration that
    // were given the internal id (e.g. "post_5") as their slug.
    $rows = $pdo->query("SELECT blog_id, slug, title FROM blogs")->fetchAll(PDO::FETCH_ASSOC);
    $update = $pdo->prepare("UPDATE blogs SET slug = ? WHERE blog_id = ?");
    $fixed = 0;
    foreach ($rows as $row) {
        $currentSlug = trim((string)$row['slug']);
        $needsSlug = $currentSlug === ''
            || $currentSlug === $row['blog_id']
            || preg_match('/^post[_-]/i', $currentSlug);
        if (!$needsSlug) {
            continue;
        }
        $newSlug = uniqueSlug($pdo, slugify($row['title']), $row['blog_id']);
        $update->execute([$newSlug, $row['blog_id']]);
        $fixed++;
    }

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
        $default_password = 'Aumnamahral@2026';
        $hash = password_hash($default_password, PASSWORD_DEFAULT);
        
        $insert = $pdo->prepare("INSERT INTO admins (display_name, email, password_hash) VALUES (?, ?, ?)");
        $insert->execute([$default_name, $default_email, $hash]);
    }

    echo "Database and tables initialized successfully. Readable slugs generated for {$fixed} post(s).";
} catch (PDOException $e) {
    echo "Initialization failed: " . $e->getMessage();
}
?>
