<?php
header('Content-Type: application/json');


$apiKey = '0c9ca47e441ba53ff891dae7dd59c00c';

$url = "https://api.exchangerate.host/list?access_key={$apiKey}";


// set a short timeout
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
      'error'   => 'Failed to fetch currency list'
    ]);
    exit;
}

echo $response;
