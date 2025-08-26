<?php
declare(strict_types=1);
ini_set('display_errors','1'); error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

$conn->set_charset('utf8mb4');

$sql = 'SELECT id, name FROM location ORDER BY name';
$res = $conn->query($sql);

if (!$res) {
  http_response_code(500);
  echo json_encode([
    'status' => ['code' => 500, 'description' => 'Query failed'],
    'data' => []
  ]);
  exit;
}

$data = $res->fetch_all(MYSQLI_ASSOC);
foreach ($data as &$row) { $row['id'] = (int)$row['id']; }

echo json_encode([
  'status' => ['code' => 200, 'description' => 'OK'],
  'data' => $data
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
