 <?php
 //ini_set('display_errors','On'); error_reporting(E_ALL);
 //$executionStartTime = microtime(true);
 //require_once __DIR__ . '/db.php';
 include("config.php");
 header('Content-Type: application/json; charset=UTF-8');
 
 $conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);
 if (mysqli_connect_errno()) {
   echo json_encode(["status"=>["code"=>"300","name"=>"failure","description"=>"database unavailable","returnedIn"=>round((microtime(true)-$executionStartTime)*1000)." ms"],"data"=>[]]); exit;
 }
// Ensure UTF-8 (log but keep going if it fails)
if (!$conn->set_charset('utf8mb4')) { error_log('DB charset error: '.$conn->error); }
 
 $sql = "SELECT id, name FROM location ORDER BY name ASC";

$res = $conn->query($sql);
if ($res === false) {
  error_log('locations query failed: '.$conn->error);
  echo json_encode([
    "status" => ["code"=>"400","name"=>"executed","description"=>"query failed","returnedIn"=>round((microtime(true)-$executionStartTime)*1000)." ms"],
    "data" => []
  ]);
  $conn->close();
  exit;
}
 $data = [];
 while ($row = $res->fetch_assoc()) { $data[] = $row; }
$res->free();
 
 echo json_encode([
   "status" => ["code"=>"200","name"=>"ok","description"=>"success","returnedIn"=>round((microtime(true)-$executionStartTime)*1000)." ms"],
   "data" => $data
 ]);
 $conn->close();
