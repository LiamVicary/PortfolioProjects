
<?php

	// connection details for MySQL database

	$cd_host = "127.0.0.1";
	$cd_port = 3306;
	$cd_socket = "";

	// database name, username and password

	$cd_dbname = "companydirectory";
	$cd_user = "root";
	$cd_password = "";


	$conn = new mysqli(
    $cd_host,
    $cd_user,
    $cd_password,
    $cd_dbname,
    $cd_port,
    $cd_socket
);



