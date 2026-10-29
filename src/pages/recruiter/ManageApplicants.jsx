import React, { useState } from "react";
import { 
  Search, MoreHorizontal, User, FileText, CheckCircle, Clock, X, 
  Mail, Phone, GraduationCap, Briefcase, Download, Eye, ExternalLink, 
  Printer, Building2, Calendar, Sparkles, Check, Layers, Award, FileCode,
  Video, MapPin, Link as LinkIcon, Send, AlertCircle, CheckCircle2,
  CalendarPlus, MessageSquare, Copy, Star, ThumbsUp, DollarSign,
  FileCheck, ShieldCheck, PartyPopper, CheckSquare, Edit3
} from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useJobs } from "../../context/JobContext";
import { useAuth } from "../../context/AuthContext";
import { 
  downloadBase64File, 
  openResumeInNewTab, 
  downloadAtsResume, 
  printAtsResume, 
  getAtsResumeDataUrl 
} from "../../utils/resumeHelper";

export default function ManageApplicants() {
  const { jobs } = useJobs();
  const { user } = useAuth();
  const [activeJobFilter, setActiveJobFilter] = useState("All Jobs");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [previewApplicant, setPreviewApplicant] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  // State for Interview Scheduling Modal
  const [schedulingApplicant, setSchedulingApplicant] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    roundName: "Technical Round 1",
    customRoundName: "",
    date: "",
    time: "11:00",
    duration: "45 mins",
    mode: "Google Meet",
    meetingLink: "",
    venue: "Placement Cell - Interview Room 204",
    interviewerName: user?.name || "Hiring Manager",
    interviewerRole: user?.role === "ALUMNI" ? "Alumni Technical Lead" : "Engineering Recruiter",
    instructions: "Please join 5 minutes before scheduled time with a stable internet connection, webcam turned on, and your code editor ready."
  });

  // State for Interview Evaluation / Scorecard Modal
  const [evaluatingApplicant, setEvaluatingApplicant] = useState(null);
  const [evaluationForm, setEvaluationForm] = useState({
    technicalScore: 4,
    problemSolvingScore: 4,
    domainScore: 4,
    communicationScore: 4,
    recommendation: "Hire",
    strengths: "",
    areasForImprovement: "",
    notes: ""
  });

  // State for Offer Letter Generation & Preview Modal
  const [releasingOfferApplicant, setReleasingOfferApplicant] = useState(null);
  const [previewOffer, setPreviewOffer] = useState(null);
  const [offerForm, setOfferForm] = useState({
    ctc: "12.0",
    baseSalary: "9.5 LPA",
    bonus: "1.5 LPA Performance Bonus",
    stocks: "1.0 LPA (ESOPs)",
    designation: "",
    workLocation: "Bangalore / Hybrid",
    joiningDate: "",
    acceptanceDeadline: "",
    terms: "This offer is contingent upon successful completion of your undergraduate degree with minimum 7.0 CGPA and no active backlogs at the time of joining.",
    welcomeMessage: "We were very impressed by your interview evaluations and problem-solving abilities! We are thrilled to welcome you to our team."
  });

  const appStatuses = JSON.parse(localStorage.getItem('student_application_statuses') || '{}');
  const activeUsers = JSON.parse(localStorage.getItem('nexus_active_users') || '[]');
  const pendingUsers = JSON.parse(localStorage.getItem('nexus_pending_requests') || '[]');
  const scheduledInterviews = JSON.parse(localStorage.getItem('scheduled_job_interviews') || '[]');
  const candidateEvaluations = JSON.parse(localStorage.getItem('candidate_evaluations') || '[]');
  const studentOffers = JSON.parse(localStorage.getItem('student_job_offers') || '[]');
  
  // Only show jobs posted by current recruiter/alumni unless admin/TPO
  const relevantJobs = (user?.role === "RECRUITER" || user?.role === "ALUMNI")
    ? jobs.filter(j => j.postedBy === user?.email)
    : jobs;

  const allApplicants = relevantJobs.flatMap(job => {
    return (job.applicants || []).map((email) => {
      // 1. Check for specific application record
      const appRecordRaw = localStorage.getItem(`application_data_${job.id}_${email}`);
      const appRecord = appRecordRaw ? JSON.parse(appRecordRaw) : null;

      // 2. Check for specific resume attached to this job
      const specificResumeName = localStorage.getItem(`resume_job_${job.id}_${email}`);
      const specificResumeData = localStorage.getItem(`resume_data_job_${job.id}_${email}`);

      // 3. Check for student profile
      const profileKey = `studentProfileData_${email}`;
      const studentProfile = JSON.parse(localStorage.getItem(profileKey) || 'null')
        || (JSON.parse(localStorage.getItem('studentProfileData') || 'null')?.email === email 
            ? JSON.parse(localStorage.getItem('studentProfileData')) 
            : null);

      // 4. Check registered users
      const regUser = activeUsers.find(u => u.email === email) || pendingUsers.find(u => u.email === email);

      let name = email.split('@')[0];
      if (appRecord?.studentProfileSnapshot?.fullName) {
        name = appRecord.studentProfileSnapshot.fullName;
      } else if (studentProfile?.fullName) {
        name = studentProfile.fullName;
      } else if (regUser?.name) {
        name = regUser.name;
      }

      const cgpa = appRecord?.studentProfileSnapshot?.cgpa 
        || studentProfile?.cgpa 
        || regUser?.cgpa 
        || "N/A";

      const tags = (appRecord?.studentProfileSnapshot?.skills?.length ? appRecord.studentProfileSnapshot.skills : null)
        || (studentProfile?.skills?.length ? studentProfile.skills : null)
        || (regUser?.skills?.length ? regUser.skills : [])
        || ["Technical Skills"];

      const status = appStatuses[`${job.role}_${email}`] || "Applied";

      const phone = appRecord?.studentProfileSnapshot?.phone 
        || studentProfile?.phone 
        || regUser?.phone 
        || "N/A";

      const course = appRecord?.studentProfileSnapshot?.course 
        || studentProfile?.course 
        || regUser?.department 
        || regUser?.branch 
        || "Computer Science";

      const college = appRecord?.studentProfileSnapshot?.college 
        || studentProfile?.college 
        || "University Institute";

      const resumeFile = appRecord?.resumeFile 
        || specificResumeName 
        || studentProfile?.resumeFile 
        || `${name.replace(/\s+/g, '_')}_Resume.pdf`;

      const resumeData = appRecord?.resumeData 
        || specificResumeData 
        || studentProfile?.resumeData 
        || null;

      const profilePicture = studentProfile?.profilePicture || regUser?.profilePicture || null;

      const fullProfile = appRecord?.studentProfileSnapshot || studentProfile || {
        fullName: name,
        email: email,
        phone: phone,
        course: course,
        college: college,
        cgpa: cgpa,
        skills: tags,
        projects: [],
        experience: [],
        certifications: []
      };

      // Check if interview is scheduled for this applicant
      const interview = scheduledInterviews.find(i => i.jobId === job.id && i.applicantEmail === email);
      
      // Check if scorecard/evaluation exists
      const evaluation = candidateEvaluations.find(e => e.jobId === job.id && e.applicantEmail === email);

      // Check if official offer exists
      const offer = studentOffers.find(o => o.jobId === job.id && o.applicantEmail === email);

      return {
        id: `${job.id}_${email}`,
        jobId: job.id,
        jobRole: job.role,
        company: job.company,
        email: email,
        name: name,
        cgpa: cgpa,
        tags: tags,
        status: status,
        phone: phone,
        course: course,
        college: college,
        resumeFile: resumeFile,
        resumeData: resumeData,
        hasUploadedData: Boolean(resumeData),
        profilePicture: profilePicture,
        fullProfile: fullProfile,
        appliedDate: appRecord?.appliedDate || job.date || "Recent",
        interview: interview,
        evaluation: evaluation,
        offer: offer
      };
    });
  });

  const filteredApplicants = allApplicants
    .filter(app => activeJobFilter === "All Jobs" || app.jobRole === activeJobFilter)
    .filter(app => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (app.name || "").toLowerCase().includes(q) ||
        (app.email || "").toLowerCase().includes(q) ||
        (app.jobRole || "").toLowerCase().includes(q)
      );
    });

  const uniqueJobRoles = ["All Jobs", ...new Set(relevantJobs.map(j => j.role))];

  const stages = ["Applied", "Shortlisted", "Interviewing", "Offered"];

  const moveApplicant = (app, newStatus) => {
    // If moving to offered, open the offer generator modal
    if (newStatus === "Offered") {
      handleOpenReleaseOfferModal(app);
      setOpenDropdownId(null);
      return;
    }

    const currentStatuses = JSON.parse(localStorage.getItem('student_application_statuses') || '{}');
    currentStatuses[`${app.jobRole}_${app.email}`] = newStatus;
    localStorage.setItem('student_application_statuses', JSON.stringify(currentStatuses));

    const notifications = JSON.parse(localStorage.getItem('student_notifications') || '[]');
    const newNotification = {
      id: Date.now(),
      message: `Your application for ${app.jobRole} at ${app.company} has been moved to ${newStatus}!`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      read: false
    };
    localStorage.setItem('student_notifications', JSON.stringify([newNotification, ...notifications]));
    window.dispatchEvent(new Event('notifications_updated'));
    
    setOpenDropdownId(null);
    setRefreshCounter(prev => prev + 1);
  };

  const stageStyle = (stage) => {
    switch(stage) {
      case "Applied": return "bg-gray-100 border-gray-200 text-gray-700";
      case "Shortlisted": return "bg-blue-50 border-blue-200 text-blue-700";
      case "Interviewing": return "bg-amber-50 border-amber-200 text-amber-700";
      case "Offered": return "bg-emerald-50 border-emerald-200 text-emerald-700";
      default: return "";
    }
  };

  const handleDownloadResume = (applicant) => {
    const rawName = applicant.name || "Applicant";
    const filename = applicant.resumeFile?.endsWith('.pdf') 
      ? applicant.resumeFile 
      : `${rawName.replace(/\s+/g, '_')}_Resume.pdf`;

    if (applicant.resumeData) {
      downloadBase64File(applicant.resumeData, filename);
    } else {
      downloadAtsResume(applicant.fullProfile, filename);
    }
  };

  const handleViewResume = (applicant) => {
    setPreviewApplicant(applicant);
  };

  // Open the interview scheduling modal with prepopulated data
  const handleOpenScheduleModal = (applicant) => {
    const existing = applicant.interview;
    
    // Default date to tomorrow if not scheduled
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDateStr = tomorrow.toISOString().split('T')[0];

    // Generate meeting link if not present
    const randomCode = Math.random().toString(36).substring(2, 5) + "-" + 
                       Math.random().toString(36).substring(2, 6) + "-" + 
                       Math.random().toString(36).substring(2, 5);
    const defaultMeetLink = `https://meet.google.com/${randomCode}`;

    if (existing) {
      setInterviewForm({
        roundName: existing.roundName || "Technical Round 1",
        customRoundName: existing.customRoundName || "",
        date: existing.date || defaultDateStr,
        time: existing.time || "11:00",
        duration: existing.duration || "45 mins",
        mode: existing.mode || "Google Meet",
        meetingLink: existing.meetingLink || defaultMeetLink,
        venue: existing.venue || "Placement Cell - Interview Room 204",
        interviewerName: existing.interviewerName || user?.name || "Hiring Manager",
        interviewerRole: existing.interviewerRole || "Engineering Recruiter",
        instructions: existing.instructions || "Please join 5 minutes before scheduled time with a stable internet connection, webcam turned on, and your code editor ready."
      });
    } else {
      setInterviewForm({
        roundName: "Technical Round 1",
        customRoundName: "",
        date: defaultDateStr,
        time: "11:00",
        duration: "45 mins",
        mode: "Google Meet",
        meetingLink: defaultMeetLink,
        venue: "Placement Cell - Interview Room 204",
        interviewerName: user?.name || "Hiring Manager",
        interviewerRole: user?.role === "ALUMNI" ? "Alumni Technical Lead" : "Engineering Recruiter",
        instructions: "Please join 5 minutes before scheduled time with a stable internet connection, webcam turned on, and your code editor ready."
      });
    }
    setSchedulingApplicant(applicant);
    setOpenDropdownId(null);
  };

  const handleGenerateMeetLink = () => {
    const randomCode = Math.random().toString(36).substring(2, 5) + "-" + 
                       Math.random().toString(36).substring(2, 6) + "-" + 
                       Math.random().toString(36).substring(2, 5);
    setInterviewForm(prev => ({ ...prev, meetingLink: `https://meet.google.com/${randomCode}` }));
  };

  const handleSaveInterview = (e) => {
    e.preventDefault();
    if (!schedulingApplicant) return;

    const roundTitle = interviewForm.roundName === "Custom" && interviewForm.customRoundName 
      ? interviewForm.customRoundName 
      : interviewForm.roundName;

    const interviewRecord = {
      id: schedulingApplicant.interview?.id || `int_${Date.now()}`,
      jobId: schedulingApplicant.jobId,
      jobRole: schedulingApplicant.jobRole,
      company: schedulingApplicant.company,
      applicantEmail: schedulingApplicant.email,
      applicantName: schedulingApplicant.name,
      roundName: roundTitle,
      date: interviewForm.date,
      time: interviewForm.time,
      duration: interviewForm.duration,
      mode: interviewForm.mode,
      meetingLink: interviewForm.meetingLink,
      venue: interviewForm.venue,
      interviewerName: interviewForm.interviewerName,
      interviewerRole: interviewForm.interviewerRole,
      instructions: interviewForm.instructions,
      status: "Scheduled",
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    const currentInterviews = JSON.parse(localStorage.getItem('scheduled_job_interviews') || '[]');
    const filtered = currentInterviews.filter(i => !(i.jobId === schedulingApplicant.jobId && i.applicantEmail === schedulingApplicant.email));
    const updatedInterviews = [interviewRecord, ...filtered];
    localStorage.setItem('scheduled_job_interviews', JSON.stringify(updatedInterviews));

    // Update status to Interviewing automatically
    const currentStatuses = JSON.parse(localStorage.getItem('student_application_statuses') || '{}');
    currentStatuses[`${schedulingApplicant.jobRole}_${schedulingApplicant.email}`] = "Interviewing";
    localStorage.setItem('student_application_statuses', JSON.stringify(currentStatuses));

    // Create detailed student notification
    const notifications = JSON.parse(localStorage.getItem('student_notifications') || '[]');
    const meetingDetailsText = interviewForm.mode.includes("In-Person") 
      ? `Venue: ${interviewForm.venue}` 
      : `Link: ${interviewForm.meetingLink}`;

    const newNotification = {
      id: Date.now(),
      message: `🎯 Interview Scheduled! Your ${roundTitle} for ${schedulingApplicant.jobRole} at ${schedulingApplicant.company} is confirmed for ${interviewForm.date} at ${interviewForm.time} (${interviewForm.duration}). ${meetingDetailsText}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      read: false,
      interviewId: interviewRecord.id,
      meetingLink: interviewForm.meetingLink,
      dateFormatted: `${interviewForm.date} @ ${interviewForm.time}`
    };
    localStorage.setItem('student_notifications', JSON.stringify([newNotification, ...notifications]));

    // Dispatch custom events for real-time reactivity
    window.dispatchEvent(new Event('notifications_updated'));
    window.dispatchEvent(new Event('interviews_updated'));
    window.dispatchEvent(new Event('storage'));

    setSchedulingApplicant(null);
    setRefreshCounter(prev => prev + 1);

    // If details modal is open for this applicant, update view
    if (selectedApplicant && selectedApplicant.id === schedulingApplicant.id) {
      setSelectedApplicant(prev => ({
        ...prev,
        status: "Interviewing",
        interview: interviewRecord
      }));
    }
  };

  const handleCancelInterview = (applicant) => {
    if (!applicant) return;
    const currentInterviews = JSON.parse(localStorage.getItem('scheduled_job_interviews') || '[]');
    const filtered = currentInterviews.filter(i => !(i.jobId === applicant.jobId && i.applicantEmail === applicant.email));
    localStorage.setItem('scheduled_job_interviews', JSON.stringify(filtered));

    // Notify student
    const notifications = JSON.parse(localStorage.getItem('student_notifications') || '[]');
    const newNotification = {
      id: Date.now(),
      message: `Your scheduled interview for ${applicant.jobRole} at ${applicant.company} has been cancelled or rescheduled by the recruiter.`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      read: false
    };
    localStorage.setItem('student_notifications', JSON.stringify([newNotification, ...notifications]));

    window.dispatchEvent(new Event('notifications_updated'));
    window.dispatchEvent(new Event('interviews_updated'));

    setSchedulingApplicant(null);
    if (selectedApplicant && selectedApplicant.id === applicant.id) {
      setSelectedApplicant(prev => ({
        ...prev,
        interview: null
      }));
    }
    setRefreshCounter(prev => prev + 1);
  };

  // Open Scorecard / Evaluation Modal
  const handleOpenEvaluationModal = (applicant) => {
    const existing = applicant.evaluation;
    if (existing) {
      setEvaluationForm({
        technicalScore: existing.technicalScore || 4,
        problemSolvingScore: existing.problemSolvingScore || 4,
        domainScore: existing.domainScore || 4,
        communicationScore: existing.communicationScore || 4,
        recommendation: existing.recommendation || "Hire",
        strengths: existing.strengths || "",
        areasForImprovement: existing.areasForImprovement || "",
        notes: existing.notes || ""
      });
    } else {
      setEvaluationForm({
        technicalScore: 4,
        problemSolvingScore: 4,
        domainScore: 4,
        communicationScore: 4,
        recommendation: "Hire",
        strengths: "Good problem solving, understands clean code principles.",
        areasForImprovement: "Can improve knowledge of distributed systems.",
        notes: "Solid candidate with great technical fundamentals."
      });
    }
    setEvaluatingApplicant(applicant);
    setOpenDropdownId(null);
  };

  const handleSaveEvaluation = (e) => {
    e.preventDefault();
    if (!evaluatingApplicant) return;

    const overall = (
      (parseFloat(evaluationForm.technicalScore) +
       parseFloat(evaluationForm.problemSolvingScore) +
       parseFloat(evaluationForm.domainScore) +
       parseFloat(evaluationForm.communicationScore)) / 4
    ).toFixed(1);

    const evaluationRecord = {
      id: evaluatingApplicant.evaluation?.id || `eval_${Date.now()}`,
      jobId: evaluatingApplicant.jobId,
      jobRole: evaluatingApplicant.jobRole,
      company: evaluatingApplicant.company,
      applicantEmail: evaluatingApplicant.email,
      applicantName: evaluatingApplicant.name,
      overallScore: overall,
      technicalScore: evaluationForm.technicalScore,
      problemSolvingScore: evaluationForm.problemSolvingScore,
      domainScore: evaluationForm.domainScore,
      communicationScore: evaluationForm.communicationScore,
      recommendation: evaluationForm.recommendation,
      strengths: evaluationForm.strengths,
      areasForImprovement: evaluationForm.areasForImprovement,
      notes: evaluationForm.notes,
      evaluatedBy: user?.name || "Hiring Evaluator",
      evaluatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const currentEvals = JSON.parse(localStorage.getItem('candidate_evaluations') || '[]');
    const filtered = currentEvals.filter(e => !(e.jobId === evaluatingApplicant.jobId && e.applicantEmail === evaluatingApplicant.email));
    localStorage.setItem('candidate_evaluations', JSON.stringify([evaluationRecord, ...filtered]));

    window.dispatchEvent(new Event('evaluations_updated'));
    setEvaluatingApplicant(null);
    setRefreshCounter(prev => prev + 1);

    if (selectedApplicant && selectedApplicant.id === evaluatingApplicant.id) {
      setSelectedApplicant(prev => ({
        ...prev,
        evaluation: evaluationRecord
      }));
    }
  };

  // Open Release Offer Modal
  const handleOpenReleaseOfferModal = (applicant) => {
    const existing = applicant.offer;
    
    // Default joining date: 2 months ahead
    const defaultJoining = new Date();
    defaultJoining.setMonth(defaultJoining.getMonth() + 2);
    const defaultJoiningStr = defaultJoining.toISOString().split('T')[0];

    // Default acceptance deadline: 7 days ahead
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 7);
    const defaultDeadlineStr = defaultDeadline.toISOString().split('T')[0];

    // Try to parse salary from job
    const jobMatch = jobs.find(j => j.id === applicant.jobId);
    const salaryRaw = jobMatch?.salaryAmount || "14.5";

    if (existing) {
      setOfferForm({
        ctc: existing.ctc || salaryRaw,
        baseSalary: existing.baseSalary || `${(parseFloat(salaryRaw) * 0.75).toFixed(1)} LPA`,
        bonus: existing.bonus || `${(parseFloat(salaryRaw) * 0.15).toFixed(1)} LPA Performance Bonus`,
        stocks: existing.stocks || `${(parseFloat(salaryRaw) * 0.10).toFixed(1)} LPA ESOPs`,
        designation: existing.designation || applicant.jobRole,
        workLocation: existing.workLocation || "Bangalore / Hybrid",
        joiningDate: existing.joiningDate || defaultJoiningStr,
        acceptanceDeadline: existing.acceptanceDeadline || defaultDeadlineStr,
        terms: existing.terms || "This offer is contingent upon successful completion of your undergraduate degree with minimum 7.0 CGPA and no active backlogs at the time of joining.",
        welcomeMessage: existing.welcomeMessage || "We were very impressed by your interview evaluations and problem-solving abilities! We are thrilled to welcome you to our team."
      });
    } else {
      setOfferForm({
        ctc: salaryRaw,
        baseSalary: `${(parseFloat(salaryRaw) * 0.75).toFixed(1)} LPA`,
        bonus: `${(parseFloat(salaryRaw) * 0.15).toFixed(1)} LPA Performance Bonus`,
        stocks: `${(parseFloat(salaryRaw) * 0.10).toFixed(1)} LPA ESOPs`,
        designation: applicant.jobRole,
        workLocation: "Bangalore / Hybrid",
        joiningDate: defaultJoiningStr,
        acceptanceDeadline: defaultDeadlineStr,
        terms: "This offer is contingent upon successful completion of your undergraduate degree with minimum 7.0 CGPA and no active backlogs at the time of joining.",
        welcomeMessage: "We were very impressed by your interview evaluations and problem-solving abilities! We are thrilled to welcome you to our team."
      });
    }
    setReleasingOfferApplicant(applicant);
    setOpenDropdownId(null);
  };

  const handleSaveOffer = (e) => {
    e.preventDefault();
    if (!releasingOfferApplicant) return;

    const offerRecord = {
      id: releasingOfferApplicant.offer?.id || `off_${Date.now()}`,
      jobId: releasingOfferApplicant.jobId,
      jobRole: releasingOfferApplicant.jobRole,
      company: releasingOfferApplicant.company,
      applicantEmail: releasingOfferApplicant.email,
      applicantName: releasingOfferApplicant.name,
      ctc: offerForm.ctc,
      currency: "INR",
      period: "LPA",
      baseSalary: offerForm.baseSalary,
      bonus: offerForm.bonus,
      stocks: offerForm.stocks,
      designation: offerForm.designation,
      workLocation: offerForm.workLocation,
      joiningDate: offerForm.joiningDate,
      acceptanceDeadline: offerForm.acceptanceDeadline,
      terms: offerForm.terms,
      welcomeMessage: offerForm.welcomeMessage,
      status: releasingOfferApplicant.offer?.status || "Pending", // "Pending" | "Accepted" | "Declined"
      releasedBy: user?.name || "Campus Recruiter",
      releasedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const currentOffers = JSON.parse(localStorage.getItem('student_job_offers') || '[]');
    const filtered = currentOffers.filter(o => !(o.jobId === releasingOfferApplicant.jobId && o.applicantEmail === releasingOfferApplicant.email));
    localStorage.setItem('student_job_offers', JSON.stringify([offerRecord, ...filtered]));

    // Update status to Offered automatically
    const currentStatuses = JSON.parse(localStorage.getItem('student_application_statuses') || '{}');
    currentStatuses[`${releasingOfferApplicant.jobRole}_${releasingOfferApplicant.email}`] = "Offered";
    localStorage.setItem('student_application_statuses', JSON.stringify(currentStatuses));

    // Also update job.selected in JobContext/localStorage (pp_jobs_global and nexus_jobs)
    try {
      const globalJobs = JSON.parse(localStorage.getItem('pp_jobs_global') || '[]');
      const updatedGlobal = globalJobs.map(j => {
        if (j.id === releasingOfferApplicant.jobId) {
          const sel = j.selected || [];
          return sel.includes(releasingOfferApplicant.email) ? j : { ...j, selected: [...sel, releasingOfferApplicant.email] };
        }
        return j;
      });
      localStorage.setItem('pp_jobs_global', JSON.stringify(updatedGlobal));
    } catch (e) {
      console.error(e);
    }

    const currentJobs = JSON.parse(localStorage.getItem('nexus_jobs') || '[]');
    const updatedJobs = currentJobs.map(j => {
      if (j.id === releasingOfferApplicant.jobId) {
        const sel = j.selected || [];
        return sel.includes(releasingOfferApplicant.email) ? j : { ...j, selected: [...sel, releasingOfferApplicant.email] };
      }
      return j;
    });
    localStorage.setItem('nexus_jobs', JSON.stringify(updatedJobs));
    window.dispatchEvent(new Event('jobs_updated'));

    // Send high priority notification to student
    const notifications = JSON.parse(localStorage.getItem('student_notifications') || '[]');
    const newNotification = {
      id: Date.now(),
      message: `🎉 Official Offer Released! ${releasingOfferApplicant.company} has offered you the role of ${offerForm.designation} with a package of ${offerForm.ctc} LPA. Review & accept your offer under My Applications!`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      read: false,
      offerId: offerRecord.id
    };
    localStorage.setItem('student_notifications', JSON.stringify([newNotification, ...notifications]));

    window.dispatchEvent(new Event('notifications_updated'));
    window.dispatchEvent(new Event('offers_updated'));
    window.dispatchEvent(new Event('storage'));

    setReleasingOfferApplicant(null);
    setRefreshCounter(prev => prev + 1);

    if (selectedApplicant && selectedApplicant.id === releasingOfferApplicant.id) {
      setSelectedApplicant(prev => ({
        ...prev,
        status: "Offered",
        offer: offerRecord
      }));
    }
  };

  const applyTemplate = (type) => {
    if (type === "dsa") {
      setInterviewForm(prev => ({
        ...prev,
        roundName: "Technical Round 1 (Data Structures & Algorithms)",
        instructions: "Please be ready 5 minutes early with your webcam on, have an IDE (VS Code/CLion) open, and be prepared for live coding problem solving on arrays, trees, and dynamic programming."
      }));
    } else if (type === "system") {
      setInterviewForm(prev => ({
        ...prev,
        roundName: "Technical Round 2 (System Design & Projects)",
        instructions: "Have your GitHub repositories and architecture diagrams ready. We will walk through your major projects and design a scalable backend service."
      }));
    } else if (type === "hr") {
      setInterviewForm(prev => ({
        ...prev,
        roundName: "HR & Culture Fit Discussion",
        instructions: "A friendly 30-minute discussion regarding company culture, career aspirations, and team collaboration. Formal attire is recommended."
      }));
    }
  };

  const recommendationColor = (rec) => {
    switch(rec) {
      case "Strong Hire": return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Hire": return "bg-blue-100 text-blue-800 border-blue-300";
      case "Leaning Hire": return "bg-amber-100 text-amber-800 border-amber-300";
      case "Reject": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-8rem)] flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Applicant Pipeline & Evaluations</h1>
          <p className="text-gray-500">Track candidates, submit interview scorecards, and release official campus offer letters.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
             className="h-10 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700 shadow-sm"
             value={activeJobFilter}
             onChange={(e) => setActiveJobFilter(e.target.value)}
          >
             {uniqueJobRoles.map(role => (
               <option key={role} value={role}>{role}</option>
             ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 shrink-0">
         <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              type="text" 
              placeholder={`Search candidates by name, email, or role...`} 
              className="pl-9 h-10 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
         <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
           {filteredApplicants.length} Total Applicants
         </span>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-6 overflow-x-auto pb-4 pt-2 flex-1 items-start minimal-scrollbar">
         {stages.map((stage) => {
           const stageApplicants = filteredApplicants.filter(app => app.status === stage);
           return (
             <div key={stage} className="flex-shrink-0 w-80 bg-gray-50/70 rounded-2xl flex flex-col max-h-full border border-gray-200/70 shadow-sm">
                <div className={`px-4 py-3 border-b flex items-center justify-between rounded-t-2xl font-semibold text-sm ${stageStyle(stage)}`}>
                   <span>{stage}</span>
                   <span className="bg-white/80 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs">{stageApplicants.length}</span>
                </div>
                
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                   {stageApplicants.map((app) => (
                      <div 
                        key={app.id} 
                        className="bg-white p-4 rounded-xl shadow-xs border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group relative"
                        onClick={() => setSelectedApplicant(app)}
                      >
                         <div className="flex justify-between items-start mb-3 relative">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-xs overflow-hidden">
                                  {app.profilePicture ? (
                                     <img src={app.profilePicture} alt={app.name} className="w-full h-full object-cover" />
                                  ) : (
                                     app.name.charAt(0).toUpperCase()
                                  )}
                               </div>
                               <div>
                                 <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{app.name}</h3>
                                 <div className="flex items-center gap-2 mt-0.5">
                                   <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">CGPA: {app.cgpa}</span>
                                 </div>
                                 <p className="text-[11px] text-gray-500 font-medium mt-1 flex items-center gap-1">
                                    <Briefcase className="w-3 h-3 text-indigo-500" /> {app.jobRole}
                                 </p>
                               </div>
                            </div>
                            <div className="relative">
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setOpenDropdownId(openDropdownId === app.id ? null : app.id); 
                                }} 
                                className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors -mt-1 -mr-1"
                              >
                                 <MoreHorizontal className="w-4 h-4"/>
                              </button>
                              {openDropdownId === app.id && (
                                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-30 py-1.5 animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
                                  <button 
                                    onClick={() => handleOpenScheduleModal(app)} 
                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                                  >
                                    <Video className="w-3.5 h-3.5" />
                                    {app.interview ? "Edit Interview Slot" : "Schedule Interview"}
                                  </button>

                                  <button 
                                    onClick={() => handleOpenEvaluationModal(app)} 
                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                                  >
                                    <Star className="w-3.5 h-3.5" />
                                    {app.evaluation ? "Edit Scorecard" : "Evaluate Scorecard"}
                                  </button>

                                  <button 
                                    onClick={() => handleOpenReleaseOfferModal(app)} 
                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                  >
                                    <Award className="w-3.5 h-3.5" />
                                    {app.offer ? "Edit Offer Letter" : "Release Official Offer"}
                                  </button>

                                  <div className="border-t border-gray-100 my-1"></div>
                                  {stage !== "Shortlisted" && stage !== "Interviewing" && stage !== "Offered" && (
                                    <button onClick={() => moveApplicant(app, "Shortlisted")} className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Move to Shortlisted</button>
                                  )}
                                  {stage !== "Interviewing" && stage !== "Offered" && (
                                    <button onClick={() => moveApplicant(app, "Interviewing")} className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-600">Move to Interviewing</button>
                                  )}
                                  {stage !== "Offered" && (
                                    <button onClick={() => moveApplicant(app, "Offered")} className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">Release Offer</button>
                                  )}
                                </div>
                              )}
                            </div>
                         </div>

                         {/* Active Scheduled Interview Badge */}
                         {app.interview && (
                            <div className="mb-2.5 p-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-lg flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 font-bold text-amber-900 truncate">
                                <Video className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span className="truncate">{app.interview.roundName}: {app.interview.date} @ {app.interview.time}</span>
                              </div>
                              <span className="text-[10px] bg-amber-200/70 text-amber-800 font-extrabold px-1.5 py-0.5 rounded ml-1 shrink-0">
                                {app.interview.duration}
                              </span>
                            </div>
                         )}

                         {/* Active Evaluation Scorecard Badge */}
                         {app.evaluation && (
                            <div className={`mb-2.5 p-2 rounded-lg flex items-center justify-between text-xs border ${recommendationColor(app.evaluation.recommendation)}`}>
                              <div className="flex items-center gap-1.5 font-bold truncate">
                                <Star className="w-3.5 h-3.5 fill-current text-amber-500 shrink-0" />
                                <span>{app.evaluation.overallScore}/5</span>
                                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/70">
                                  {app.evaluation.recommendation}
                                </span>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleOpenEvaluationModal(app); }}
                                className="text-[10px] underline font-semibold hover:opacity-80"
                              >
                                Edit
                              </button>
                            </div>
                         )}

                         {/* Active Offer Badge */}
                         {app.offer && (
                            <div className={`mb-2.5 p-2 rounded-lg flex items-center justify-between text-xs border ${
                              app.offer.status === "Accepted" ? "bg-emerald-50 text-emerald-900 border-emerald-300" :
                              app.offer.status === "Declined" ? "bg-gray-50 text-gray-700 border-gray-300" :
                              "bg-purple-50 text-purple-900 border-purple-200"
                            }`}>
                              <div className="flex items-center gap-1.5 font-bold truncate">
                                <Award className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span className="truncate">₹{app.offer.ctc} LPA • {app.offer.status}</span>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setPreviewOffer(app.offer); }}
                                className="text-[10px] font-bold text-indigo-700 underline hover:text-indigo-900"
                              >
                                View Letter
                              </button>
                            </div>
                         )}
                         
                         {/* Skills Tags */}
                         <div className="flex flex-wrap gap-1.5 mb-3.5">
                           {app.tags.slice(0, 3).map(tag => (
                             <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-medium border border-gray-200">
                               {tag}
                             </span>
                           ))}
                           {app.tags.length > 3 && (
                             <span className="px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded-md text-[10px] font-medium">
                               +{app.tags.length - 3}
                             </span>
                           )}
                         </div>

                         {/* Action Buttons on Card */}
                         <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-1.5">
                            <div className="flex items-center gap-1">
                              <button 
                                 onClick={(e) => { 
                                   e.stopPropagation(); 
                                   handleViewResume(app);
                                 }}
                                 className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors bg-indigo-50/60 hover:bg-indigo-100/70 px-2 py-1 rounded-lg"
                                 title="View ATS resume"
                              >
                                 <FileText className="w-3.5 h-3.5" /> Resume
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadResume(app);
                                }}
                                className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
                                title="Download resume"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Evaluation Scorecard Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEvaluationModal(app);
                                }}
                                className={`text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                                  app.evaluation
                                    ? "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                title="Interview Scorecard & Evaluation"
                              >
                                <Star className="w-3 h-3 text-amber-500" />
                                {app.evaluation ? `${app.evaluation.overallScore}★` : "Score"}
                              </button>

                              {/* Offer Action Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (app.offer) {
                                    setPreviewOffer(app.offer);
                                  } else {
                                    handleOpenReleaseOfferModal(app);
                                  }
                                }}
                                className={`text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                                  app.offer
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                                }`}
                                title="Release Official Offer"
                              >
                                <Award className="w-3 h-3" />
                                {app.offer ? "Offer" : "Hire"}
                              </button>
                            </div>
                         </div>
                      </div>
                   ))}

                   {stageApplicants.length === 0 && (
                      <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
                         <User className="w-8 h-8 text-gray-300 mb-2" />
                         <p className="text-xs font-medium text-gray-400">No candidates in {stage}.</p>
                      </div>
                   )}
                </div>
             </div>
           );
         })}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .minimal-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .minimal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .minimal-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}} />

      {/* SCHEDULE INTERVIEW MODAL */}
      {schedulingApplicant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50/60 to-purple-50/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {schedulingApplicant.interview ? "Edit Interview Slot" : "Schedule Interview"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Candidate: <span className="font-semibold text-indigo-700">{schedulingApplicant.name}</span> ({schedulingApplicant.jobRole})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSchedulingApplicant(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveInterview} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Quick Template Picker */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Quick Agenda Templates
                </label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    type="button" 
                    onClick={() => applyTemplate("dsa")}
                    className="text-xs px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition-colors"
                  >
                    DSA & Live Coding
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyTemplate("system")}
                    className="text-xs px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg border border-purple-200 transition-colors"
                  >
                    System Design & Projects
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyTemplate("hr")}
                    className="text-xs px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg border border-emerald-200 transition-colors"
                  >
                    HR & Culture Fit
                  </button>
                </div>
              </div>

              {/* Round Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                  Interview Round / Type
                </label>
                <select
                  value={interviewForm.roundName}
                  onChange={(e) => setInterviewForm({ ...interviewForm, roundName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white font-medium text-gray-800 shadow-xs"
                >
                  <option>Technical Round 1</option>
                  <option>Technical Round 2</option>
                  <option>Coding Assessment & DSA</option>
                  <option>System Architecture & Design</option>
                  <option>Managerial & Leadership Round</option>
                  <option>HR & Cultural Evaluation</option>
                  <option>Final Founder Discussion</option>
                  <option>Custom</option>
                </select>

                {interviewForm.roundName === "Custom" && (
                  <input
                    type="text"
                    placeholder="Enter custom round title..."
                    required
                    value={interviewForm.customRoundName}
                    onChange={(e) => setInterviewForm({ ...interviewForm, customRoundName: e.target.value })}
                    className="w-full mt-2 h-10 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                )}
              </div>

              {/* Date, Time & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                    Date
                  </label>
                  <input 
                    type="date" 
                    min={new Date().toLocaleDateString('en-CA')}
                    required 
                    value={interviewForm.date} 
                    onChange={e => setInterviewForm({...interviewForm, date: e.target.value})} 
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                    Start Time
                  </label>
                  <input 
                    type="time" 
                    required 
                    value={interviewForm.time} 
                    onChange={e => setInterviewForm({...interviewForm, time: e.target.value})} 
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                    Duration
                  </label>
                  <select 
                    value={interviewForm.duration} 
                    onChange={e => setInterviewForm({...interviewForm, duration: e.target.value})} 
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option>30 mins</option>
                    <option>45 mins</option>
                    <option>60 mins</option>
                    <option>90 mins</option>
                  </select>
                </div>
              </div>

              {/* Mode & Meeting Link / Venue */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider">
                    Interview Mode & Platform
                  </label>
                  <div className="flex items-center gap-1 text-xs">
                    {["Google Meet", "Zoom", "MS Teams", "In-Person (Campus)"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setInterviewForm({ ...interviewForm, mode: m })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          interviewForm.mode === m 
                            ? "bg-indigo-600 text-white shadow-xs" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {m.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {!interviewForm.mode.includes("In-Person") ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-600">Video Call Link</label>
                      <button
                        type="button"
                        onClick={handleGenerateMeetLink}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Auto-Generate Meet Link
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type="url" 
                        required 
                        placeholder="https://meet.google.com/xxx-xxxx-xxx" 
                        value={interviewForm.meetingLink} 
                        onChange={e => setInterviewForm({...interviewForm, meetingLink: e.target.value})} 
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs" 
                      />
                      <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Campus Venue & Room</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required 
                        placeholder="Placement Office, Seminar Hall A, Room 204" 
                        value={interviewForm.venue} 
                        onChange={e => setInterviewForm({...interviewForm, venue: e.target.value})} 
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                      />
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                  </div>
                )}
              </div>

              {/* Interviewer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                    Interviewer Name
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={interviewForm.interviewerName} 
                    onChange={e => setInterviewForm({...interviewForm, interviewerName: e.target.value})} 
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                    Interviewer Role / Title
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={interviewForm.interviewerRole} 
                    onChange={e => setInterviewForm({...interviewForm, interviewerRole: e.target.value})} 
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>

              {/* Candidate Instructions */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                  Preparation Instructions & Notes for Student
                </label>
                <textarea
                  rows={3}
                  value={interviewForm.instructions}
                  onChange={e => setInterviewForm({...interviewForm, instructions: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                  placeholder="Share prerequisites, what they should prepare, code editors to keep open, etc."
                />
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                {schedulingApplicant.interview ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="text-red-600 hover:bg-red-50 hover:border-red-200 text-xs"
                    onClick={() => handleCancelInterview(schedulingApplicant)}
                  >
                    Cancel Interview Slot
                  </Button>
                ) : (
                  <span className="text-xs text-gray-400">Automatic notification will be sent.</span>
                )}

                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSchedulingApplicant(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-200"
                  >
                    <Send className="w-3.5 h-3.5" /> Save & Send Invite
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INTERVIEW EVALUATION & SCORECARD MODAL */}
      {evaluatingApplicant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50/70 to-orange-50/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Candidate Interview Scorecard
                  </h2>
                  <p className="text-xs text-gray-500">
                    Evaluating: <span className="font-semibold text-amber-800">{evaluatingApplicant.name}</span> for {evaluatingApplicant.jobRole}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEvaluatingApplicant(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEvaluation} className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Skill Ratings Grid */}
              <div className="space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Skill Competency Ratings (1 to 5)</h4>
                
                {/* Technical / Coding */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-800">Coding & Technical Accuracy</p>
                    <p className="text-[11px] text-gray-400">Syntax, clean code, efficiency</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setEvaluationForm({ ...evaluationForm, technicalScore: val })}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                          evaluationForm.technicalScore === val 
                            ? "bg-amber-500 text-white shadow-xs scale-105" 
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Problem Solving / DSA */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-200/60">
                  <div>
                    <p className="text-xs font-bold text-gray-800">Problem Solving & Algorithms</p>
                    <p className="text-[11px] text-gray-400">Complexity, approach, edge cases</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setEvaluationForm({ ...evaluationForm, problemSolvingScore: val })}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                          evaluationForm.problemSolvingScore === val 
                            ? "bg-amber-500 text-white shadow-xs scale-105" 
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Domain & Architecture */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-200/60">
                  <div>
                    <p className="text-xs font-bold text-gray-800">Domain & Architecture Knowledge</p>
                    <p className="text-[11px] text-gray-400">Database, frameworks, project depth</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setEvaluationForm({ ...evaluationForm, domainScore: val })}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                          evaluationForm.domainScore === val 
                            ? "bg-amber-500 text-white shadow-xs scale-105" 
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Communication */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-200/60">
                  <div>
                    <p className="text-xs font-bold text-gray-800">Communication & Culture Fit</p>
                    <p className="text-[11px] text-gray-400">Articulation, attitude, teamwork</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setEvaluationForm({ ...evaluationForm, communicationScore: val })}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                          evaluationForm.communicationScore === val 
                            ? "bg-amber-500 text-white shadow-xs scale-105" 
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Overall Recommendation */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1.5">
                  Final Hiring Recommendation
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "Strong Hire", color: "hover:border-emerald-500 hover:bg-emerald-50", active: "bg-emerald-600 text-white border-emerald-600" },
                    { label: "Hire", color: "hover:border-blue-500 hover:bg-blue-50", active: "bg-blue-600 text-white border-blue-600" },
                    { label: "Leaning Hire", color: "hover:border-amber-500 hover:bg-amber-50", active: "bg-amber-500 text-white border-amber-500" },
                    { label: "Reject", color: "hover:border-red-500 hover:bg-red-50", active: "bg-red-600 text-white border-red-600" }
                  ].map((rec) => (
                    <button
                      key={rec.label}
                      type="button"
                      onClick={() => setEvaluationForm({ ...evaluationForm, recommendation: rec.label })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        evaluationForm.recommendation === rec.label
                          ? rec.active
                          : `bg-white text-gray-700 border-gray-200 ${rec.color}`
                      }`}
                    >
                      {rec.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                    Key Strengths
                  </label>
                  <input
                    type="text"
                    value={evaluationForm.strengths}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, strengths: e.target.value })}
                    placeholder="e.g. Strong in DSA, fast debugger"
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                    Areas for Growth
                  </label>
                  <input
                    type="text"
                    value={evaluationForm.areasForImprovement}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, areasForImprovement: e.target.value })}
                    placeholder="e.g. Distributed caching, API design"
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Detailed Evaluation Notes */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                  Interviewer Assessment & Justification
                </label>
                <textarea
                  rows={3}
                  value={evaluationForm.notes}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, notes: e.target.value })}
                  placeholder="Provide detailed reasoning for the hiring decision to assist the campus placement team..."
                  className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed"
                />
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEvaluatingApplicant(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-amber-200"
                >
                  <CheckSquare className="w-4 h-4" /> Save Scorecard
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RELEASE OFFICIAL OFFER MODAL */}
      {releasingOfferApplicant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50/70 to-teal-50/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Generate Official Placement Offer
                  </h2>
                  <p className="text-xs text-gray-500">
                    Candidate: <span className="font-semibold text-emerald-800">{releasingOfferApplicant.name}</span> ({releasingOfferApplicant.email})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setReleasingOfferApplicant(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveOffer} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                    Annual CTC Package (LPA)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={offerForm.ctc}
                      onChange={(e) => setOfferForm({ ...offerForm, ctc: e.target.value })}
                      placeholder="e.g. 14.5"
                      className="w-full h-10 pl-8 pr-3 rounded-xl border border-gray-300 text-sm font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <DollarSign className="w-4 h-4 text-emerald-600 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                    Fixed Base Salary
                  </label>
                  <input
                    type="text"
                    required
                    value={offerForm.baseSalary}
                    onChange={(e) => setOfferForm({ ...offerForm, baseSalary: e.target.value })}
                    placeholder="e.g. 11.0 LPA"
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                    Performance Bonus / Joining Bonus
                  </label>
                  <input
                    type="text"
                    value={offerForm.bonus}
                    onChange={(e) => setOfferForm({ ...offerForm, bonus: e.target.value })}
                    placeholder="e.g. 1.5 LPA Performance"
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                    Stocks / Equity / ESOPs
                  </label>
                  <input
                    type="text"
                    value={offerForm.stocks}
                    onChange={(e) => setOfferForm({ ...offerForm, stocks: e.target.value })}
                    placeholder="e.g. 2.0 LPA (4-year vest)"
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                    Official Job Title / Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={offerForm.designation}
                    onChange={(e) => setOfferForm({ ...offerForm, designation: e.target.value })}
                    placeholder="e.g. Associate Software Engineer"
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                    Work Location & Mode
                  </label>
                  <input
                    type="text"
                    required
                    value={offerForm.workLocation}
                    onChange={(e) => setOfferForm({ ...offerForm, workLocation: e.target.value })}
                    placeholder="e.g. Bangalore / Hybrid"
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                    Expected Joining Date
                  </label>
                  <input
                    type="date"
                    required
                    value={offerForm.joiningDate}
                    onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                    Acceptance Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={offerForm.acceptanceDeadline}
                    onChange={(e) => setOfferForm({ ...offerForm, acceptanceDeadline: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                  Welcome Message
                </label>
                <textarea
                  rows={2}
                  value={offerForm.welcomeMessage}
                  onChange={(e) => setOfferForm({ ...offerForm, welcomeMessage: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                  Offer Terms & Conditions
                </label>
                <textarea
                  rows={2}
                  value={offerForm.terms}
                  onChange={(e) => setOfferForm({ ...offerForm, terms: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setReleasingOfferApplicant(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200"
                >
                  <PartyPopper className="w-4 h-4" /> Release Official Offer Letter
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL OFFER LETTER PREVIEW & PRINT MODAL */}
      {previewOffer && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Official Placement Offer Letter</h3>
                  <p className="text-xs text-gray-500">{previewOffer.company} • {previewOffer.applicantName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white gap-1.5 text-xs text-gray-700"
                  onClick={() => window.print()}
                >
                  <Printer className="w-3.5 h-3.5" /> Print / PDF
                </Button>

                <button 
                  onClick={() => setPreviewOffer(null)} 
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-6 flex justify-center">
              <div className="w-full max-w-2xl bg-white p-8 sm:p-12 rounded-2xl shadow-md border border-gray-200 text-gray-900 font-sans space-y-6">
                
                {/* Letterhead */}
                <div className="flex items-start justify-between border-b-2 border-gray-900 pb-5">
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-wider text-gray-900">
                      {previewOffer.company}
                    </h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Campus Recruitment Division</p>
                    <p className="text-xs text-gray-500">{previewOffer.workLocation}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider border ${
                      previewOffer.status === "Accepted" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                      previewOffer.status === "Declined" ? "bg-red-100 text-red-800 border-red-300" :
                      "bg-amber-100 text-amber-800 border-amber-300"
                    }`}>
                      {previewOffer.status === "Accepted" ? "Offer Accepted ✓" : previewOffer.status === "Declined" ? "Offer Declined" : "Offer Pending Acceptance"}
                    </span>
                    <p className="text-xs text-gray-400 mt-2 font-medium">Date: {previewOffer.releasedAt}</p>
                  </div>
                </div>

                {/* Candidate Address */}
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-bold text-gray-900">To,</p>
                  <p className="font-bold text-gray-900">{previewOffer.applicantName}</p>
                  <p className="text-gray-600">{previewOffer.applicantEmail}</p>
                  <p className="text-gray-600">Subject: <span className="font-bold text-gray-900">Offer of Employment for the position of {previewOffer.designation}</span></p>
                </div>

                {/* Welcome Body */}
                <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-3">
                  <p>Dear <span className="font-bold text-gray-900">{previewOffer.applicantName}</span>,</p>
                  <p>
                    {previewOffer.welcomeMessage || "On behalf of our entire recruitment team, we are delighted to extend you an offer of employment. We were thoroughly impressed with your technical capabilities, problem solving, and enthusiasm during the campus placement drive."}
                  </p>
                </div>

                {/* Compensation Package Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Annual Compensation Breakdown (CTC)</h4>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 border-b border-gray-200 font-bold text-gray-700">
                        <tr>
                          <th className="p-3">Component</th>
                          <th className="p-3 text-right">Amount (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr>
                          <td className="p-3 font-medium text-gray-800">Fixed Base Salary</td>
                          <td className="p-3 text-right font-semibold text-gray-900">{previewOffer.baseSalary}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-gray-800">Variable / Performance Bonus</td>
                          <td className="p-3 text-right font-semibold text-gray-900">{previewOffer.bonus || "N/A"}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-gray-800">Stock Grants / Long-term Incentives</td>
                          <td className="p-3 text-right font-semibold text-gray-900">{previewOffer.stocks || "N/A"}</td>
                        </tr>
                        <tr className="bg-emerald-50/50 font-bold">
                          <td className="p-3 text-emerald-900">Total Cost to Company (CTC)</td>
                          <td className="p-3 text-right text-emerald-900 text-sm">{previewOffer.ctc} LPA</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Logistics */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold block uppercase">Expected Joining Date</span>
                    <span className="font-bold text-gray-900 mt-0.5 block">{previewOffer.joiningDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block uppercase">Acceptance Deadline</span>
                    <span className="font-bold text-red-600 mt-0.5 block">{previewOffer.acceptanceDeadline}</span>
                  </div>
                </div>

                {/* Terms */}
                {previewOffer.terms && (
                  <div className="space-y-1 text-xs text-gray-600 border-t border-gray-100 pt-3">
                    <span className="font-bold text-gray-800 block">Terms & Conditions:</span>
                    <p className="leading-relaxed italic">{previewOffer.terms}</p>
                  </div>
                )}

                {/* Signature */}
                <div className="pt-6 border-t border-gray-200 flex justify-between items-end text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{previewOffer.releasedBy || "Campus Recruiting Manager"}</p>
                    <p className="text-gray-500">{previewOffer.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 italic">Digitally Verified Document</p>
                    <p className="font-bold text-gray-700">Official Placement Offer</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-500">Offer ID: #{previewOffer.id}</span>
              <Button variant="outline" onClick={() => setPreviewOffer(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Inspection Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Applicant Details</h2>
                <p className="text-xs text-gray-500 mt-0.5">Applied for {selectedApplicant.jobRole} at {selectedApplicant.company}</p>
              </div>
              <button 
                onClick={() => setSelectedApplicant(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Profile Card */}
              <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-50/50 to-blue-50/30 p-4 rounded-2xl border border-indigo-100/60">
                <div className="w-16 h-16 flex-shrink-0 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-md overflow-hidden">
                  {selectedApplicant.profilePicture ? (
                     <img src={selectedApplicant.profilePicture} alt={selectedApplicant.name} className="w-full h-full object-cover" />
                  ) : (
                     selectedApplicant.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedApplicant.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">{selectedApplicant.college}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${stageStyle(selectedApplicant.status)}`}>
                      {selectedApplicant.status}
                    </span>
                    <span className="text-xs text-gray-400">• Applied {selectedApplicant.appliedDate}</span>
                  </div>
                </div>
              </div>

              {/* Evaluation Scorecard Section inside Details */}
              {selectedApplicant.evaluation ? (
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-amber-950">Interview Scorecard</h4>
                        <p className="text-xs text-amber-800 font-medium">
                          Overall Rating: <span className="font-extrabold">{selectedApplicant.evaluation.overallScore} / 5</span>
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider ${recommendationColor(selectedApplicant.evaluation.recommendation)}`}>
                      {selectedApplicant.evaluation.recommendation}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white/80 p-3 rounded-xl border border-amber-100">
                    <div>Coding / Tech: <span className="font-bold">{selectedApplicant.evaluation.technicalScore}/5</span></div>
                    <div>Problem Solving: <span className="font-bold">{selectedApplicant.evaluation.problemSolvingScore}/5</span></div>
                    <div>Domain Depth: <span className="font-bold">{selectedApplicant.evaluation.domainScore}/5</span></div>
                    <div>Communication: <span className="font-bold">{selectedApplicant.evaluation.communicationScore}/5</span></div>
                  </div>

                  {selectedApplicant.evaluation.notes && (
                    <p className="text-xs text-gray-600 italic bg-white/80 p-2.5 rounded-lg border border-amber-100">
                      "{selectedApplicant.evaluation.notes}"
                    </p>
                  )}

                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleOpenEvaluationModal(selectedApplicant)}
                    className="w-full bg-white border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold"
                  >
                    Edit Evaluation Scorecard
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className="w-6 h-6 text-amber-500" />
                    <div>
                      <p className="text-sm font-bold text-amber-950">No Evaluation Scorecard</p>
                      <p className="text-xs text-amber-700">Record structured interview scores & ratings.</p>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs"
                    onClick={() => handleOpenEvaluationModal(selectedApplicant)}
                  >
                    Score Candidate
                  </Button>
                </div>
              )}

              {/* Official Offer Section inside Details */}
              {selectedApplicant.offer ? (
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-950">Official Placement Offer</h4>
                        <p className="text-xs text-emerald-800 font-semibold">
                          Package: {selectedApplicant.offer.ctc} LPA • {selectedApplicant.offer.designation}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider ${
                      selectedApplicant.offer.status === "Accepted" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                      selectedApplicant.offer.status === "Declined" ? "bg-red-100 text-red-800 border-red-300" :
                      "bg-amber-100 text-amber-800 border-amber-300"
                    }`}>
                      {selectedApplicant.offer.status}
                    </span>
                  </div>

                  <div className="text-xs text-gray-700 bg-white/80 p-3 rounded-xl border border-emerald-100 space-y-1">
                    <p><span className="font-bold text-gray-900">Expected Joining:</span> {selectedApplicant.offer.joiningDate}</p>
                    <p><span className="font-bold text-gray-900">Work Location:</span> {selectedApplicant.offer.workLocation}</p>
                    <p><span className="font-bold text-gray-900">Base Salary:</span> {selectedApplicant.offer.baseSalary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setPreviewOffer(selectedApplicant.offer)}
                      className="bg-white border-emerald-300 text-emerald-900 hover:bg-emerald-100 text-xs font-bold"
                    >
                      View Offer Letter
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOpenReleaseOfferModal(selectedApplicant)}
                      className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold"
                    >
                      Edit Offer Terms
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="text-sm font-bold text-emerald-950">Release Job Offer</p>
                      <p className="text-xs text-emerald-700">Generate and release an official offer letter.</p>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                    onClick={() => handleOpenReleaseOfferModal(selectedApplicant)}
                  >
                    Release Offer
                  </Button>
                </div>
              )}

              {/* Interview Status Card inside Details */}
              {selectedApplicant.interview ? (
                <div className="p-4 bg-gradient-to-br from-indigo-50/60 to-purple-50/60 rounded-2xl border border-indigo-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-indigo-900">{selectedApplicant.interview.roundName}</h4>
                        <p className="text-xs text-indigo-700 font-medium">
                          {selectedApplicant.interview.date} at {selectedApplicant.interview.time} ({selectedApplicant.interview.duration})
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOpenScheduleModal(selectedApplicant)}
                      className="bg-white border-indigo-300 text-indigo-900 hover:bg-indigo-100 text-xs font-bold"
                    >
                      Edit Slot
                    </Button>
                  </div>

                  <div className="text-xs text-gray-700 bg-white/80 p-3 rounded-xl border border-indigo-100 space-y-1">
                    <p><span className="font-bold text-gray-900">Interviewer:</span> {selectedApplicant.interview.interviewerName} ({selectedApplicant.interview.interviewerRole})</p>
                    {selectedApplicant.interview.meetingLink && (
                      <p className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-gray-900">Meeting:</span>
                        <a href={selectedApplicant.interview.meetingLink} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate">
                          {selectedApplicant.interview.meetingLink}
                        </a>
                      </p>
                    )}
                    {selectedApplicant.interview.instructions && (
                      <p className="pt-1 text-gray-600 italic">"{selectedApplicant.interview.instructions}"</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarPlus className="w-6 h-6 text-indigo-600" />
                    <div>
                      <p className="text-sm font-bold text-indigo-950">No Interview Scheduled</p>
                      <p className="text-xs text-indigo-700">Invite this candidate to a live evaluation round.</p>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                    onClick={() => handleOpenScheduleModal(selectedApplicant)}
                  >
                    Schedule Now
                  </Button>
                </div>
              )}

              {/* Contact & Academic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Email</span>
                    <span className="text-xs font-semibold text-gray-800 truncate block">{selectedApplicant.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-xs">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Phone</span>
                    <span className="text-xs font-semibold text-gray-800">{selectedApplicant.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-xs">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Course / Branch</span>
                    <span className="text-xs font-semibold text-gray-800 truncate block">{selectedApplicant.course}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-xs">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-700 uppercase font-bold block">Cumulative CGPA</span>
                    <span className="text-sm font-extrabold text-indigo-900">{selectedApplicant.cgpa}</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                 <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Candidate Skills</h4>
                 <div className="flex flex-wrap gap-2">
                   {selectedApplicant.tags.map(tag => (
                     <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200">
                       {tag}
                     </span>
                   ))}
                 </div>
              </div>

              {/* Resume Section with View & Download */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        PDF
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 truncate max-w-[220px] sm:max-w-[280px]">
                          {selectedApplicant.resumeFile}
                        </p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          {selectedApplicant.hasUploadedData ? "Uploaded by applicant" : "Generated Candidate ATS Resume"}
                        </p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                   <Button 
                     variant="outline"
                     className="bg-white hover:bg-indigo-50 hover:text-indigo-700 border-indigo-200 text-indigo-600 font-semibold text-xs flex items-center justify-center gap-2 py-2.5 shadow-xs"
                     onClick={() => handleViewResume(selectedApplicant)}
                   >
                     <Eye className="w-4 h-4" /> View Resume
                   </Button>

                   <Button 
                     className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 py-2.5 shadow-sm shadow-indigo-200"
                     onClick={() => handleDownloadResume(selectedApplicant)}
                   >
                     <Download className="w-4 h-4" /> Download Resume
                   </Button>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-400">Application ID: #{selectedApplicant.id}</span>
              <Button variant="outline" onClick={() => setSelectedApplicant(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FULL INTERACTIVE RESUME VIEWER MODAL */}
      {previewApplicant && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{previewApplicant.name} - Resume</h3>
                  <p className="text-xs text-gray-500">{previewApplicant.resumeFile}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white gap-1.5 text-xs text-gray-700"
                  onClick={() => handleDownloadResume(previewApplicant)}
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </Button>

                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white gap-1.5 text-xs text-gray-700"
                  onClick={() => printAtsResume(previewApplicant.fullProfile)}
                >
                  <Printer className="w-3.5 h-3.5" /> Print / PDF
                </Button>

                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white gap-1.5 text-xs text-gray-700"
                  onClick={() => {
                    if (previewApplicant.resumeData) {
                      openResumeInNewTab(previewApplicant.resumeData, previewApplicant.resumeFile);
                    } else {
                      const dataUrl = getAtsResumeDataUrl(previewApplicant.fullProfile);
                      openResumeInNewTab(dataUrl, previewApplicant.resumeFile);
                    }
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Tab
                </Button>

                <button 
                  onClick={() => setPreviewApplicant(null)} 
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content - Resume Display */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-6 flex justify-center">
              {previewApplicant.resumeData && previewApplicant.resumeData.startsWith('data:application/pdf') ? (
                <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <iframe 
                    src={previewApplicant.resumeData} 
                    title="Student Resume PDF" 
                    className="w-full h-full border-none"
                  />
                </div>
              ) : previewApplicant.resumeData && (previewApplicant.resumeData.startsWith('data:image/') || previewApplicant.resumeData.startsWith('http')) ? (
                <div className="max-w-2xl bg-white p-4 rounded-2xl shadow-md border border-gray-200">
                  <img 
                    src={previewApplicant.resumeData} 
                    alt="Uploaded Resume" 
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
              ) : (
                /* ATS Formatted Printable Document View */
                <div className="w-full max-w-2xl bg-white p-8 sm:p-12 rounded-2xl shadow-md border border-gray-200 text-gray-900 font-sans space-y-6 my-auto">
                  {/* Header */}
                  <div className="text-center border-b-2 border-gray-900 pb-5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-gray-900 mb-2">
                      {previewApplicant.fullProfile?.fullName || previewApplicant.name}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      {previewApplicant.email} {previewApplicant.phone !== "N/A" ? `| ${previewApplicant.phone}` : ''} | {previewApplicant.course}
                    </p>
                  </div>

                  {/* Summary */}
                  {previewApplicant.fullProfile?.summary && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-2">
                        Professional Summary
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {previewApplicant.fullProfile.summary}
                      </p>
                    </div>
                  )}

                  {/* Education */}
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-3">
                      Education
                    </h2>
                    <div className="flex justify-between items-start text-xs sm:text-sm">
                      <div>
                        <p className="font-bold text-gray-900">{previewApplicant.college}</p>
                        <p className="text-gray-600 italic">{previewApplicant.course}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-700">CGPA: {previewApplicant.cgpa}</p>
                        <p className="text-gray-500 text-xs">{previewApplicant.fullProfile?.yearSem || "Final Year"}</p>
                      </div>
                    </div>
                    {(previewApplicant.fullProfile?.marks10th || previewApplicant.fullProfile?.marks12th) && (
                      <p className="text-xs text-gray-500 mt-1.5">
                        {[previewApplicant.fullProfile?.marks12th && `Class 12th: ${previewApplicant.fullProfile.marks12th}`, previewApplicant.fullProfile?.marks10th && `Class 10th: ${previewApplicant.fullProfile.marks10th}`].filter(Boolean).join(' | ')}
                      </p>
                    )}
                  </div>

                  {/* Skills */}
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-2.5">
                      Technical Skills & Competencies
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-800">
                      <span className="font-bold">Core Skills:</span> {previewApplicant.tags.join(', ')}
                    </p>
                  </div>

                  {/* Projects */}
                  {previewApplicant.fullProfile?.projects?.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-3">
                        Academic & Personal Projects
                      </h2>
                      <div className="space-y-3">
                        {previewApplicant.fullProfile.projects.map((proj, idx) => (
                          <div key={idx} className="text-xs sm:text-sm">
                            <div className="flex justify-between">
                              <span className="font-bold text-gray-900">{proj.title}</span>
                              {proj.link && <span className="text-indigo-600 text-xs font-medium">{proj.link}</span>}
                            </div>
                            {proj.tech && <p className="text-gray-500 text-xs italic">Tech Stack: {proj.tech}</p>}
                            {proj.desc && <p className="text-gray-700 text-xs mt-1">• {proj.desc}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {previewApplicant.fullProfile?.experience?.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-3">
                        Internships & Experience
                      </h2>
                      <div className="space-y-3">
                        {previewApplicant.fullProfile.experience.map((exp, idx) => (
                          <div key={idx} className="text-xs sm:text-sm">
                            <div className="flex justify-between font-semibold text-gray-900">
                              <span>{exp.company} | <span className="italic font-normal">{exp.role}</span></span>
                              <span className="text-gray-500 text-xs">{exp.duration}</span>
                            </div>
                            {exp.desc && <p className="text-gray-700 text-xs mt-1">• {exp.desc}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {previewApplicant.fullProfile?.certifications?.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-2.5">
                        Certifications
                      </h2>
                      <ul className="list-disc list-inside text-xs sm:text-sm text-gray-800 space-y-1">
                        {previewApplicant.fullProfile.certifications.map((c, idx) => (
                          <li key={idx}>
                            <span className="font-semibold">{c.course || c.title}</span>
                            {c.platform && <span className="text-gray-500"> - {c.platform}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-500">Resume viewer ready for hiring evaluation.</span>
              <Button variant="outline" onClick={() => setPreviewApplicant(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
