<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - E-Learning</title>
    <link rel="stylesheet" href="css/login.css">
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header class="header">
        <a class="logo">E-Learning</a>
        <a href="index.php" class="back-btn">Back Home</a>
    </header>
    
    <div class="login-container">
        <div class="login-left">
            <h1>Welcome Back</h1>
            <p>Turn your ideas into reality.</p>
            <p>You can use an online menu for us today.</p>
        </div>
        
        <div class="login-right">
            <form id="loginForm" class="login-form" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']);?>" method = "post">
                <h2>Login</h2>
                
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name = "email" placeholder="Enter your email" required>
                    <div id="emailError" class="error-message"></div>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Enter your password" required>
                    <div id="passwordError" class="error-message"></div>
                </div>

                <div class="form-group">
                    <a href="forgotPassword.php">Forgot Password?</a>
                </div>
                
                <button type="submit" class="login-btn" name = "login">Login</button>
                
                <div class="form-footer">
                    <p>Don't have an account? <a href="register.php">Create account</a></p>
                </div>
            </form>
        </div>
    </div>

    <?php
        require_once('connection.php');
        session_start();
        if (isset($_SESSION['user_id'])) {
            header("Location: learner/course.php");
            exit;
        }
        // echo '<pre>';
        // print_r($_SESSION);
        // echo '</pre>';
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            if (isset($_POST['login'])) {
                $email = $_POST['email'];
                $password = $_POST['password'];
                    
                $sql = "select * from users where email = '$email'";
                $result = $conn->query($sql);
                if ($result) {
                    if ($result->num_rows > 0) {
                        $row = $result->fetch_assoc();
                        if (password_verify($password, $row['password'])) {
                            $_SESSION['user_id'] = $row['user_id'];
                            setcookie('name', $row['name'], time() + (3600 * 5), "");
                            setcookie('uid', $row['user_id'], time() + (3600 * 5), "");
                            if ($row['role'] === 'Learner') {
                                header("Location: learner/course.php");
                            } else if($row['role'] === 'Tutor'){
                                header("Location: tutor/manage_course.html");
                            } else if($row['role'] === 'Admin'){
                                header("Location: admin/home_admin.html");
                            } else{
                                echo "<script>alert('Role tidak dikenali');</script>";
                            }
                        } else{                                           
                            echo "<script>alert('Password tidak cocok');</script>";
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

    <!-- <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const emailError = document.getElementById('emailError');
            const passwordError = document.getElementById('passwordError');
            
            // Hide previous errors
            emailError.style.display = 'none';
            passwordError.style.display = 'none';
            
            // Get user database from localStorage
            const userDatabase = JSON.parse(localStorage.getItem('userDatabase')) || [];
            
            // Find user
            const user = userDatabase.find(u => u.email === email);
            
            if (!user) {
                emailError.textContent = 'Email not registered';
                emailError.style.display = 'block';
                return;
            }
            
            if (user.password !== password) {
                passwordError.textContent = 'Incorrect password';
                passwordError.style.display = 'block';
                return;
            }
            
            // Successful login - save to session
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            
            // Redirect based on role
            switch(user.role) {
                case 'student':
                    window.location.href = 'student/dashboard.html';
                    break;
                case 'tutor':
                    window.location.href = 'tutor/dashboard.html';
                    break;
                case 'admin':
                    window.location.href = 'admin/dashboard.html';
                    break;
                default:
                    alert('Invalid user role');
            }
        });
    </script> -->
</body>
</html>