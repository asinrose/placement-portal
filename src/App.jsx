import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { JobProvider } from "./context/JobContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import JobBoard from "./pages/student/JobBoard";
import StudentApplications from "./pages/student/StudentApplications";
import StudentSavedJobs from "./pages/student/StudentSavedJobs";
import Notifications from "./pages/student/Notifications";
import TpoDashboard from "./pages/tpo/TpoDashboard";
import JobApprovals from "./pages/tpo/JobApprovals";
import StudentManagement from "./pages/tpo/StudentManagement";
import CompanyManagement from "./pages/tpo/CompanyManagement";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import PostJob from "./pages/recruiter/PostJob";
import ManageApplicants from "./pages/recruiter/ManageApplicants";
import AlumniDashboard from "./pages/alumni/AlumniDashboard";
import JobReferrals from "./pages/alumni/JobReferrals";
import MockInterviews from "./pages/alumni/MockInterviews";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AdminStudentManagement from "./pages/admin/AdminStudentManagement";
import ManageJobs from "./components/shared/ManageJobs";

// Dummy dashboard pages to verify the layout works
const DummyDashboard = ({ title }) => (
  <div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <p className="text-gray-600">This module is under construction.</p>
    </div>
  </div>
);

// Sidebar Navigation Maps
import { LayoutDashboard, Users, Briefcase, FileText, Settings, MessageSquare, Video, Shield, GraduationCap } from "lucide-react";

export const ADMIN_NAV = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Student Accounts", href: "/admin/students", icon: GraduationCap },
  { name: "System Settings", href: "/admin/settings", icon: Settings },
];

export const ALUMNI_NAV = [
  { name: "Dashboard", href: "/alumni/dashboard", icon: LayoutDashboard },
  { name: "Post Job", href: "/alumni/post-job", icon: Briefcase },
  { name: "My Jobs", href: "/alumni/my-jobs", icon: FileText },
  { name: "Manage Applicants", href: "/alumni/applicants", icon: Users },
  { name: "Interviews", href: "/alumni/interviews", icon: Video },
  { name: "Referrals", href: "/alumni/referrals", icon: Briefcase },
  { name: "Community", href: "/alumni/community", icon: MessageSquare },
];

export const STUDENT_NAV = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/student/profile", icon: Users },
  { name: "Job Board", href: "/student/jobs", icon: Briefcase },
  { name: "Applications", href: "/student/applications", icon: FileText },
];

export const RECRUITER_NAV = [
  { name: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard },
  { name: "Post Job", href: "/recruiter/post-job", icon: Briefcase },
  { name: "My Jobs", href: "/recruiter/my-jobs", icon: FileText },
  { name: "Manage Applicants", href: "/recruiter/applicants", icon: Users },
];

export const TPO_NAV = [
  { name: "Dashboard", href: "/tpo/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/tpo/students", icon: Users },
  { name: "Companies", href: "/tpo/companies", icon: Briefcase },
  { name: "Job Approvals", href: "/tpo/jobs", icon: FileText },
  { name: "Settings", href: "/tpo/settings", icon: Settings },
];

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <JobProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
              <Route element={<DashboardLayout navigationItems={STUDENT_NAV} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student/jobs" element={<JobBoard />} />
                <Route path="/student/applications" element={<StudentApplications />} />
                <Route path="/student/saved-jobs" element={<StudentSavedJobs />} />
                <Route path="/student/notifications" element={<Notifications />} />
              </Route>
            </Route>

            {/* Recruiter Routes */}
            <Route element={<ProtectedRoute allowedRoles={["RECRUITER"]} />}>
              <Route element={<DashboardLayout navigationItems={RECRUITER_NAV} />}>
                <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                <Route path="/recruiter/post-job" element={<PostJob />} />
                <Route path="/recruiter/my-jobs" element={<ManageJobs rolePrefix="recruiter" />} />
                <Route path="/recruiter/edit-job/:jobId" element={<PostJob />} />
                <Route path="/recruiter/applicants" element={<ManageApplicants />} />
              </Route>
            </Route>

            {/* TPO Routes */}
            <Route element={<ProtectedRoute allowedRoles={["PLACEMENT_OFFICER"]} />}>
              <Route element={<DashboardLayout navigationItems={TPO_NAV} />}>
                <Route path="/tpo/dashboard" element={<TpoDashboard />} />
                <Route path="/tpo/students" element={<StudentManagement />} />
                <Route path="/tpo/companies" element={<CompanyManagement />} />
                <Route path="/tpo/jobs" element={<JobApprovals />} />
                <Route path="/tpo/settings" element={<DummyDashboard title="System Settings" />} />
              </Route>
            </Route>

            {/* Alumni Routes */}
            <Route element={<ProtectedRoute allowedRoles={["ALUMNI"]} />}>
              <Route element={<DashboardLayout navigationItems={ALUMNI_NAV} />}>
                <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
                <Route path="/alumni/post-job" element={<PostJob />} />
                <Route path="/alumni/my-jobs" element={<ManageJobs rolePrefix="alumni" />} />
                <Route path="/alumni/edit-job/:jobId" element={<PostJob />} />
                <Route path="/alumni/applicants" element={<ManageApplicants />} />
                <Route path="/alumni/interviews" element={<MockInterviews />} />
                <Route path="/alumni/referrals" element={<JobReferrals />} />
                <Route path="/alumni/community" element={<DummyDashboard title="Community & Forum" />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route element={<DashboardLayout navigationItems={ADMIN_NAV} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/students" element={<AdminStudentManagement />} />
                <Route path="/admin/settings" element={<DummyDashboard title="System Settings" />} />
              </Route>
            </Route>

            {/* Fallback Unauthorized Route */}
            <Route path="/unauthorized" element={
              <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-4">
                <h1 className="text-4xl font-bold text-gray-900">403</h1>
                <p className="text-gray-600">You do not have permission to view this page.</p>
                <a href="/" className="text-indigo-600 hover:text-indigo-800 underline">Return to safety</a>
              </div>
            } />

            {/* Catch all 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </JobProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
