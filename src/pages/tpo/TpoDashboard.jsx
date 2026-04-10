import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Users, Briefcase, FileText, CheckCircle, ArrowRight, Activity, Calendar, X } from "lucide-react";
import { Button } from "../../components/Button";
import { Link } from "react-router-dom";

export default function TpoDashboard() {
  const stats = [
    { title: "Total Students", value: "850", icon: Users, color: "text-blue-500", bg: "bg-blue-50", border: "hover:border-blue-200" },
    { title: "Total Companies", value: "124", icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-50", border: "hover:border-indigo-200" },
    { title: "Pending Approvals", value: "12", icon: FileText, color: "text-amber-500", bg: "bg-amber-50", border: "hover:border-amber-200" },
    { title: "Placed Students", value: "412", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", border: "hover:border-emerald-200" },
  ];

  const [jobs, setJobs] = useState([
    { id: 1, company: "TechCorp Global", role: "Software Developer", ctc: "12 LPA", status: "Pending" },
    { id: 2, company: "DataSync Inc", role: "Data Scientist", ctc: "15 LPA", status: "Pending" },
    { id: 3, company: "CloudNet Systems", role: "DevOps Engineer", ctc: "10 LPA", status: "Pending" },
    { id: 4, company: "Acme Corp", role: "Frontend Developer", ctc: "8 LPA", status: "Pending" },
  ]);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = (id) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status: "Approved" } : job));
  };

  const openRejectModal = (job) => {
    setSelectedJob(job);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) return;
    setJobs(jobs.map(job => job.id === selectedJob.id ? { ...job, status: "Rejected" } : job));
    setRejectModalOpen(false);
  };

  const activities = [
    { id: 1, icon: Users, title: "45 new students registered", time: "2 hours ago", color: "text-blue-500", bg: "bg-blue-50" },
    { id: 2, icon: CheckCircle, title: "TechCorp finalized 12 hires", time: "5 hours ago", color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: 3, icon: Briefcase, title: "New company registration: DataSync", time: "1 day ago", color: "text-purple-500", bg: "bg-purple-50" },
    { id: 4, icon: Calendar, title: "Pre-placement talk scheduled by Acme", time: "2 days ago", color: "text-amber-500", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Placement Officer Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor campus placement activities and approve requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white">Download Reports</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">Add New Drive</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all ${stat.border}`}>
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 opacity-50 group-hover:scale-150 transition-transform duration-700" />
               <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-gray-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between py-4 bg-gray-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Recent Job Approvals Pending
              </CardTitle>
              <Link to="/tpo/jobs" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
                View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                     <tr>
                       <th className="px-6 py-4 font-semibold">Company</th>
                       <th className="px-6 py-4 font-semibold">Role</th>
                       <th className="px-6 py-4 font-semibold">CTC</th>
                       <th className="px-6 py-4 font-semibold text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                     {jobs.map((job) => (
                       <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                         <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            {job.company}
                         </td>
                         <td className="px-6 py-4 text-gray-600">{job.role}</td>
                         <td className="px-6 py-4 font-medium text-gray-700">{job.ctc}</td>
                         <td className="px-6 py-4 text-right">
                           {job.status === "Pending" ? (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-white border-red-200 hover:bg-red-600 hover:border-red-600" onClick={() => openRejectModal(job)}>Reject</Button>
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200" onClick={() => handleApprove(job.id)}>Approve</Button>
                              </div>
                           ) : (
                             <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${job.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {job.status}
                             </span>
                           )}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Announcements / Activities */}
        <div className="space-y-8">
          <Card className="border-gray-100 shadow-sm overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
            <CardHeader className="border-b border-gray-100 bg-white py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
               <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent pl-4">
                  {activities.map((activity) => {
                     const Icon = activity.icon;
                     return (
                        <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                           <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-indigo-100 text-indigo-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                              <Icon className="w-3 h-3" />
                           </div>
                           <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-gray-100 bg-white shadow-sm group-hover:border-indigo-100 group-hover:shadow-md transition-all">
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{activity.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                           </div>
                        </div>
                     );
                  })}
               </div>
               <button className="mt-8 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5 group bg-white">
                 View All Activity <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-5 border-b border-gray-100">
                 <h2 className="text-lg font-semibold text-gray-900">Reject Job Posting</h2>
                 <button onClick={() => setRejectModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                   <X className="w-5 h-5"/>
                 </button>
              </div>
              <div className="p-5 space-y-4">
                 <div className="bg-amber-50 text-amber-800 text-sm p-3 rounded-lg border border-amber-100">
                   You are rejecting the <strong>{selectedJob?.role}</strong> role at <strong>{selectedJob?.company}</strong>.
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for rejection <span className="text-red-500">*</span></label>
                   <textarea
                     className="w-full text-sm rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px] resize-none"
                     placeholder="Please specify why this posting does not meet campus criteria..."
                     value={rejectReason}
                     onChange={(e) => setRejectReason(e.target.value)}
                     autoFocus
                   />
                 </div>
              </div>
              <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                 <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
                 <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleRejectConfirm} disabled={!rejectReason.trim()}>
                   Confirm Rejection
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
