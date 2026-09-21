    </main> <!-- End .page-container -->
  </div> <!-- End .app-main -->
</div> <!-- End .app-wrapper -->

<!-- Mobile Bottom Navigation Bar Included -->
<?php require_once __DIR__ . '/mobile-nav.php'; ?>

<!-- Toast Notification Container -->
<div id="toastContainer" class="toast-container"></div>

<!-- Universal Confirmation Dialog Modal -->
<div id="confirmationModal" class="modal-backdrop">
  <div class="modal-dialog">
    <div class="modal-header">
      <h3 class="modal-title">Confirm Action</h3>
      <button type="button" class="modal-close-btn" data-dismiss="modal">&times;</button>
    </div>
    <div class="modal-body">
      <p style="color: var(--text-muted);">Are you sure you want to proceed with this operation?</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
      <button type="button" id="confirmActionBtn" class="btn btn-danger">Confirm</button>
    </div>
  </div>
</div>

<!-- Quick Add Shift Modal (Reusable everywhere) -->
<div id="quickShiftModal" class="modal-backdrop">
  <div class="modal-dialog">
    <div class="modal-header">
      <h3 class="modal-title"><i class="bi bi-clock-plus" style="color: var(--primary-blue);"></i> Quick Record Shift</h3>
      <button type="button" class="modal-close-btn" data-dismiss="modal">&times;</button>
    </div>
    <form action="<?= APP_URL ?>/pages/shifts.php" method="POST">
      <input type="hidden" name="action" value="quick_add">
      <div class="modal-body">
        <?php
        // Fetch active jobs for dropdown
        $jobStmt = $pdo->prepare("SELECT id, company_name, hourly_wage FROM jobs WHERE user_id = ? AND is_active = 1");
        $jobStmt->execute([$currentUser['id']]);
        $userJobs = $jobStmt->fetchAll();
        ?>
        <div class="form-group">
          <label class="form-label">Select Employer (Baito)</label>
          <select name="job_id" id="modalJobSelect" class="form-control" required>
            <?php if (empty($userJobs)): ?>
              <option value="">No jobs added yet. Add a job first.</option>
            <?php else: ?>
              <?php foreach ($userJobs as $j): ?>
                <option value="<?= $j['id'] ?>" data-wage="<?= $j['hourly_wage'] ?>">
                  <?= htmlspecialchars($j['company_name']) ?> (¥<?= number_format($j['hourly_wage']) ?>/hr)
                </option>
              <?php endforeach; ?>
            <?php endif; ?>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Shift Date</label>
          <input type="date" name="shift_date" class="form-control" value="<?= date('Y-m-d') ?>" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
          <div class="form-group">
            <label class="form-label">Start Time</label>
            <input type="time" name="start_time" id="modalStartTime" class="form-control" value="09:00" required>
          </div>
          <div class="form-group">
            <label class="form-label">End Time</label>
            <input type="time" name="end_time" id="modalEndTime" class="form-control" value="15:00" required>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
          <div class="form-group">
            <label class="form-label">Break (Minutes)</label>
            <input type="number" name="break_minutes" id="modalBreakMinutes" class="form-control" value="30" min="0" step="5">
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select name="status" class="form-control">
              <option value="completed">Completed</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Transit Cost (Suica / Train JPY)</label>
          <input type="number" name="transport_cost" class="form-control" value="0" min="0" placeholder="e.g. 520">
        </div>

        <div class="alert alert-info" style="margin-bottom: 0; padding: 0.75rem 1rem;">
          <i class="bi bi-info-circle"></i>
          <div>All hours count towards your <strong>28 hours/week student visa cap</strong>.</div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg"></i> Save Shift</button>
      </div>
    </form>
  </div>
</div>

<!-- Master Client JavaScript -->
<script src="<?= APP_URL ?>/assets/js/main.js"></script>

</body>
</html>
