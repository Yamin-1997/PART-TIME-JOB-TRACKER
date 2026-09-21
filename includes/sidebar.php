<?php
/**
 * BaitoMate - Reusable Dark Navy Sidebar Component
 * Displays BaitoMate logo, 10 primary pages, and Student 28-hr meter
 */
$activePage = $activePage ?? 'dashboard';

// Ensure weekly hours are computed
if (!isset($weeklyHours)) {
    $weeklyHours = 0;
    $legalLimit = 28.0;
    $hoursLeft = 28.0;
    $percentUsed = 0;
}
?>
<aside id="appSidebar" class="app-sidebar">
  <!-- Brand Logo Header -->
  <div class="sidebar-header">
    <a href="<?= APP_URL ?>/pages/dashboard.php" class="brand-logo">
      <i class="bi bi-briefcase-fill" style="color: #3b82f6;"></i>
      <span>BaitoMate</span>
    </a>
    <span class="brand-badge">Japan</span>
  </div>

  <!-- Navigation Links -->
  <div class="sidebar-content">
    <div class="sidebar-section-title">Main Work</div>

    <a href="<?= APP_URL ?>/pages/dashboard.php" class="nav-link-item <?= $activePage === 'dashboard' ? 'active' : '' ?>">
      <i class="bi bi-grid-1x2-fill"></i>
      <span>Dashboard</span>
    </a>

    <a href="<?= APP_URL ?>/pages/jobs.php" class="nav-link-item <?= $activePage === 'jobs' ? 'active' : '' ?>">
      <i class="bi bi-building"></i>
      <span>Jobs</span>
    </a>

    <a href="<?= APP_URL ?>/pages/shifts.php" class="nav-link-item <?= $activePage === 'shifts' ? 'active' : '' ?>">
      <i class="bi bi-clock-history"></i>
      <span>Shifts</span>
    </a>

    <a href="<?= APP_URL ?>/pages/salary.php" class="nav-link-item <?= $activePage === 'salary' ? 'active' : '' ?>">
      <i class="bi bi-currency-yen"></i>
      <span>Salary</span>
    </a>

    <a href="<?= APP_URL ?>/pages/expenses.php" class="nav-link-item <?= $activePage === 'expenses' ? 'active' : '' ?>">
      <i class="bi bi-wallet2"></i>
      <span>Expenses</span>
    </a>

    <a href="<?= APP_URL ?>/pages/calendar.php" class="nav-link-item <?= $activePage === 'calendar' ? 'active' : '' ?>">
      <i class="bi bi-calendar-week"></i>
      <span>Calendar</span>
    </a>

    <div class="sidebar-section-title">Student Tools</div>

    <a href="<?= APP_URL ?>/pages/notes.php" class="nav-link-item <?= $activePage === 'notes' ? 'active' : '' ?>">
      <i class="bi bi-journal-text"></i>
      <span>Notes</span>
    </a>

    <a href="<?= APP_URL ?>/pages/reports.php" class="nav-link-item <?= $activePage === 'reports' ? 'active' : '' ?>">
      <i class="bi bi-bar-chart-line"></i>
      <span>Reports</span>
    </a>

    <a href="<?= APP_URL ?>/pages/settings.php" class="nav-link-item <?= $activePage === 'settings' ? 'active' : '' ?>">
      <i class="bi bi-gear"></i>
      <span>Settings</span>
    </a>

    <a href="<?= APP_URL ?>/auth/logout.php" class="nav-link-item text-danger" style="margin-top: auto;">
      <i class="bi bi-box-arrow-right" style="color: #f87171;"></i>
      <span style="color: #fca5a5;">Logout</span>
    </a>
  </div>

  <!-- Footer 28-Hour Weekly Visa Limit Tracker -->
  <div class="sidebar-footer">
    <div class="visa-tracker-card">
      <div class="visa-tracker-header">
        <span class="visa-tracker-title">
          <i class="bi bi-hourglass-split"></i> Weekly 28h Limit
        </span>
        <span class="visa-tracker-hours"><?= number_format($weeklyHours, 1) ?>h</span>
      </div>

      <div class="visa-progress-bar">
        <div class="visa-progress-fill <?= $weeklyHours >= 28 ? 'danger' : ($weeklyHours >= 24 ? 'warning' : 'safe') ?>" 
             style="width: <?= min(100, $percentUsed) ?>%;"></div>
      </div>

      <div class="visa-tracker-subtext">
        <span><?= $hoursLeft > 0 ? number_format($hoursLeft, 1) . 'h remaining' : 'LIMIT REACHED!' ?></span>
        <span>Max <?= $legalLimit ?>h</span>
      </div>
    </div>
  </div>
</aside>
