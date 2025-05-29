<?php
header('Content-Type: application/json');

$geo = json_decode(file_get_contents('functions/countryBorders.geo.json'), true);

$out = [];
if (isset($geo['features']) && is_array($geo['features'])) {
    foreach ($geo['features'] as $feature) {
        $p = $feature['properties'];
        
        if (!empty($p['iso_a2']) && !empty($p['name'])) {
            $out[] = [
                'iso'  => $p['iso_a2'],
                'name' => $p['name']
            ];
        }
    }
}

echo json_encode($out, JSON_UNESCAPED_UNICODE);
