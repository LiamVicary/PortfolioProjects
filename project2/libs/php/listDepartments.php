 <?php
 //ini_set('display_errors',1);
 //error_reporting(E_ALL);
 //require_once __DIR__ . '/db.php';
 include 'config.php';
 
 header('Content-Type: application/json; charset=UTF-8');
 
 $conn = new mysqli($cd_host,$cd_user,$cd_password,$cd_dbname,$cd_port,$cd_socket);
if (mysqli_connect_errno()) {
  // DB unavailable
  echo json_encode([
    'status' => ['code' => 300, 'name' => 'failure', 'description' => 'database unavailable'],
    'data' => []
  ]);
  exit;
}
// Ensure UTF-8 (log but keep going if it fails)
if (!$conn->set_charset('utf8mb4')) { error_log('DB charset error: '.$conn->error); }
 
 $query = '
   SELECT d.id, d.name, l.name AS location
   FROM department d
   LEFT JOIN location l ON l.id = d.locationID
   ORDER BY d.name ASC, l.name ASC
 ';

$result = $conn->query($query);
if ($result === false) {
  error_log('get departments query failed: '.$conn->error);
  echo json_encode([
    'status' => ['code' => 400, 'name' => 'executed', 'description' => 'query failed'],
    'data' => []
  ]);
  $conn->close();
  exit;
}
 
 $data = [];
 while($row = $result->fetch_assoc()) {
   $data[] = $row;
 }
$result->free();
$conn->close();
 
 echo json_encode([
   'status'=>['code'=>200,'name'=>'ok','description'=>'success'],
   'data'=>$data
 ]);
