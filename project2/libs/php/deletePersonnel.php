<?php
//require_once __DIR__ . '/db.php';
include 'config.php';
header('Content-Type: application/json; charset=UTF-8');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
if (isset($conn) && $conn instanceof mysqli) { @$conn->set_charset('utf8mb4'); }

$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
if ($id === null || $id === false || $id <= 0) {
  echo json_encode(['success' => false, 'message' => 'Invalid or missing id']);
  exit;
}

try {
  $stmt = $conn->prepare('DELETE FROM personnel WHERE id = ?');
  $stmt->bind_param('i', $id);
  $stmt->execute();
  if ($stmt->affected_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'No matching record']);
  } else {
    echo json_encode(['success' => true]);
  }

  
} catch (mysqli_sql_exception $e) {
  $code = $e->getCode();
  // 1451 = FK constraint (record in use)
  $safe = ($code === 1451) ? 'Record is in use and cannot be deleted' : 'Database error';
  error_log('DELETE personnel failed: ' . $e->getMessage());
  echo json_encode(['success' => false, 'message' => $safe]);
}
