import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { 
  Briefcase, Building2, CheckCircle, Clock, TrendingUp, Calendar, ArrowRight, 
  ChevronRight, Star, Video, ExternalLink, Sparkles, Award 
} from "lucide-react";
import { useJobs } from "../../context/JobContext";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "../../components/Button";

export default function StudentDashboard() {
  const { jobs } = useJobs();
  const { user } = useAuth();
  const userEmail = user?.email || "";

  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [studentOffers, setStudentOffers] = useState([]);

  const loadData = () => {
    try {
      const storedInts = JSON.parse(localStorage.getItem('scheduled_job_interviews') || '[]');
      setScheduledInterviews(storedInts);
    } catch {
      setScheduledInterviews([]);
    }

    try {
      const storedOffers = JSON.parse(localStorage.getItem('student_job_offers') || '[]');
      setStudentOffers(storedOffers);
    } catch {
      setStudentOffers([]);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('interviews_updated', loadData);
    window.addEventListener('offers_updated', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('interviews_updated', loadData);
      window.removeEventListener('offers_updated', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const appliedJobs = jobs.filter(job => job.applicants?.includes(userEmail));
  const savedJobs = jobs.filter(job => job.savedBy?.includes(userEmail));
  const myInterviews = scheduledInterviews.filter(i => i.applicantEmail === userEmail);
  const myOffers = studentOffers.filter(o => o.applicantEmail === userEmail);
  const pendingOffers = myOffers.filter(o => o.status === "Pending");

  // Unique companies visited
  const companiesCount = new Set(appliedJobs.map(j => j.company)).size;

  const stats = [
    { title: "Active Applications", value: appliedJobs.length.toString(), icon: Clock, color: "text-amber-500", bg: "bg-amber-50", link: "/student/applications" },
    { title: "Interviews Scheduled", value: myInterviews.length.toString(), icon: Video, color: "text-indigo-600", bg: "bg-indigo-50", link: "/student/applications" },
    { title: "Offers Received", value: myOffers.length.toString(), icon: Award, color: "text-emerald-600", bg: "bg-emerald-50", link: "/student/applications", highlight: myOffers.length > 0 },
    { title: "Saved Roles", value: savedJobs.length.toString(), icon: Star, color: "text-purple-500", bg: "bg-purple-50", link: "/student/saved-jobs" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name || "Student"}! Here's an overview of your placement journey.</p>
        </div>
        <Link to="/student/jobs" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 gap-2">
          <Briefcase className="w-4 h-4" />
          Browse New Jobs
        </Link>
      </div>

      {/* Prominent Offer Notification Banner if Pending Offers Exist */}
      {pendingOffers.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden animate-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 font-bold shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded text-white">
                  Action Required
                </span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">
                  You have {pendingOffers.length} official job offer{pendingOffers.length > 1 ? "s" : ""} waiting for your response!
                </h3>
                <p className="text-emerald-100 text-xs">
                  Review the formal compensation structure, benefits, and accept digitally.
                </p>
              </div>
            </div>
            <Link 
              to="/student/applications"
              className="bg-white hover:bg-emerald-50 text-emerald-800 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-colors shrink-0"
            >
              Review Offers &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const CardInner = (
            <div className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border transition-all cursor-pointer h-full ${
              stat.highlight ? "border-emerald-200 ring-2 ring-emerald-500/20" : "border-gray-100 hover:shadow-md hover:border-indigo-100"
            }`}>
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 opacity-50 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className={`text-3xl font-bold ${stat.highlight ? "text-emerald-700" : "text-gray-900 group-hover:text-indigo-600"} transition-colors`}>
                      {stat.value}
                    </p>
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
        {/* Main Content Area: Recent Applications */}
        <div className="xl:col-span-2 space-y-8">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  Recent Applications & Pipeline
                </CardTitle>
                <Link to="/student/applications" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
                  View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
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
                ) : appliedJobs.slice(0, 4).map((job, idx) => {
                  const appStatuses = JSON.parse(localStorage.getItem('student_application_statuses') || '{}');
                  const currentStatus = appStatuses[`${job.role}_${userEmail}`] || (job.selected?.includes(userEmail) ? "Offered" : "Applied");
                  const interview = myInterviews.find(i => i.jobId === job.id);
                  const offer = myOffers.find(o => o.jobId === job.id);
                  
                  let statusColor = "bg-indigo-50 text-indigo-700";
                  let statusText = "Under Review";
                  if (offer) {
                    if (offer.status === "Accepted") {
                      statusColor = "bg-emerald-100 text-emerald-800 font-bold";
                      statusText = `Accepted (₹${offer.ctc} LPA)`;
                    } else if (offer.status === "Declined") {
                      statusColor = "bg-gray-100 text-gray-700";
                      statusText = "Offer Declined";
                    } else {
                      statusColor = "bg-emerald-600 text-white font-bold animate-pulse";
                      statusText = `🎉 Offer! (₹${offer.ctc} LPA)`;
                    }
                  } else if (currentStatus === "Offered" || currentStatus === "Selected") {
                    statusColor = "bg-emerald-100 text-emerald-800";
                    statusText = "Offered";
                  } else if (currentStatus === "Interviewing" || interview) {
                    statusColor = "bg-amber-100 text-amber-800 font-bold";
                    statusText = "Interviewing";
                  } else if (currentStatus === "Shortlisted") {
                    statusColor = "bg-blue-100 text-blue-800";
                    statusText = "Shortlisted";
                  }

                  return (
                  <li key={job.id || idx} className="p-5 sm:px-6 hover:bg-gray-50 transition-colors group cursor-pointer">
                    <Link to="/student/applications" className="flex items-center justify-between">
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
                          {interview && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 mt-1">
                              <Video className="w-3 h-3 text-amber-600" />
                              {interview.roundName}: {interview.date} @ {interview.time}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor}`}>
                          {statusText}
                        </span>
                        <p className="text-xs text-gray-400 font-medium">Applied recently</p>
                      </div>
                    </Link>
                  </li>
                )})}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Upcoming Interviews & Events */}
        <div className="space-y-8">
          <Card className="border-gray-100 shadow-sm overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
            <CardHeader className="border-b border-gray-100 bg-white py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" />
                Upcoming Interviews
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {myInterviews.length > 0 ? (
                <div className="space-y-4">
                  {myInterviews.map((inv) => (
                    <div key={inv.id} className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-xs space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {inv.roundName}
                          </span>
                          <h4 className="text-sm font-bold text-gray-900 mt-1">{inv.jobRole}</h4>
                          <p className="text-xs text-gray-500 font-medium">{inv.company}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-700 font-semibold bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" /> {inv.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" /> {inv.time}
                        </span>
                      </div>

                      {inv.meetingLink ? (
                        <a 
                          href={inv.meetingLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Video className="w-3.5 h-3.5" /> Join Video Call
                        </a>
                      ) : (
                        <p className="text-[11px] text-gray-500 text-center font-medium">
                          📍 {inv.venue || "Campus Venue"}
                        </p>
                      )}
                    </div>
                  ))}

                  <Link 
                    to="/student/applications"
                    className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5 group"
                  >
                    View All Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">No Interviews Scheduled Yet</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    Keep your profile and ATS resume updated. Recruiter interview invites will appear right here.
                  </p>
                  <Link 
                    to="/student/jobs" 
                    className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Explore Job Openings &rarr;
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}