<?php
header('Content-Type: application/json; charset=utf-8');

// Validate input
if (!isset($_GET['country']) || trim($_GET['country']) === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing country parameter']);
    exit;
}

$country     = trim($_GET['country']);
$safeCountry = rawurlencode($country);

// Build the Wikimedia API URL for extracts
$apiUrl = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles={$safeCountry}";

// Initialize cURL and fetch
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'MyApp/1.0 (youremail@example.com)');
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Handle HTTP errors
if ($httpCode !== 200 || !$response) {
    http_response_code($httpCode);
    echo json_encode(['error' => "Wikipedia API returned HTTP {$httpCode}"]);
    exit;
}

// Decode and parse the JSON response
$data = json_decode($response, true);
if (!isset($data['query']['pages'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid API response']);
    exit;
}

$pages = $data['query']['pages'];
$page  = reset($pages);

// Extract summary
$fullExtract = isset($page['extract']) && $page['extract'] !== ''
    ? trim($page['extract'])
    : 'No summary available.';



// Output with the sanitized country as title
echo json_encode([
    'title'   => $country,
    'extract' => $fullExtract
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
