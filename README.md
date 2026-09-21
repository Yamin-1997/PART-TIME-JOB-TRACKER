# BaitoMate (バイトメイト)
### Part-time Job & Shift Tracker for International Students in Japan

BaitoMate is a full-stack web application purpose-built for international students working part-time (*arubaito* / バイト) in Japan. It helps students track working hours across multiple jobs, strictly comply with the Japanese Immigration 28-hour/week legal restriction, calculate monthly salaries and transit allowances, and balance living expenses.

---

## 📁 Complete Project Structure & Purpose of Each Folder

```text
baitomate/
├── assets/                  # Public static assets
│   ├── css/
│   │   └── style.css        # Responsive CSS: dark navy sidebar, cards, modals, mobile bottom nav
│   ├── js/
│   │   └── main.js          # Vanilla JavaScript for drawer menus, modals, toasts, wage calculations
│   └── images/              # Logos, workplace icons, and graphic assets
│
├── config/                  # Global application configuration
│   ├── config.php           # App constants, base URL detection, JST timezone, JPY currency formatting
│   └── database.php         # PDO database singleton (MySQL default with automatic SQLite fallback)
│
├── database/                # Database schemas and data migrations
│   ├── schema.sql           # Complete MySQL schema for XAMPP / phpMyAdmin import
│   └── baitomate.sqlite     # Portable SQLite database for instant zero-config testing
│
├── includes/                # Reusable PHP modular layout components
│   ├── header.php           # Top HTML head, CDNs (Bootstrap Icons, Chart.js, FullCalendar), sticky header
│   ├── sidebar.php          # Dark navy desktop/tablet sidebar with 10 pages and 28h visa meter
│   ├── mobile-nav.php       # Mobile bottom navigation bar and Quick Shift Floating Action Button (+)
│   └── footer.php           # Global modals (Quick Shift, Confirm Dialog), toasts, and closing HTML tags
│
├── auth/                    # Student authentication and access control
│   ├── login.php            # Secure login screen with 1-click Demo Student Credentials filler
│   ├── register.php         # Registration with Japanese school name, visa type, and target wage
│   └── logout.php           # Session destruction and redirection
│
├── pages/                   # Main application screens (10 Sidebar Pages)
│   ├── dashboard.php        # Real-time dashboard with 28h limit alerts, earnings, charts & shifts
│   ├── jobs.php             # Employer management (wages, transport allowances, uniforms, contacts)
│   ├── shifts.php           # Complete shift records with start/end time and break calculations
│   ├── salary.php           # Monthly gross pay, transit reimbursements, and pay-slip breakdowns
│   ├── expenses.php         # Student living expenses (Suica commute, groceries, JLPT books)
│   ├── calendar.php         # FullCalendar UI with shift color-coding and shift scheduling
│   ├── notes.php            # Useful workplace Japanese phrases, shift swap records, tax tips
│   ├── reports.php          # Analytical reports and monthly/annual exportable summaries
│   └── settings.php         # Student profile, visa status, vacation mode toggle (40h cap)
│
├── api/                     # REST API endpoints for asynchronous interactions
│   └── calendar-events.php  # JSON feed for FullCalendar & optional Google Calendar sync
│
├── index.php                # Front controller: routes to dashboard or login
├── router.php               # PHP CLI router for local preview and testing
└── README.md                # Documentation, setup guide, and legal compliance info
