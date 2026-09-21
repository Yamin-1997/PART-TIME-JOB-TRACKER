/**
 * BaitoMate - Main Client-side Interactions
 * Vanilla JavaScript (No heavy frameworks)
 * Handles drawer menus, modals, toasts, and dynamic calculations
 */

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initModals();
  initToasts();
});

/**
 * Mobile Sidebar Drawer & Overlay Handlers
 */
function initSidebar() {
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (toggleBtn && sidebar && overlay) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }
}

/**
 * Global Modal System
 */
function initModals() {
  // Close buttons inside modals
  document.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-backdrop');
      if (modal) {
        modal.classList.remove('show');
      }
    });
  });

  // Close when clicking outside dialog
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  });

  // Modal open triggers
  document.querySelectorAll('[data-toggle="modal"]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute('data-target');
      if (targetId) {
        openModal(targetId);
      }
    });
  });
}

function openModal(modalId) {
  const cleanId = modalId.replace('#', '');
  const modal = document.getElementById(cleanId);
  if (modal) {
    modal.classList.add('show');
  }
}

function closeModal(modalId) {
  const cleanId = modalId.replace('#', '');
  const modal = document.getElementById(cleanId);
  if (modal) {
    modal.classList.remove('show');
  }
}

/**
 * Toast Notification System
 */
function initToasts() {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';

  let iconClass = 'bi-info-circle-fill text-primary';
  if (type === 'success') iconClass = 'bi-check-circle-fill text-success';
  if (type === 'danger' || type === 'error') iconClass = 'bi-exclamation-triangle-fill text-danger';
  if (type === 'warning') iconClass = 'bi-exclamation-circle-fill text-warning';

  toast.innerHTML = `
    <i class="bi ${iconClass}"></i>
    <div style="flex:1;">${message}</div>
    <button type="button" style="background:none;border:none;color:#94a3b8;cursor:pointer;" onclick="this.parentElement.remove()">
      <i class="bi bi-x"></i>
    </button>
  `;

  container.appendChild(toast);

  // Auto dismiss after 4.5 seconds
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}
