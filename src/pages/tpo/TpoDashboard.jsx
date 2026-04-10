import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Users, Briefcase, FileText, CheckCircle, Search } from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function TpoDashboard() {
  const stats = [
    { title: "Total Students", value: "850", icon: Users, color: "text-blue-500", bg: "bg-blue-100" },
    { title: "Total Companies", value: "124", icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-100" },
    { title: "Pending Approvals", value: "12", icon: FileText, color: "text-amber-500", bg: "bg-amber-100" },
    { title: "Placed Students", value: "412", icon: CheckCircle, color: "text-green-500", bg: "bg-green-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Placement Officer Dashboard</h1>
          <p className="text-gray-500">Monitor campus placement activities and approve requests.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Download Reports</Button>
          <Button>Add New Drive</Button>
        </div>
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
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Recent Job Approvals Pending</CardTitle>
            <div className="relative w-64">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
               <Input type="text" placeholder="Search companies..." className="pl-9 h-9" />
            </div>
          </CardHeader>
          <CardContent>
             <div className="overflow-x-auto mt-4">
               <table className="w-full text-sm text-left">
                 <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y border-gray-100">
                   <tr>
                     <th className="px-4 py-3">Company</th>
                     <th className="px-4 py-3">Role specified</th>
                     <th className="px-4 py-3">CTC</th>
                     <th className="px-4 py-3 text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {[
                     { company: "TechCorp Global", role: "Software Developer", ctc: "12 LPA" },
                     { company: "DataSync Inc", role: "Data Scientist", ctc: "15 LPA" },
                     { company: "CloudNet Systems", role: "DevOps Engineer", ctc: "10 LPA" },
                     { company: "Acme Corp", role: "Frontend Developer", ctc: "8 LPA" },
                   ].map((job, idx) => (
                     <tr key={idx} className="hover:bg-gray-50">
                       <td className="px-4 py-3 font-medium text-gray-900">{job.company}</td>
                       <td className="px-4 py-3 text-gray-600">{job.role}</td>
                       <td className="px-4 py-3 text-gray-600">{job.ctc}</td>
                       <td className="px-4 py-3 text-right">
                         <div className="flex justify-end gap-2">
                           <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50">Reject</Button>
                           <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Approve</Button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                     <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">45 new students registered</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                     <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">TechCorp finalized 12 hires</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                     <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New company registration: DataSync</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>    
    </div>
  );
}
