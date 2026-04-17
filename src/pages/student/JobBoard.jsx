import React, { useState } from "react";
import { useJobs } from "../../context/JobContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Briefcase, MapPin, DollarSign, Clock, Search, CheckCircle, X, Filter, GraduationCap, Building2, Calendar, Target, AlertCircle, ExternalLink, Bookmark } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function JobBoard() {
  const { jobs, applyForJob, toggleSaveJob } = useJobs();
  const { user } = useAuth();
  const currentUserEmail = user?.email || "student@example.com";
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [applySuccess, setApplySuccess] = useState(null);

  // We only show approved jobs to students
  const approvedJobs = jobs.filter(j => j.status === "Approved");
  
  const filteredJobs = approvedJobs.filter(job => {
    const matchSearch = job.role.toLowerCase().includes(search.toLowerCase()) ||
                        job.company.toLowerCase().includes(search.toLowerCase()) ||
                        (job.requiredSkills || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || job.type === filterType;
    return matchSearch && matchType;
  });

  const handleApply = (job) => {
    if (job.applyMethod === "External link" && job.externalLink) {
       window.open(job.externalLink, '_blank', 'noopener,noreferrer');
       return;
    }

    applyForJob(job.id, currentUserEmail);
    setApplySuccess(job.id);
    setTimeout(() => setApplySuccess(null), 3000);
    setSelectedJob(null);
  };

  const handleSave = (e, job) => {
    e.stopPropagation();
    toggleSaveJob(job.id, currentUserEmail);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Opportunities Board</h1>
          <p className="text-gray-500">Discover and apply to TPO-verified roles.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full shadow-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Verified by Placement Cell</span>
        </div>
      </div>

      {applySuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="font-medium">Application routed successfully! Good luck!</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search roles, companies, or tags..."
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 shrink-0 overflow-x-auto pb-2 sm:pb-0">
          {["All", "Full-time", "Summer Internship", "6-Month Internship"].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 text-sm rounded-lg border font-medium transition-all whitespace-nowrap ${
                filterType === type
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

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
                <button onClick={(e) => handleSave(e, selectedJob)} className={`p-2 rounded-full shadow-sm border transition-colors ${selectedJob.savedBy?.includes(currentUserEmail) ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-100"}`}>
                  <Bookmark className={`w-5 h-5 ${selectedJob.savedBy?.includes(currentUserEmail) ? "fill-current tracking-wide" : ""}`} />
                </button>
                <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-900 bg-white p-2 rounded-full shadow-sm border border-gray-100 hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50 space-y-6">
              
              {/* Top Banner Row */}
              <div className="flex flex-wrap gap-3">
                <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${getTypeBadgeColor(selectedJob.type)}`}>{selectedJob.type}</span>
                <span className="text-sm bg-white text-gray-800 px-3 py-1.5 rounded-full border border-gray-200 font-medium flex items-center gap-1.5 shadow-sm">
                  <MapPin className="w-4 h-4 text-gray-400"/> {selectedJob.workMode} {selectedJob.location ? `• ${selectedJob.location}` : ""}
                </span>
                <span className="text-sm bg-indigo-50 text-indigo-800 px-3 py-1.5 rounded-full border border-indigo-100 font-semibold flex items-center gap-1.5 shadow-sm">
                  <DollarSign className="w-4 h-4"/> {selectedJob.salaryCurrency} {selectedJob.salaryAmount} / {selectedJob.salaryType}
                </span>
                <span className={`text-sm px-3 py-1.5 rounded-full border font-medium flex items-center gap-1.5 shadow-sm ${isDeadlinePassed(selectedJob.deadline) ? "bg-red-50 text-red-700 border-red-200" : "bg-white text-gray-800 border-gray-200"}`}>
                  <Calendar className="w-4 h-4 text-gray-400"/> Deadline: {selectedJob.deadline}
                </span>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 
                 {/* Left Column - Core Description */}
                 <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm">
                       <CardContent className="p-6 space-y-5">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg mb-3 block">Role Description</h4>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{selectedJob.description}</p>
                          </div>
                          {selectedJob.rolesAndResponsibilities && (
                            <div className="pt-5 border-t border-gray-100">
                              <h4 className="font-bold text-gray-900 text-lg mb-3 block">Responsibilities</h4>
                              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{selectedJob.rolesAndResponsibilities}</p>
                            </div>
                          )}
                       </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                       <CardContent className="p-6 space-y-5">
                          {selectedJob.requiredSkills && (
                            <div>
                              <h4 className="font-bold text-gray-900 mb-3 text-sm tracking-wide uppercase">Required Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedJob.requiredSkills.split(",").map((s, i) => (
                                  <span key={i} className="bg-gray-100 text-gray-800 border border-gray-200 px-3 py-1 rounded-md text-sm font-medium">{s.trim()}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedJob.preferredSkills && (
                            <div className="pt-4">
                              <h4 className="font-bold text-gray-900 mb-3 text-sm tracking-wide uppercase">Preferred Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedJob.preferredSkills.split(",").map((s, i) => (
                                  <span key={i} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-md text-sm">{s.trim()}</span>
                                ))}
                              </div>
                            </div>
                          )}
                       </CardContent>
                    </Card>
                 </div>

                 {/* Right Column - Stats & Meta */}
                 <div className="space-y-6">
                    {/* Eligibility Alert */}
                    <Card className="border-indigo-100 shadow-sm ring-1 ring-indigo-50 bg-indigo-50/20">
                      <CardContent className="p-5">
                         <h4 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2"><Target className="w-5 h-5"/> Criteria Set</h4>
                         <ul className="text-sm text-indigo-800 space-y-3">
                           <li className="flex justify-between items-center border-b border-indigo-100 pb-2">
                             <span className="text-indigo-600">CGPA</span>
                             <span className="font-bold">{selectedJob.minCgpa}</span>
                           </li>
                           <li className="flex justify-between items-center border-b border-indigo-100 pb-2">
                             <span className="text-indigo-600">Backlogs</span>
                             <span className="font-bold">{selectedJob.backlogs}</span>
                           </li>
                           <li className="flex justify-between items-center border-b border-indigo-100 pb-2">
                             <span className="text-indigo-600">Batch</span>
                             <span className="font-bold">{selectedJob.passingYear}</span>
                           </li>
                           {selectedJob.courses && (
                             <li className="flex flex-col gap-1 border-b border-indigo-100 pb-2">
                               <span className="text-indigo-600 text-xs">Courses</span>
                               <span className="font-bold leading-tight">{selectedJob.courses}</span>
                             </li>
                           )}
                           {selectedJob.branches && (
                             <li className="flex flex-col gap-1">
                               <span className="text-indigo-600 text-xs">Branches</span>
                               <span className="font-bold leading-tight">{selectedJob.branches}</span>
                             </li>
                           )}
                         </ul>
                      </CardContent>
                    </Card>

                    {/* Process & Offer Meta */}
                    <Card className="border-none shadow-sm">
                      <CardContent className="p-5 space-y-5">
                         <div>
                           <h4 className="font-semibold text-gray-900 mb-3 text-sm">Selection Steps</h4>
                           {selectedJob.selectionProcess?.length > 0 ? (
                             <div className="space-y-2">
                                {selectedJob.selectionProcess.map((step, idx) => (
                                  <div key={idx} className="flex gap-3 text-sm text-gray-600 items-start">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0 mt-0.5">{idx+1}</div>
                                    <span className="pt-0.5">{step}</span>
                                  </div>
                                ))}
                             </div>
                           ) : <span className="text-sm text-gray-400">Not specified</span>}
                         </div>

                         {selectedJob.benefits && (
                            <div className="pt-4 border-t border-gray-100">
                               <h4 className="font-semibold text-gray-900 mb-2 text-sm">Benefits Package</h4>
                               <p className="text-sm text-gray-600">{selectedJob.benefits}</p>
                            </div>
                         )}

                         <div className="pt-4 border-t border-gray-100">
                           <h4 className="font-semibold text-gray-900 mb-2 text-sm">Recruiter</h4>
                           <div className="text-sm text-gray-600">
                             <p className="font-medium">{selectedJob.recruiterName}</p>
                             <p>{selectedJob.recruiterEmail}</p>
                           </div>
                         </div>
                      </CardContent>
                    </Card>
                 </div>
              </div>
            </div>

            {/* Modal Action Footer */}
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
                       <span className="flex justify-center items-center gap-2">Apply on Company Portal <ExternalLink className="w-5 h-5"/></span>
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

      {/* Grid of Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.length === 0 ? (
          <div className="xl:col-span-3 text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-700">No matching jobs found</h3>
            <p className="text-gray-500 mt-2">Adjust your filters or come back later.</p>
          </div>
        ) : (
          filteredJobs.map(job => {
            const isApplied = job.applicants?.includes(currentUserEmail);
            const isSaved = job.savedBy?.includes(currentUserEmail);
            const expired = isDeadlinePassed(job.deadline);
            
            return (
              <div key={job.id} onClick={() => setSelectedJob(job)} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col cursor-pointer overflow-hidden">
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
                       <button onClick={(e) => handleSave(e, job)} className={`p-1.5 rounded-full transition-colors ${isSaved ? "text-indigo-600 bg-indigo-50" : "text-gray-300 hover:text-indigo-500 hover:bg-gray-50"}`}>
                         <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                       </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 text-[1.1rem] leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{job.role}</h3>
                  <p className="text-indigo-600 font-medium text-sm mb-4">{job.company}</p>

                  <div className="space-y-2 mt-auto">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> <span className="truncate max-w-[120px]">{job.workMode}</span></div>
                      <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                      <div className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-gray-400" /> {job.salaryAmount}</div>
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
          })
        )}
      </div>
    </div>
  );
}
