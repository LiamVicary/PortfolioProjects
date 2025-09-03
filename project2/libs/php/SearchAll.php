<?php

	// example use from browser
	// http://localhost/companydirectory/libs/php/searchAll.php?txt=<txt>

	// remove next two lines for production
	
	//ini_set('display_errors', 'On');
	//error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	//require_once __DIR__ . '/db.php';

	include("config.php");

	header('Content-Type: application/json; charset=UTF-8');

    // Enforce GET
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

    // Ensure UTF-8 (log but keep going if it fails)
    if (!$conn->set_charset('utf8mb4')) {
        error_log('DB charset error: ' . $conn->error);
    }

    // Read & validate search text (reject empty/very short/wildcard-only)
    $txt = filter_input(INPUT_GET, 'txt', FILTER_UNSAFE_RAW);
    $txt = is_string($txt) ? trim($txt) : '';
    if ($txt === '' || mb_strlen($txt) < 1 || str_replace(['%','_'], '', $txt) === '') {
        $output['status']['code'] = "400";
        $output['status']['name'] = "bad_request";
        $output['status']['description'] = "invalid or too-short search text";
        $output['status']['returnedIn'] = round((microtime(true) - $executionStartTime) * 1000, 2) . " ms";
        $output['data'] = [];
        echo json_encode($output);
        mysqli_close($conn);
        exit;
    }


	// first query - SQL statement accepts parameters and so is prepared to avoid SQL injection.
	// $_REQUEST used for development / debugging. Remember to change to $_POST for production

    $query = $conn->prepare('SELECT `p`.`id`, `p`.`firstName`, `p`.`lastName`, `p`.`email`, `p`.`jobTitle`, `d`.`id` as `departmentID`, `d`.`name` AS `departmentName`, `l`.`id` as `locationID`, `l`.`name` AS `locationName` FROM `personnel` `p` LEFT JOIN `department` `d` ON (`d`.`id` = `p`.`departmentID`) LEFT JOIN `location` `l` ON (`l`.`id` = `d`.`locationID`) WHERE `p`.`firstName` LIKE ? OR `p`.`lastName` LIKE ? OR `p`.`email` LIKE ? OR `p`.`jobTitle` LIKE ? OR `d`.`name` LIKE ? OR `l`.`name` LIKE ? ORDER BY `p`.`lastName`, `p`.`firstName`, `d`.`name`, `l`.`name`');
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

	$likeText = "%" . $txt . "%";

  if (!$query->bind_param("ssssss", $likeText, $likeText, $likeText, $likeText, $likeText, $likeText)) {
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

	$query->execute();
	
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

  $found = [];

	while ($row = mysqli_fetch_assoc($result)) {

		array_push($found, $row);

	}

	mysqli_free_result($result);
    $query->close();

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = round((microtime(true) - $executionStartTime) * 1000, 2) . " ms";
	$output['data']['found'] = $found;
	
	mysqli_close($conn);

	echo json_encode($output); 

?>
