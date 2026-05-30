<?php
header('Content-Type: application/json');
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM blogs WHERE blog_id = ?");
            $stmt->execute([$_GET['id']]);
            $blog = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($blog) {
                // Map db columns to json fields
                $blog['id'] = $blog['blog_id'];
                $blog['featureImage'] = $blog['feature_image'];
                $blog['date'] = $blog['created_at'];
                unset($blog['blog_id'], $blog['feature_image'], $blog['created_at']);
                echo json_encode($blog);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Blog not found']);
            }
        } else {
            $stmt = $pdo->query("SELECT * FROM blogs ORDER BY created_at DESC");
            $blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $mapped = array_map(function($b) {
                $b['id'] = $b['blog_id'];
                $b['featureImage'] = $b['feature_image'];
                $b['date'] = $b['created_at'];
                unset($b['blog_id'], $b['feature_image'], $b['created_at']);
                return $b;
            }, $blogs);
            echo json_encode($mapped);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['title'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
            break;
        }

        $blog_id = 'post_' . uniqid();
        $title = $data['title'];
        $excerpt = $data['excerpt'] ?? '';
        $content = $data['content'] ?? '';
        $feature_image = $data['featureImage'] ?? null;
        $status = $data['status'] ?? 'draft';

        $stmt = $pdo->prepare("INSERT INTO blogs (blog_id, title, excerpt, content, feature_image, status) VALUES (?, ?, ?, ?, ?, ?)");
        if ($stmt->execute([$blog_id, $title, $excerpt, $content, $feature_image, $status])) {
            echo json_encode(['id' => $blog_id, 'status' => 'success']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save blog']);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data or missing ID']);
            break;
        }

        $blog_id = $data['id'];
        $title = $data['title'];
        $excerpt = $data['excerpt'] ?? '';
        $content = $data['content'] ?? '';
        $feature_image = $data['featureImage'] ?? null;
        $status = $data['status'] ?? 'draft';

        $stmt = $pdo->prepare("UPDATE blogs SET title = ?, excerpt = ?, content = ?, feature_image = ?, status = ? WHERE blog_id = ?");
        if ($stmt->execute([$title, $excerpt, $content, $feature_image, $status, $blog_id])) {
            echo json_encode(['id' => $blog_id, 'status' => 'success']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update blog']);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data or missing ID']);
            break;
        }

        $stmt = $pdo->prepare("DELETE FROM blogs WHERE blog_id = ?");
        if ($stmt->execute([$data['id']])) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete blog']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
