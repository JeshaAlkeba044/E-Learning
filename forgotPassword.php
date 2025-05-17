<!DOCTYPE html>
<html>
<head>
    <title>Forgot Password - E-Learning</title>
    <link rel="stylesheet" href="css/login.css">
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header class="header">
        <a class="logo">E-Learning</a>
        <a href="index.html" class="back-btn">Back Home</a>
    </header>
    
    <div class="login-container">
        <div class="login-left">
            <h1>Change Your Password</h1>
            <p>Make sure your email is registed!</p>
        </div>
        
        <div class="login-right">
            <form id="loginForm" class="login-form" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']);?>" method = "post">
                <h2>Login - Forgot Password</h2>
                
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name = "email" placeholder="Enter your email" required>
                    <div id="emailError" class="error-message"></div>
                </div>
                
                <div class="form-group">
                    <label for="password">New Password</label>
                    <input type="password" id="newpassword" name="newpassword" placeholder="Enter your password" required>
                    <div id="passwordError" class="error-message"></div>
                </div>

                <button type="submit" class="login-btn" name = "change-pass">Change Password</button>
                
                <div class="form-footer">
                    <p>Remember your password? <a href="login.php">Login</a></p>
                </div>
            </form>
        </div>
    </div>

    <?php
        require_once('connection.php');

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            if (isset($_POST['change-pass'])) {
                $email = $_POST['email'];
                $newpassword = $_POST['newpassword'];
                    
                $sql = "select * from users where email = '$email'";
                $result = $conn->query($sql);
                if ($result) {
                    if ($result->num_rows > 0) {
                        if (strlen($newpassword) >= 8) {
                            $sql = "update users set password = '".password_hash($newpassword, PASSWORD_BCRYPT)."' where email = '$email'";
                            $result = $conn->query($sql);
                            if ($result) {
                                echo "<script>alert('Password telah diupdate, silahkan Anda melakukan Log In');</script>";
                                echo "<script>window.location='login.php';</script>";
                                exit;
                            } else {
                                echo "Error update password: " . $conn->error;
                            }
                        } else{
                            echo "<script>alert('Password min 8 karakter');</script>";
                            echo "<script>window.location='forgotPassword.php';</script>";  
                            exit;
                        }
                    } else {
                        echo "<script>alert('Email tidak ditemukan');</script>";
                    }
                } else {
                    echo "<script>alert('Terjadi kesalahan dalam eksekusi SQL: " . $conn->error . "');</script>";
                }
            }
        }
    ?>
</body>
</html>