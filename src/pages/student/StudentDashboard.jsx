import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Briefcase, Building2, CheckCircle, Clock, TrendingUp, Calendar, ArrowRight, ChevronRight, Star } from "lucide-react";
import { useJobs } from "../../context/JobContext";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const { jobs } = useJobs();
  const { user } = useAuth();
  const userEmail = user?.email || "student@example.com";

  const appliedJobs = jobs.filter(job => job.applicants?.includes(userEmail));
  const savedJobs = jobs.filter(job => job.savedBy?.includes(userEmail));

  const stats = [
    { title: "Active Applications", value: appliedJobs.length.toString(), icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { title: "Interviews Scheduled", value: "0", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "Saved Jobs", value: savedJobs.length.toString(), icon: Star, color: "text-indigo-500", bg: "bg-indigo-50", link: "/student/saved-jobs" },
    { title: "Companies Visited", value: "0", icon: Building2, color: "text-blue-500", bg: "bg-blue-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, Alice! Here's an overview of your placement journey.</p>
        </div>
        <Link to="/student/jobs" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 gap-2">
          <Briefcase className="w-4 h-4" />
          Browse New Jobs
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const CardInner = (
            <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer h-full">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 opacity-50 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{stat.value}</p>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
          
          return stat.link ? (
             <Link key={stat.title} to={stat.link}>{CardInner}</Link>
          ) : (
             <div key={stat.title}>{CardInner}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-8">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  Recent Applications
                </CardTitle>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
                  View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-100">
                {appliedJobs.length === 0 ? (
                   <li className="p-8 text-center">
                     <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                       <Briefcase className="w-6 h-6 text-gray-300" />
                     </div>
                     <p className="text-gray-500 font-medium">You haven't applied to any roles yet.</p>
                     <Link to="/student/jobs" className="text-indigo-600 text-sm hover:underline mt-1 inline-block">Explore open roles</Link>
                   </li>
                ) : appliedJobs.slice(0, 3).map((job, idx) => {
                  const appStatuses = JSON.parse(localStorage.getItem('student_application_statuses') || '{}');
                  const currentStatus = appStatuses[`${job.role}_${userEmail}`] || (job.selected?.includes(userEmail) ? "Offered" : "Applied");
                  
                  let statusColor = "bg-indigo-50 text-indigo-700";
                  let statusText = "Under Review";
                  if (currentStatus === "Offered" || currentStatus === "Selected") {
                    statusColor = "bg-emerald-100 text-emerald-800";
                    statusText = "Offered";
                  } else if (currentStatus === "Interviewing") {
                    statusColor = "bg-amber-100 text-amber-800";
                    statusText = "Interviewing";
                  } else if (currentStatus === "Shortlisted") {
                    statusColor = "bg-blue-100 text-blue-800";
                    statusText = "Shortlisted";
                  }

                  return (
                  <li key={job.id || idx} className="p-5 sm:px-6 hover:bg-gray-50 transition-colors group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden bg-white shadow-sm group-hover:shadow-md transition-shadow shrink-0">
                           {(job.companyLogo && (job.companyLogo.startsWith("blob:") || job.companyLogo.startsWith("data:") || job.companyLogo.startsWith("http"))) ? (
                               <img src={job.companyLogo} alt="logo" className="w-full h-full object-cover"/>
                           ) : (
                               <img src={`https://ui-avatars.com/api/?name=${job.company}&background=random&color=fff`} alt="logo" className="w-full h-full object-contain"/>
                           )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{job.role}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                            <Building2 className="w-3.5 h-3.5" />
                            {job.company}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor}`}>
                          {statusText}
                        </span>
                        <p className="text-xs text-gray-400 font-medium">Applied recently</p>
                      </div>
                    </div>
                  </li>
                )})}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Announcements */}
        <div className="space-y-8">
          <Card className="border-gray-100 shadow-sm overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
            <CardHeader className="border-b border-gray-100 bg-white">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-5">
                 {[].map((ann, idx) => {
                   const Icon = ann.icon;
                   return (
                     <div key={idx} className="flex gap-4 group cursor-pointer">
                       <div className="flex-shrink-0 mt-1">
                         <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                           <Icon className="w-4 h-4" />
                         </div>
                       </div>
                       <div>
                         <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{ann.title}</p>
                         <div className="flex items-center gap-2 mt-1">
                           <span className="text-xs font-medium text-gray-500">{ann.date}</span>
                           <span className="w-1 h-1 rounded-full bg-gray-300" />
                           <span className="text-xs font-medium text-indigo-600">{ann.type}</span>
                         </div>
                       </div>
                     </div>
                   );
                 })}
              </div>
              <button className="mt-6 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5 group">
                View Calendar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
