<?php
ini_set('display_errors','On'); error_reporting(E_ALL);
$executionStartTime = microtime(true);
require_once __DIR__ . '/db.php';
include("config.php");
header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);
if (mysqli_connect_errno()) {
  echo json_encode(["status"=>["code"=>"300","name"=>"failure","description"=>"database unavailable","returnedIn"=>round((microtime(true)-$executionStartTime)*1000)." ms"],"data"=>[]]); exit;
}

$id = isset($_POST['id']) && $_POST['id'] !== "" ? intval($_POST['id']) : null;
$name = trim($_POST['name'] ?? "");
$locationID = intval($_POST['locationID'] ?? 0);

if ($name === "" || $locationID <= 0) {
  echo json_encode(["status"=>["code"=>"422","name"=>"invalid","description"=>"Missing name or locationID","returnedIn"=>round((microtime(true)-$executionStartTime)*1000)." ms"],"data"=>[]]); exit;
}

if ($id) {
  $stmt = $conn->prepare("UPDATE department SET name=?, locationID=? WHERE id=?");
  $stmt->bind_param("sii", $name, $locationID, $id);
} else {
  $stmt = $conn->prepare("INSERT INTO department (name, locationID) VALUES (?,?)");
  $stmt->bind_param("si", $name, $locationID);
}

if (!$stmt->execute()) {
  $code = ($conn->errno === 1062) ? "409" : "400"; // 409 if unique constraint on name, if you have one
  echo json_encode(["status"=>["code"=>$code,"name"=>"error","description"=>$conn->error,"returnedIn"=>round((microtime(true)-$executionStartTime)*1000)." ms"],"data"=>[]]); exit;
}

echo json_encode(["status"=>["code"=>"200","name"=>"ok","description"=>"success","returnedIn"=>round((microtime(true)-$executionStartTime)*1000)." ms"],"data"=>["id"=>$id ?: $conn->insert_id]]);
$conn->close();
