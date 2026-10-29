import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { 
  Clock, Calendar, CheckCircle, Video, Plus, User, Trash2, Search, 
  Sparkles, ExternalLink, Download, FileText, Printer, X, Eye, 
  MapPin, Send, Edit3, Link as LinkIcon, AlertCircle, Copy, Check,
  Star, Award, CheckSquare
} from "lucide-react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useJobs } from "../../context/JobContext";
import { useAuth } from "../../context/AuthContext";
import { 
  downloadBase64File, 
  openResumeInNewTab, 
  downloadAtsResume, 
  printAtsResume, 
  getAtsResumeDataUrl 
} from "../../utils/resumeHelper";

export default function RecruiterInterviews() {
  const { jobs } = useJobs();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("candidate_interviews"); // 'candidate_interviews' | 'open_slots'
  const [searchQuery, setSearchQuery] = useState("");
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [candidateEvaluations, setCandidateEvaluations] = useState([]);
  const [openSlots, setOpenSlots] = useState([]);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [previewApplicant, setPreviewApplicant] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // New Open Slot Form
  const [newSlot, setNewSlot] = useState({
    date: "",
    time: "11:00",
    duration: "45 mins",
    topic: "Technical Interview & Problem Solving",
    meetingLink: "",
    mode: "Google Meet"
  });

  // Modal for editing/scheduling applicant interview
  const [editingInterview, setEditingInterview] = useState(null);
  const [editForm, setEditForm] = useState({
    roundName: "Technical Round 1",
    date: "",
    time: "11:00",
    duration: "45 mins",
    mode: "Google Meet",
    meetingLink: "",
    venue: "Placement Cell - Interview Room 204",
    interviewerName: user?.name || "Hiring Manager",
    interviewerRole: "Engineering Recruiter",
    instructions: "Please join 5 minutes before scheduled time with webcam on and code editor ready."
  });

  // Modal for candidate scorecard evaluation
  const [evaluatingInterview, setEvaluatingInterview] = useState(null);
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

  const loadData = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('scheduled_job_interviews') || '[]');
      setScheduledInterviews(stored);
    } catch {
      setScheduledInterviews([]);
    }

    try {
      const evals = JSON.parse(localStorage.getItem('candidate_evaluations') || '[]');
      setCandidateEvaluations(evals);
    } catch {
      setCandidateEvaluations([]);
    }

    try {
      const slots = JSON.parse(localStorage.getItem('recruiter_open_slots') || '[]');
      setOpenSlots(slots);
    } catch {
      setOpenSlots([]);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('interviews_updated', loadData);
    window.addEventListener('evaluations_updated', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('interviews_updated', loadData);
      window.removeEventListener('evaluations_updated', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  // Filter jobs posted by this recruiter unless admin
  const myJobs = (user?.role === "RECRUITER" || user?.role === "ALUMNI")
    ? jobs.filter(j => j.postedBy === user?.email)
    : jobs;
  
  const myJobIds = myJobs.map(j => j.id);

  // Interviews relevant to this recruiter's jobs
  const relevantInterviews = scheduledInterviews.filter(i => 
    myJobIds.includes(i.jobId) || i.interviewerName === user?.name
  );

  const filteredInterviews = relevantInterviews.filter(inv => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (inv.applicantName || "").toLowerCase().includes(q) ||
      (inv.applicantEmail || "").toLowerCase().includes(q) ||
      (inv.jobRole || "").toLowerCase().includes(q) ||
      (inv.roundName || "").toLowerCase().includes(q)
    );
  });

  // Generate Meet link helper
  const handleGenerateMeetLink = (forOpenSlot = false) => {
    const randomCode = Math.random().toString(36).substring(2, 5) + "-" + 
                       Math.random().toString(36).substring(2, 6) + "-" + 
                       Math.random().toString(36).substring(2, 5);
    const link = `https://meet.google.com/${randomCode}`;
    if (forOpenSlot) {
      setNewSlot(prev => ({ ...prev, meetingLink: link }));
    } else {
      setEditForm(prev => ({ ...prev, meetingLink: link }));
    }
  };

  // Open slot creation
  const handleAddOpenSlot = (e) => {
    e.preventDefault();
    if (!newSlot.date || !newSlot.time || !newSlot.topic) return;

    const meetLink = newSlot.meetingLink || `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    
    const slotRecord = {
      id: Date.now(),
      ...newSlot,
      meetingLink: meetLink,
      recruiterEmail: user?.email,
      recruiterName: user?.name || "Campus Recruiter",
      bookedBy: null
    };

    const updated = [slotRecord, ...openSlots];
    setOpenSlots(updated);
    localStorage.setItem('recruiter_open_slots', JSON.stringify(updated));
    setIsSlotModalOpen(false);
    setNewSlot({
      date: "",
      time: "11:00",
      duration: "45 mins",
      topic: "Technical Interview & Problem Solving",
      meetingLink: "",
      mode: "Google Meet"
    });
  };

  const handleRemoveOpenSlot = (id) => {
    const updated = openSlots.filter(s => s.id !== id);
    setOpenSlots(updated);
    localStorage.setItem('recruiter_open_slots', JSON.stringify(updated));
  };

  // Open Edit Modal for an Interview
  const handleOpenEditModal = (interview) => {
    setEditingInterview(interview);
    setEditForm({
      roundName: interview.roundName || "Technical Round 1",
      date: interview.date || "",
      time: interview.time || "11:00",
      duration: interview.duration || "45 mins",
      mode: interview.mode || "Google Meet",
      meetingLink: interview.meetingLink || "",
      venue: interview.venue || "Placement Cell - Interview Room 204",
      interviewerName: interview.interviewerName || user?.name || "Hiring Manager",
      interviewerRole: interview.interviewerRole || "Engineering Recruiter",
      instructions: interview.instructions || "Please join 5 minutes before scheduled time with webcam on and code editor ready."
    });
  };

  // Save changes to candidate interview
  const handleSaveEditInterview = (e) => {
    e.preventDefault();
    if (!editingInterview) return;

    const updatedRecord = {
      ...editingInterview,
      roundName: editForm.roundName,
      date: editForm.date,
      time: editForm.time,
      duration: editForm.duration,
      mode: editForm.mode,
      meetingLink: editForm.meetingLink,
      venue: editForm.venue,
      interviewerName: editForm.interviewerName,
      interviewerRole: editForm.interviewerRole,
      instructions: editForm.instructions,
      updatedAt: new Date().toISOString()
    };

    const currentInterviews = JSON.parse(localStorage.getItem('scheduled_job_interviews') || '[]');
    const filtered = currentInterviews.filter(i => i.id !== editingInterview.id && !(i.jobId === editingInterview.jobId && i.applicantEmail === editingInterview.applicantEmail));
    const updated = [updatedRecord, ...filtered];
    localStorage.setItem('scheduled_job_interviews', JSON.stringify(updated));

    // Notify student
    const notifications = JSON.parse(localStorage.getItem('student_notifications') || '[]');
    const newNotification = {
      id: Date.now(),
      message: `🔄 Interview Updated! Your ${editForm.roundName} for ${editingInterview.jobRole} at ${editingInterview.company} has been scheduled for ${editForm.date} at ${editForm.time} (${editForm.duration}). Link: ${editForm.meetingLink}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      read: false,
      interviewId: updatedRecord.id,
      meetingLink: editForm.meetingLink
    };
    localStorage.setItem('student_notifications', JSON.stringify([newNotification, ...notifications]));

    window.dispatchEvent(new Event('notifications_updated'));
    window.dispatchEvent(new Event('interviews_updated'));

    setEditingInterview(null);
    loadData();
  };

  // Open Scorecard Modal
  const handleOpenEvaluationModal = (interview) => {
    const existing = candidateEvaluations.find(e => e.jobId === interview.jobId && e.applicantEmail === interview.applicantEmail);
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
        strengths: "Quick problem comprehension, good edge case testing.",
        areasForImprovement: "System scaling and asynchronous architecture.",
        notes: "Strong candidate who passed the coding round."
      });
    }
    setEvaluatingInterview(interview);
  };

  const handleSaveEvaluation = (e) => {
    e.preventDefault();
    if (!evaluatingInterview) return;

    const overall = (
      (parseFloat(evaluationForm.technicalScore) +
       parseFloat(evaluationForm.problemSolvingScore) +
       parseFloat(evaluationForm.domainScore) +
       parseFloat(evaluationForm.communicationScore)) / 4
    ).toFixed(1);

    const evalRecord = {
      id: `eval_${Date.now()}`,
      jobId: evaluatingInterview.jobId,
      jobRole: evaluatingInterview.jobRole,
      company: evaluatingInterview.company,
      applicantEmail: evaluatingInterview.applicantEmail,
      applicantName: evaluatingInterview.applicantName,
      overallScore: overall,
      technicalScore: evaluationForm.technicalScore,
      problemSolvingScore: evaluationForm.problemSolvingScore,
      domainScore: evaluationForm.domainScore,
      communicationScore: evaluationForm.communicationScore,
      recommendation: evaluationForm.recommendation,
      strengths: evaluationForm.strengths,
      areasForImprovement: evaluationForm.areasForImprovement,
      notes: evaluationForm.notes,
      evaluatedBy: user?.name || "Technical Interviewer",
      evaluatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const currentEvals = JSON.parse(localStorage.getItem('candidate_evaluations') || '[]');
    const filtered = currentEvals.filter(e => !(e.jobId === evaluatingInterview.jobId && e.applicantEmail === evaluatingInterview.applicantEmail));
    localStorage.setItem('candidate_evaluations', JSON.stringify([evalRecord, ...filtered]));

    window.dispatchEvent(new Event('evaluations_updated'));
    setEvaluatingInterview(null);
    loadData();
  };

  // Cancel candidate interview
  const handleCancelInterview = (interview) => {
    const currentInterviews = JSON.parse(localStorage.getItem('scheduled_job_interviews') || '[]');
    const filtered = currentInterviews.filter(i => i.id !== interview.id && !(i.jobId === interview.jobId && i.applicantEmail === interview.applicantEmail));
    localStorage.setItem('scheduled_job_interviews', JSON.stringify(filtered));

    const notifications = JSON.parse(localStorage.getItem('student_notifications') || '[]');
    const newNotification = {
      id: Date.now(),
      message: `Your interview for ${interview.jobRole} at ${interview.company} has been cancelled by the recruiter.`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      read: false
    };
    localStorage.setItem('student_notifications', JSON.stringify([newNotification, ...notifications]));

    window.dispatchEvent(new Event('notifications_updated'));
    window.dispatchEvent(new Event('interviews_updated'));

    setEditingInterview(null);
    loadData();
  };

  // Open Resume Viewer for Candidate
  const handleOpenResume = (interview) => {
    const email = interview.applicantEmail;
    const jobId = interview.jobId;

    const appRecordRaw = localStorage.getItem(`application_data_${jobId}_${email}`);
    const appRecord = appRecordRaw ? JSON.parse(appRecordRaw) : null;
    const specificResumeName = localStorage.getItem(`resume_job_${jobId}_${email}`);
    const specificResumeData = localStorage.getItem(`resume_data_job_${jobId}_${email}`);
    const profileKey = `studentProfileData_${email}`;
    const studentProfile = JSON.parse(localStorage.getItem(profileKey) || 'null')
      || (JSON.parse(localStorage.getItem('studentProfileData') || 'null')?.email === email 
          ? JSON.parse(localStorage.getItem('studentProfileData')) 
          : null);

    const fullProfile = appRecord?.studentProfileSnapshot || studentProfile || {
      fullName: interview.applicantName,
      email: interview.applicantEmail,
      phone: "N/A",
      course: "Computer Science",
      college: "University Institute",
      cgpa: "N/A",
      skills: ["Technical Skills"],
      projects: [],
      experience: [],
      certifications: []
    };

    setPreviewApplicant({
      name: interview.applicantName,
      email: interview.applicantEmail,
      resumeFile: appRecord?.resumeFile || specificResumeName || `${interview.applicantName.replace(/\s+/g, '_')}_Resume.pdf`,
      resumeData: appRecord?.resumeData || specificResumeData || null,
      fullProfile: fullProfile,
      tags: fullProfile.skills || []
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysCount = relevantInterviews.filter(i => i.date === todayStr).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Video className="w-6 h-6 text-indigo-600" /> Interviews & Live Evaluations
          </h1>
          <p className="text-gray-500">Manage candidate interview rounds, submit scorecards, and launch video calls.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center gap-2"
            onClick={() => {
              handleGenerateMeetLink(true);
              setIsSlotModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4"/> Host Open Drive Slot
          </Button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Scheduled Candidates</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{relevantInterviews.length}</p>
            </div>
            <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <Video className="w-5 h-5"/>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white ring-1 ring-amber-200 bg-gradient-to-br from-white to-amber-50/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Today's Sessions</p>
              <p className="text-2xl font-extrabold text-amber-900 mt-1">{todaysCount}</p>
            </div>
            <div className="w-11 h-11 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5"/>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Evaluations Logged</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{candidateEvaluations.length}</p>
            </div>
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5"/>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("candidate_interviews")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "candidate_interviews"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Candidate Rounds ({relevantInterviews.length})
          </button>
          <button
            onClick={() => setActiveTab("open_slots")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "open_slots"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Hosted Drive Slots ({openSlots.length})
          </button>
        </div>

        {activeTab === "candidate_interviews" && (
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search candidate, role, or round..." 
              className="pl-9 h-9 text-xs rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* TAB 1: SCHEDULED CANDIDATE INTERVIEWS */}
      {activeTab === "candidate_interviews" && (
        <div className="space-y-4">
          {filteredInterviews.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white flex flex-col items-center">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                <Video className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No Candidate Interviews Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                Go to <span className="font-semibold text-indigo-600">Manage Applicants</span> to schedule live evaluation rounds for candidates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredInterviews.map((inv) => {
                const evalItem = candidateEvaluations.find(e => e.jobId === inv.jobId && e.applicantEmail === inv.applicantEmail);
                return (
                  <Card key={inv.id} className="border-indigo-100 shadow-sm hover:shadow-md transition-all bg-white overflow-hidden flex flex-col justify-between">
                    <CardContent className="p-5 space-y-4">
                      {/* Top candidate header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                            {inv.applicantName?.charAt(0) || "C"}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 leading-tight">{inv.applicantName}</h4>
                            <p className="text-[11px] text-gray-500">{inv.applicantEmail}</p>
                            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                              {inv.jobRole}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded shadow-2xs">
                          {inv.duration}
                        </span>
                      </div>

                      {/* Scorecard Summary Badge if evaluated */}
                      {evalItem && (
                        <div className="p-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 font-bold text-amber-900">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> Rating: {evalItem.overallScore}/5
                          </span>
                          <span className="font-extrabold text-[10px] bg-white px-1.5 py-0.5 rounded text-amber-800 border border-amber-200">
                            {evalItem.recommendation}
                          </span>
                        </div>
                      )}

                      {/* Round & Timing info */}
                      <div className="p-3 bg-gray-50/90 rounded-xl border border-gray-100 space-y-1.5">
                        <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> {inv.roundName}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {inv.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" /> {inv.time}</span>
                        </div>
                      </div>

                      {/* Interviewer */}
                      <div className="text-[11px] text-gray-500 space-y-1">
                        <p><span className="font-semibold text-gray-700">Interviewer:</span> {inv.interviewerName}</p>
                        {inv.instructions && (
                          <p className="truncate italic text-gray-400">"{inv.instructions}"</p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-gray-100 space-y-2">
                        {inv.meetingLink ? (
                          <a 
                            href={inv.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-100 transition-colors"
                          >
                            <Video className="w-3.5 h-3.5" /> Launch Video Call
                          </a>
                        ) : (
                          <p className="text-xs text-gray-600 text-center font-medium py-1">📍 {inv.venue || "Campus Venue"}</p>
                        )}

                        <div className="grid grid-cols-3 gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenResume(inv)}
                            className="text-xs text-gray-700 border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-1 p-1"
                          >
                            <FileText className="w-3 h-3 text-indigo-500" /> Resume
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEvaluationModal(inv)}
                            className="text-xs text-amber-800 bg-amber-50/60 border-amber-200 hover:bg-amber-100 flex items-center justify-center gap-1 p-1"
                          >
                            <Star className="w-3 h-3 text-amber-500" /> Score
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditModal(inv)}
                            className="text-xs text-gray-700 border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-1 p-1"
                          >
                            <Edit3 className="w-3 h-3 text-indigo-500" /> Reschedule
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OPEN DRIVE SLOTS */}
      {activeTab === "open_slots" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {openSlots.map((slot) => (
              <Card key={slot.id} className="border-indigo-100 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        {slot.topic}
                      </span>
                      <button 
                        onClick={() => handleRemoveOpenSlot(slot.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-700">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400"/> {slot.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400"/> {slot.time} ({slot.duration})</span>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      <p><span className="font-semibold text-gray-700">Hosted By:</span> {slot.recruiterName}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <a
                      href={slot.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" /> Launch Room
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}

            {openSlots.length === 0 && (
              <div className="col-span-full p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                <p className="text-sm font-medium text-gray-500">No open drive slots created yet. Click "Host Open Drive Slot" above to publish one!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EVALUATION / SCORECARD MODAL */}
      {evaluatingInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Interview Scorecard</h3>
                  <p className="text-xs text-gray-500">Candidate: {evaluatingInterview.applicantName} ({evaluatingInterview.jobRole})</p>
                </div>
              </div>
              <button onClick={() => setEvaluatingInterview(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="p-6 space-y-4">
              <div className="space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Competency Scores (1 to 5)</h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-800">Technical & Coding</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setEvaluationForm({ ...evaluationForm, technicalScore: v })}
                        className={`w-7 h-7 rounded-lg text-xs font-bold ${
                          evaluationForm.technicalScore === v 
                            ? "bg-amber-500 text-white shadow-xs" 
                            : "bg-white text-gray-700 border border-gray-200"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                  <span className="text-xs font-semibold text-gray-800">Problem Solving & DSA</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setEvaluationForm({ ...evaluationForm, problemSolvingScore: v })}
                        className={`w-7 h-7 rounded-lg text-xs font-bold ${
                          evaluationForm.problemSolvingScore === v 
                            ? "bg-amber-500 text-white shadow-xs" 
                            : "bg-white text-gray-700 border border-gray-200"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                  <span className="text-xs font-semibold text-gray-800">Communication & Fit</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setEvaluationForm({ ...evaluationForm, communicationScore: v })}
                        className={`w-7 h-7 rounded-lg text-xs font-bold ${
                          evaluationForm.communicationScore === v 
                            ? "bg-amber-500 text-white shadow-xs" 
                            : "bg-white text-gray-700 border border-gray-200"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                  Recommendation
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["Strong Hire", "Hire", "Leaning Hire", "Reject"].map((rec) => (
                    <button
                      key={rec}
                      type="button"
                      onClick={() => setEvaluationForm({ ...evaluationForm, recommendation: rec })}
                      className={`p-2 rounded-xl border text-xs font-bold ${
                        evaluationForm.recommendation === rec 
                          ? "bg-amber-600 text-white border-amber-600 shadow-xs" 
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {rec}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                  Evaluation Comments & Justification
                </label>
                <textarea
                  rows={2}
                  value={evaluationForm.notes}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, notes: e.target.value })}
                  placeholder="Notes on candidate technical approach..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <Button type="button" variant="outline" className="text-xs" onClick={() => setEvaluatingInterview(null)}>Cancel</Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white text-xs">Save Scorecard</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HOST OPEN DRIVE SLOT MODAL */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-900">Host Open Interview / Drive Slot</h2>
              <button onClick={() => setIsSlotModalOpen(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddOpenSlot} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Date</label>
                  <input 
                    type="date" 
                    min={new Date().toLocaleDateString('en-CA')} 
                    required 
                    value={newSlot.date} 
                    onChange={e => setNewSlot({...newSlot, date: e.target.value})} 
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Time</label>
                  <input 
                    type="time" 
                    required 
                    value={newSlot.time} 
                    onChange={e => setNewSlot({...newSlot, time: e.target.value})} 
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Duration</label>
                <select 
                  value={newSlot.duration} 
                  onChange={e => setNewSlot({...newSlot, duration: e.target.value})} 
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option>30 mins</option>
                  <option>45 mins</option>
                  <option>60 mins</option>
                  <option>90 mins</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Interview Topic / Format</label>
                <input 
                  type="text" 
                  placeholder="e.g. Campus Placement Round 1, System Design" 
                  required 
                  value={newSlot.topic} 
                  onChange={e => setNewSlot({...newSlot, topic: e.target.value})} 
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Video Meeting Link</label>
                  <button 
                    type="button" 
                    onClick={() => handleGenerateMeetLink(true)} 
                    className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3"/> Auto-Generate Link
                  </button>
                </div>
                <input 
                  type="url" 
                  required 
                  value={newSlot.meetingLink} 
                  onChange={e => setNewSlot({...newSlot, meetingLink: e.target.value})} 
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>

              <div className="pt-3 flex gap-3">
                <Button type="button" variant="outline" className="w-full text-xs" onClick={() => setIsSlotModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs">Publish Open Slot</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CANDIDATE INTERVIEW MODAL */}
      {editingInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Edit Interview Slot</h3>
                <p className="text-xs text-gray-500">Candidate: {editingInterview.applicantName} ({editingInterview.jobRole})</p>
              </div>
              <button onClick={() => setEditingInterview(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditInterview} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Round Name</label>
                <input 
                  type="text" 
                  required 
                  value={editForm.roundName} 
                  onChange={e => setEditForm({...editForm, roundName: e.target.value})} 
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Date</label>
                  <input 
                    type="date" 
                    required 
                    value={editForm.date} 
                    onChange={e => setEditForm({...editForm, date: e.target.value})} 
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Time</label>
                  <input 
                    type="time" 
                    required 
                    value={editForm.time} 
                    onChange={e => setEditForm({...editForm, time: e.target.value})} 
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Duration</label>
                  <select 
                    value={editForm.duration} 
                    onChange={e => setEditForm({...editForm, duration: e.target.value})} 
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option>30 mins</option>
                    <option>45 mins</option>
                    <option>60 mins</option>
                    <option>90 mins</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Video Meeting URL</label>
                  <button 
                    type="button" 
                    onClick={() => handleGenerateMeetLink(false)} 
                    className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3"/> Auto-Generate
                  </button>
                </div>
                <input 
                  type="url" 
                  required 
                  value={editForm.meetingLink} 
                  onChange={e => setEditForm({...editForm, meetingLink: e.target.value})} 
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Candidate Preparation Instructions</label>
                <textarea 
                  rows={2} 
                  value={editForm.instructions} 
                  onChange={e => setEditForm({...editForm, instructions: e.target.value})} 
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="text-red-600 hover:bg-red-50 text-xs" 
                  onClick={() => handleCancelInterview(editingInterview)}
                >
                  Cancel Interview
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="text-xs" onClick={() => setEditingInterview(null)}>Close</Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">Save & Update</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANDIDATE RESUME PREVIEW MODAL */}
      {previewApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
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
                  onClick={() => {
                    const rawName = previewApplicant.name || "Applicant";
                    const filename = previewApplicant.resumeFile?.endsWith('.pdf') 
                      ? previewApplicant.resumeFile 
                      : `${rawName.replace(/\s+/g, '_')}_Resume.pdf`;
                    if (previewApplicant.resumeData) {
                      downloadBase64File(previewApplicant.resumeData, filename);
                    } else {
                      downloadAtsResume(previewApplicant.fullProfile, filename);
                    }
                  }}
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </Button>

                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white gap-1.5 text-xs text-gray-700"
                  onClick={() => printAtsResume(previewApplicant.fullProfile)}
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </Button>

                <button 
                  onClick={() => setPreviewApplicant(null)} 
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-100 p-6 flex justify-center">
              {previewApplicant.resumeData && previewApplicant.resumeData.startsWith('data:application/pdf') ? (
                <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <iframe 
                    src={previewApplicant.resumeData} 
                    title="Student Resume PDF" 
                    className="w-full h-full border-none"
                  />
                </div>
              ) : (
                <div className="w-full max-w-2xl bg-white p-8 sm:p-12 rounded-2xl shadow-md border border-gray-200 text-gray-900 font-sans space-y-6 my-auto">
                  <div className="text-center border-b-2 border-gray-900 pb-5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-gray-900 mb-2">
                      {previewApplicant.fullProfile?.fullName || previewApplicant.name}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      {previewApplicant.email} | {previewApplicant.fullProfile?.course || "Engineering"}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-2.5">
                      Technical Skills
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-800">
                      {previewApplicant.tags.join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
