import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Users, Briefcase, Activity, ShieldCheck, TrendingUp, AlertCircle, FileText, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "../../components/Button";
import { useJobs } from "../../context/JobContext";

export default function AdminDashboard() {
  const { jobs } = useJobs();
  const approvedJobs = jobs.filter(j => j.status === "Approved");
  const totalApplicantsPool = approvedJobs.reduce((acc, job) => acc + (job.applicants?.length || 0), 0);
  const stats = [
    { title: "Total Users", value: "0", change: "0%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Live Jobs", value: approvedJobs.length.toString(), change: `+${approvedJobs.length}`, icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Active Applications", value: totalApplicantsPool.toString(), change: `+${totalApplicantsPool}`, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Security Alerts", value: "0", change: "0", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    try {
      const pending = JSON.parse(localStorage.getItem('nexus_pending_requests') || '[]');
      const active = JSON.parse(localStorage.getItem('nexus_active_users') || '[]');
      
      const pendingLogs = pending.map(req => ({
        id: `p-${req.id}`,
        action: `New ${req.role.toLowerCase()} registration pending approval`,
        user: req.name,
        time: req.date,
        status: 'Warning'
      }));

      const activeLogs = active.map(req => ({
        id: `a-${req.id}`,
        action: `New ${req.role.toLowerCase()} account activated`,
        user: req.name,
        time: req.joined,
        status: 'Success'
      }));

      const allLogs = [...pendingLogs, ...activeLogs].sort((a, b) => b.id.split('-')[1] - a.id.split('-')[1]);
      setLogs(allLogs.slice(0, 6)); // Show latest 6
    } catch {
      setLogs([]);
    }
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Overview</h1>
          <p className="text-gray-500">System-wide analytics and control center.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-white"><AlertCircle className="w-4 h-4"/> System Logs</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                <span className="text-emerald-600 font-medium">{stat.change}</span>
                <span className="text-gray-400 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 border-none shadow-sm bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg text-gray-800">Recent System Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {logs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${log.status === 'Success' ? 'bg-emerald-500' : log.status === 'Warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{log.action}</p>
                      <p className="text-xs text-gray-500">Initiated by {log.user}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{log.time}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No recent system activity.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-900 to-indigo-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start text-indigo-100 hover:text-white hover:bg-white/10 bg-white/5 border-none">
              <Users className="w-4 h-4 mr-3" /> Manage TPO Accounts
            </Button>
            <Button variant="ghost" className="w-full justify-start text-indigo-100 hover:text-white hover:bg-white/10 bg-white/5 border-none">
              <Activity className="w-4 h-4 mr-3" /> View System Logs
            </Button>
            <Button variant="ghost" className="w-full justify-start text-indigo-100 hover:text-white hover:bg-white/10 bg-white/5 border-none">
              <ShieldCheck className="w-4 h-4 mr-3" /> Security Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Global Jobs Overview Table */}
      <Card className="border-none shadow-sm bg-white overflow-hidden mt-8 w-full">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            Live Jobs & Applications Oversight
          </CardTitle>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            {approvedJobs.length} Active
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Requisition Details</th>
                  <th className="px-6 py-4 font-semibold">Target Audience</th>
                  <th className="px-6 py-4 font-semibold text-center">Total Applied</th>
                  <th className="px-6 py-4 font-semibold text-center">Selected</th>
                  <th className="px-6 py-4 font-semibold text-right">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {approvedJobs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No jobs have been approved by the TPO yet.
                    </td>
                  </tr>
                ) : approvedJobs.map(job => {
                  const appliedCount = job.applicants?.length || 0;
                  const selectedCount = job.selected?.length || 0;
                  return (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                          {(job.companyLogo && (job.companyLogo.startsWith("blob:") || job.companyLogo.startsWith("data:") || job.companyLogo.startsWith("http"))) ? (
                             <img src={job.companyLogo} className="w-full h-full object-cover" alt="logo"/>
                          ) : (
                             <img src={`https://ui-avatars.com/api/?name=${job.company}&background=random&color=fff`} className="w-full h-full object-contain" alt="logo"/>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{job.role}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{job.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border bg-gray-50 text-gray-700 border-gray-200">
                         {job.visibility}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex justify-center">
                          <div className="flex items-center gap-1.5 font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md">
                            <Users className="w-4 h-4"/> {appliedCount}
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex justify-center">
                          <div className={`flex items-center gap-1.5 font-bold px-3 py-1 rounded-md ${selectedCount > 0 ? "text-emerald-700 bg-emerald-50" : "text-gray-400 bg-gray-50"}`}>
                            <CheckCircle className="w-4 h-4"/> {selectedCount}
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <p className="text-xs text-gray-900 font-medium">{job.postedBy}</p>
                       <p className="text-[10px] text-gray-500 uppercase">{job.applyMethod}</p>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
