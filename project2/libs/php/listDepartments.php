<?php
ini_set('display_errors',1);
error_reporting(E_ALL);
include 'config.php';

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host,$cd_user,$cd_password,$cd_dbname,$cd_port,$cd_socket);

$query = '
  SELECT d.id, d.name, l.name AS location
  FROM department d
  LEFT JOIN location l ON l.id = d.locationID
  ORDER BY d.name
';
$result = $conn->query($query);

$data = [];
while($row = $result->fetch_assoc()) {
  $data[] = $row;
}

echo json_encode([
  'status'=>['code'=>200,'name'=>'ok','description'=>'success'],
  'data'=>$data
]);
