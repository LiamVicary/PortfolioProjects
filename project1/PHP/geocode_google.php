<?php
// PHP/geocode_google.php
header('Content-Type: application/json');

$GOOGLE_API_KEY = 'AIzaSyAJf1NjVWza05W7vkIdQl_4b9SUUEgk8mM';

if (isset($_GET['q'])) {
    $query = urlencode(trim($_GET['q']));
    $url = "https://maps.googleapis.com/maps/api/geocode/json"
         . "?address={$query}"
         . "&key={$GOOGLE_API_KEY}";
} elseif (isset($_GET['lat']) && isset($_GET['lng'])) {
    $lat = floatval($_GET['lat']);
    $lng = floatval($_GET['lng']);
    $url = "https://maps.googleapis.com/maps/api/geocode/json"
         . "?latlng={$lat},{$lng}"
         . "&key={$GOOGLE_API_KEY}";
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Missing query parameters']);
    exit;
}

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$status  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($status);
echo $response;
