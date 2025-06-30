<?php
// PHP/get_currency_rest.php
header('Content-Type: application/json; charset=UTF-8');

if (empty($_GET['country'])) {
    echo json_encode(['error' => 'Missing country parameter']);
    exit;
}

$country = urlencode($_GET['country']);
// fullText=true makes it match exact country names where possible
$url = "https://restcountries.com/v3.1/name/{$country}?fullText=true";

$resp = @file_get_contents($url);
if ($resp === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Failed to fetch from Rest Countries']);
    exit;
}

$data = json_decode($resp, true);
if (!isset($data[0]['currencies']) || !is_array($data[0]['currencies'])) {
    echo json_encode(['error' => 'No currency data']);
    exit;
}

// pick the first currency in the object
$currencies = $data[0]['currencies'];
$code       = array_key_first($currencies);
$info       = $currencies[$code];

echo json_encode([
    'code'   => $code,
    'symbol' => $info['symbol'] ?? '',
    'name'   => $info['name']   ?? ''
]);
