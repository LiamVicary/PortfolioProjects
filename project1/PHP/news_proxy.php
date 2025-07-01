<?php
header('Content-Type: application/json');

if (empty($_GET['country'])) {
  http_response_code(400);
  echo json_encode(['error'=>'Missing country']);
  exit;
}

$country = urlencode($_GET['country']);
$key     = 'pub_e03c24c5e6cb470cb5edbbcd2db91630';
$url     = "https://newsdata.io/api/1/news?apikey=$key&q=$country&language=en";

// Fetch the data
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$err      = curl_error($ch);
curl_close($ch);

if ($err) {
  http_response_code(500);
  echo json_encode(['error'=>$err]);
  exit;
}

$data = json_decode($response, true);
if (empty($data['results'])) {
  echo json_encode(['articles'=>[]]);
  exit;
}

// take the 3 most recent (they come ordered by date desc)
$top3 = array_slice($data['results'], 0, 3);

echo json_encode(['articles'=>$top3]);
