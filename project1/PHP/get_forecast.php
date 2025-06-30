<?php
header('Content-Type: application/json; charset=utf-8');
$key = 'c12fc719ba194000bb0113820252706';

if (!isset($_GET['country']) || trim($_GET['country']) === '') {
  http_response_code(400);
  echo json_encode(['error'=>'Missing "country"']);
  exit;
}

$q   = rawurlencode(trim($_GET['country']));
$days = 4; // today + next 3 days
$url = "https://api.weatherapi.com/v1/forecast.json"
     . "?key={$key}&q={$q}&days={$days}&aqi=no";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);

if (curl_errno($ch)) {
  http_response_code(502);
  echo json_encode(['error'=>curl_error($ch)]);
  exit;
}

$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($code);
echo $response;
exit;
