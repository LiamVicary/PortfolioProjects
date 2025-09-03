<?php
// deleteDepartmentByID.php

$executionStartTime = microtime(true);

include("config.php");
header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status'] = [
        'code' => "300",
        'name' => "failure",
        'description' => "database unavailable",
        'returnedIn' => round((microtime(true) - $executionStartTime) * 1000, 2) . " ms"
    ];
    $output['data'] = [];
    echo json_encode($output);
    exit;
}

// charset (log if it fails, but continue)
if (!$conn->set_charset('utf8mb4')) {
    error_log('DB charset error: ' . $conn->error);
}

// Enforce POST + validate id
$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
if ($id === null || $id === false || $id <= 0) {
    $output['status'] = [
        'code' => "400",
        'name' => "bad_request",
        'description' => "invalid id",
        'returnedIn' => round((microtime(true) - $executionStartTime) * 1000, 2) . " ms"
    ];
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}

/* -------- Dependency check: personnel in this department -------- */
$cnt = 0;
$chk = $conn->prepare('SELECT COUNT(1) AS cnt FROM personnel WHERE departmentID = ?');
if ($chk === false) {
    error_log('prepare(count personnel) failed: ' . $conn->error);
    $output['status'] = [
        'code' => "400",
        'name' => "executed",
        'description' => "query prepare failed",
        'returnedIn' => round((microtime(true) - $executionStartTime) * 1000, 2) . " ms"
    ];
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}
if (!$chk->bind_param('i', $id) || !$chk->execute()) {
    error_log('count personnel execute failed: ' . $chk->error);
    $output['status'] = [
        'code' => "400",
        'name' => "executed",
        'description' => "query failed",
        'returnedIn' => round((microtime(true) - $executionStartTime) * 1000, 2) . " ms"
    ];
    $output['data'] = [];
    echo json_encode($output);
    $chk->close();
    $conn->close();
    exit;
}
$res = $chk->get_result();
if ($res) {
    $row = $res->fetch_assoc();
    $cnt = (int)($row['cnt'] ?? 0);
    $res->free();
}
$chk->close();

// If any personnel depend on this department, block delete
if ($cnt > 0) {
    $output['status'] = [
        'code' => "409",
        'name' => "cannot_delete",
        'description' => "department has assigned personnel",
        'returnedIn' => round((microtime(true) - $executionStartTime) * 1000, 2) . " ms"
    ];
    // Your JS reads either data.personnelCount OR top-level personnelCount
    $output['data'] = ['personnelCount' => $cnt];
    $output['personnelCount'] = $cnt;
    echo json_encode($output);
    $conn->close();
    exit;
}

/* -------------------- Perform delete -------------------- */
$del = $conn->prepare('DELETE FROM department WHERE id = ?');
if ($del === false) {
    error_log('prepare(delete department) failed: ' . $conn->error);
    $output['status'] = [
        'code' => "400",
        'name' => "executed",
        'description' => "query prepare failed",
        'returnedIn' => round((microtime(true) - $executionStartTime) * 1000, 2) . " ms"
    ];
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}
if (!$del->bind_param('i', $id) || !$del->execute()) {
    $errno = $del->errno;
    error_log('delete department execute failed: ' . $del->error . ' (errno ' . $errno . ')');

    // If FK blocks the delete (race condition), surface like the dependency case
    if ($errno === 1451) {
        $output['status'] = [
            'code' => "409",
            'name' => "cannot_delete",
            'description' => "department has assigned personnel",
            'returnedIn' => round((microtime(true) - $executionStartTime) * 1000, 2) . " ms"
        ];
        $output['data'] = ['personnelCount' => 1];
        $output['personnelCount'] = 1;
    } else {
        $output['status'] = [
            'code' => "400",
            'name' => "executed",
            'description' => "query failed",
            'returnedIn' => round((microtime(true) - $executionStartTime) * 1000, 2) . " ms"
        ];
        $output['data'] = [];
    }

    echo json_encode($output);
    $del->close();
    $conn->close();
    exit;
}

$deleted = $del->affected_rows;
$del->close();
$conn->close();

if ($deleted > 0) {
    $output['status'] = [
        'code' => "200",
        'name' => "ok",
        'description' => "success",
        'returnedIn' => round((microtime(true) - $executionStartTime) * 1000, 2) . " ms"
    ];
    $output['data'] = [];
} else {
    // id not found: treat as not found
    $output['status'] = [
        'code' => "404",
        'name' => "not_found",
        'description' => "department not found",
        'returnedIn' => round((microtime(true) - $executionStartTime) * 1000, 2) . " ms"
    ];
    $output['data'] = [];
}

echo json_encode($output);
