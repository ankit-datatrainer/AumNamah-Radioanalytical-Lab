<?php
// Shared slug utilities used by blogs.php (create/update) and init_db.php (backfill).

if (!function_exists('slugify')) {
    function slugify($text) {
        $text = strtolower(trim($text));
        // Strip HTML entities/accents down to plain ascii-ish words
        $text = preg_replace('/&[a-z]+;/', ' ', $text);
        $text = preg_replace('/[^a-z0-9]+/', '-', $text);
        $text = trim($text, '-');
        return $text === '' ? 'post' : $text;
    }
}

if (!function_exists('uniqueSlug')) {
    function uniqueSlug($pdo, $baseSlug, $excludeBlogId = null) {
        $slug = $baseSlug;
        $i = 2;
        while (true) {
            $sql = "SELECT blog_id FROM blogs WHERE slug = ?" . ($excludeBlogId ? " AND blog_id != ?" : "");
            $stmt = $pdo->prepare($sql);
            $stmt->execute($excludeBlogId ? [$slug, $excludeBlogId] : [$slug]);
            if (!$stmt->fetch()) {
                return $slug;
            }
            $slug = $baseSlug . '-' . $i;
            $i++;
        }
    }
}
