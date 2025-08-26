<?php
require_once __DIR__ . '/db.php';
include 'config.php';
header('Content-Type: application/json');

// read POST fields
$id           = $_POST['id'] ?: null;          // empty => new
$firstName    = $_POST['firstName'];
$lastName     = $_POST['lastName'];
$jobTitle     = $_POST['jobTitle'];
$email        = $_POST['email'];
$departmentID = $_POST['departmentID'];

try {
  if ($id) {
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

  echo json_encode(['success' => true]);
} catch (mysqli_sql_exception $e) {
  // e.g. foreign-key error if departmentID invalid
  echo json_encode([
    'success' => false,
    'message' => $e->getMessage()
  ]);
}
