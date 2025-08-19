<?php
ini_set('display_errors','On'); error_reporting(E_ALL);
$executionStartTime = microtime(true);
include("config.php");
header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);
if (mysqli_connect_errno()) {
  echo json_encode(["status"=>["code"=>"300","name"=>"failure","description"=>"database unavailable","returnedIn"=>round((microtime(true)-$executionStartTime)*1000)." ms"],"data"=>[]]); exit;
}

$sql = "SELECT id, name FROM location ORDER BY name";
$res = $conn->query($sql);
$data = [];
while ($row = $res->fetch_assoc()) { $data[] = $row; }

echo json_encode([
  "status" => ["code"=>"200","name"=>"ok","description"=>"success","returnedIn"=>round((microtime(true)-$executionStartTime)*1000)." ms"],
  "data" => $data
]);
$conn->close();
