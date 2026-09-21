<?php
/**
 * BaitoMate - Reusable Top Header Component
 */
require_once __DIR__ . '/../config/config.php';
$currentUser = requireAuth();

$activePage = $activePage ?? 'dashboard';
$pageTitle = $pageTitle ?? 'Dashboard';

// Calculate current week hours for header badge
require_once __DIR__ . '/../config/database.php';
$pdo = Database::getConnection();

// Calculate Monday to Sunday of current week in JST
$monday = date('Y-m-d', strtotime('monday this week'));
$sunday = date('Y-m-d', strtotime('sunday this week'));

$stmtWeek = $pdo->prepare("
    SELECT COALESCE(SUM(total_hours), 0) as week_hours 
    FROM shifts 
    WHERE user_id = ? AND shift_date BETWEEN ? AND ? AND status != 'cancelled'
");
$stmtWeek->execute([$currentUser['id'], $monday, $sunday]);
$weeklyHours = (float)($stmtWeek->fetch()['week_hours'] ?? 0);
$legalLimit = LEGAL_WEEKLY_HOUR_LIMIT;
$hoursLeft = max(0, $legalLimit - $weeklyHours);
$percentUsed = min(100, round(($weeklyHours / $legalLimit) * 100));

// Badge visual styling
$badgeClass = 'safe';
if ($weeklyHours >= $legalLimit) {
    $badgeClass = 'danger';
} elseif ($weeklyHours >= ($legalLimit - 4)) {
    $badgeClass = 'warning';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($pageTitle) ?> | BaitoMate - Japan Student Job Tracker</title>
  
  <!-- Bootstrap Icons CDN (Only icons allowed) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  
  <!-- Chart.js for Charts -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
  
  <!-- FullCalendar for Calendar UI -->
  <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js"></script>
  
  <!-- Master Application CSS -->
  <link rel="stylesheet" href="<?= APP_URL ?>/assets/css/style.css">
</head>
<body>

<div class="app-wrapper">
  <!-- Reusable Sidebar Included Next -->
  <?php require_once __DIR__ . '/sidebar.php'; ?>

  <!-- Backdrop overlay for mobile drawer -->
  <div id="sidebarOverlay" class="sidebar-overlay"></div>

  <!-- Main Content Wrapper -->
  <div class="app-main">
    <!-- Top Sticky Header -->
    <header class="app-header">
      <div class="header-left">
        <button type="button" id="sidebarToggleBtn" class="sidebar-toggle-btn" aria-label="Toggle menu">
          <i class="bi bi-list"></i>
        </button>
        <span class="header-page-title"><?= htmlspecialchars($pageTitle) ?></span>
      </div>

      <div class="header-right">
        <!-- 28h Weekly Status Pill -->
        <div class="header-badge-legal" title="Japanese Immigration Law restricts working hours to 28 hrs/week for international students">
          <i class="bi bi-shield-check"></i>
          <span><?= number_format($weeklyHours, 1) ?> / <?= $legalLimit ?> hrs this week</span>
        </div>

        <!-- User Profile Pill -->
        <div class="user-profile-menu" title="<?= htmlspecialchars($currentUser['school']) ?>">
          <div class="user-avatar">
            <?= strtoupper(substr($currentUser['name'], 0, 1)) ?>
          </div>
          <div class="user-meta" style="display: none; @media(min-width: 640px){ display: flex; }">
            <span class="user-name"><?= htmlspecialchars($currentUser['name']) ?></span>
            <span class="user-role"><?= htmlspecialchars($currentUser['visa']) ?></span>
          </div>
        </div>
      </div>
    </header>

    <!-- Page Content Slot Starts in each individual page -->
    <main class="page-container">
      <?php if ($flash = getFlashMessage()): ?>
        <div class="alert alert-<?= htmlspecialchars($flash['type']) ?>">
          <i class="bi bi-<?= $flash['type'] === 'success' ? 'check-circle' : 'exclamation-circle' ?>"></i>
          <div><?= htmlspecialchars($flash['message']) ?></div>
        </div>
      <?php endif; ?>
