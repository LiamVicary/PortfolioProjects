<?php

	// example use from browser
	// http://localhost/companydirectory/libs/php/insertDepartment.php?name=New%20Department&locationID=<id>

	// remove next two lines for production
	
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);
	
	// this includes the login details
	
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

	// SQL statement accepts parameters and so is prepared to avoid SQL injection.
	// Accept GET (dev) or POST (prod), but validate inputs

    // Ensure UTF-8 (log if it fails)
    if (!$conn->set_charset('utf8mb4')) { error_log('DB charset error: '.$conn->error); }

    // Validate inputs: name (non-empty) and locationID (positive int)
    $name = filter_input(INPUT_GET, 'name', FILTER_UNSAFE_RAW);
    $loc  = filter_input(INPUT_GET, 'locationID', FILTER_VALIDATE_INT);
    if ($name === null) { $name = filter_input(INPUT_POST, 'name', FILTER_UNSAFE_RAW); }
    if ($loc === null || $loc === false) { $loc = filter_input(INPUT_POST, 'locationID', FILTER_VALIDATE_INT); }
    $name = is_string($name) ? trim($name) : '';
    if ($name === '' || $loc === null || $loc === false || $loc <= 0) {
        $output['status']['code'] = "400";
        $output['status']['name'] = "bad_request";
        $output['status']['description'] = "invalid or missing name/locationID";
        $output['status']['returnedIn'] = round((microtime(true) - $executionStartTime) * 1000, 2) . " ms";
        $output['data'] = [];
        echo json_encode($output);
        mysqli_close($conn);
        exit;
    }

	$query = $conn->prepare('INSERT INTO department (name, locationID) VALUES(?,?)');
    if ($query === false) {
        error_log('Prepare failed: '.$conn->error);
        $output['status']['code'] = "400";
        $output['status']['name'] = "executed";
        $output['status']['description'] = "query prepare failed";
        $output['status']['returnedIn'] = round((microtime(true) - $executionStartTime) * 1000, 2) . " ms";
        $output['data'] = [];
        echo json_encode($output);
        mysqli_close($conn);
        exit;
    }

	if (!$query->bind_param("si", $name, $loc)) {
        error_log('bind_param failed: '.$query->error);
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
        error_log('Execute failed: '.$query->error);

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

    if ($conn->affected_rows <= 0) {
        $output['status']['code'] = "400";
        $output['status']['name'] = "executed";
        $output['status']['description'] = "no row inserted";
        $output['status']['returnedIn'] = round((microtime(true) - $executionStartTime) * 1000, 2) . " ms";
        $output['data'] = [];
        echo json_encode($output);
        $query->close();
        mysqli_close($conn);
        exit;
    }

    $query->close();

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = round((microtime(true) - $executionStartTime) * 1000, 2) . " ms";
	$output['data'] = [];
	
	mysqli_close($conn);

	echo json_encode($output); 

?>
