 <?php
//require_once __DIR__ . '/db.php';
 include 'config.php';

header('Content-Type: application/json; charset=UTF-8');

// Make mysqli throw exceptions so try/catch works
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
if (isset($conn) && $conn instanceof mysqli) {
  if (!$conn->set_charset('utf8mb4')) { error_log('DB charset error: '.$conn->error); }
}
 
// read & validate POST fields
$id = filter_input(
  INPUT_POST, 'id', FILTER_VALIDATE_INT,
  ['options' => ['min_range' => 1], 'flags' => FILTER_NULL_ON_FAILURE]
); // null => INSERT, int>=1 => UPDATE
$firstName = trim((string)($_POST['firstName'] ?? ''));
$lastName  = trim((string)($_POST['lastName']  ?? ''));
$jobTitle  = trim((string)($_POST['jobTitle']  ?? ''));
$email     = (string)($_POST['email'] ?? '');
$emailOk   = filter_var($email, FILTER_VALIDATE_EMAIL);
$departmentID = filter_input(INPUT_POST, 'departmentID', FILTER_VALIDATE_INT, ['options'=>['min_range'=>1]]);

if ($firstName === '' || $lastName === '' || $jobTitle === '' || !$emailOk || $departmentID === false) {
  echo json_encode(['success'=>false,'message'=>'invalid input']); exit;
}
 
 try {
  if ($id !== null) {
     // UPDATE existing
     $stmt = $conn->prepare(
       'UPDATE personnel 
          SET firstName=?, lastName=?, jobTitle=?, email=?, departmentID=?
        WHERE id=?'
     );
     $stmt->bind_param(
       'ssssii',
      $firstName, $lastName, $jobTitle, $email, $departmentID, $id
     );
   } else {
     // INSERT new
     $stmt = $conn->prepare(
       'INSERT INTO personnel
          (firstName, lastName, jobTitle, email, departmentID)
        VALUES (?,?,?,?,?)'
     );
     $stmt->bind_param(
       'ssssi',
       $firstName, $lastName, $jobTitle, $email, $departmentID
     );
   }
 
   $stmt->execute();

  // If updating, detect "not found or no change"
  if ($id !== null && $stmt->affected_rows === 0) {
    echo json_encode(['success'=>false,'message'=>'not found or no change']);
  } else {
    echo json_encode(['success' => true]);
  }
  $stmt->close();
 } catch (mysqli_sql_exception $e) {

  error_log('savePersonnel error: '.$e->getMessage());
  // Map common MySQL errors to friendly messages
  $errno = $e->getCode();
  if ($errno === 1062) {           // duplicate key
    $msg = 'duplicate value';
  } elseif ($errno === 1452) {     // cannot add/update child row (FK)
    $msg = 'invalid department';
  } elseif ($errno === 1406) {     // data too long
    $msg = 'field too long';
  } else {
    $msg = 'database error';
  }
  echo json_encode(['success'=>false,'message'=>$msg]);
 }
