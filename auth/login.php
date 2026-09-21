<?php
/**
 * BaitoMate - Student Login Page
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

// Redirect to dashboard if already logged in
if (!empty($_SESSION['user_id'])) {
    header('Location: ' . APP_URL . '/pages/dashboard.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $error = 'Please fill in both your email and password.';
    } else {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password_hash'])) {
                // Initialize authenticated session
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['name'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['user_school'] = $user['school_name'] ?? 'Language School / University';
                $_SESSION['user_visa'] = $user['visa_type'] ?? 'Student (留学)';
                $_SESSION['max_weekly_hours'] = (float)($user['max_weekly_hours'] ?? 28.0);

                setFlashMessage('success', 'Welcome back to BaitoMate, ' . htmlspecialchars($user['name']) . '!');
                header('Location: ' . APP_URL . '/pages/dashboard.php');
                exit;
            } else {
                $error = 'Invalid email address or password. Try the demo account.';
            }
        } catch (Exception $e) {
            $error = 'Database connection issue. Please check configuration.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login | BaitoMate - Student Part-time Work Tracker</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="<?= APP_URL ?>/assets/css/style.css">
</head>
<body style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">

<div class="auth-wrapper">
  <div class="auth-card">
    <div class="auth-brand">
      <div style="display: inline-flex; align-items: center; gap: 0.65rem; margin-bottom: 0.5rem;">
        <i class="bi bi-briefcase-fill" style="font-size: 1.8rem; color: var(--primary-blue);"></i>
        <span style="font-size: 1.75rem; font-weight: 800; color: #0f172a;">BaitoMate</span>
      </div>
      <p>Part-time job & shift tracker for international students in Japan</p>
    </div>

    <?php if (!empty($error)): ?>
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <div><?= htmlspecialchars($error) ?></div>
      </div>
    <?php endif; ?>

    <?php if ($flash = getFlashMessage()): ?>
      <div class="alert alert-<?= htmlspecialchars($flash['type']) ?>">
        <i class="bi bi-check-circle-fill"></i>
        <div><?= htmlspecialchars($flash['message']) ?></div>
      </div>
    <?php endif; ?>

    <form action="<?= APP_URL ?>/auth/login.php" method="POST">
      <div class="form-group">
        <label class="form-label" for="email">Student Email Address</label>
        <input type="email" id="email" name="email" class="form-control" placeholder="name@university.ac.jp" required value="<?= htmlspecialchars($_POST['email'] ?? 'student@baitomate.jp') ?>">
      </div>

      <div class="form-group">
        <label class="form-label" for="password">Password</label>
        <input type="password" id="password" name="password" class="form-control" placeholder="••••••••" required value="student123">
      </div>

      <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">
        <i class="bi bi-box-arrow-in-right"></i> Sign In to BaitoMate
      </button>

      <!-- Quick Demo Auto-Fill Button -->
      <button type="button" class="btn btn-secondary" style="width: 100%; margin-top: 0.75rem; font-size: 0.8rem;" onclick="fillDemo()">
        <i class="bi bi-lightning-charge-fill" style="color: #f59e0b;"></i> Auto-Fill Demo Credentials (student123)
      </button>
    </form>

    <div style="text-align: center; margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color); font-size: 0.875rem; color: var(--text-muted);">
      New international student? <a href="<?= APP_URL ?>/auth/register.php" style="font-weight: 600;">Create an account</a>
    </div>

    <div style="margin-top: 1.25rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-sm); padding: 0.65rem 0.85rem; font-size: 0.75rem; color: #64748b;">
      <i class="bi bi-shield-lock" style="color: #10b981;"></i> <strong>Visa Safe:</strong> Helps you strictly abide by the 28-hour/week legal work restriction under Japanese Immigration Control.
    </div>
  </div>
</div>

<script>
function fillDemo() {
  document.getElementById('email').value = 'student@baitomate.jp';
  document.getElementById('password').value = 'student123';
}
</script>

</body>
</html>
