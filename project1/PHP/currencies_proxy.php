<?php
header('Content-Type: application/json');

$appId = 'bbf77c8f4a0248fc8509c7c54f7dc662';
$url   = "https://openexchangerates.org/api/latest.json?app_id={$appId}";

// For speedy access https://openexchangerates.org/api/latest.json?app_id=bbf77c8f4a0248fc8509c7c54f7dc662

// short timeout
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
      'error' => 'Failed to fetch rates'
    ]);
    exit;
}

// just relay the JSON
echo $response;
