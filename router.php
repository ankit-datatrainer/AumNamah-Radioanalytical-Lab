<?php
// ============================================================
// LOCAL DEV ONLY - mirrors the production .htaccess rewrite rules.
//
// Start the server with:   php -S localhost:8000 router.php
// (or just double-click start-local.bat)
//
// Running "php -S localhost:8000" WITHOUT this file makes every
// unknown path fall back to index.html, so /blog shows the homepage.
// Production (Apache/Hostinger) uses .htaccess and ignores this file.
// ============================================================

$uri  = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$path = __DIR__ . $uri;

// 1. Real files (css, js, images, api/*.php) are served as-is.
if ($uri !== '/' && file_exists($path) && !is_dir($path)) {
    return false;
}

// 2. /blog/<slug>  ->  Blog-Post.html?slug=<slug>
if (preg_match('#^/blog/([A-Za-z0-9_-]+)/?$#', $uri, $m)) {
    $_GET['slug']            = $m[1];
    $_REQUEST['slug']        = $m[1];
    $_SERVER['QUERY_STRING'] = 'slug=' . $m[1];
    include __DIR__ . '/Blog-Post.html';
    return true;
}

// 3. /blog  ->  Blog.html
if (preg_match('#^/blog/?$#', $uri)) {
    include __DIR__ . '/Blog.html';
    return true;
}

// 4. Root -> homepage
if ($uri === '/') {
    include __DIR__ . '/index.html';
    return true;
}

// 5. Anything else: show the 404 page instead of silently
//    falling back to the homepage (which hides real mistakes).
http_response_code(404);
if (file_exists(__DIR__ . '/404.html')) {
    include __DIR__ . '/404.html';
} else {
    echo 'Not found: ' . htmlspecialchars($uri);
}
return true;
