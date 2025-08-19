<?php
include 'config.php';
$id   = $_POST['id'] ?: null;
$name = $_POST['name'];
if ($id) {
  $stmt = $conn->prepare('UPDATE location SET name=? WHERE id=?');
  $stmt->bind_param('si',$name,$id);
} else {
  $stmt = $conn->prepare('INSERT INTO location(name) VALUES(?)');
  $stmt->bind_param('s',$name);
}
if ($stmt->execute()) {
  echo json_encode(['success'=>true]);
} else {
  echo json_encode(['success'=>false,'message'=>'DB error: '.$conn->error]);
}
?>