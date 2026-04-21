import React, { useState } from "react";
import { useJobs } from "../../context/JobContext";
import { useAuth } from "../../context/AuthContext";
import { Briefcase, MapPin, DollarSign, Clock, Search, CheckCircle, X, Bookmark, Building2, Calendar, Target, AlertCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Button } from "../../components/Button";

export default function StudentSavedJobs() {
  const { jobs, applyForJob, toggleSaveJob } = useJobs();
  const { user } = useAuth();
  const currentUserEmail = user?.email || "student@example.com";
  
  const [selectedJob, setSelectedJob] = useState(null);

  // Get only jobs the user has saved
  const savedJobs = jobs.filter(job => job.savedBy?.includes(currentUserEmail));

  const handleApply = (job) => {
    if (job.applyMethod === "External link" && job.externalLink) {
       window.open(job.externalLink, '_blank', 'noopener,noreferrer');
       return;
    }
    applyForJob(job.id, currentUserEmail);
    setSelectedJob(null);
  };

  const handleSave = (e, job) => {
    e.stopPropagation();
    toggleSaveJob(job.id, currentUserEmail);
    if (selectedJob?.id === job.id) setSelectedJob(null);
  };

  const isDeadlinePassed = (deadlineDate) => {
    if (!deadlineDate) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const deadline = new Date(deadlineDate);
    return today > deadline;
  };

  const getTypeBadgeColor = (type) => {
    switch(type) {
      case "Full-time": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Summer Internship": return "bg-amber-100 text-amber-800 border-amber-200";
      case "6-Month Internship": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-indigo-100 text-indigo-800 border-indigo-200";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Saved Jobs</h1>
          <p className="text-gray-500">Your personal collection of bookmarked opportunities.</p>
        </div>
        <Link to="/student/jobs" className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 border border-indigo-100 px-4 py-2 hover:bg-indigo-100 transition-colors rounded-full shadow-sm font-medium">
          Explore More Roles
        </Link>
      </div>

      {savedJobs.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl border border-gray-100 shadow-sm mt-8">
            <div className="mx-auto w-16 h-16 bg-gray-50 flex items-center justify-center rounded-full mb-4">
               <Bookmark className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">No saved jobs yet</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">You haven't bookmarked any opportunities. Browse the Job Board and click the bookmark icon to save jobs here for later.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
            {savedJobs.map(job => {
              const isApplied = job.applicants?.includes(currentUserEmail);
              const expired = isDeadlinePassed(job.deadline);
              
              return (
                <div key={job.id} onClick={() => setSelectedJob(job)} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col cursor-pointer overflow-hidden relative">
                  <div className="p-6 flex-1 flex flex-col relative">
                    
                    {expired && (
                      <div className="absolute top-0 right-0 bg-red-100 text-red-800 text-[10px] font-bold px-3 py-1 uppercase rounded-bl-lg">Closed</div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                      <div className="w-14 h-14 rounded-xl border border-gray-100 flex items-center justify-center p-2 shadow-sm bg-white group-hover:scale-105 transition-transform">
                        {(job.companyLogo && (job.companyLogo.startsWith("blob:") || job.companyLogo.startsWith("data:") || job.companyLogo.startsWith("http"))) ? (
                            <img src={job.companyLogo} alt="logo" className="w-full h-full object-cover rounded-lg"/>
                        ) : (
                            <img src={`https://ui-avatars.com/api/?name=${job.company}&background=random&color=fff`} alt="logo" className="w-full h-full object-contain rounded-lg"/>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         {isApplied && <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shrink-0"><CheckCircle className="w-3 h-3"/> Applied</span>}
                         <button onClick={(e) => handleSave(e, job)} className={`p-1.5 rounded-full transition-colors text-indigo-600 bg-indigo-50`}>
                           <Bookmark className="w-5 h-5 fill-current tracking-wide" />
                         </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 text-[1.1rem] leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{job.role}</h3>
                    <p className="text-indigo-600 font-medium text-sm mb-4">{job.company}</p>

                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> <span className="truncate max-w-[120px]">{job.workMode}</span></div>
                        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                        <div className="flex items-center gap-1.5 text-gray-600 font-medium"><span>{job.salaryCurrency}</span> {job.salaryAmount}</div>
                      </div>
                    </div>

                    {job.requiredSkills && (
                      <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-50">
                        {job.requiredSkills.split(",").slice(0,3).map((s, i) => (
                          <span key={i} className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">{s.trim()}</span>
                        ))}
                        {job.requiredSkills.split(",").length > 3 && <span className="text-[11px] font-medium bg-gray-50 text-gray-400 px-2 py-1 rounded-md">+{job.requiredSkills.split(",").length - 3}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
      )}

      {/* Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm pt-10 pb-10">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center p-2 shadow-sm shrink-0">
                   {(selectedJob.companyLogo && (selectedJob.companyLogo.startsWith("blob:") || selectedJob.companyLogo.startsWith("data:") || selectedJob.companyLogo.startsWith("http"))) ? (
                      <img src={selectedJob.companyLogo} alt="logo" className="w-full h-full object-cover rounded-lg"/>
                   ) : (
                      <img src={`https://ui-avatars.com/api/?name=${selectedJob.company}&background=random&color=fff`} alt="logo" className="w-full h-full object-contain rounded-lg"/>
                   )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-1">{selectedJob.role}</h2>
                  <p className="text-lg text-indigo-700 font-semibold">{selectedJob.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => handleSave(e, selectedJob)} className="p-2 rounded-full shadow-sm border transition-colors bg-indigo-50 border-indigo-200 text-indigo-600">
                  <Bookmark className="w-5 h-5 fill-current tracking-wide" />
                </button>
                <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-900 bg-white p-2 rounded-full shadow-sm border border-gray-100 hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50 space-y-6">
              <div className="flex flex-wrap gap-3">
                <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${getTypeBadgeColor(selectedJob.type)}`}>{selectedJob.type}</span>
                <span className="text-sm bg-indigo-50 text-indigo-800 px-3 py-1.5 rounded-full border border-indigo-100 font-semibold flex items-center gap-1.5 shadow-sm">
                  {selectedJob.salaryCurrency} {selectedJob.salaryAmount} / {selectedJob.salaryType}
                </span>
                <span className={`text-sm px-3 py-1.5 rounded-full border font-medium flex items-center gap-1.5 shadow-sm ${isDeadlinePassed(selectedJob.deadline) ? "bg-red-50 text-red-700 border-red-200" : "bg-white text-gray-800 border-gray-200"}`}>
                  <Calendar className="w-4 h-4 text-gray-400"/> Deadline: {selectedJob.deadline}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm">
                       <CardContent className="p-6 space-y-5">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg mb-3 block">Role Description</h4>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{selectedJob.description}</p>
                          </div>
                       </CardContent>
                    </Card>
                 </div>
                 <div className="space-y-6">
                    <Card className="border-indigo-100 shadow-sm ring-1 ring-indigo-50 bg-indigo-50/20">
                      <CardContent className="p-5">
                         <h4 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2"><Target className="w-5 h-5"/> Criteria Set</h4>
                         <ul className="text-sm text-indigo-800 space-y-3">
                           <li className="flex justify-between items-center border-b border-indigo-100 pb-2">
                             <span className="text-indigo-600">CGPA</span>
                             <span className="font-bold">{selectedJob.minCgpa}</span>
                           </li>
                           <li className="flex justify-between items-center border-b border-indigo-100 pb-2">
                             <span className="text-indigo-600">Batch</span>
                             <span className="font-bold">{selectedJob.passingYear}</span>
                           </li>
                         </ul>
                      </CardContent>
                    </Card>
                 </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
               {isDeadlinePassed(selectedJob.deadline) ? (
                 <div className="sm:col-span-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-center gap-2">
                   <AlertCircle className="w-5 h-5"/> 
                   <span className="font-semibold tracking-wide">APPLICATION DEADLINE HAS PASSED</span>
                 </div>
               ) : (
                 <>
                   <Button variant="outline" className="w-full text-base py-6" onClick={() => setSelectedJob(null)}>Cancel Action</Button>
                   <Button
                     className={`w-full text-base py-6 shadow-md transition-all ${selectedJob.applicants?.includes(currentUserEmail) ? "bg-emerald-600 shadow-emerald-200" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200"}`}
                     onClick={() => handleApply(selectedJob)}
                     disabled={selectedJob.applicants?.includes(currentUserEmail)}
                   >
                     {selectedJob.applicants?.includes(currentUserEmail) ? (
                       <span className="flex justify-center items-center gap-2">Application Submitted <CheckCircle className="w-5 h-5"/></span>
                     ) : selectedJob.applyMethod === "External link" ? (
                       <span className="flex justify-center items-center gap-2">Apply on Portal <ExternalLink className="w-5 h-5"/></span>
                     ) : (
                       "Submit Application Now"
                     )}
                   </Button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
