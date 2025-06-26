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

// Correct any names for APIs
$corrections = [
  'Bosnia and Herz.'                 => 'Bosnia and Herzegovina',
  'Central African Rep.'             => 'Central African Republic',
  'Czech Rep.'             => 'Czech Republic',
  'Côte d\'Ivoire'             => 'Ivory Coast',
  'Dem. Rep. Congo'             => 'Democratic Republic of the Congo',
  'Dem. Rep. Korea'             => 'North Korea',
  'Dominican Rep.'      => 'Dominican Republic',
  'Eq. Guinea'             => 'Equatorial Guinea',
  'Falkland Is.'             => 'Falkland Islands',
  'Korea'             => 'South Korea',
  'Lao PDR'             => 'Laos',
  'N. Cyprus'             => 'Cyprus',
  'Solomon Is.'             => 'Solomon Islands',
  'S. Sudan'             => 'South Sudan',
  'W. Sahara'             => 'Western Sahara',
  ''             => '',
];

$out = array_map(function($c) use ($corrections) {
  if (isset($corrections[$c['name']])) {
      $c['name'] = $corrections[$c['name']];
  }
  return $c;
}, $out);


// Sort by country name, ascending
usort($out, function($a, $b) {
  return strcmp($a['name'], $b['name']);
});

echo json_encode($out, JSON_UNESCAPED_UNICODE);
