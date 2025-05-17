<?php
    $conn = mysqli_connect("localhost", "root","",);
    if (!$conn) {
      die("Connection failed: " . mysqli_connect_error());
    }

	$sql = "CREATE DATABASE e-learning";
	if (mysqli_query($conn, $sql)) {
		echo "Database created successfully";
	} else {
		echo "Error creating database: " . mysqli_error($conn);
	}
		  
	mysqli_close($conn);
?>
