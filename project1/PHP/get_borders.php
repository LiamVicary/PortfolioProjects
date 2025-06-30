<?php
// PHP/get_borders.php
header('Content-Type: application/json; charset=UTF-8');

if (empty($_GET['country'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing country parameter']);
    exit;
}

$country = rawurlencode($_GET['country']);
// ask Rest Countries for just the border ISO3 codes
$url = "https://restcountries.com/v3.1/name/{$country}?fullText=true&fields=borders";
$resp = @file_get_contents($url);
if ($resp === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Failed to fetch border data']);
    exit;
}

$data = json_decode($resp, true);
if (empty($data[0]['borders'])) {
    // no borders key or empty
    echo json_encode(['borders' => []]);
    exit;
}

$codes = $data[0]['borders']; // e.g. ["CAN","MEX",…]

// now map ISO3 codes → names in one call
$codeList = implode(',', $codes);
$alphaUrl = "https://restcountries.com/v3.1/alpha?codes={$codeList}&fields=name";
$bresp = @file_get_contents($alphaUrl);
if ($bresp === false) {
    // fallback: just return codes
    echo json_encode(['borders' => $codes]);
    exit;
}

$bdata = json_decode($bresp, true);
$names = [];
foreach ($bdata as $countryObj) {
    if (isset($countryObj['name']['common'])) {
        $names[] = $countryObj['name']['common'];
    }
}

echo json_encode(['borders' => array_values($names)]);
