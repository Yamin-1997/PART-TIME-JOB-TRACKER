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
```

---

## 🇯🇵 Why BaitoMate is Critical for Students in Japan

Under **Article 19 of the Immigration Control and Refugee Recognition Act** (出入国管理及び難民認定法):
- Foreign nationals residing under **"Student" (留学)** status who obtain the *Permission to Engage in Activity other than that Permitted under the Status of Residence Previously Granted* (資格外活動許可) are legally restricted to a maximum of **28 hours per week** of part-time work across **all employers combined**.
- During official long vacation periods defined by the university/school (Summer/Spring breaks), the limit increases to **40 hours per week** (max 8 hours/day).
- Exceeding this limit jeopardizes visa renewals and can lead to deportation. **BaitoMate actively calculates multi-job hours from Monday to Sunday and fires real-time color-coded warnings before students breach the legal ceiling.**

---

## 🚀 Local Setup Instructions (XAMPP for Windows / macOS / Linux)

1. **Copy Files to XAMPP**:
   - Copy or clone the `baitomate` folder into your XAMPP web root directory:
     - **Windows**: `C:/xampp/htdocs/baitomate/`
     - **macOS**: `/Applications/XAMPP/xamppfiles/htdocs/baitomate/`
     - **Linux**: `/opt/lampp/htdocs/baitomate/`

2. **Start Apache & MySQL**:
   - Open the **XAMPP Control Panel**.
   - Start both **Apache** and **MySQL**.

3. **Import the Database**:
   - Open your browser and navigate to `http://localhost/phpmyadmin/`.
   - Click on the **Import** tab (or create a database named `baitomate_db`).
   - Choose the file `database/schema.sql` located inside the project and click **Import**.
   - *Note*: If MySQL is not running or not yet imported, BaitoMate will automatically fall back to the built-in SQLite database so you can test immediately without any configuration errors!

4. **Launch Application**:
   - Open your browser and visit: `http://localhost/baitomate/`
   - Sign in using the pre-seeded demo international student credentials:
     - **Email**: `student@baitomate.jp`
     - **Password**: `student123`
     - *(Or click the "Auto-Fill Demo Credentials" button on the login screen)*

---

## ☁️ Deploying to Cloudflare (Pages & .cloudflare.com)

BaitoMate is 100% pre-configured for deployment on **Cloudflare Pages** and custom domains managed through Cloudflare.

### Included Cloudflare Configuration Files:
- `public/_redirects`: Provides automatic SPA fallback routing (`/* /index.html 200`) so URL navigation and page reloads work smoothly without 404 errors.
- `public/_headers`: Pre-configures edge security headers and long-term caching for static assets.
- `wrangler.toml` & `wrangler.jsonc`: Cloudflare Pages configuration pointing to `pages_build_output_dir = "dist"`.

### Option 1: Cloudflare Pages Git Integration (Recommended)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your repository.
3. Set the build configuration:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**. Cloudflare will compile and deploy the site across its global CDN.
5. Under **Custom domains**, link your custom domain (e.g., `baitomate.yourdomain.com`).

### Option 2: Cloudflare CLI (Wrangler)
```bash
# Install dependencies & build
npm install
npm run build

# Deploy directly to Cloudflare Pages
npx wrangler pages deploy dist
```
