<?php
// PHP/geocode_google_places.php

header('Content-Type: application/json');

$GOOGLE_API_KEY = 'AIzaSyAJf1NjVWza05W7vkIdQl_4b9SUUEgk8mM';

if (!isset($_GET['q'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing query parameter']);
    exit;
}

$query = urlencode(trim($_GET['q']));

// Build the Places Text Search API URL
$url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
     . "?query={$query}"
     . "&key={$GOOGLE_API_KEY}";

// Perform the API request
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Return API response to client
http_response_code($status);
echo $response;
