<?php    
    $con = mysqli_connect("localhost", "root","", "e-learning"); 
	if (mysqli_connect_errno()) {
	    echo "Failed to connect to MySQL: ".mysqli_connect_error();
	}
	$sql = "CREATE TABLE Users(
	    user_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
		name VARCHAR(100) NOT NULL,
		email VARCHAR(100) NOT NULL,
		password VARCHAR(8) NOT NULL,
		phone_number VARCHAR(20) NOT NULL,
		profile_picture mediumblob NULL,
		role enum('Learner', 'Tutor','Admin') Not Null
		);
	";
			
	if (mysqli_query($con, $sql)) {
		echo "Table created successfully";
	} else {
		echo "Error creating database:".mysqli_error($con);
	}
	mysqli_close($con);
?>