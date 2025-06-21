<?php
// PHP/get_languages.php

header('Content-Type: application/json; charset=utf-8');

if (!isset($_GET['country']) || trim($_GET['country']) === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or empty "country" parameter.']);
    exit;
}

$countryName = trim($_GET['country']);

// Special‐cases


$query = str_replace(' ', '%20', $countryName);

$apiUrl = "https://restcountries.com/v3.1/name/{$query}"
        . "?fullText=true&fields=languages";

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode([
        'error' => "Rest Countries API returned HTTP {$httpCode}"
    ]);
    exit;
}

$data = json_decode($response, true);
if (!is_array($data) || !isset($data[0]['languages'])) {
    if (isset($data['languages'])) {
        $languages = $data['languages'];
    } else {
        http_response_code(502);
        echo json_encode(['error' => 'Unexpected API response format']);
        exit;
    }
} else {
    $languages = $data[0]['languages'];
}

echo json_encode(['languages' => $languages], JSON_UNESCAPED_UNICODE);
