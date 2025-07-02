<?php
header('Content-Type: application/json; charset=utf-8');

if (!isset($_GET['country']) || trim($_GET['country']) === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing title parameter']);
    exit;
}

$country     = trim($_GET['country']);
$safeCountry = rawurlencode($country);

// 1) Fetch the HTML for that page
$htmlUrl = "https://en.wikipedia.org/w/rest.php/v1/page/{$safeCountry}";

$ch = curl_init($htmlUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'MyApp/1.0 (youremail@example.com)');
$html     = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(['error' => "Wikipedia HTML API returned HTTP {$httpCode}"]);
    exit;
}


libxml_use_internal_errors(true);
$doc = new DOMDocument();

$doc->loadHTML('<?xml encoding="utf-8" ?>' . $html);
libxml_clear_errors();

$section = $doc->getElementById('mwAQ');
$extract = '';

if ($section) {
    $paras = $section->getElementsByTagName('p');
    if ($paras->length > 0) {
        $extract = trim($paras->item(0)->textContent);
    }
}

if ($extract === '') {
    $extract = 'No summary available.';
}


echo json_encode([
    'title'   => $title,
    'extract' => $extract
], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
