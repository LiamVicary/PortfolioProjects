<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

include 'config.php';

// 1) Fetch all locations
$res = $conn->query('SELECT id, name FROM location ORDER BY name');
if (! $res) {
    // in case the query fails
    die("Database error: " . $conn->error);
}

// 2) Turn result set into an array
$locations = $res->fetch_all(MYSQLI_ASSOC);

// 3) Loop and emit the new Bootstrap-5–styled rows
foreach ($locations as $loc) {
    echo "<tr>
            <td class=\"align-middle text-nowrap\">{$loc['name']}</td>
            <td class=\"text-end text-nowrap\">
              <button
                type=\"button\"
                class=\"btn btn-primary btn-sm\"
                data-bs-toggle=\"modal\"
                data-bs-target=\"#locationModal\"
                data-id=\"{$loc['id']}\">
                <i class=\"fa-solid fa-pencil fa-fw\"></i>
              </button>
              <button
                type=\"button\"
                class=\"btn btn-primary btn-sm delete-location\"
                data-id=\"{$loc['id']}\">
                <i class=\"fa-solid fa-trash fa-fw\"></i>
              </button>
            </td>
          </tr>";
}
