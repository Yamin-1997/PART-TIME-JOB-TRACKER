<?php
/**
 * BaitoMate - Student Registration Page
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

if (!empty($_SESSION['user_id'])) {
    header('Location: ' . APP_URL . '/pages/dashboard.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $school = trim($_POST['school_name'] ?? '');
    $visa = trim($_POST['visa_type'] ?? 'Student (留学)');
    $hourlyTarget = (int)($_POST['hourly_target'] ?? 1200);

    if (empty($name) || empty($email) || empty($password)) {
        $error = 'Please fill out all required fields.';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters long.';
    } else {
        try {
            $pdo = Database::getConnection();

            // Check if email already registered
            $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $checkStmt->execute([$email]);
            if ($checkStmt->fetch()) {
                $error = 'This email is already registered. Please sign in instead.';
            } else {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("
                    INSERT INTO users (name, email, password_hash, school_name, visa_type, hourly_target, max_weekly_hours)
                    VALUES (?, ?, ?, ?, ?, ?, 28.0)
                ");
                $stmt->execute([$name, $email, $hash, $school, $visa, $hourlyTarget]);
                $newUserId = (int)$pdo->lastInsertId();

                // Automatically seed a default first job for instant convenience
                $jobStmt = $pdo->prepare("
                    INSERT INTO jobs (user_id, company_name, job_title, hourly_wage, transport_allowance, color_hex)
                    VALUES (?, 'Lawson Station Front', 'Convenience Store Staff (コンビニ)', 1250, 500, '#2563eb')
                ");
                $jobStmt->execute([$newUserId]);

                // Log in immediately
                $_SESSION['user_id'] = $newUserId;
                $_SESSION['user_name'] = $name;
                $_SESSION['user_email'] = $email;
                $_SESSION['user_school'] = $school;
                $_SESSION['user_visa'] = $visa;
                $_SESSION['max_weekly_hours'] = 28.0;

                setFlashMessage('success', 'Welcome to BaitoMate! Your account and initial job have been created.');
                header('Location: ' . APP_URL . '/pages/dashboard.php');
                exit;
            }
        } catch (Exception $e) {
            $error = 'Failed to create account: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Register | BaitoMate - Japan Student Part-time Tracker</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="<?= APP_URL ?>/assets/css/style.css">
</head>
<body style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">

<div class="auth-wrapper">
  <div class="auth-card" style="max-width: 480px;">
    <div class="auth-brand">
      <div style="display: inline-flex; align-items: center; gap: 0.65rem; margin-bottom: 0.5rem;">
        <i class="bi bi-briefcase-fill" style="font-size: 1.8rem; color: var(--primary-blue);"></i>
        <span style="font-size: 1.75rem; font-weight: 800; color: #0f172a;">BaitoMate</span>
      </div>
      <p>Create your student account & protect your 28h visa limit</p>
    </div>

    <?php if (!empty($error)): ?>
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <div><?= htmlspecialchars($error) ?></div>
      </div>
    <?php endif; ?>

    <form action="<?= APP_URL ?>/auth/register.php" method="POST">
      <div class="form-group">
        <label class="form-label" for="name">Full Name</label>
        <input type="text" id="name" name="name" class="form-control" placeholder="e.g. Mei-Ling Zhou" required value="<?= htmlspecialchars($_POST['name'] ?? '') ?>">
      </div>

      <div class="form-group">
        <label class="form-label" for="email">Student Email Address</label>
        <input type="email" id="email" name="email" class="form-control" placeholder="name@university.ac.jp" required value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
      </div>

      <div class="form-group">
        <label class="form-label" for="school_name">School / University in Japan</label>
        <input type="text" id="school_name" name="school_name" class="form-control" placeholder="e.g. Waseda University / Tokyo Japanese Academy" value="<?= htmlspecialchars($_POST['school_name'] ?? '') ?>">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
        <div class="form-group">
          <label class="form-label" for="visa_type">Residence Status</label>
          <select id="visa_type" name="visa_type" class="form-control">
            <option value="Student (留学)">Student (留学)</option>
            <option value="Designated Activities (特定活動)">Designated Activities</option>
            <option value="Working Holiday (ワーホリ)">Working Holiday</option>
            <option value="Dependent (家族滞在)">Dependent (家族滞在)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="hourly_target">Target Wage (JPY)</label>
          <input type="number" id="hourly_target" name="hourly_target" class="form-control" value="1250" min="1113" step="10">
          <span class="form-text">Tokyo min: ¥1,163/hr</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="password">Create Password</label>
        <input type="password" id="password" name="password" class="form-control" placeholder="At least 6 characters" required>
      </div>

      <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">
        <i class="bi bi-person-plus"></i> Register Student Account
      </button>
    </form>

    <div style="text-align: center; margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color); font-size: 0.875rem; color: var(--text-muted);">
      Already registered? <a href="<?= APP_URL ?>/auth/login.php" style="font-weight: 600;">Sign in here</a>
    </div>
  </div>
</div>

</body>
</html>
