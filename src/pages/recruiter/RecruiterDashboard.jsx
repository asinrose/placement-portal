import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Users, Briefcase, Clock, Send, BarChart2, TrendingUp, ChevronRight, Video, Calendar } from "lucide-react";
import { Button } from "../../components/Button";
import { Link } from "react-router-dom";
import { useJobs } from "../../context/JobContext";
import { useAuth } from "../../context/AuthContext";

export default function RecruiterDashboard() {
  const { jobs } = useJobs();
  const { user } = useAuth();

  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [offers, setOffers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('student_job_offers') || '[]');
    } catch {
      return [];
    }
  });

  const loadData = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('scheduled_job_interviews') || '[]');
      setScheduledInterviews(stored);
    } catch {
      setScheduledInterviews([]);
    }
    try {
      setOffers(JSON.parse(localStorage.getItem('student_job_offers') || '[]'));
    } catch {
      setOffers([]);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('interviews_updated', loadData);
    window.addEventListener('offers_updated', loadData);
    window.addEventListener('jobs_updated', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('interviews_updated', loadData);
      window.removeEventListener('offers_updated', loadData);
      window.removeEventListener('jobs_updated', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const getJobSelectedCount = (job) => {
    const acceptedOffersForJob = offers.filter(o => 
      o.status === "Accepted" &&
      (o.jobId === job.id || 
       (o.jobRole && job.role && o.jobRole.toLowerCase().trim() === job.role.toLowerCase().trim() && 
        o.company && job.company && o.company.toLowerCase().trim() === job.company.toLowerCase().trim()))
    );
    const selectedEmails = new Set([
      ...(job.selected || []),
      ...acceptedOffersForJob.map(o => o.applicantEmail)
    ]);
    return selectedEmails.size;
  };

  const myJobs = jobs.filter(j => j.postedBy === user?.email);
  const myJobIds = myJobs.map(j => j.id);
  const activeJobs = myJobs.filter(j => j.status === "Approved");
  const totalApplicants = myJobs.reduce((acc, j) => acc + (j.applicants?.length || 0), 0);
  const totalOffered = myJobs.reduce((acc, j) => acc + getJobSelectedCount(j), 0);
  const myInterviews = scheduledInterviews.filter(i => myJobIds.includes(i.jobId) || i.interviewerName === user?.name);

  const stats = [
    { title: "Active Jobs", value: activeJobs.length.toString(), icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-50", border: "hover:border-indigo-200", link: "/recruiter/my-jobs" },
    { title: "Total Applicants", value: totalApplicants.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-50", border: "hover:border-blue-200", link: "/recruiter/applicants" },
    { title: "Interviews Set", value: myInterviews.length.toString(), icon: Video, color: "text-purple-600", bg: "bg-purple-50", border: "hover:border-purple-200", link: "/recruiter/interviews" },
    { title: "Offers Extended", value: totalOffered.toString(), icon: Send, color: "text-emerald-500", bg: "bg-emerald-50", border: "hover:border-emerald-200", link: "/recruiter/applicants" },
  ];

  const funnelSteps = [
    { label: "Applied", value: totalApplicants, color: "indigo", sub: "100%" },
    { label: "Shortlisted", value: myJobs.reduce((acc, j) => acc + (j.shortlisted?.length || 0), 0), color: "blue", sub: totalApplicants > 0 ? `${Math.round((myJobs.reduce((acc, j) => acc + (j.shortlisted?.length || 0), 0) / totalApplicants) * 100)}%` : "0%" },
    { label: "Interviewing", value: myInterviews.length, color: "amber", sub: totalApplicants > 0 ? `${Math.round((myInterviews.length / totalApplicants) * 100)}%` : "0%" },
    { label: "Offered", value: totalOffered, color: "emerald", sub: totalApplicants > 0 ? `${Math.round((totalOffered / totalApplicants) * 100)}%` : "0%" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Recruitment Hub</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name || "Recruiter"}. Here is the status of your current campus hiring pipeline.</p>
        </div>
        <Link to="/recruiter/post-job">
          <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 group">
             <Briefcase className="w-4 h-4" />
             Post New Job
             <ChevronRight className="w-4 h-4 ml-1 opacity-50 group-hover:translate-x-1 transition-all" />
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const CardContentInner = (
            <div className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all cursor-pointer h-full ${stat.border}`}>
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 opacity-50 group-hover:scale-150 transition-transform duration-700" />
               <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1 group-hover:text-indigo-600 transition-colors">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );

          return stat.link ? (
            <Link key={stat.title} to={stat.link}>{CardContentInner}</Link>
          ) : (
            <div key={stat.title}>{CardContentInner}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-gray-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between py-4 bg-gray-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Active Job Postings Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="flex flex-col">
                 {myJobs.length === 0 ? (
                   <div className="p-8 text-center text-gray-500">
                     <p className="font-medium">No job postings created yet.</p>
                     <Link to="/recruiter/post-job" className="text-indigo-600 text-sm hover:underline mt-1 inline-block">Post your first campus job</Link>
                   </div>
                 ) : (
                   myJobs.map((job) => (
                     <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 lg:px-6 border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                       <div className="mb-4 sm:mb-0">
                         <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{job.role}</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wide">
                              {job.type}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${job.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {job.status}
                            </span>
                            <span className="text-xs text-gray-400 font-medium tracking-wide">Posted {job.date}</span>
                         </div>
                       </div>
                       <div className="flex gap-3">
                         <Link to="/recruiter/applicants" className="flex flex-col items-center justify-center bg-indigo-50/50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 px-4 py-2 rounded-xl transition-all cursor-pointer min-w-[90px]">
                            <span className="font-bold text-indigo-700 text-lg">{job.applicants?.length || 0}</span>
                            <span className="text-[10px] text-indigo-500 uppercase tracking-widest font-semibold">Applied</span>
                         </Link>
                         <Link to="/recruiter/applicants" className="flex flex-col items-center justify-center bg-emerald-50/50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 px-4 py-2 rounded-xl transition-all cursor-pointer min-w-[90px]">
                            <span className="font-bold text-emerald-700 text-lg">{getJobSelectedCount(job)}</span>
                            <span className="text-[10px] text-emerald-600 uppercase tracking-widest font-semibold">Selected</span>
                         </Link>
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Graphics */}
        <div className="space-y-8">
          <Card className="border-gray-100 shadow-sm flex flex-col bg-gradient-to-b from-white to-gray-50/30 overflow-hidden h-full">
            <CardHeader className="border-b border-gray-100 bg-white py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                 <BarChart2 className="w-5 h-5 text-indigo-600"/>
                 Aggregate Hiring Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center p-6 gap-6 relative">
               <div className="flex flex-col gap-4">
                 {funnelSteps.map((step, idx) => (
                   <div key={idx} className="relative z-10 flex items-center gap-4 group">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-105 ${step.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : step.color === 'blue' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'}`}>
                         <span className="font-bold text-lg leading-none">{step.value}</span>
                      </div>
                      <div>
                         <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{step.label}</p>
                         <p className="text-xs text-gray-500 font-medium tracking-wide">Yield rate: {step.sub}</p>
                      </div>
                   </div>
                 ))}
               </div>
               
               <p className="text-xs text-center text-gray-400 mt-4 px-2">
                 Shows the aggregate conversion across your job roles.
               </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
