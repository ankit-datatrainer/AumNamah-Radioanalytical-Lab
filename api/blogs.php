<?php
header('Content-Type: application/json');
require 'auth.php';
require 'db.php';
require 'slug_helper.php';

$method = $_SERVER['REQUEST_METHOD'];

// Stored paths are often relative ("assets/images/x.png"). On a pretty URL like
// /blog/my-post those resolve to /blog/assets/... and 404, so make them root-relative.
function absolutePath($url) {
    $url = trim((string)$url);
    if ($url === '' || preg_match('#^(https?:)?//#i', $url) || $url[0] === '/' || stripos($url, 'data:') === 0) {
        return $url;
    }
    return '/' . ltrim($url, './');
}

// Same fix for <img src="..."> inside the saved post body.
function absolutizeContent($html) {
    if (!$html) {
        return $html;
    }
    return preg_replace_callback(
        '#(<img\b[^>]*?\bsrc\s*=\s*)(["\'])(.*?)\2#is',
        function ($m) {
            return $m[1] . $m[2] . absolutePath($m[3]) . $m[2];
        },
        $html
    );
}

// Strip anything executable or embeddable from post HTML so a post can never
// inject scripts, hidden iframes, redirects or cloaked spam into the page.
function sanitizeContent($html) {
    $html = (string)$html;
    $tags = 'script|iframe|object|embed|applet|form|meta|link|style|base|frame|frameset';
    $html = preg_replace('#<(' . $tags . ')\b[^>]*>.*?</\1\s*>#is', '', $html);
    $html = preg_replace('#</?(' . $tags . ')\b[^>]*>#is', '', $html);
    $html = preg_replace('#\son[a-z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)#i', '', $html);
    $html = preg_replace('#\b(href|src)\s*=\s*(["\'])\s*(javascript|vbscript|data):.*?\2#is', '$1="#"', $html);
    return $html;
}

function mapBlogRow($b) {
    $b['id'] = $b['blog_id'] ?? null;
    $b['featureImage'] = absolutePath($b['feature_image'] ?? '') ?: null;
    $b['content'] = absolutizeContent(sanitizeContent($b['content'] ?? ''));
    $b['metaTitle'] = $b['meta_title'] ?? null;
    $b['metaDescription'] = $b['meta_description'] ?? null;
    $b['metaKeywords'] = $b['meta_keywords'] ?? null;
    $b['date'] = $b['created_at'] ?? null;
    unset($b['blog_id'], $b['feature_image'], $b['meta_title'], $b['meta_description'], $b['meta_keywords'], $b['created_at']);
    return $b;
}

switch ($method) {
    case 'GET':
        // Visitors only ever see published posts; drafts are visible to signed-in admins.
        $onlyPublished = is_admin() ? '' : " AND status = 'published'";
        if (isset($_GET['id'])) {
            $lookup = $_GET['id'];
            $stmt = $pdo->prepare("SELECT * FROM blogs WHERE (slug = ? OR blog_id = ?)" . $onlyPublished);
            $stmt->execute([$lookup, $lookup]);
            $blog = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($blog) {
                echo json_encode(mapBlogRow($blog));
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Blog not found']);
            }
        } else {
            $stmt = $pdo->query("SELECT * FROM blogs WHERE 1=1" . $onlyPublished . " ORDER BY created_at DESC");
            $blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $mapped = array_map('mapBlogRow', $blogs);
            echo json_encode($mapped);
        }
        break;

    case 'POST':
        require_admin();
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['title'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
            break;
        }

        $blog_id = 'post_' . uniqid();
        $title = $data['title'] ?? '';
        $excerpt = $data['excerpt'] ?? '';
        $content = sanitizeContent($data['content'] ?? '');
        $feature_image = $data['featureImage'] ?? null;
        $status = ($data['status'] ?? '') === 'published' ? 'published' : 'draft';
        $meta_title = trim($data['metaTitle'] ?? '') ?: null;
        $meta_description = trim($data['metaDescription'] ?? '') ?: null;
        $meta_keywords = trim($data['metaKeywords'] ?? '') ?: null;

        $baseSlug = slugify(!empty($data['slug']) ? $data['slug'] : $title);
        $slug = uniqueSlug($pdo, $baseSlug);

        $stmt = $pdo->prepare("INSERT INTO blogs (blog_id, slug, title, excerpt, content, feature_image, meta_title, meta_description, meta_keywords, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        if ($stmt->execute([$blog_id, $slug, $title, $excerpt, $content, $feature_image, $meta_title, $meta_description, $meta_keywords, $status])) {
            echo json_encode(['id' => $blog_id, 'slug' => $slug, 'status' => 'success']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save blog']);
        }
        break;

    case 'PUT':
        require_admin();
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data or missing ID']);
            break;
        }

        $blog_id = $data['id'];
        $title = $data['title'] ?? '';
        $excerpt = $data['excerpt'] ?? '';
        $content = sanitizeContent($data['content'] ?? '');
        $feature_image = $data['featureImage'] ?? null;
        $status = ($data['status'] ?? '') === 'published' ? 'published' : 'draft';
        $meta_title = trim($data['metaTitle'] ?? '') ?: null;
        $meta_description = trim($data['metaDescription'] ?? '') ?: null;
        $meta_keywords = trim($data['metaKeywords'] ?? '') ?: null;

        $baseSlug = slugify(!empty($data['slug']) ? $data['slug'] : $title);
        $slug = uniqueSlug($pdo, $baseSlug, $blog_id);

        $stmt = $pdo->prepare("UPDATE blogs SET slug = ?, title = ?, excerpt = ?, content = ?, feature_image = ?, meta_title = ?, meta_description = ?, meta_keywords = ?, status = ? WHERE blog_id = ?");
        if ($stmt->execute([$slug, $title, $excerpt, $content, $feature_image, $meta_title, $meta_description, $meta_keywords, $status, $blog_id])) {
            echo json_encode(['id' => $blog_id, 'slug' => $slug, 'status' => 'success']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update blog']);
        }
        break;

    case 'DELETE':
        require_admin();
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
