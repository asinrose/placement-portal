# 🎓 Nexus Placement Portal — Enterprise Campus Recruitment & Career Ecosystem

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A modern, full-lifecycle enterprise campus recruitment and career management platform connecting **Students**, **Corporate Recruiters**, **Alumni**, **Training & Placement Officers (TPO)**, and **Administrators** into a unified, reactive web ecosystem.

---

## 🌐 Live Demo & Repository
- **Live Application**: [https://placement-portal-asinrose.vercel.app](https://placement-portal-asinrose.vercel.app)
- **Source Code**: [https://github.com/asinrose/placement-portal](https://github.com/asinrose/placement-portal)

---

## 💡 Overview & Problem Statement
Traditional university recruitment drives are plagued by fragmented communication, manual Excel tracking, disjointed Google Forms, and delayed eligibility screening. 

**Nexus Placement Portal** solves this by centralizing the complete hiring journey:
`Job Posting` ➔ `Automated 4-Factor Eligibility Verification` ➔ `Candidate Screening` ➔ `Competency Scorecards` ➔ `Google Calendar Interview Scheduling` ➔ `Official Offer Letter Generation` ➔ `Digital Signature Acceptance` ➔ `Institutional Placement Analytics`.

---

## 👥 Multi-Role Architecture (5 Distinct Portals)

### 1. 👨‍🎓 Student Portal
- **Automated Eligibility Engine**: Real-time evaluation against company cutoffs across **CGPA**, **Degree/Course**, **Branch/Department**, and **Standing Backlogs**. Dynamic shortfall banners explain criteria non-fulfillment.
- **Application Tracking**: End-to-end tracking (`Applied`, `Under Review`, `Shortlisted`, `Interviewing`, `Offered`, `Accepted`).
- **Interactive Offer Letter Acceptance**: Receive official branded offer letters with compensation breakdown, deadline timers, and legally formatted digital signature acceptance/rejection.
- **Profile Management**: Live profile editing with instant synchronization back to active job eligibility states.
- **Peer Community**: Discussion boards with tag filtering and community interaction.

### 2. 💼 Corporate Recruiter Portal
- **Hiring Pipeline**: Multi-tab candidate pipeline to manage applicants, review resume snapshots, and move candidates across stages.
- **Structured Interview Scorecards**: Score candidates across standardized competencies (Technical Knowledge, Problem Solving, Communication, Cultural Fit) with qualitative feedback and hiring recommendations (`Strong Hire`, `Hire`, `Hold`, `Reject`).
- **Interview Scheduling**: Schedule virtual or on-site rounds with instant **Google Calendar invite link** generation.
- **Branded Offer Generator**: Issue official digital offer letters with role titles, CTC/stipends, joining dates, conditions, and acceptance deadlines.

### 3. 🤝 Alumni Mentorship & Referral Network
- **Exclusive Job Referrals**: Alumni post direct referral openings from their current employers for verified students.
- **Mock Interview Scheduling**: 1-on-1 interview practice sessions hosted by alumni to coach juniors.
- **Community Mentorship**: Direct Q&A forum connecting graduating students with experienced industry professionals.

### 4. 📊 Training & Placement Officer (TPO) Dashboard
- **Institutional Analytics**: Real-time tracking of overall placement rates, average/highest CTC, active hiring drives, and partnered corporate headcount.
- **Branch-Wise Progress**: Live progress bars tracking placement saturation per academic department.
- **Corporate Partner Directory**: Dynamic tracking of total hires per company synced directly with accepted student offers.
- **Accreditation Export**: Single-click export of placement audit data to **CSV** and formatted **Printable Accreditation Reports**.

### 5. 🛡️ Platform Administration
- **Live Recruitment Oversight**: Real-time view across all active corporate job requisitions, total applicant counts, and accepted offers.
- **User Management & RBAC**: Manage student records, recruiter approvals, account suspensions, and credential controls.
- **System Settings**: Platform-wide configuration, audit logs, and maintenance toggles.

---

## ⚡ Technical Highlights & Engineering Decisions

```
┌────────────────────────────────────────────────────────┐
│                   Vite + React 19 SPA                  │
└───────────────────────────┬────────────────────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐     ┌──────────────┐
│  Auth & RBAC │    │ 4-Dimension  │     │Event-Driven  │
│  Context API │    │ Eligibility  │     │  Sync Engine │
└──────────────┘    └──────────────┘     └──────────────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            ▼
      ┌───────────────────────────────────────────┐
      │  Dynamic Cross-Role Reactive Sync Bus     │
      │  (offers_updated, profile_updated, etc.)  │
      └─────────────────────┬─────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Local Storage Enterprise Simulation & Web Storage API  │
└────────────────────────────────────────────────────────┘
```

- **Event-Driven Client Sync**: Uses a custom reactive event bus (`window.dispatchEvent` + `CustomEvent`) ensuring updates in one view (e.g. Student accepting an offer) immediately propagate to TPO analytics and Recruiter dashboards without page reloads.
- **Four-Factor Dynamic Eligibility Engine**: Evaluates applicant attributes against strict corporate parameters in $O(1)$ client-side evaluation with defensive fallbacks.
- **Defensive UI & Modal Stacking**: Structured z-index layering (`z-50`, `z-[60]`, `z-[70]`) ensuring zero modal conflicts when previewing offers and scorecards simultaneously.
- **Production-Optimized Build**: Built with Vite 8 + Tailwind CSS 4, achieving sub-1.2s production build times and clean chunk minification.

---

## 🔑 Demo Access Accounts

You can test any role immediately from the login page:

| Role | Email / Identifier | Password |
| :--- | :--- | :--- |
| **Student** | `24411@university.edu` *(or ID: `24411`)* | *(Any password / remember me)* |
| **Recruiter** | `marcus.vance@datametrics.com` | *(Any password)* |
| **TPO Officer** | `tpo@demo.com` | `mypassword123` *(or `demo123`)* |
| **Administrator** | `admin@demo.com` | `demo123` |
| **Alumni** | Use the **Sign Up** tab to create an Alumni account | `demo123` |

---

## 🛠 Tech Stack

- **Frontend Core**: [React 19](https://react.dev/), [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF & Export Engine**: [jsPDF](https://github.com/parallax/jsPDF), [html2canvas](https://html2canvas.hertzen.com/)
- **Hosting & CI/CD**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/asinrose/placement-portal.git

# Navigate into the project directory
cd placement-portal

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### Building for Production
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` folder.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author
**Asin Rose**  
- GitHub: [@asinrose](https://github.com/asinrose)  
- LinkedIn: [Connect on LinkedIn](https://linkedin.com)
