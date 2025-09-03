<?php
//require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=UTF-8');
include 'config.php';

// Ensure $conn exists (create it here if config.php only holds creds)
if (!isset($conn) || !($conn instanceof mysqli)) {
  $conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);
  if ($conn->connect_errno) { echo json_encode(["error"=>"db unavailable"]); exit; }
  $createdConn = true;
} else {
  $createdConn = false;
}
// Ensure UTF-8 (log failure but keep going)
if (!$conn->set_charset('utf8mb4')) { error_log('DB charset error: '.$conn->error); }

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($id === null || $id === false || $id <= 0) {
  echo json_encode(["error" => "invalid id"]);
  if (!empty($createdConn)) { $conn->close(); }
  exit;
}

$stmt = $conn->prepare('SELECT id, name FROM location WHERE id=?');
if ($stmt === false) {
  error_log('prepare failed: '.$conn->error);
  echo json_encode(["error"=>"database error"]); if (!empty($createdConn)) { $conn->close(); } exit;
}
if (!$stmt->bind_param('i', $id)) {
  error_log('bind_param failed: '.$stmt->error);
  echo json_encode(["error"=>"database error"]); $stmt->close(); if (!empty($createdConn)) { $conn->close(); } exit;
}
if (!$stmt->execute()) {
  error_log('execute failed: '.$stmt->error);
  echo json_encode(["error"=>"database error"]); $stmt->close(); if (!empty($createdConn)) { $conn->close(); } exit;
}
$res = $stmt->get_result();
if ($res === false) {
  error_log('get_result failed: '.$stmt->error);
  echo json_encode(["error"=>"database error"]); $stmt->close(); if (!empty($createdConn)) { $conn->close(); } exit;
}
$row = $res->fetch_assoc();
$res->free(); $stmt->close(); if (!empty($createdConn)) { $conn->close(); }
echo json_encode($row ?: ["error"=>"not found"]);
