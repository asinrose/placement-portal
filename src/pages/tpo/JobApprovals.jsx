import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Search, Filter, Briefcase, FileText, X } from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function JobApprovals() {
  const [jobs, setJobs] = useState([]);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Job Approvals</h1>
          <p className="text-gray-500">Review and vet incoming job postings from recruiters.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
             <Input type="text" placeholder="Search roles or companies..." className="pl-9 bg-white" />
          </div>
          <Button variant="outline" className="gap-2 bg-white"><Filter className="w-4 h-4"/> Filter</Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Company & Role</th>
                  <th className="px-6 py-4 font-semibold">CTC / Compensation</th>
                  <th className="px-6 py-4 font-semibold">Job Type</th>
                  <th className="px-6 py-4 font-semibold">Posted</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{job.role}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{job.company}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">{job.ctc}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        {job.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{job.date}</td>
                    <td className="px-6 py-4 text-right">
                      {job.status === "Pending" ? (
                        <div className="flex justify-end gap-2">
                           <Button size="sm" variant="outline" className="text-red-600 hover:text-white border-red-200 hover:bg-red-600 hover:border-red-600" onClick={() => openRejectModal(job)}>
                             Reject
                           </Button>
                           <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200" onClick={() => handleApprove(job.id)}>
                             Approve
                           </Button>
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
