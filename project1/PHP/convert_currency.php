<?php
header('Content-Type: application/json');

$from   = $_GET['from']   ?? '';
$to     = $_GET['to']     ?? '';
$amount = $_GET['amount'] ?? '';

if (!$from || !$to || !$amount) {
    http_response_code(400);
    echo json_encode([
      'success' => false,
      'error'   => 'Missing parameters'
    ]);
    exit;
}

$apiKey = '0c9ca47e441ba53ff891dae7dd59c00c';
$url    = "https://api.exchangerate.host/convert"
        . "?access_key={$apiKey}"
        . "&from={$from}"
        . "&to={$to}"
        . "&amount={$amount}";

$ctx = stream_context_create([
  'http'=>[
    'method'  => 'GET',
    'timeout' => 5
  ]
]);

$response = @file_get_contents($url, false, $ctx);
if ($response === false) {
    http_response_code(502);
    echo json_encode([
      'success' => false,
      'error'   => 'Conversion request failed'
    ]);
    exit;
}

echo $response;
