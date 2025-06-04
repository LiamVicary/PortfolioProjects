<?php
header('Content-Type: application/json');

if (empty($_GET['iso'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing "iso" query parameter']);
    exit;
}

$isoCode = strtoupper(trim($_GET['iso']));

$geojsonPath = __DIR__ . '/countryBorders.geo.json';
if (!file_exists($geojsonPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'GeoJSON file not found on server']);
    exit;
}

$geo = json_decode(file_get_contents($geojsonPath), true);
if ($geo === null || !isset($geo['features'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid GeoJSON format']);
    exit;
}

$found = null;
foreach ($geo['features'] as $feature) {
    if (
        isset($feature['properties']['iso_a2']) &&
        strtoupper($feature['properties']['iso_a2']) === $isoCode
    ) {
        $found = $feature;
        break;
    }
}

if ($found === null) {
    http_response_code(404);
    echo json_encode(['error' => "No border found for ISO code \"$isoCode\""]);
    exit;
}

echo json_encode($found, JSON_UNESCAPED_UNICODE);
