<?php
header('Content-Type: application/json');

$geoPath = __DIR__ . '/countryBorders.geo.json';
if (!file_exists($geoPath)) {
  http_response_code(500);
  echo json_encode(['error' => 'GeoJSON file not found']);
  exit;
}
$geo = json_decode(file_get_contents($geoPath), true);
$out = [];
foreach ($geo['features'] as $feat) {
  $p = $feat['properties'];
  if (!empty($p['iso_a2']) && !empty($p['name'])) {
    $out[] = ['iso'=>$p['iso_a2'], 'name'=>$p['name']];
  }
}

// Sort by country name, ascending
usort($out, function($a, $b) {
  return strcmp($a['name'], $b['name']);
});

echo json_encode($out, JSON_UNESCAPED_UNICODE);
