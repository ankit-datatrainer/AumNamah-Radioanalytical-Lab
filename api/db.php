<?php
$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'u190365089_aumnamahral';

// Standard credentials fallback list (Production + Local Dev)
$credentials = [
    // Live Production Credentials
    ['host' => 'localhost', 'port' => '3306', 'user' => 'u190365089_aumnamahral', 'pass' => 'Aumnamahral@123', 'db' => 'u190365089_aumnamahral'],
    // Environment Variables or standard overrides
    ['host' => getenv('DB_HOST') ?: '127.0.0.1', 'port' => getenv('DB_PORT') ?: '3306', 'user' => getenv('DB_USER') ?: 'root', 'pass' => getenv('DB_PASS') !== false ? getenv('DB_PASS') : '123456', 'db' => 'aumnamah_db'],
    ['host' => '127.0.0.1', 'port' => '3307', 'user' => 'root', 'pass' => '', 'db' => 'aumnamah_db']
];

$pdo = null;
$lastException = null;

foreach ($credentials as $cred) {
    try {
        $cHost = $cred['host'];
        $cPort = $cred['port'];
        $cUser = $cred['user'];
        $cPass = $cred['pass'];
        $cDb   = $cred['db'];
        
        // Try direct connection to DB
        $pdo = new PDO("mysql:host=$cHost;port=$cPort;dbname=$cDb;charset=utf8mb4", $cUser, $cPass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        break;
    } catch (PDOException $e) {
        $lastException = $e;
        // Try creating DB if local root user
        try {
            $pdo = new PDO("mysql:host=$cHost;port=$cPort", $cUser, $cPass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `$cDb`");
            $pdo = new PDO("mysql:host=$cHost;port=$cPort;dbname=$cDb;charset=utf8mb4", $cUser, $cPass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            break;
        } catch (PDOException $e2) {
            $lastException = $e2;
            $pdo = null;
        }
    }
}

if (!$pdo) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed: ' . ($lastException ? $lastException->getMessage() : 'Unknown error')]);
    exit;
}
?>