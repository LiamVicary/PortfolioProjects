<?php

	// example use from browser
	// http://localhost/companydirectory/libs/php/getAll.php

	// remove next two lines for production
	
	// ini_set('display_errors', 'On');
	// error_reporting(E_ALL);
	//require_once __DIR__ . '/db.php';

	$executionStartTime = microtime(true);

	include("config.php");

	header('Content-Type: application/json; charset=UTF-8');

	if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
        $output['status']['code'] = "405";
        $output['status']['name'] = "method_not_allowed";
        $output['status']['description'] = "Use GET";
        $output['status']['returnedIn'] = round((microtime(true) - $executionStartTime) * 1000, 2) . " ms";
        $output['data'] = [];
        echo json_encode($output);
        exit;
    }

	$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

	if (mysqli_connect_errno()) {
		
		error_log('DB connect error: ' . mysqli_connect_error());
		$output['status']['code'] = "300";
		$output['status']['name'] = "failure";
		$output['status']['description'] = "database unavailable";
		$output['status']['returnedIn'] = round((microtime(true) - $executionStartTime) * 1000, 2) . " ms";
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output);

		exit;

	}	

	// Set DB charset (nice-to-have)
    if (!$conn->set_charset('utf8mb4')) {
        error_log('DB charset error: ' . $conn->error);
    }


	// SQL does not accept parameters and so is not prepared

$query = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location
          FROM personnel p
          LEFT JOIN department d ON (d.id = p.departmentID)
          LEFT JOIN location l ON (l.id = d.locationID)
          ORDER BY p.lastName, p.firstName, d.name, l.name';
	$result = $conn->query($query);
	
	if (!$result) {
		error_log('getAll query failed: ' . $conn->error);

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}
   
   	$data = [];

	while ($row = mysqli_fetch_assoc($result)) {

		array_push($data, $row);

	}

	// Free result (tidy)
    mysqli_free_result($result);

	$output['status']['code'] = 200;
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = round((microtime(true) - $executionStartTime) * 1000, 2) . " ms";
	$output['data'] = $data;
	
	mysqli_close($conn);

	echo json_encode($output); 

?>
