<?php
/**
 * BaitoMate - Reusable Mobile Bottom Navigation Bar & FAB
 */
$activePage = $activePage ?? 'dashboard';
?>

<!-- Floating Action Button for Quick Addition on Mobile -->
<button type="button" class="fab-btn" data-toggle="modal" data-target="#quickShiftModal" aria-label="Quick Add Shift">
  <i class="bi bi-plus-lg"></i>
</button>

<!-- Mobile Fixed Bottom Navigation Bar -->
<nav class="mobile-bottom-nav">
  <a href="<?= APP_URL ?>/pages/dashboard.php" class="mobile-nav-item <?= $activePage === 'dashboard' ? 'active' : '' ?>">
    <i class="bi bi-grid-1x2-fill"></i>
    <span>Home</span>
  </a>

  <a href="<?= APP_URL ?>/pages/shifts.php" class="mobile-nav-item <?= $activePage === 'shifts' ? 'active' : '' ?>">
    <i class="bi bi-clock-history"></i>
    <span>Shifts</span>
  </a>

  <a href="<?= APP_URL ?>/pages/salary.php" class="mobile-nav-item <?= $activePage === 'salary' ? 'active' : '' ?>">
    <i class="bi bi-currency-yen"></i>
    <span>Salary</span>
  </a>

  <a href="<?= APP_URL ?>/pages/expenses.php" class="mobile-nav-item <?= $activePage === 'expenses' ? 'active' : '' ?>">
    <i class="bi bi-wallet2"></i>
    <span>Expenses</span>
  </a>

  <a href="#" class="mobile-nav-item" onclick="document.getElementById('sidebarToggleBtn').click(); return false;">
    <i class="bi bi-list"></i>
    <span>Menu</span>
  </a>
</nav>
