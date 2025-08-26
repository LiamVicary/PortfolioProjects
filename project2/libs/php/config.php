<?php

	// connection details for MySQL database

	$cd_host = "db5018477798.hosting-data.io";
	$cd_port = 3306;
	$cd_socket = "";

	// database name, username and password

	$cd_dbname = "dbs14682477";
	$cd_user = "dbu846743";
	$cd_password = "VaultTecBobblehead1337!";


	$conn = new mysqli(
    $cd_host,
    $cd_user,
    $cd_password,
    $cd_dbname,
    $cd_port,
    $cd_socket
);
?>

