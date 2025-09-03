<?php

	// example use from browser
	// http://localhost/companydirectory/libs/php/getPersonnelByID.php?id=<id>

	// remove next two lines for production
	
	//ini_set('display_errors', 'On');
	//error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	//require_once __DIR__ . '/db.php';

	include("config.php");

	header('Content-Type: application/json; charset=UTF-8');

	$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

	if (mysqli_connect_errno()) {
		
		$output['status']['code'] = "300";
		$output['status']['name'] = "failure";
		$output['status']['description'] = "database unavailable";
		$output['status']['returnedIn'] = round((microtime(true) - $executionStartTime) * 1000, 2) . " ms";
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output);

		exit;

	}	

	// Ensure UTF-8 (log but keep going if it fails)
    if (!$conn->set_charset('utf8mb4')) {
        error_log('DB charset error: ' . $conn->error);
    }

    // Validate id (keeps original $_REQUEST intent: try GET then POST)
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if ($id === null || $id === false) {
        $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    }
    if ($id === null || $id === false || $id <= 0) {
        $output['status']['code'] = "400";
        $output['status']['name'] = "bad_request";
        $output['status']['description'] = "invalid or missing id";
        $output['status']['returnedIn'] = round((microtime(true) - $executionStartTime) * 1000, 2) . " ms";
        $output['data'] = [];
        echo json_encode($output);
        mysqli_close($conn);
        exit;
    }


	// first query - SQL statement accepts parameters and so is prepared to avoid SQL injection.
	// $_REQUEST used for development / debugging. Remember to change to $_POST for production

	$query = $conn->prepare('SELECT `id`, `firstName`, `lastName`, `email`, `jobTitle`, `departmentID` FROM `personnel` WHERE `id` = ?');
    if ($query === false) {
        error_log('Prepare failed: ' . $conn->error);
        $output['status']['code'] = "400";
        $output['status']['name'] = "executed";
        $output['status']['description'] = "query prepare failed";
        $output['status']['returnedIn'] = round((microtime(true) - $executionStartTime) * 1000, 2) . " ms";
        $output['data'] = [];
        echo json_encode($output);
        mysqli_close($conn);
        exit;
    }

	if (!$query->bind_param("i", $id)) {
        error_log('bind_param failed: ' . $query->error);
        $output['status']['code'] = "400";
        $output['status']['name'] = "executed";
        $output['status']['description'] = "bind failed";
        $output['status']['returnedIn'] = round((microtime(true) - $executionStartTime) * 1000, 2) . " ms";
        $output['data'] = [];
        echo json_encode($output);
        $query->close();
        mysqli_close($conn);
        exit;
    }

	$ok = $query->execute();
    if ($ok === false) {
        error_log('Execute failed: ' . $query->error);

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['status']['returnedIn'] = round((microtime(true) - $executionStartTime) * 1000, 2) . " ms";
        $output['data'] = [];
 
        $query->close();

		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}
    
	$result = $query->get_result();
    if ($result === false) {
        error_log('get_result failed: ' . $query->error);
        $output['status']['code'] = "400";
        $output['status']['name'] = "executed";
        $output['status']['description'] = "query failed";
        $output['status']['returnedIn'] = round((microtime(true) - $executionStartTime) * 1000, 2) . " ms";
        $output['data'] = [];
        echo json_encode($output);
        $query->close();
        mysqli_close($conn);
        exit;
    }

   	$personnel = [];

	while ($row = mysqli_fetch_assoc($result)) {

		array_push($personnel, $row);

	}

	mysqli_free_result($result);
    $query->close();

	// second query - does not accept parameters and so is not prepared

	$query = 'SELECT id, name from department ORDER BY name ASC';

	$result = $conn->query($query);
	
	if (!$result) {
		error_log('department list query failed: ' . $conn->error);

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}
   
   	$department = [];

	while ($row = mysqli_fetch_assoc($result)) {

		array_push($department, $row);

	}

	mysqli_free_result($result);

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = round((microtime(true) - $executionStartTime) * 1000, 2) . " ms";
	$output['data']['personnel'] = $personnel;
	$output['data']['department'] = $department;
	
	mysqli_close($conn);

	echo json_encode($output); 

?>
