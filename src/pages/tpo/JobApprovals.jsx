import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { 
  Search, Briefcase, FileText, X, Eye, Building2, MapPin, 
  DollarSign, Calendar, GraduationCap, User, Mail, Phone, 
  Clock, CheckCircle2, ListChecks, Award, Globe, ExternalLink, 
  ShieldCheck, Check, Sparkles, AlertCircle
} from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useJobs } from "../../context/JobContext";

export default function JobApprovals() {
  const { jobs, approveJob, rejectJob } = useJobs();

  const [searchQuery, setSearchQuery] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = (id) => {
    approveJob(id);
    if (selectedJob && selectedJob.id === id) {
      setSelectedJob(prev => prev ? { ...prev, status: "Approved" } : null);
    }
  };

  const openDetailsModal = (job) => {
    setSelectedJob(job);
    setDetailsModalOpen(true);
  };

  const openRejectModal = (job) => {
    setSelectedJob(job);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) return;
    rejectJob(selectedJob.id, rejectReason);
    setRejectModalOpen(false);
    if (detailsModalOpen) {
      setSelectedJob(prev => prev ? { ...prev, status: "Rejected", rejectReason } : null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const roleMatch = (job.role || "").toLowerCase().includes(q);
    const companyMatch = (job.company || "").toLowerCase().includes(q);
    const typeMatch = (job.type || "").toLowerCase().includes(q);
    const locationMatch = (job.location || "").toLowerCase().includes(q);
    const statusMatch = (job.status || "").toLowerCase().includes(q);
    return roleMatch || companyMatch || typeMatch || locationMatch || statusMatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Job Approvals</h1>
          <p className="text-gray-500">Review and vet incoming job postings from recruiters and alumni.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64 sm:w-80">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
             <Input 
               type="text" 
               placeholder="Search roles, companies, status..." 
               className="pl-9 pr-8 bg-white" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             {searchQuery && (
               <button 
                 onClick={() => setSearchQuery("")}
                 className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100"
               >
                 <X className="w-4 h-4" />
               </button>
             )}
          </div>
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
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      {searchQuery ? (
                        <div>
                          <p className="font-medium text-gray-700">No jobs match "{searchQuery}"</p>
                          <p className="text-xs text-gray-400 mt-1">Try searching with a different keyword or company name</p>
                        </div>
                      ) : (
                        "No job postings available."
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform overflow-hidden shrink-0 border border-indigo-100/50">
                              {job.companyLogo ? (
                                <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain" />
                              ) : (
                                <Briefcase className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{job.role}</p>
                              <p className="text-gray-500 text-xs mt-0.5">{job.company}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {job.salaryAmount ? `${job.salaryCurrency || "₹"}${job.salaryAmount} (${job.salaryType || "CTC"})` : (job.ctc || "N/A")}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          {job.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{job.date}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 border-indigo-200 gap-1.5"
                            onClick={() => openDetailsModal(job)}
                          >
                            <Eye className="w-3.5 h-3.5" /> Read More
                          </Button>

                          {job.status === "Pending" ? (
                            <>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-white border-red-200 hover:bg-red-600 hover:border-red-600" onClick={() => openRejectModal(job)}>
                                Reject
                              </Button>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200" onClick={() => handleApprove(job.id)}>
                                Approve
                              </Button>
                            </>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${job.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {job.status}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FULL JOB REQUISITION DETAILS MODAL (READ MORE) */}
      {detailsModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/70 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center justify-center text-indigo-600 font-bold overflow-hidden shrink-0">
                  {selectedJob.companyLogo ? (
                    <img src={selectedJob.companyLogo} alt={selectedJob.company} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Building2 className="w-7 h-7 text-indigo-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-900">{selectedJob.role}</h2>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      selectedJob.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      selectedJob.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {selectedJob.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mt-1">
                    <span>{selectedJob.company}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {selectedJob.location || "Location not specified"}</span>
                    <span>•</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold text-gray-700">{selectedJob.workMode || "Onsite"}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-800">
              
              {/* Section 1: Quick Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-indigo-50/50 border border-indigo-100/80 rounded-xl p-3.5">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5"/> Compensation
                  </p>
                  <p className="text-base font-bold text-gray-900 mt-1">
                    {selectedJob.salaryAmount ? `${selectedJob.salaryCurrency || "₹"}${selectedJob.salaryAmount}` : "Not Disclosed"}
                  </p>
                  <p className="text-[11px] text-gray-500">{selectedJob.salaryType || "CTC"}</p>
                </div>

                <div className="bg-blue-50/50 border border-blue-100/80 rounded-xl p-3.5">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5"/> Job Type & Mode
                  </p>
                  <p className="text-base font-bold text-gray-900 mt-1">
                    {selectedJob.type || "Full-time"}
                  </p>
                  <p className="text-[11px] text-gray-500">{selectedJob.workMode || "Onsite"}</p>
                </div>

                <div className="bg-amber-50/50 border border-amber-100/80 rounded-xl p-3.5">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5"/> Deadline
                  </p>
                  <p className="text-base font-bold text-gray-900 mt-1">
                    {selectedJob.deadline || "Open"}
                  </p>
                  <p className="text-[11px] text-gray-500">Vacancies: {selectedJob.vacancies || "Open"}</p>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-3.5">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5"/> Min. CGPA
                  </p>
                  <p className="text-base font-bold text-gray-900 mt-1">
                    {selectedJob.minCgpa ? `${selectedJob.minCgpa} CGPA` : "No Cutoff"}
                  </p>
                  <p className="text-[11px] text-gray-500">Max Backlogs: {selectedJob.backlogs || "0"}</p>
                </div>
              </div>

              {/* Section 2: Eligibility & Target Audience */}
              <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-5 space-y-3">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600"/> Candidate Eligibility Criteria
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-xs font-medium text-gray-500 block">Eligible Courses:</span>
                    <span className="font-semibold text-gray-800">{selectedJob.courses || "All Courses"}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 block">Eligible Branches:</span>
                    <span className="font-semibold text-gray-800">{selectedJob.branches || "All Branches"}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 block">Batch / Passing Year:</span>
                    <span className="font-semibold text-gray-800">{selectedJob.passingYear || "Any Batch"}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 block">Target Audience:</span>
                    <span className="font-semibold text-gray-800">{selectedJob.visibility || "All students"}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 block">Auto-Check Eligibility:</span>
                    <span className="font-semibold text-gray-800">{selectedJob.autoCheckEligibility ? "Yes (Enforced)" : "No"}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 block">Application Method:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedJob.applyMethod === "External link" && selectedJob.externalLink ? (
                        <a href={selectedJob.externalLink} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                          External Link <ExternalLink className="w-3 h-3"/>
                        </a>
                      ) : (
                        "Placement Portal"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Skills & Selection Rounds */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="border border-gray-200/80 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500"/> Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.requiredSkills ? (
                      selectedJob.requiredSkills.split(',').map((skill, idx) => (
                        <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs px-2.5 py-1 rounded-md font-medium">
                          {skill.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">None specified</span>
                    )}
                  </div>

                  {selectedJob.preferredSkills && (
                    <>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 pt-2 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-blue-500"/> Preferred / Nice to have
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedJob.preferredSkills.split(',').map((skill, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 border border-gray-200 text-xs px-2.5 py-1 rounded-md font-medium">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="border border-gray-200/80 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <ListChecks className="w-3.5 h-3.5 text-emerald-500"/> Selection Rounds
                  </h4>
                  <div className="space-y-2">
                    {selectedJob.selectionProcess && selectedJob.selectionProcess.length > 0 ? (
                      selectedJob.selectionProcess.map((round, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span>{round}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">Standard campus recruitment process</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 4: Full Job Description & Responsibilities */}
              <div className="border border-gray-200/80 rounded-xl p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 mb-1.5 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500"/> Job Description
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                    {selectedJob.description || "No description provided."}
                  </p>
                </div>

                {selectedJob.rolesAndResponsibilities && (
                  <div className="pt-3 border-t border-gray-100">
                    <h4 className="font-bold text-sm text-gray-900 mb-1.5">Roles & Responsibilities</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                      {selectedJob.rolesAndResponsibilities}
                    </p>
                  </div>
                )}

                {selectedJob.benefits && (
                  <div className="pt-3 border-t border-gray-100">
                    <h4 className="font-bold text-sm text-gray-900 mb-1.5">Perks & Additional Benefits</h4>
                    <p className="text-sm text-gray-600">{selectedJob.benefits}</p>
                  </div>
                )}
              </div>

              {/* Section 5: Recruiter & Origin Contact Details */}
              <div className="bg-indigo-50/40 border border-indigo-100/70 rounded-xl p-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-900 mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5"/> Requisition Initiator Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 block">Recruiter Name:</span>
                    <span className="font-semibold text-gray-800">{selectedJob.recruiterName || "Not Provided"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Recruiter Email:</span>
                    <span className="font-semibold text-gray-800">{selectedJob.recruiterEmail || selectedJob.postedBy || "Not Provided"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Recruiter Phone:</span>
                    <span className="font-semibold text-gray-800">{selectedJob.recruiterPhone || "Not Provided"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Posted By Account:</span>
                    <span className="font-semibold text-gray-800">{selectedJob.postedBy || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Date Submitted:</span>
                    <span className="font-semibold text-gray-800">{selectedJob.date || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Rejection notice if previously rejected */}
              {selectedJob.status === "Rejected" && selectedJob.rejectReason && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3.5 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Rejection Feedback:</span>
                    <span>{selectedJob.rejectReason}</span>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-400">Requisition ID: #{selectedJob.id}</span>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
                  Close
                </Button>
                {selectedJob.status === "Pending" && (
                  <>
                    <Button 
                      variant="outline" 
                      className="text-red-600 hover:text-white border-red-200 hover:bg-red-600 hover:border-red-600"
                      onClick={() => openRejectModal(selectedJob)}
                    >
                      Reject Posting
                    </Button>
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 gap-1.5"
                      onClick={() => {
                        handleApprove(selectedJob.id);
                        setDetailsModalOpen(false);
                      }}
                    >
                      <Check className="w-4 h-4"/> Approve Requisition
                    </Button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

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
