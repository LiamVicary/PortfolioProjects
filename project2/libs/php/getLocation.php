<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=UTF-8');
include 'config.php';

// Ensure $conn exists (create it here if config.php only holds creds)
if (!isset($conn) || !($conn instanceof mysqli)) {
  $conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);
  if ($conn->connect_errno) { echo json_encode(["error"=>"db unavailable"]); exit; }
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$stmt = $conn->prepare('SELECT id, name FROM location WHERE id=?');
$stmt->bind_param('i',$id);
$stmt->execute();
$res = $stmt->get_result();
echo json_encode($res->fetch_assoc() ?: ["error"=>"not found"]);
