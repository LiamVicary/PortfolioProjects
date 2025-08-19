<?php
include 'config.php';
header('Content-Type: application/json');

$id = (int)$_POST['id'];

try {
  $stmt = $conn->prepare('DELETE FROM personnel WHERE id = ?');
  $stmt->bind_param('i', $id);
  $stmt->execute();

  echo json_encode(['success' => true]);
} catch (mysqli_sql_exception $e) {
  // e.g. error code 1451 if someone tried to delete a dept
  echo json_encode([
    'success' => false,
    'message' => $e->getMessage()
  ]);
}
