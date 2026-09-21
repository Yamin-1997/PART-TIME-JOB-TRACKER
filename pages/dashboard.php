<?php
/**
 * BaitoMate - Main Student Dashboard Page
 */
$activePage = 'dashboard';
$pageTitle = 'Dashboard';

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
$currentUser = requireAuth();
$pdo = Database::getConnection();
$userId = $currentUser['id'];

// 1. Calculate Current Week Hours (Monday to Sunday)
$mondayThisWeek = date('Y-m-d', strtotime('monday this week'));
$sundayThisWeek = date('Y-m-d', strtotime('sunday this week'));

$stmtWeek = $pdo->prepare("
    SELECT COALESCE(SUM(total_hours), 0) as total_hours,
           COALESCE(SUM(gross_pay), 0) as week_gross
    FROM shifts 
    WHERE user_id = ? AND shift_date BETWEEN ? AND ? AND status != 'cancelled'
");
$stmtWeek->execute([$userId, $mondayThisWeek, $sundayThisWeek]);
$weekData = $stmtWeek->fetch();
$currentWeekHours = (float)($weekData['total_hours'] ?? 0);
$currentWeekGross = (int)($weekData['week_gross'] ?? 0);

// Check if student is on official university vacation mode
$stmtUser = $pdo->prepare("SELECT is_vacation_mode, max_weekly_hours FROM users WHERE id = ?");
$stmtUser->execute([$userId]);
$userData = $stmtUser->fetch();
$isVacation = (bool)($userData['is_vacation_mode'] ?? 0);
$legalWeeklyLimit = $isVacation ? LEGAL_VACATION_HOUR_LIMIT : (float)($userData['max_weekly_hours'] ?? LEGAL_WEEKLY_HOUR_LIMIT);
$hoursRemaining = max(0, $legalWeeklyLimit - $currentWeekHours);
$percentUsed = min(100, round(($currentWeekHours / $legalWeeklyLimit) * 100));

// 2. Calculate Current Month Earnings & Shifts
$firstDayMonth = date('Y-m-01');
$lastDayMonth = date('Y-m-t');

$stmtMonth = $pdo->prepare("
    SELECT COUNT(id) as shift_count,
           COALESCE(SUM(total_hours), 0) as month_hours,
           COALESCE(SUM(gross_pay), 0) as month_gross,
           COALESCE(SUM(transport_cost), 0) as month_transit
    FROM shifts 
    WHERE user_id = ? AND shift_date BETWEEN ? AND ? AND status != 'cancelled'
");
$stmtMonth->execute([$userId, $firstDayMonth, $lastDayMonth]);
$monthData = $stmtMonth->fetch();
$monthGross = (int)($monthData['month_gross'] ?? 0);
$monthHours = (float)($monthData['month_hours'] ?? 0);
$monthShifts = (int)($monthData['shift_count'] ?? 0);

// 3. Calculate Current Month Expenses
$stmtExp = $pdo->prepare("
    SELECT COALESCE(SUM(amount), 0) as total_expenses 
    FROM expenses 
    WHERE user_id = ? AND expense_date BETWEEN ? AND ?
");
$stmtExp->execute([$userId, $firstDayMonth, $lastDayMonth]);
$monthExpenses = (int)($stmtExp->fetch()['total_expenses'] ?? 0);
$netBalance = $monthGross - $monthExpenses;

// 4. Calculate Average Hourly Rate across Active Jobs
$stmtJobs = $pdo->prepare("SELECT * FROM jobs WHERE user_id = ? AND is_active = 1");
$stmtJobs->execute([$userId]);
$activeJobs = $stmtJobs->fetchAll();

$avgHourlyWage = 0;
if (!empty($activeJobs)) {
    $totalWage = array_sum(array_column($activeJobs, 'hourly_wage'));
    $avgHourlyWage = round($totalWage / count($activeJobs));
}

// 5. Fetch Recent Shifts (with Job names and colors)
$stmtRecent = $pdo->prepare("
    SELECT s.*, j.company_name, j.color_hex, j.hourly_wage
    FROM shifts s
    JOIN jobs j ON s.job_id = j.id
    WHERE s.user_id = ?
    ORDER BY s.shift_date DESC, s.start_time DESC
    LIMIT 6
");
$stmtRecent->execute([$userId]);
$recentShifts = $stmtRecent->fetchAll();

// 6. Fetch Recent Expenses
$stmtRecentExp = $pdo->prepare("
    SELECT * FROM expenses 
    WHERE user_id = ? 
    ORDER BY expense_date DESC, id DESC 
    LIMIT 4
");
$stmtRecentExp->execute([$userId]);
$recentExpenses = $stmtRecentExp->fetchAll();

// 7. Calculate 7-Day Hours for Chart.js
$daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
$dailyHoursMap = [
    'Mon' => 0, 'Tue' => 0, 'Wed' => 0, 'Thu' => 0, 'Fri' => 0, 'Sat' => 0, 'Sun' => 0
];

$stmtDaily = $pdo->prepare("
    SELECT shift_date, SUM(total_hours) as day_hours
    FROM shifts
    WHERE user_id = ? AND shift_date BETWEEN ? AND ? AND status != 'cancelled'
    GROUP BY shift_date
");
$stmtDaily->execute([$userId, $mondayThisWeek, $sundayThisWeek]);
$dailyResults = $stmtDaily->fetchAll();

foreach ($dailyResults as $r) {
    $dayName = date('D', strtotime($r['shift_date']));
    if (isset($dailyHoursMap[$dayName])) {
        $dailyHoursMap[$dayName] = (float)$r['day_hours'];
    }
}

// Include Header
require_once __DIR__ . '/../includes/header.php';
?>

<!-- Page Header Row -->
<div class="page-header-row">
  <div class="page-title-group">
    <h1>Student Dashboard</h1>
    <p>Track your Japanese part-time jobs, weekly visa restrictions, and finances</p>
  </div>
  <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
    <button type="button" class="btn btn-secondary" data-toggle="modal" data-target="#quickExpenseModal">
      <i class="bi bi-receipt"></i> Log Expense
    </button>
    <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#quickShiftModal">
      <i class="bi bi-plus-circle-fill"></i> Record Shift
    </button>
  </div>
</div>

<!-- 28-Hour Immigration Legal Compliance Banner -->
<div class="legal-visa-banner">
  <div class="legal-banner-left">
    <div class="legal-banner-icon">
      <i class="bi bi-shield-check"></i>
    </div>
    <div>
      <div class="legal-banner-title">
        <?= $isVacation ? 'Long Vacation Mode (Max 40 hrs/week)' : 'Student Visa Work Restriction (Max 28 hrs/week)' ?>
      </div>
      <div class="legal-banner-desc">
        Under Article 19 of the Immigration Control Act, international students in Japan cannot exceed 
        <strong><?= $legalWeeklyLimit ?> hours/week</strong> across ALL jobs combined.
      </div>
    </div>
  </div>
  <div>
    <?php if ($currentWeekHours >= $legalWeeklyLimit): ?>
      <span class="badge" style="background-color: #ef4444; color:#fff; padding: 0.4rem 0.8rem; border-radius: var(--radius-sm); font-weight:700;">
        <i class="bi bi-exclamation-octagon-fill"></i> LIMIT REACHED
      </span>
    <?php elseif ($currentWeekHours >= ($legalWeeklyLimit - 4)): ?>
      <span class="badge" style="background-color: #f59e0b; color:#fff; padding: 0.4rem 0.8rem; border-radius: var(--radius-sm); font-weight:700;">
        <i class="bi bi-exclamation-triangle-fill"></i> <?= number_format($hoursRemaining, 1) ?>h LEFT
      </span>
    <?php else: ?>
      <span class="badge" style="background-color: #10b981; color:#fff; padding: 0.4rem 0.8rem; border-radius: var(--radius-sm); font-weight:700;">
        <i class="bi bi-check-circle-fill"></i> SAFE (<?= number_format($hoursRemaining, 1) ?>h LEFT)
      </span>
    <?php endif; ?>
  </div>
</div>

<!-- 4 Responsive Summary Cards (Desktop 4 cols, Tablet 2 cols, Mobile 1 col) -->
<div class="grid-cards-4">
  <!-- Card 1: Monthly Earnings -->
  <div class="summary-card">
    <div class="summary-card-header">
      <span class="summary-card-title">This Month's Gross</span>
      <div class="summary-card-icon green">
        <i class="bi bi-currency-yen"></i>
      </div>
    </div>
    <div class="summary-card-value"><?= formatJPY($monthGross) ?></div>
    <div class="summary-card-footer">
      <i class="bi bi-clock"></i>
      <span><?= number_format($monthHours, 1) ?> hours worked (<?= $monthShifts ?> shifts)</span>
    </div>
  </div>

  <!-- Card 2: Weekly Hours Tracker -->
  <div class="summary-card">
    <div class="summary-card-header">
      <span class="summary-card-title">Weekly Hours (28h Cap)</span>
      <div class="summary-card-icon blue">
        <i class="bi bi-hourglass-split"></i>
      </div>
    </div>
    <div class="summary-card-value <?= $currentWeekHours >= $legalWeeklyLimit ? 'coral' : '' ?>">
      <?= number_format($currentWeekHours, 1) ?> <span style="font-size: 1rem; color: var(--text-muted); font-weight: 500;">/ <?= $legalWeeklyLimit ?>h</span>
    </div>
    <div class="summary-card-footer">
      <i class="bi bi-shield-exclamation"></i>
      <span><?= number_format($hoursRemaining, 1) ?> hours available this week</span>
    </div>
  </div>

  <!-- Card 3: Net Monthly Savings -->
  <div class="summary-card">
    <div class="summary-card-header">
      <span class="summary-card-title">Net After Expenses</span>
      <div class="summary-card-icon <?= $netBalance >= 0 ? 'green' : 'coral' ?>">
        <i class="bi bi-piggy-bank"></i>
      </div>
    </div>
    <div class="summary-card-value <?= $netBalance >= 0 ? 'green' : 'coral' ?>">
      <?= formatJPY($netBalance) ?>
    </div>
    <div class="summary-card-footer">
      <i class="bi bi-cart"></i>
      <span>Expenses: <?= formatJPY($monthExpenses) ?> this month</span>
    </div>
  </div>

  <!-- Card 4: Average Hourly Wage -->
  <div class="summary-card">
    <div class="summary-card-header">
      <span class="summary-card-title">Avg. Hourly Rate</span>
      <div class="summary-card-icon amber">
        <i class="bi bi-cash-stack"></i>
      </div>
    </div>
    <div class="summary-card-value">
      <?= formatJPY($avgHourlyWage) ?><span style="font-size: 0.95rem; color: var(--text-muted); font-weight: 500;">/hr</span>
    </div>
    <div class="summary-card-footer">
      <i class="bi bi-geo-alt"></i>
      <span>Across <?= count($activeJobs) ?> active workplace(s)</span>
    </div>
  </div>
</div>

<!-- Main Analytical Grid (Charts & Jobs) -->
<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;" class="grid-desktop-2-1">
  <!-- Chart: Weekly Hours Breakdown -->
  <div class="content-card" style="margin-bottom: 0;">
    <div class="content-card-header">
      <h2 class="content-card-title">
        <i class="bi bi-bar-chart-fill" style="color: var(--primary-blue);"></i> Weekly Work Hours (Mon – Sun)
      </h2>
      <span style="font-size: 0.8rem; color: var(--text-muted);">Immigration Week Standard</span>
    </div>
    <div style="height: 240px; position: relative;">
      <canvas id="weeklyHoursChart"></canvas>
    </div>
  </div>

  <!-- Active Jobs Mini-List -->
  <div class="content-card" style="margin-bottom: 0;">
    <div class="content-card-header">
      <h2 class="content-card-title">
        <i class="bi bi-building" style="color: var(--accent-green-dark);"></i> Active Jobs (<?= count($activeJobs) ?>)
      </h2>
      <a href="<?= APP_URL ?>/pages/jobs.php" class="btn btn-sm btn-secondary">Manage</a>
    </div>

    <?php if (empty($activeJobs)): ?>
      <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
        <i class="bi bi-briefcase" style="font-size: 2rem; display: block; margin-bottom: 0.5rem; color: #cbd5e1;"></i>
        <p>No jobs added yet.</p>
        <a href="<?= APP_URL ?>/pages/jobs.php" class="btn btn-sm btn-primary" style="margin-top: 0.5rem;">Add Your First Baito</a>
      </div>
    <?php else: ?>
      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        <?php foreach ($activeJobs as $job): ?>
          <div style="background-color: var(--bg-surface-subtle); border-radius: var(--radius-md); padding: 0.85rem 1rem; border-left: 4px solid <?= htmlspecialchars($job['color_hex']) ?>;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <strong style="font-size: 0.95rem; color: var(--text-main); display: block;">
                  <?= htmlspecialchars($job['company_name']) ?>
                </strong>
                <span style="font-size: 0.775rem; color: var(--text-muted);">
                  <?= htmlspecialchars($job['job_title']) ?>
                </span>
              </div>
              <span style="font-weight: 700; color: var(--primary-blue); font-size: 0.9rem;">
                ¥<?= number_format($job['hourly_wage']) ?>/h
              </span>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</div>

<!-- Recent Shifts Section -->
<div class="content-card">
  <div class="content-card-header">
    <h2 class="content-card-title">
      <i class="bi bi-clock-history" style="color: var(--primary-blue);"></i> Recent Shifts
    </h2>
    <a href="<?= APP_URL ?>/pages/shifts.php" class="btn btn-sm btn-secondary">View All Shifts</a>
  </div>

  <?php if (empty($recentShifts)): ?>
    <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
      <i class="bi bi-calendar-x" style="font-size: 2.5rem; display: block; margin-bottom: 0.75rem; color: #cbd5e1;"></i>
      <p style="font-weight: 600;">No shifts recorded yet</p>
      <p style="font-size: 0.85rem; margin-top: 0.25rem;">Log your work hours to start tracking your 28-hour limit automatically.</p>
      <button type="button" class="btn btn-primary btn-sm" style="margin-top: 0.75rem;" data-toggle="modal" data-target="#quickShiftModal">
        <i class="bi bi-plus-lg"></i> Record Your First Shift
      </button>
    </div>
  <?php else: ?>
    <!-- Desktop Table View -->
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Workplace</th>
            <th>Time Range</th>
            <th>Hours</th>
            <th>Gross Pay</th>
            <th>Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($recentShifts as $shift): ?>
            <tr>
              <td>
                <strong><?= formatDateJST($shift['shift_date'], 'D, M j') ?></strong>
              </td>
              <td>
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: <?= htmlspecialchars($shift['color_hex']) ?>; margin-right: 0.4rem;"></span>
                <?= htmlspecialchars($shift['company_name']) ?>
              </td>
              <td>
                <?= substr($shift['start_time'], 0, 5) ?> - <?= substr($shift['end_time'], 0, 5) ?>
                <?php if ($shift['break_minutes'] > 0): ?>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">(<?= $shift['break_minutes'] ?>m break)</span>
                <?php endif; ?>
              </td>
              <td><strong><?= number_format($shift['total_hours'], 2) ?> hrs</strong></td>
              <td><strong style="color: var(--accent-green-dark);"><?= formatJPY($shift['gross_pay']) ?></strong></td>
              <td>
                <span class="status-pill <?= htmlspecialchars($shift['status']) ?>">
                  <?= ucfirst(htmlspecialchars($shift['status'])) ?>
                </span>
              </td>
              <td style="text-align: right;">
                <a href="<?= APP_URL ?>/pages/shifts.php" class="btn btn-sm btn-secondary" title="View details">
                  <i class="bi bi-eye"></i>
                </a>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View (Table transformed to cards on mobile) -->
    <div class="mobile-card-list">
      <?php foreach ($recentShifts as $shift): ?>
        <div class="mobile-data-card" style="border-left: 4px solid <?= htmlspecialchars($shift['color_hex']) ?>;">
          <div class="mobile-data-card-header">
            <strong><?= htmlspecialchars($shift['company_name']) ?></strong>
            <span class="status-pill <?= htmlspecialchars($shift['status']) ?>">
              <?= ucfirst(htmlspecialchars($shift['status'])) ?>
            </span>
          </div>
          <div class="mobile-data-row">
            <span>Date</span>
            <strong><?= formatDateJST($shift['shift_date'], 'D, M j, Y') ?></strong>
          </div>
          <div class="mobile-data-row">
            <span>Hours</span>
            <strong><?= number_format($shift['total_hours'], 2) ?>h (<?= substr($shift['start_time'], 0, 5) ?>–<?= substr($shift['end_time'], 0, 5) ?>)</strong>
          </div>
          <div class="mobile-data-row">
            <span>Gross Pay</span>
            <strong style="color: var(--accent-green-dark);"><?= formatJPY($shift['gross_pay']) ?></strong>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</div>

<!-- Modal: Quick Add Expense -->
<div id="quickExpenseModal" class="modal-backdrop">
  <div class="modal-dialog">
    <div class="modal-header">
      <h3 class="modal-title"><i class="bi bi-receipt" style="color: var(--accent-coral);"></i> Log Living Expense</h3>
      <button type="button" class="modal-close-btn" data-dismiss="modal">&times;</button>
    </div>
    <form action="<?= APP_URL ?>/pages/expenses.php" method="POST">
      <input type="hidden" name="action" value="quick_add">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Expense Category</label>
          <select name="category" class="form-control" required>
            <option value="Commute / Suica">Commute / Suica Pass (交通費)</option>
            <option value="Meals & Groceries">Meals & Groceries (食費)</option>
            <option value="Study / JLPT Prep">Textbooks / JLPT Exam (学業)</option>
            <option value="Mobile / Internet">Mobile SIM / Wifi (通信費)</option>
            <option value="Housing / Utilities">Rent / Utilities (家賃・光熱費)</option>
            <option value="Other">Other Expenses</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Amount (JPY ¥)</label>
          <input type="number" name="amount" class="form-control" placeholder="e.g. 2400" min="1" required>
        </div>

        <div class="form-group">
          <label class="form-label">Date</label>
          <input type="date" name="expense_date" class="form-control" value="<?= date('Y-m-d') ?>" required>
        </div>

        <div class="form-group">
          <label class="form-label">Description (Optional)</label>
          <input type="text" name="description" class="form-control" placeholder="e.g. Tokyo Metro commuter pass renewal">
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-danger"><i class="bi bi-check-lg"></i> Record Expense</button>
      </div>
    </form>
  </div>
</div>

<!-- Chart.js Weekly Breakdown Initialization -->
<script>
document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('weeklyHoursChart');
  if (!ctx) return;

  const labels = <?= json_encode($daysOfWeek) ?>;
  const hoursData = <?= json_encode(array_values($dailyHoursMap)) ?>;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Hours Worked',
        data: hoursData,
        backgroundColor: '#2563eb',
        borderRadius: 6,
        barThickness: 24
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.parsed.y} hours`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 8,
          grid: { color: '#f1f5f9' },
          ticks: {
            stepSize: 2,
            callback: function(value) { return value + 'h'; }
          }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
});
</script>

<style>
@media (max-width: 900px) {
  .grid-desktop-2-1 {
    grid-template-columns: 1fr !important;
  }
}
</style>

<?php
// Include Footer
require_once __DIR__ . '/../includes/footer.php';
?>
