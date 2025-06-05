<?php
// php/geocode.php
header('Content-Type: application/json');

// NOTE: hard-code your key here, or load from a secure config file
$OPENCAGE_KEY = '64babd120bf641ba8d7387a9e0519c0d';

if (isset($_GET['q'])) {
    // Forward geocoding: country name or any address
    $query = urlencode(trim($_GET['q']));
    $limit = 1; // just take the first result

    $url = "https://api.opencagedata.com/geocode/v1/json"
         . "?q={$query}"
         . "&key={$OPENCAGE_KEY}"
         . "&limit={$limit}";
}
elseif (isset($_GET['lat']) && isset($_GET['lng'])) {
  // → Reverse geocoding
  $lat = floatval($_GET['lat']);
  $lng = floatval($_GET['lng']);
  $url = "https://api.opencagedata.com/geocode/v1/json"
       . "?q={$lat}+{$lng}"
       . "&key={$OPENCAGE_KEY}"
       . "&no_annotations=1"      // you can tweak parameters as needed
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
  

// If you reach here without `q`, return an error
http_response_code(400);
echo json_encode(['error' => 'Missing "q" parameter for forward geocoding']);
