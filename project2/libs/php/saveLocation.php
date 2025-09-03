 <?php
 //require_once __DIR__ . '/db.php';
 include 'config.php';
 header('Content-Type: application/json; charset=UTF-8');
 
// Enforce POST
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405);
  echo json_encode(['success'=>false,'message'=>'use POST']); exit;
}

 // Validate inputs
$id = filter_input(
  INPUT_POST,
  'id',
  FILTER_VALIDATE_INT,
  ['options' => ['min_range' => 1], 'flags' => FILTER_NULL_ON_FAILURE]
);

 $name = trim((string)($_POST['name'] ?? ''));
 if ($name === '') { echo json_encode(['success'=>false,'message'=>'Invalid name']); exit; }
 
 // Ensure we have a mysqli connection (in case config.php doesn't create $conn)
 if (!isset($conn) || !($conn instanceof mysqli)) {
   $conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);
   if ($conn->connect_errno) { echo json_encode(['success'=>false,'message'=>'database unavailable']); exit; }
 }
 if (!$conn->set_charset('utf8mb4')) { error_log('DB charset error: '.$conn->error); }
 
// Decide insert vs update safely
// Treat missing/empty/invalid id (null OR false) as INSERT
if ($id === null || $id === false) {
  // INSERT (no id provided)
  $stmt = $conn->prepare('INSERT INTO location(name) VALUES(?)');
  if ($stmt === false) { error_log('prepare failed: '.$conn->error); http_response_code(500); echo json_encode(['success'=>false,'message'=>'database error']); exit; }
  if (!$stmt->bind_param('s',$name)) { error_log('bind failed: '.$conn->error); http_response_code(500); echo json_encode(['success'=>false,'message'=>'database error']); $stmt->close(); exit; }
  $isUpdate = false;
} elseif ($id > 0) {
   $stmt = $conn->prepare('UPDATE location SET name=? WHERE id=?');

  if ($stmt === false) { error_log('prepare failed: '.$conn->error); http_response_code(500); echo json_encode(['success'=>false,'message'=>'database error']); exit; }
  if (!$stmt->bind_param('si',$name,$id)) { error_log('bind failed: '.$conn->error); http_response_code(500); echo json_encode(['success'=>false,'message'=>'database error']); $stmt->close(); exit; }
  $isUpdate = true;
} else {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'invalid id']); exit;
}

$ok = $stmt->execute();
if ($ok) {
  if (!empty($isUpdate) && $stmt->affected_rows === 0) {
    // No such id or no change
    http_response_code(404);
    echo json_encode(['success'=>false,'message'=>'not found or no change']);
  } else {
    echo json_encode(['success'=>true]);
  }
} else {
  error_log('execute failed: '.$stmt->error);
  // Map common MySQL errors to clearer client messages
  $errno = $stmt->errno;
  if ($errno === 1062) { http_response_code(409); $msg = 'duplicate name'; }
  elseif ($errno === 1406) { http_response_code(400); $msg = 'name too long'; }
  else { http_response_code(500); $msg = 'database error'; }
  echo json_encode(['success'=>false,'message'=>$msg]);
}
 $stmt->close();
 if (isset($conn) && $conn instanceof mysqli) { $conn->close(); }
 ?>
