<?php
declare(strict_types=1);
// Do NOT echo PHP warnings into JSON:
ini_set('display_errors','0');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

// Ensure $conn is a live mysqli connection
if (!isset($conn) || !($conn instanceof mysqli)) {
  // Expect these to be defined in config.php
  $conn = @new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);
  if ($conn->connect_errno) {
    http_response_code(500);
    echo json_encode([
      'status' => ['code' => 500, 'description' => 'DB connect failed'],
      'data' => []
    ]);
    exit;
  }
}

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
