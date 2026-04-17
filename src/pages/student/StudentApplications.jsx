import React from "react";
import { useJobs } from "../../context/JobContext";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Briefcase, MapPin, DollarSign, ExternalLink, Calendar, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function StudentApplications() {
  const { jobs } = useJobs();
  const { user } = useAuth();
  const userEmail = user?.email || "student@example.com";

  const appliedJobs = jobs.filter(job => job.applicants?.includes(userEmail));
  const selectedJobs = appliedJobs.filter(job => job.selected?.includes(userEmail));
  
  const pendingCount = appliedJobs.length - selectedJobs.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Applications</h1>
          <p className="text-gray-500">Track the status of all your ongoing and past job applications.</p>
        </div>
        <Link to="/student/jobs" className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-indigo-100 shadow-sm">
           Explore More Rolls
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         <Card className="border-none shadow-sm bg-white">
           <CardContent className="p-6 flex items-center justify-between">
              <div>
                 <p className="text-sm font-medium text-gray-500">Total Applied</p>
                 <p className="text-3xl font-bold text-gray-900">{appliedJobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                 <Briefcase className="w-6 h-6"/>
              </div>
           </CardContent>
         </Card>
         <Card className="border-none shadow-sm bg-white">
           <CardContent className="p-6 flex items-center justify-between">
              <div>
                 <p className="text-sm font-medium text-gray-500">Under Review</p>
                 <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                 <Clock className="w-6 h-6"/>
              </div>
           </CardContent>
         </Card>
         <Card className="border-none shadow-sm bg-white border-emerald-100 ring-1 ring-emerald-50">
           <CardContent className="p-6 flex items-center justify-between">
              <div>
                 <p className="text-sm font-medium text-emerald-600">Selected</p>
                 <p className="text-3xl font-bold text-emerald-700">{selectedJobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                 <CheckCircle className="w-6 h-6"/>
              </div>
           </CardContent>
         </Card>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden mt-8 w-full">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Application History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Job Role & Company</th>
                  <th className="px-6 py-4 font-semibold">Compensation</th>
                  <th className="px-6 py-4 font-semibold">Deadline</th>
                  <th className="px-6 py-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appliedJobs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                        <Briefcase className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Applications Yet</h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto">You haven't applied to any roles. Visit the Job Board to discover your next opportunity!</p>
                    </td>
                  </tr>
                ) : appliedJobs.map(job => {
                  const isSelected = job.selected?.includes(userEmail);
                  
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
                       <p className="text-gray-700 font-medium">
                         {job.salaryAmount} {job.salaryCurrency} <span className="text-[10px] text-gray-400 uppercase ml-1">{job.salaryType}</span>
                       </p>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-gray-600 text-xs flex items-center gap-1.5 font-medium"><Calendar className="w-3.5 h-3.5 text-gray-400"/> {job.deadline}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                       {isSelected ? (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5"/>
                            Selected
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100">
                            <Clock className="w-3.5 h-3.5"/>
                            Under Review
                         </span>
                       )}
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
