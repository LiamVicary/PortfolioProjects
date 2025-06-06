<?php
// php/geocode.php
header('Content-Type: application/json');

$OPENCAGE_KEY = '496216fafb274d8baa5cb5097563c57f';

//FORWARD
if (isset($_GET['q'])) {
    $query = urlencode(trim($_GET['q']));
    $limit = 1; 
    $url = "https://api.opencagedata.com/geocode/v1/json"
         . "?q={$query}"
         . "&key={$OPENCAGE_KEY}"
         . "&limit={$limit}";
}
//REVERSE
elseif (isset($_GET['lat']) && isset($_GET['lng'])) {
  $lat = floatval($_GET['lat']);
  $lng = floatval($_GET['lng']);
  $url = "https://api.opencagedata.com/geocode/v1/json"
       . "?q={$lat}+{$lng}"
       . "&key={$OPENCAGE_KEY}"
       . "&no_annotations=1"      
       . "&limit=1";
}
else {
  http_response_code(400);
  echo json_encode(['error' => 'Provide either "q" (forward) or both "lat" and "lng" (reverse)']);
  exit;
}

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $status  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($status !== 200) {
        http_response_code($status);
        echo json_encode(['error' => "OpenCage HTTP {$status}"]);
        exit;
    }
    echo $response;
    exit;
  
http_response_code(400);
echo json_encode(['error' => 'Missing "q" parameter for forward geocoding']);
