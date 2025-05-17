<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - E-Learning</title>
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
            <h1>Welcome</h1>
            <p>Please enter your personal data correctly</p>
        </div>
        
        <div class="login-right">
            <form id="loginForm" class="login-form" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']);?>" method = "post">
                <h2>Create Account</h2>
                
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" name="name" placeholder="Enter your full name" value="<?php echo isset($_POST['name']) ? htmlspecialchars($_POST['name']) : ''; ?>" required>
                </div>
                
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="Enter your email" value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>" required>
                    <div id="emailError" class="error-message"></div>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Create a password (min 8 characters)" minlength="8" required>
                </div>
                
                <button type="submit" class="login-btn" name="register">Register</button>
                
                <div class="form-footer">
                    <p>Already have an account? <a href="login.html">Login</a></p>
                </div>
            </form>
        </div>
    </div>

    <?php
        require_once('connection.php');
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            if (isset($_POST['register'])) {
                $name = $_POST['name'];
                $email = $_POST['email'];
                $password = $_POST['password'];
                    
                $sql = "select email from users where email = '$email'";
                $result = $conn->query($sql);
                if ($result) {
                    if ($result->num_rows < 1) {
                        if (strlen($password) >= 8) {
                            $sql = "insert into users (name, email, password,role) values ('$name', '$email', '".password_hash($password, PASSWORD_BCRYPT)."', 'Learner')";
                            $result = $conn->query($sql);
                            if ($result) {
                                echo "<script>alert('Akun berhasil ditambahkan');window.location='login.php';</script>";
                                exit();
                            } else {
                                echo "<script>alert('Gagal membuat akun');</script>";
                            }
                            //   echo "<script>alert('Tunggu ');</script>";
                        } else{
                            echo "<script>alert('Password min 8 karakter');</script>";
                            echo "<script>window.location='register.php';</script>";  
                            // exit;
                        }
                    } else {
                        echo "<script>alert('Email sudah pernah digunakan. Silahkan input email yang berbeda!');</script>";
                    }
                } else {
                    echo "<script>alert('Terjadi kesalahan dalam eksekusi SQL: " . $conn->error . "');</script>";
                }
            }
        }
    ?>

    <!-- <script>
        // Simulated database
        const userDatabase = JSON.parse(localStorage.getItem('userDatabase')) || [];

        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            let email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            const emailError = document.getElementById('emailError');
            
            // Validate email based on role
            let isValid = true;
            emailError.style.display = 'none';
            
            if (role === 'tutor') {
                if (!email.endsWith('@tutor.elearning.id')) {
                    emailError.textContent = 'Tutor email must end with @tutor.elearning.id';
                    emailError.style.display = 'block';
                    isValid = false;
                }
            } else if (role === 'admin') {
                if (!email.endsWith('@admin.elearning.id')) {
                    emailError.textContent = 'Admin email must end with @admin.elearning.id';
                    emailError.style.display = 'block';
                    isValid = false;
                }
            }
            
            if (!isValid) return;
            
            // Check if email already exists
            if (userDatabase.some(user => user.email === email)) {
                emailError.textContent = 'Email already registered';
                emailError.style.display = 'block';
                return;
            }
            
            // Create user object
            const user = {
                id: Date.now().toString(),
                name,
                email,
                password, 
                role,
                createdAt: new Date().toISOString()
            };

            userDatabase.push(user);
            localStorage.setItem('userDatabase', JSON.stringify(userDatabase));
            
            alert(`Registration successful as ${role}! Please login.`);
            window.location.href = 'login.html';
        });
    </script> -->
</body>
</html>