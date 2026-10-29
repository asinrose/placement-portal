import React, { useState, useEffect } from "react";
import { useJobs } from "../../context/JobContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { 
  Briefcase, MapPin, DollarSign, Clock, Search, CheckCircle, X, Filter, 
  GraduationCap, Building2, Calendar, Target, AlertCircle, ExternalLink, 
  Bookmark, FileText, Upload, CheckCircle2, XCircle, ShieldCheck, HelpCircle,
  Sparkles, Layers
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function JobBoard() {
  const { jobs, applyForJob, toggleSaveJob } = useJobs();
  const { user } = useAuth();
  const currentUserEmail = user?.email || "";
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [eligibilityFilter, setEligibilityFilter] = useState("All"); // "All" | "Eligible Only"
  const [selectedJob, setSelectedJob] = useState(null);
  const [applySuccess, setApplySuccess] = useState(null);

  // Helper to load fresh student profile from storage / auth
  const loadFreshStudentProfile = () => {
    const userKey = currentUserEmail ? `studentProfileData_${currentUserEmail}` : 'studentProfileData';
    const saved = localStorage.getItem(userKey) || localStorage.getItem('studentProfileData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!currentUserEmail || parsed.email === currentUserEmail || !parsed.email) {
          return {
            ...parsed,
            degree: parsed.degree || user?.degree || "B.Tech",
            course: parsed.course || user?.branch || user?.department || "Data Analytics",
            branch: parsed.course || parsed.branch || "Data Analytics",
            cgpa: parsed.cgpa || user?.cgpa || "7",
            backlogs: parsed.backlogs !== undefined ? parsed.backlogs : (user?.backlogs || "0"),
            resumeFile: parsed.resumeFile || null,
            resumeData: parsed.resumeData || null
          };
        }
      } catch (e) {
        console.error("Error parsing student profile:", e);
      }
    }
    
    // Fallback to active users
    const activeUsers = JSON.parse(localStorage.getItem("nexus_active_users") || "[]");
    const me = activeUsers.find(u => u.email === currentUserEmail);
    
    return {
      degree: me?.degree || user?.degree || "B.Tech",
      cgpa: me?.cgpa || user?.cgpa || "7",
      course: me?.branch || me?.department || user?.branch || "Data Analytics",
      branch: me?.branch || me?.department || user?.branch || "Data Analytics",
      backlogs: me?.backlogs || user?.backlogs || "0",
      resumeFile: null,
      resumeData: null
    };
  };

  const [studentProfile, setStudentProfile] = useState(() => loadFreshStudentProfile());

  // Listen to profile updates live so changes in StudentProfile immediately reflect here
  useEffect(() => {
    const handleUpdate = () => {
      setStudentProfile(loadFreshStudentProfile());
    };

    handleUpdate();

    window.addEventListener('profile_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('profile_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [currentUserEmail, user]);

  const [selectedResume, setSelectedResume] = useState(() => studentProfile?.resumeFile || null);
  const [selectedResumeData, setSelectedResumeData] = useState(() => studentProfile?.resumeData || null);
  const [showUploadResume, setShowUploadResume] = useState(() => !studentProfile?.resumeFile);

  const handleFileUpload = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedResume(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedResumeData(reader.result);
      };
      reader.readAsDataURL(file);
      setShowUploadResume(false);
    }
  };

  const isDeadlinePassed = (deadlineDate) => {
    if (!deadlineDate) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const deadline = new Date(deadlineDate);
    return today > deadline;
  };

  // Comprehensive Automated Eligibility Verification
  const checkEligibility = (job) => {
    const studentCgpa = parseFloat(studentProfile.cgpa) || 0;
    const studentDegree = (studentProfile.degree || "B.Tech").toLowerCase().trim();
    const studentCourse = (studentProfile.course || "Data Analytics").toLowerCase().trim();
    const studentBranch = (studentProfile.branch || studentProfile.course || "Data Analytics").toLowerCase().trim();
    const studentBacklogs = parseInt(studentProfile.backlogs !== undefined ? studentProfile.backlogs : 0);

    const minCgpa = job.minCgpa ? parseFloat(job.minCgpa) : null;
    const maxBacklogs = job.backlogs !== undefined && job.backlogs !== null && job.backlogs !== "" ? parseInt(job.backlogs) : null;

    // 1. CGPA Check
    let cgpaPass = true;
    if (minCgpa !== null && studentCgpa < minCgpa) cgpaPass = false;

    // 2. Backlogs Check
    let backlogsPass = true;
    if (maxBacklogs !== null && studentBacklogs > maxBacklogs) backlogsPass = false;

    // 3. Department / Branch Check
    let branchPass = true;
    if (job.branches && job.branches !== "All" && job.branches !== "All Branches") {
       const reqBranches = job.branches.toLowerCase().split(',').map(b => b.trim());
       branchPass = reqBranches.some(reqBranch => {
         const cleanReq = reqBranch.replace(/[^a-z0-9]/gi, '');
         const cleanBranch = studentBranch.replace(/[^a-z0-9]/gi, '');
         const cleanCourse = studentCourse.replace(/[^a-z0-9]/gi, '');
         return (
           studentBranch.includes(reqBranch) ||
           studentCourse.includes(reqBranch) ||
           cleanBranch.includes(cleanReq) ||
           cleanCourse.includes(cleanReq) ||
           reqBranch.includes(studentBranch) ||
           reqBranch.includes(studentCourse) ||
           (cleanReq.includes("cs") && (cleanBranch.includes("cs") || cleanBranch.includes("data"))) ||
           (cleanReq.includes("data") && (cleanBranch.includes("data") || cleanCourse.includes("data")))
         );
       });
    }

    // 4. Degree / Program / Course Check
    let coursePass = true;
    if (job.courses && job.courses !== "All" && job.courses !== "All Courses") {
       const reqCourses = job.courses.toLowerCase().split(',').map(c => c.trim());
       coursePass = reqCourses.some(reqCourse => {
         const cleanReq = reqCourse.replace(/[^a-z0-9]/gi, '');
         const cleanDegree = studentDegree.replace(/[^a-z0-9]/gi, '');
         const cleanCourse = studentCourse.replace(/[^a-z0-9]/gi, '');
         return (
           studentDegree.includes(reqCourse) ||
           studentCourse.includes(reqCourse) ||
           cleanDegree.includes(cleanReq) ||
           cleanCourse.includes(cleanReq) ||
           (cleanReq === "btech" && (cleanDegree === "btech" || cleanDegree === "be" || cleanCourse.includes("btech"))) ||
           (cleanReq === "bsc" && (cleanDegree === "bsc" || cleanCourse.includes("bsc"))) ||
           (cleanReq === "bca" && (cleanDegree === "bca" || cleanCourse.includes("bca"))) ||
           (cleanReq === "mca" && (cleanDegree === "mca" || cleanCourse.includes("mca"))) ||
           (cleanReq === "mtech" && (cleanDegree === "mtech" || cleanCourse.includes("mtech")))
         );
       });
    }

    const isEligible = (job.visibility === "All students" && !job.autoCheckEligibility) 
      ? true 
      : (cgpaPass && backlogsPass && branchPass && coursePass);

    const unmetReasons = [];
    if (!cgpaPass) unmetReasons.push(`Min CGPA: ${minCgpa} (Yours: ${studentCgpa || "N/A"})`);
    if (!coursePass) unmetReasons.push(`Eligible Courses: ${job.courses} (Yours: ${studentProfile.degree || "Not set"})`);
    if (!branchPass) unmetReasons.push(`Eligible Branches: ${job.branches} (Yours: ${studentProfile.course || "General"})`);
    if (!backlogsPass) unmetReasons.push(`Max Standing Backlogs: ${maxBacklogs} (Yours: ${studentBacklogs})`);

    return {
      isEligible,
      cgpaPass,
      backlogsPass,
      branchPass,
      coursePass,
      studentCgpa,
      studentDegree: studentProfile.degree || "B.Tech",
      studentCourse: studentProfile.course || "Data Analytics",
      studentBranch: studentProfile.branch || studentProfile.course || "Data Analytics",
      studentBacklogs,
      minCgpa,
      maxBacklogs,
      reqBranches: job.branches,
      reqCourses: job.courses,
      unmetReasons
    };
  };

  const [alumniReferrals, setAlumniReferrals] = useState(() => {
    try {
      const saved = localStorage.getItem('alumni_referrals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleOpenReferral = (ref) => {
    const allRefs = JSON.parse(localStorage.getItem('alumni_referrals') || '[]');
    const updated = allRefs.map(r => r.id === ref.id ? { ...r, clicks: (r.clicks || 0) + 1 } : r);
    localStorage.setItem('alumni_referrals', JSON.stringify(updated));
    setAlumniReferrals(updated);
    window.open(ref.url, '_blank', 'noopener,noreferrer');
  };

  const handleApplyReferral = (e, ref) => {
    e.stopPropagation();
    const allRefs = JSON.parse(localStorage.getItem('alumni_referrals') || '[]');
    const updated = allRefs.map(r => {
      if (r.id === ref.id) {
        const apps = r.applicantEmails || [];
        if (!apps.includes(currentUserEmail)) {
          return { ...r, clicks: (r.clicks || 0) + 1, applicants: (r.applicants || 0) + 1, applicantEmails: [...apps, currentUserEmail] };
        } else {
          return { ...r, clicks: (r.clicks || 0) + 1 };
        }
      }
      return r;
    });
    localStorage.setItem('alumni_referrals', JSON.stringify(updated));
    setAlumniReferrals(updated);
    window.open(ref.url, '_blank', 'noopener,noreferrer');
  };

  // Show all Approved jobs, and allow filtering by eligibility
  const approvedJobs = jobs.filter(j => j.status === "Approved" && !isDeadlinePassed(j.deadline));
  
  const filteredJobs = approvedJobs.filter(job => {
    const matchSearch = job.role.toLowerCase().includes(search.toLowerCase()) ||
                        job.company.toLowerCase().includes(search.toLowerCase()) ||
                        (job.requiredSkills || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || job.type === filterType;
    
    // Eligibility filter
    const eligInfo = checkEligibility(job);
    const matchEligibility = eligibilityFilter === "All" || (eligibilityFilter === "Eligible Only" && eligInfo.isEligible);

    return matchSearch && matchType && matchEligibility;
  });

  const filteredReferrals = alumniReferrals.filter(ref => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (ref.role || "").toLowerCase().includes(q) || (ref.company || "").toLowerCase().includes(q);
  });

  const handleApply = (job) => {
    const elig = checkEligibility(job);
    if (!elig.isEligible) {
      alert(`You do not meet the minimum criteria for this position:\n• ${elig.unmetReasons.join('\n• ')}`);
      return;
    }

    if (job.applyMethod === "External link" && job.externalLink) {
       window.open(job.externalLink, '_blank', 'noopener,noreferrer');
       return;
    }

    applyForJob(job.id, currentUserEmail);
    
    // Save the specific resume used for this application in localStorage
    const resumeToSave = selectedResume || studentProfile?.resumeFile || (studentProfile?.fullName ? `${studentProfile.fullName}_Resume.pdf` : "Student_Resume.pdf");
    const resumeDataToSave = selectedResumeData || studentProfile?.resumeData || null;

    localStorage.setItem(`resume_job_${job.id}_${currentUserEmail}`, resumeToSave);
    if (resumeDataToSave) {
      localStorage.setItem(`resume_data_job_${job.id}_${currentUserEmail}`, resumeDataToSave);
    }

    const applicationRecord = {
      jobId: job.id,
      jobRole: job.role,
      company: job.company,
      studentEmail: currentUserEmail,
      resumeFile: resumeToSave,
      resumeData: resumeDataToSave,
      appliedDate: new Date().toISOString().split('T')[0],
      appliedAt: new Date().toISOString(),
      studentProfileSnapshot: studentProfile
    };
    localStorage.setItem(`application_data_${job.id}_${currentUserEmail}`, JSON.stringify(applicationRecord));

    setApplySuccess(job.id);
    setTimeout(() => setApplySuccess(null), 3000);
    setSelectedJob(null);
  };

  const handleSave = (e, job) => {
    e.stopPropagation();
    toggleSaveJob(job.id, currentUserEmail);
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
      {/* Header with Live Synchronized Student Academic Credentials */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Campus Opportunities Board</h1>
          <p className="text-gray-500">Discover and apply to TPO-verified campus placements and internships.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-3.5 py-2 rounded-xl shadow-xs">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>
              <strong>{studentProfile.degree || "B.Tech"}</strong> • <strong>{studentProfile.course || "Data Analytics"}</strong> • CGPA: <strong>{studentProfile.cgpa || "7"}</strong> • Backlogs: <strong>{studentProfile.backlogs !== undefined ? studentProfile.backlogs : "0"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>TPO Verified</span>
          </div>
        </div>
      </div>

      {applySuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="font-medium">Application routed successfully to the recruiter pipeline!</p>
        </div>
      )}

      {/* Filters and Eligibility Mode */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search roles, companies, or tech stack..."
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Eligibility Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 self-start lg:self-auto shrink-0">
          <button
            onClick={() => setEligibilityFilter("All")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              eligibilityFilter === "All"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Roles ({approvedJobs.length})
          </button>
          <button
            onClick={() => setEligibilityFilter("Eligible Only")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              eligibilityFilter === "Eligible Only"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-700 hover:text-emerald-800"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Eligible Only ({approvedJobs.filter(j => checkEligibility(j).isEligible).length})
          </button>
        </div>

        {/* Job Type Pills */}
        <div className="flex gap-2 shrink-0 overflow-x-auto pb-1 lg:pb-0">
          {["All", "Full-time", "Summer Internship", "6-Month Internship", "Alumni Referrals"].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-2 text-xs rounded-xl border font-semibold transition-all whitespace-nowrap ${
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

      {/* Details & Eligibility Verification Modal */}
      {selectedJob && (() => {
        const elig = checkEligibility(selectedJob);
        const isApplied = selectedJob.applicants?.includes(currentUserEmail);
        const expired = isDeadlinePassed(selectedJob.deadline);

        return (
        <div className="fixed inset-0 z-50 flex justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm pt-8 pb-8 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 my-auto border border-gray-100">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gray-50/70 shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center p-2 shadow-sm shrink-0">
                   {(selectedJob.companyLogo && (selectedJob.companyLogo.startsWith("blob:") || selectedJob.companyLogo.startsWith("data:") || selectedJob.companyLogo.startsWith("http"))) ? (
                      <img src={selectedJob.companyLogo} alt="logo" className="w-full h-full object-cover rounded-xl"/>
                   ) : (
                      <img src={`https://ui-avatars.com/api/?name=${selectedJob.company}&background=random&color=fff`} alt="logo" className="w-full h-full object-contain rounded-xl"/>
                   )}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedJob.role}</h2>
                    {elig.isEligible ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Eligible to Apply
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Criteria Not Met
                      </span>
                    )}
                  </div>
                  <p className="text-base text-indigo-700 font-semibold mt-1">{selectedJob.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => handleSave(e, selectedJob)} className={`p-2 rounded-xl shadow-sm border transition-colors ${selectedJob.savedBy?.includes(currentUserEmail) ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-100"}`}>
                  <Bookmark className={`w-5 h-5 ${selectedJob.savedBy?.includes(currentUserEmail) ? "fill-current" : ""}`} />
                </button>
                <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-900 bg-white p-2 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 space-y-6">
              
              {/* Top Banner Row */}
              <div className="flex flex-wrap gap-2.5">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${getTypeBadgeColor(selectedJob.type)}`}>{selectedJob.type}</span>
                <span className="text-xs bg-white text-gray-800 px-3 py-1.5 rounded-xl border border-gray-200 font-semibold flex items-center gap-1.5 shadow-xs">
                  <MapPin className="w-3.5 h-3.5 text-gray-400"/> {selectedJob.workMode} {selectedJob.location ? `• ${selectedJob.location}` : ""}
                </span>
                <span className="text-xs bg-indigo-50 text-indigo-800 px-3 py-1.5 rounded-xl border border-indigo-100 font-bold flex items-center gap-1.5 shadow-xs">
                  {selectedJob.salaryCurrency} {selectedJob.salaryAmount} / {selectedJob.salaryType}
                </span>
                <span className={`text-xs px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 shadow-xs ${expired ? "bg-red-50 text-red-700 border-red-200" : "bg-white text-gray-800 border-gray-200"}`}>
                  <Calendar className="w-3.5 h-3.5 text-gray-400"/> Deadline: {selectedJob.deadline}
                </span>
              </div>

              {/* AUTOMATED ELIGIBILITY CHECKLIST BOX */}
              <div className={`p-5 rounded-2xl border ${
                elig.isEligible 
                  ? "bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border-emerald-200" 
                  : "bg-gradient-to-br from-rose-50/70 to-amber-50/40 border-rose-200"
              } space-y-4 shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${elig.isEligible ? "text-emerald-600" : "text-rose-600"}`} />
                    <h4 className="font-extrabold text-sm text-gray-900">
                      Automated Eligibility Verification
                    </h4>
                  </div>
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    elig.isEligible 
                      ? "bg-emerald-600 text-white shadow-xs" 
                      : "bg-rose-600 text-white shadow-xs"
                  }`}>
                    {elig.isEligible ? "Passed All Criteria" : "Criteria Shortfall"}
                  </span>
                </div>

                {/* Itemized Criteria Checklist - 4 Dedicated Dimensions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* 1. CGPA Check */}
                  <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-xs flex items-start gap-2.5">
                    {elig.cgpaPass ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Min. CGPA Cutoff</span>
                      <p className="text-xs font-bold text-gray-900 mt-0.5">
                        Required: {selectedJob.minCgpa || "None"}
                      </p>
                      <p className={`text-[11px] font-semibold mt-0.5 ${elig.cgpaPass ? "text-emerald-700" : "text-rose-600"}`}>
                        Your CGPA: {elig.studentCgpa} {elig.cgpaPass ? "✓" : "✗"}
                      </p>
                    </div>
                  </div>

                  {/* 2. Degree / Program Check */}
                  <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-xs flex items-start gap-2.5">
                    {elig.coursePass ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Degree / Program</span>
                      <p className="text-xs font-bold text-gray-900 mt-0.5 truncate max-w-[140px]" title={selectedJob.courses || "All Degrees"}>
                        {selectedJob.courses || "All Degrees"}
                      </p>
                      <p className={`text-[11px] font-semibold mt-0.5 ${elig.coursePass ? "text-emerald-700" : "text-rose-600"}`}>
                        Your Degree: {elig.studentDegree} {elig.coursePass ? "✓" : "✗"}
                      </p>
                    </div>
                  </div>

                  {/* 3. Department / Branch Check */}
                  <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-xs flex items-start gap-2.5">
                    {elig.branchPass ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Department / Branch</span>
                      <p className="text-xs font-bold text-gray-900 mt-0.5 truncate max-w-[140px]" title={selectedJob.branches || "All"}>
                        {selectedJob.branches || "All Branches"}
                      </p>
                      <p className={`text-[11px] font-semibold mt-0.5 ${elig.branchPass ? "text-emerald-700" : "text-rose-600"}`}>
                        Your Branch: {elig.studentBranch} {elig.branchPass ? "✓" : "✗"}
                      </p>
                    </div>
                  </div>

                  {/* 4. Backlogs Check */}
                  <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-xs flex items-start gap-2.5">
                    {elig.backlogsPass ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Max Standing Backlogs</span>
                      <p className="text-xs font-bold text-gray-900 mt-0.5">
                        Allowed: {selectedJob.backlogs !== undefined ? selectedJob.backlogs : "0"}
                      </p>
                      <p className={`text-[11px] font-semibold mt-0.5 ${elig.backlogsPass ? "text-emerald-700" : "text-rose-600"}`}>
                        Your Backlogs: {elig.studentBacklogs} {elig.backlogsPass ? "✓" : "✗"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Overall Verdict Note */}
                <p className={`text-xs font-medium leading-relaxed ${
                  elig.isEligible ? "text-emerald-900" : "text-rose-900"
                }`}>
                  {elig.isEligible 
                    ? "✓ Your academic credentials satisfy all eligibility cutoffs mandated by the employer for this campus drive. You may proceed to submit your application below."
                    : `⚠️ Ineligible: You do not satisfy the employer's minimum thresholds: ${elig.unmetReasons.join(", ")}.`
                  }
                </p>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 
                 {/* Left Column - Core Description */}
                 <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm">
                       <CardContent className="p-6 space-y-5">
                          <div>
                            <h4 className="font-bold text-gray-900 text-base mb-2.5 block">Role Description</h4>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{selectedJob.description}</p>
                          </div>
                          {selectedJob.rolesAndResponsibilities && (
                            <div className="pt-5 border-t border-gray-100">
                              <h4 className="font-bold text-gray-900 text-base mb-2.5 block">Responsibilities</h4>
                              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{selectedJob.rolesAndResponsibilities}</p>
                            </div>
                          )}
                       </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                       <CardContent className="p-6 space-y-4">
                          {selectedJob.requiredSkills && (
                            <div>
                              <h4 className="font-bold text-gray-900 mb-2.5 text-xs tracking-wider uppercase">Required Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedJob.requiredSkills.split(",").map((s, i) => (
                                  <span key={i} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-lg text-xs font-semibold">{s.trim()}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedJob.preferredSkills && (
                            <div className="pt-3">
                              <h4 className="font-bold text-gray-900 mb-2.5 text-xs tracking-wider uppercase">Preferred Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedJob.preferredSkills.split(",").map((s, i) => (
                                  <span key={i} className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-lg text-xs font-medium">{s.trim()}</span>
                                ))}
                              </div>
                            </div>
                          )}
                       </CardContent>
                    </Card>
                 </div>

                 {/* Right Column - Steps & Meta */}
                 <div className="space-y-6">
                    <Card className="border-none shadow-sm">
                      <CardContent className="p-5 space-y-5">
                         <div>
                           <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider">Selection Rounds</h4>
                           {selectedJob.selectionProcess?.length > 0 ? (
                             <div className="space-y-2">
                                {selectedJob.selectionProcess.map((step, idx) => (
                                  <div key={idx} className="flex gap-2.5 text-xs text-gray-700 items-start">
                                    <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-700 shrink-0 mt-0.5">{idx+1}</div>
                                    <span className="pt-0.5 font-medium">{step}</span>
                                  </div>
                                ))}
                             </div>
                           ) : <span className="text-xs text-gray-400">Standard campus rounds</span>}
                         </div>

                         {selectedJob.benefits && (
                            <div className="pt-4 border-t border-gray-100">
                               <h4 className="font-semibold text-gray-900 mb-1 text-xs uppercase tracking-wider">Benefits Package</h4>
                               <p className="text-xs text-gray-600">{selectedJob.benefits}</p>
                            </div>
                         )}

                         <div className="pt-4 border-t border-gray-100">
                           <h4 className="font-semibold text-gray-900 mb-1 text-xs uppercase tracking-wider">Recruiter Details</h4>
                           <div className="text-xs text-gray-600">
                             <p className="font-bold text-gray-800">{selectedJob.recruiterName || "Campus Recruiter"}</p>
                             <p className="text-gray-500">{selectedJob.recruiterEmail || selectedJob.postedBy}</p>
                           </div>
                         </div>
                      </CardContent>
                    </Card>
                 </div>
              </div>
            </div>

            {/* Modal Action Footer */}
             <div className="p-6 border-t border-gray-200 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
               {expired ? (
                 <div className="sm:col-span-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-center gap-2">
                   <AlertCircle className="w-5 h-5"/> 
                   <span className="font-semibold tracking-wide">APPLICATION DEADLINE HAS PASSED</span>
                 </div>
               ) : (
                 <>
                   <div className="sm:col-span-2 mb-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                     <h4 className="font-semibold text-gray-900 text-xs mb-1">Custom Resume <span className="text-gray-500 font-normal">(Optional)</span></h4>
                     <p className="text-xs text-gray-500 mb-3">Attach a targeted resume or use your verified ATS profile snapshot</p>
                     
                     {!showUploadResume && selectedResume ? (
                       <div className="flex items-center justify-between bg-white border border-gray-200 p-2.5 rounded-xl shadow-xs max-w-md">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0">
                             PDF
                           </div>
                           <div className="flex flex-col truncate">
                             <span className="text-xs font-bold text-gray-900 truncate">{selectedResume}</span>
                             <span className="text-[10px] text-gray-400">Attached Profile Resume</span>
                           </div>
                         </div>
                         <button onClick={() => { setShowUploadResume(true); setSelectedResume(null); }} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors shrink-0">
                           <X className="w-4 h-4"/>
                         </button>
                       </div>
                     ) : (
                       <div className="max-w-md">
                         <div className="relative border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50/50 transition-colors flex justify-center items-center h-14 cursor-pointer overflow-hidden">
                           <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                           <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs">
                             <Upload className="w-4 h-4" /> Upload customized resume
                           </div>
                         </div>
                       </div>
                     )}
                   </div>

                   <Button variant="outline" className="w-full text-sm py-5" onClick={() => setSelectedJob(null)}>Cancel</Button>
                   
                   {/* Gated Application Submission Button */}
                   {!elig.isEligible ? (
                     <Button
                       disabled={true}
                       className="w-full text-sm py-5 bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed font-bold"
                     >
                       <XCircle className="w-4 h-4 mr-2 text-rose-500" />
                       Ineligible to Apply (Criteria Shortfall)
                     </Button>
                   ) : (
                     <Button
                       className={`w-full text-sm py-5 shadow-md font-bold transition-all ${
                         isApplied 
                           ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200" 
                           : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200"
                       }`}
                       onClick={() => handleApply(selectedJob)}
                       disabled={isApplied}
                     >
                       {isApplied ? (
                         <span className="flex justify-center items-center gap-2">Application Already Submitted <CheckCircle className="w-4 h-4"/></span>
                       ) : selectedJob.applyMethod === "External link" ? (
                         <span className="flex justify-center items-center gap-2">Apply on Company Portal <ExternalLink className="w-4 h-4"/></span>
                       ) : (
                         "Submit Application Now"
                       )}
                     </Button>
                   )}
                 </>
               )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* Grid of Jobs & Referrals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filterType === "Alumni Referrals" ? (
          filteredReferrals.length === 0 ? (
            <div className="xl:col-span-3 text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-700">No active alumni referrals</h3>
              <p className="text-gray-500 mt-1">Alumni will post open roles from their companies here.</p>
            </div>
          ) : (
            filteredReferrals.map(ref => {
              const isApplied = (ref.applicantEmails || []).includes(currentUserEmail);
              return (
                <div key={ref.id} className="group bg-white rounded-2xl border border-indigo-100/70 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col overflow-hidden">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center p-2 text-indigo-600 font-bold shadow-xs">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                          ⚡ Alumni Referral
                        </span>
                        {isApplied && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Applied
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{ref.role}</h3>
                    <p className="text-indigo-600 font-semibold text-sm mb-2">{ref.company}</p>
                    <p className="text-xs text-gray-500 font-medium mb-4">
                      Referred by: <strong className="text-gray-800">{ref.alumniName || "Alumni"}</strong> • {ref.date}
                    </p>

                    {ref.description && (
                      <p className="text-xs text-gray-600 mb-4 line-clamp-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        {ref.description}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-gray-400 font-medium">Direct Company Link</span>
                      <Button 
                        size="sm" 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs gap-1.5 shadow-sm shadow-indigo-200"
                        onClick={(e) => handleApplyReferral(e, ref)}
                      >
                        Apply via Referral <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : filteredJobs.length === 0 ? (
          <div className="xl:col-span-3 text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-700">No matching jobs found</h3>
            <p className="text-gray-500 mt-2">Adjust your filters or eligibility selection.</p>
          </div>
        ) : (
          filteredJobs.map(job => {
            const isApplied = job.applicants?.includes(currentUserEmail);
            const isSaved = job.savedBy?.includes(currentUserEmail);
            const expired = isDeadlinePassed(job.deadline);
            const elig = checkEligibility(job);
            
            return (
              <div 
                key={job.id} 
                onClick={() => setSelectedJob(job)} 
                className={`group bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer overflow-hidden ${
                  elig.isEligible ? "border-gray-100 hover:border-emerald-300" : "border-gray-200/70 hover:border-amber-300 opacity-95"
                }`}
              >
                <div className="p-6 flex-1 flex flex-col relative">
                  
                  {expired && (
                    <div className="absolute top-0 right-0 bg-red-100 text-red-800 text-[10px] font-bold px-3 py-1 uppercase rounded-bl-lg">Closed</div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-2xl border border-gray-100 flex items-center justify-center p-2 shadow-sm bg-white group-hover:scale-105 transition-transform">
                      {(job.companyLogo && (job.companyLogo.startsWith("blob:") || job.companyLogo.startsWith("data:") || job.companyLogo.startsWith("http"))) ? (
                          <img src={job.companyLogo} alt="logo" className="w-full h-full object-cover rounded-xl"/>
                      ) : (
                          <img src={`https://ui-avatars.com/api/?name=${job.company}&background=random&color=fff`} alt="logo" className="w-full h-full object-contain rounded-xl"/>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       {isApplied && (
                         <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
                           <CheckCircle className="w-3 h-3"/> Applied
                         </span>
                       )}
                       <button onClick={(e) => handleSave(e, job)} className={`p-1.5 rounded-full transition-colors ${isSaved ? "text-indigo-600 bg-indigo-50" : "text-gray-300 hover:text-indigo-500 hover:bg-gray-50"}`}>
                         <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                       </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 text-[1.1rem] leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{job.role}</h3>
                  <p className="text-indigo-600 font-semibold text-sm mb-3">{job.company}</p>

                  {/* VISUAL ELIGIBILITY BADGE ON CARD */}
                  <div className="mb-4">
                    {elig.isEligible ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Eligible to Apply
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          Criteria Shortfall
                        </span>
                        <p className="text-[10px] text-gray-500 line-clamp-1">
                          {elig.unmetReasons[0]}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mt-auto">
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> <span className="truncate max-w-[110px]">{job.workMode}</span></div>
                      <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                      <div className="flex items-center gap-1.5 font-bold text-gray-800">
                        <span>{job.salaryCurrency}</span> {job.salaryAmount} <span className="text-[10px] font-normal text-gray-400 uppercase">{job.salaryType}</span>
                      </div>
                    </div>
                  </div>

                  {job.requiredSkills && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                      {job.requiredSkills.split(",").slice(0,3).map((s, i) => (
                        <span key={i} className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{s.trim()}</span>
                      ))}
                      {job.requiredSkills.split(",").length > 3 && <span className="text-[10px] font-semibold bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded-md">+{job.requiredSkills.split(",").length - 3}</span>}
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