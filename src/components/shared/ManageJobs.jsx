import React, { useState } from "react";
import { useJobs } from "../../context/JobContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import { Button } from "../Button";
import { 
  Briefcase, Edit3, Trash2, ShieldAlert, CheckCircle, 
  MapPin, DollarSign, Calendar, ExternalLink, Activity
} from "lucide-react";

export default function ManageJobs({ rolePrefix }) {
  const { jobs, deleteJob } = useJobs();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deleteId, setDeleteId] = useState(null);

  // Filter jobs explicitly to only those posted by the current user
  const userEmail = user?.email || "alumni@example.com"; // Mock fallback
  const myJobs = jobs.filter(job => job.postedBy === userEmail);

  // Quick stats
  const pendingCount = myJobs.filter(j => j.status === "Pending").length;
  const approvedCount = myJobs.filter(j => j.status === "Approved").length;
  const rejectedCount = myJobs.filter(j => j.status === "Rejected").length;

  const confirmDelete = () => {
    if (deleteId) {
      deleteJob(deleteId);
      setDeleteId(null);
    }
  };

  const handleEdit = (id) => {
    // Navigate back to the PostJob form, but utilizing the edit-job dynamic route
    navigate(`/${rolePrefix}/edit-job/${id}`);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "Approved": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Pending": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Rejected": return "bg-rose-100 text-rose-800 border-rose-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manage Postings</h1>
          <p className="text-gray-500">Track, edit, or remove the jobs you have published.</p>
        </div>
        <Button onClick={() => navigate(`/${rolePrefix}/post-job`)} className="bg-indigo-600 hover:bg-indigo-700">
          <Briefcase className="w-4 h-4 mr-2"/> Post New Job
        </Button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center"><Activity className="w-6 h-6 text-indigo-600"/></div>
            <div><p className="text-sm font-medium text-gray-500">Total Posted</p><p className="text-2xl font-bold text-gray-900">{myJobs.length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center"><ShieldAlert className="w-6 h-6 text-amber-600"/></div>
            <div><p className="text-sm font-medium text-gray-500">Pending Review</p><p className="text-2xl font-bold text-gray-900">{pendingCount}</p></div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-600"/></div>
            <div><p className="text-sm font-medium text-gray-500">Live (Approved)</p><p className="text-2xl font-bold text-gray-900">{approvedCount}</p></div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center"><Trash2 className="w-6 h-6 text-rose-600"/></div>
            <div><p className="text-sm font-medium text-gray-500">Rejected</p><p className="text-2xl font-bold text-gray-900">{rejectedCount}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
          <CardTitle className="text-lg">Your Requisitions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Job Details</th>
                  <th className="px-6 py-4 font-semibold">Compensation</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Application</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {myJobs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      You haven't posted any jobs yet.
                    </td>
                  </tr>
                ) : myJobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                          {(job.companyLogo && (job.companyLogo.startsWith("blob:") || job.companyLogo.startsWith("data:") || job.companyLogo.startsWith("http"))) ? (
                             <img src={job.companyLogo} className="w-full h-full object-cover" alt="logo"/>
                          ) : (
                             <img src={`https://ui-avatars.com/api/?name=${job.company}&background=random&color=fff`} className="w-full h-full object-contain" alt="logo"/>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{job.role}</p>
                          <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3"/> {job.type} • {job.workMode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-700 flex items-center gap-1"><span className="text-gray-400 font-medium">{job.salaryCurrency}</span> {job.salaryAmount}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{job.salaryType}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(job.status)}`}>
                        {job.status}
                      </span>
                      {job.status === "Rejected" && job.rejectReason && (
                        <p className="text-xs text-rose-500 mt-1 max-w-[150px] truncate" title={job.rejectReason}>Reason: {job.rejectReason}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 font-medium">{job.applyMethod}</p>
                      {job.applyMethod === "External link" && (
                        <a href={job.externalLink} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-0.5">
                          Link <ExternalLink className="w-3 h-3"/>
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => handleEdit(job.id)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700" onClick={() => setDeleteId(job.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 text-center">
                 <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                   <Trash2 className="w-8 h-8 text-red-600" />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Job Post?</h2>
                 <p className="text-sm text-gray-500 mb-6">
                   This action is permanent and will remove the requisition from the global portal entirely.
                 </p>
                 <div className="flex gap-3">
                   <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
                   <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>Delete</Button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
