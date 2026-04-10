import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Users, Briefcase, Clock, Send, BarChart2 } from "lucide-react";
import { Button } from "../../components/Button";

export default function RecruiterDashboard() {
  const stats = [
    { title: "Active Jobs", value: "4", icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-100" },
    { title: "New Applicants", value: "87", icon: Users, color: "text-blue-500", bg: "bg-blue-100" },
    { title: "Interviews Today", value: "6", icon: Clock, color: "text-amber-500", bg: "bg-amber-100" },
    { title: "Offers Extended", value: "12", icon: Send, color: "text-green-500", bg: "bg-green-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Recruiter Dashboard</h1>
          <p className="text-gray-500">Welcome back. Here is the status of your current hiring pipeline.</p>
        </div>
        <Button className="flex items-center gap-2">
           <Briefcase className="w-4 h-4" />
           Post New Job
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-none shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Active Job Postings Overview</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {[
                 { title: "Full Stack Developer", type: "Full Time", applicants: 45, shortlsited: 12 },
                 { title: "UX Designer", type: "Full Time", applicants: 28, shortlsited: 5 },
                 { title: "Marketing Intern", type: "Internship", applicants: 89, shortlsited: 20 },
               ].map((job, idx) => (
                 <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg">
                   <div className="mb-2 sm:mb-0">
                     <p className="font-medium text-gray-900 text-lg">{job.title}</p>
                     <p className="text-sm text-gray-500">{job.type} • Posted 3 days ago</p>
                   </div>
                   <div className="flex gap-4">
                     <div className="flex flex-col items-center justify-center bg-indigo-50 px-4 py-2 rounded-md">
                        <span className="font-bold text-indigo-700">{job.applicants}</span>
                        <span className="text-xs text-indigo-500 uppercase tracking-widest">Applied</span>
                     </div>
                     <div className="flex flex-col items-center justify-center bg-emerald-50 px-4 py-2 rounded-md">
                        <span className="font-bold text-emerald-700">{job.shortlsited}</span>
                        <span className="text-xs text-emerald-500 uppercase tracking-widest">Shortlist</span>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg" flex items-center gap-2>
               <BarChart2 className="w-5 h-5 text-indigo-600 inline mr-2"/>
               Hiring Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center gap-4">
             <div className="w-full bg-blue-100 h-10 rounded-md relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-blue-400 opacity-20 w-full"></div>
                <span className="relative z-10 font-medium text-blue-900 text-sm">Applications (162)</span>
             </div>
             <div className="w-full bg-indigo-100 h-10 rounded-md relative flex items-center justify-center overflow-hidden mx-auto" style={{ width: '80%' }}>
                <div className="absolute inset-y-0 left-0 bg-indigo-400 opacity-20 w-full"></div>
                <span className="relative z-10 font-medium text-indigo-900 text-sm">Shortlisted (45)</span>
             </div>
             <div className="w-full bg-amber-100 h-10 rounded-md relative flex items-center justify-center overflow-hidden mx-auto" style={{ width: '60%' }}>
                <div className="absolute inset-y-0 left-0 bg-amber-400 opacity-20 w-full"></div>
                <span className="relative z-10 font-medium text-amber-900 text-sm">Interviews (18)</span>
             </div>
             <div className="w-full bg-emerald-100 h-10 rounded-md relative flex items-center justify-center overflow-hidden mx-auto" style={{ width: '40%' }}>
                <div className="absolute inset-y-0 left-0 bg-emerald-400 opacity-20 w-full"></div>
                <span className="relative z-10 font-medium text-emerald-900 text-sm">Offers (12)</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
