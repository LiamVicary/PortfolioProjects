<?php
header('Content-Type: application/json');

$from   = $_GET['from']   ?? '';
$to     = $_GET['to']     ?? '';
$amount = $_GET['amount'] ?? '';

if (!$from || !$to || !$amount) {
    http_response_code(400);
    echo json_encode([
      'error' => 'Missing parameters'
    ]);
    exit;
}

$appId = 'bbf77c8f4a0248fc8509c7c54f7dc662';
$url   = "https://openexchangerates.org/api/latest.json?app_id={$appId}";

$ctx = stream_context_create([
  'http'=>[
    'method'  => 'GET',
    'timeout' => 5
  ]
]);

$json = @file_get_contents($url, false, $ctx);
if ($json === false) {
    http_response_code(502);
    echo json_encode([
      'error' => 'Failed to fetch rates'
    ]);
    exit;
}

$data = json_decode($json, true);
$rates = $data['rates'] ?? [];

if (!isset($rates[$from], $rates[$to])) {
    http_response_code(400);
    echo json_encode([
      'error' => 'Unknown currency code'
    ]);
    exit;
}

// base is USD, so to convert A → B:
//    amount_in_usd = amount / rate[A]
//    result = amount_in_usd * rate[B]
$result = ($amount / $rates[$from]) * $rates[$to];

echo json_encode([
  'result' => $result
]);
