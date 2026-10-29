import React, { useState, useEffect } from "react";
import { useJobs } from "../../context/JobContext";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { 
  Briefcase, MapPin, DollarSign, ExternalLink, Calendar, CheckCircle, Clock, 
  Video, Sparkles, X, Copy, Check, CalendarPlus, UserCheck, AlertCircle, 
  FileText, Award, Download, Printer, CheckCircle2, XCircle, ChevronRight, Building2
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/Button";

export default function StudentApplications() {
  const { jobs } = useJobs();
  const { user } = useAuth();
  const userEmail = user?.email || "";

  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [studentOffers, setStudentOffers] = useState([]);
  const [offerActionSuccess, setOfferActionSuccess] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);

  const loadData = () => {
    try {
      const storedInts = JSON.parse(localStorage.getItem('scheduled_job_interviews') || '[]');
      setScheduledInterviews(storedInts);
    } catch {
      setScheduledInterviews([]);
    }

    try {
      const storedOffers = JSON.parse(localStorage.getItem('student_job_offers') || '[]');
      setStudentOffers(storedOffers);
    } catch {
      setStudentOffers([]);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('interviews_updated', loadData);
    window.addEventListener('offers_updated', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('interviews_updated', loadData);
      window.removeEventListener('offers_updated', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const appliedJobs = jobs.filter(job => job.applicants?.includes(userEmail));
  const myInterviews = scheduledInterviews.filter(i => i.applicantEmail === userEmail);
  const myOffers = studentOffers.filter(o => o.applicantEmail === userEmail);
  const pendingOffers = myOffers.filter(o => o.status === "Pending");
  const acceptedOffers = myOffers.filter(o => o.status === "Accepted");

  const selectedJobs = appliedJobs.filter(job => {
    const hasAccepted = acceptedOffers.some(o => o.jobId === job.id);
    const hasOffer = myOffers.some(o => o.jobId === job.id);
    return hasAccepted || hasOffer || job.selected?.includes(userEmail);
  });

  const pendingCount = appliedJobs.length - selectedJobs.length;

  const handleCopyLink = (link) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getGoogleCalendarUrl = (interview) => {
    if (!interview || !interview.date || !interview.time) return "#";
    try {
      const startDateTimeStr = `${interview.date}T${interview.time.replace(':', '')}00`;
      const title = encodeURIComponent(`${interview.roundName || 'Interview'} - ${interview.company} (${interview.jobRole})`);
      const details = encodeURIComponent(
        `Job Interview for ${interview.jobRole} at ${interview.company}.\n` +
        `Interviewer: ${interview.interviewerName || 'Recruiter'} (${interview.interviewerRole || ''})\n` +
        `Meeting Link: ${interview.meetingLink || 'N/A'}\n\n` +
        `Instructions: ${interview.instructions || 'N/A'}`
      );
      const location = encodeURIComponent(interview.meetingLink || interview.venue || "Virtual");
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTimeStr}/${startDateTimeStr}&details=${details}&location=${location}`;
    } catch {
      return "#";
    }
  };

  // Handle student accepting offer
  const handleAcceptOffer = (offer) => {
    if (!termsAccepted) {
      alert("Please confirm your agreement to the terms & conditions before accepting.");
      return;
    }

    const allOffers = JSON.parse(localStorage.getItem('student_job_offers') || '[]');
    const updatedOffers = allOffers.map(o => {
      if (o.id === offer.id || (o.jobId === offer.jobId && o.applicantEmail === userEmail)) {
        return {
          ...o,
          status: "Accepted",
          acceptedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
      }
      return o;
    });

    localStorage.setItem('student_job_offers', JSON.stringify(updatedOffers));

    // Update job.selected in both pp_jobs_global and nexus_jobs
    try {
      const globalJobs = JSON.parse(localStorage.getItem('pp_jobs_global') || '[]');
      const updatedGlobal = globalJobs.map(j => {
        if (j.id === offer.jobId || (j.role === offer.jobRole && j.company === offer.company)) {
          const currentSel = j.selected || [];
          if (!currentSel.includes(userEmail)) {
            return { ...j, selected: [...currentSel, userEmail] };
          }
        }
        return j;
      });
      localStorage.setItem('pp_jobs_global', JSON.stringify(updatedGlobal));

      const nexusJobs = JSON.parse(localStorage.getItem('nexus_jobs') || '[]');
      const updatedNexus = nexusJobs.map(j => {
        if (j.id === offer.jobId || (j.role === offer.jobRole && j.company === offer.company)) {
          const currentSel = j.selected || [];
          if (!currentSel.includes(userEmail)) {
            return { ...j, selected: [...currentSel, userEmail] };
          }
        }
        return j;
      });
      localStorage.setItem('nexus_jobs', JSON.stringify(updatedNexus));
    } catch (err) {
      console.error(err);
    }

    // Update student_application_statuses
    const appStatuses = JSON.parse(localStorage.getItem('student_application_statuses') || '{}');
    appStatuses[`${offer.jobRole}_${userEmail}`] = "Offered";
    localStorage.setItem('student_application_statuses', JSON.stringify(appStatuses));

    // Send notifications
    const notifications = JSON.parse(localStorage.getItem('student_notifications') || '[]');
    const acceptNotification = {
      id: Date.now(),
      message: `🎉 Congratulations! You have successfully accepted the offer for ${offer.jobRole} at ${offer.company} (CTC: ₹${offer.ctc} LPA)!`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      read: false
    };
    localStorage.setItem('student_notifications', JSON.stringify([acceptNotification, ...notifications]));

    window.dispatchEvent(new Event('offers_updated'));
    window.dispatchEvent(new Event('notifications_updated'));
    window.dispatchEvent(new Event('jobs_updated'));
    window.dispatchEvent(new Event('storage'));

    setOfferActionSuccess({
      type: "accepted",
      message: `Congratulations! You have accepted the offer from ${offer.company}.`
    });

    // Update currently opened offer
    setSelectedOffer(prev => prev ? { ...prev, status: "Accepted", acceptedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } : null);
  };

  // Handle student declining offer
  const handleDeclineOffer = (offer) => {
    const allOffers = JSON.parse(localStorage.getItem('student_job_offers') || '[]');
    const updatedOffers = allOffers.map(o => {
      if (o.id === offer.id || (o.jobId === offer.jobId && o.applicantEmail === userEmail)) {
        return {
          ...o,
          status: "Declined",
          declineReason: declineReason || "Candidate opted for another opportunity",
          declinedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
      }
      return o;
    });

    localStorage.setItem('student_job_offers', JSON.stringify(updatedOffers));

    window.dispatchEvent(new Event('offers_updated'));

    setOfferActionSuccess({
      type: "declined",
      message: `You have declined the offer from ${offer.company}.`
    });

    setShowDeclineConfirm(false);
    setSelectedOffer(prev => prev ? { ...prev, status: "Declined" } : null);
  };

  const handlePrintOffer = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Applications & Offers</h1>
          <p className="text-gray-500">Track your application pipeline, interview invitations, and official job offers.</p>
        </div>
        <Link to="/student/jobs" className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-indigo-100 shadow-sm inline-flex items-center gap-2">
           <Briefcase className="w-4 h-4" /> Explore More Roles
        </Link>
      </div>

      {/* Prominent Celebratory Banner for Received Offers */}
      {pendingOffers.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden animate-in slide-in-from-top-3">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
                <Award className="w-8 h-8 text-amber-300 animate-bounce" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest bg-white/25 px-2.5 py-0.5 rounded-full text-white inline-block mb-1">
                  Official Job Offer Extended!
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  You have {pendingOffers.length} pending job offer{pendingOffers.length > 1 ? "s" : ""}!
                </h3>
                <p className="text-emerald-100 text-sm mt-0.5">
                  Review your compensation breakdown and formal terms to accept before the deadline.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button 
                onClick={() => {
                  setSelectedOffer(pendingOffers[0]);
                  setTermsAccepted(false);
                  setShowDeclineConfirm(false);
                }}
                className="bg-white hover:bg-emerald-50 text-emerald-800 font-bold px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                Review Offer Letter &rarr;
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
         <Card className="border-none shadow-sm bg-white">
           <CardContent className="p-5 flex items-center justify-between">
              <div>
                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Applied</p>
                 <p className="text-2xl font-extrabold text-gray-900 mt-1">{appliedJobs.length}</p>
              </div>
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                 <Briefcase className="w-5 h-5"/>
              </div>
           </CardContent>
         </Card>

         <Card className="border-none shadow-sm bg-white">
           <CardContent className="p-5 flex items-center justify-between">
              <div>
                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Under Review</p>
                 <p className="text-2xl font-extrabold text-gray-900 mt-1">{pendingCount}</p>
              </div>
              <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                 <Clock className="w-5 h-5"/>
              </div>
           </CardContent>
         </Card>

         <Card className="border-none shadow-sm bg-white ring-1 ring-amber-200 bg-gradient-to-br from-white to-amber-50/40">
           <CardContent className="p-5 flex items-center justify-between">
              <div>
                 <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Interviews Set</p>
                 <p className="text-2xl font-extrabold text-amber-900 mt-1">{myInterviews.length}</p>
              </div>
              <div className="w-11 h-11 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                 <Video className="w-5 h-5"/>
              </div>
           </CardContent>
         </Card>

         <Card className={`border-none shadow-sm bg-white ${myOffers.length > 0 ? "ring-2 ring-emerald-500 bg-emerald-50/30" : "border-emerald-100 ring-1 ring-emerald-50"}`}>
           <CardContent className="p-5 flex items-center justify-between">
              <div>
                 <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Job Offers</p>
                 <p className="text-2xl font-extrabold text-emerald-700 mt-1">{myOffers.length}</p>
              </div>
              <div className="w-11 h-11 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                 <Award className="w-5 h-5"/>
              </div>
           </CardContent>
         </Card>
      </div>

      {/* Applications & Offers Table */}
      <Card className="border-none shadow-sm bg-white overflow-hidden mt-6 w-full">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-gray-900">Application Pipeline & Offers</CardTitle>
          <span className="text-xs text-gray-500 font-medium">Click on any Offer or Interview to view full details</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Job Role & Company</th>
                  <th className="px-6 py-4 font-semibold">Compensation</th>
                  <th className="px-6 py-4 font-semibold">Interview / Evaluation</th>
                  <th className="px-6 py-4 font-semibold text-right">Offer Status</th>
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
                  const appStatuses = JSON.parse(localStorage.getItem('student_application_statuses') || '{}');
                  const currentStatus = appStatuses[`${job.role}_${userEmail}`] || (job.selected?.includes(userEmail) ? "Offered" : "Applied");
                  const interview = myInterviews.find(i => i.jobId === job.id);
                  const offer = myOffers.find(o => o.jobId === job.id);
                  
                  return (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
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
                       <p className="text-gray-800 font-semibold text-xs">
                         {job.salaryAmount} {job.salaryCurrency} <span className="text-[10px] text-gray-400 uppercase ml-0.5 font-normal">{job.salaryType}</span>
                       </p>
                       <p className="text-gray-400 text-[11px] mt-0.5 flex items-center gap-1 font-medium">
                         <Calendar className="w-3 h-3"/> Deadline: {job.deadline}
                       </p>
                    </td>

                    <td className="px-6 py-4">
                      {interview ? (
                        <button
                          onClick={() => setSelectedInterview(interview)}
                          className="text-left group/btn p-2 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 transition-all cursor-pointer block"
                        >
                          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                            <Video className="w-3.5 h-3.5 text-amber-600 shrink-0 group-hover/btn:scale-110 transition-transform" />
                            <span>{interview.roundName}</span>
                          </div>
                          <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                            {interview.date} at {interview.time} ({interview.duration})
                          </p>
                          <span className="text-[10px] font-bold text-indigo-600 underline mt-1 inline-block">
                            View Meeting Link & Details &rarr;
                          </span>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No interview scheduled</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                       {offer ? (
                         offer.status === "Accepted" ? (
                           <button
                             onClick={() => {
                               setSelectedOffer(offer);
                               setTermsAccepted(true);
                               setShowDeclineConfirm(false);
                             }}
                             className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 hover:bg-emerald-200 shadow-sm transition-all"
                           >
                             <CheckCircle className="w-3.5 h-3.5 text-emerald-600"/>
                             Offer Accepted (₹{offer.ctc} LPA)
                           </button>
                         ) : offer.status === "Declined" ? (
                           <button
                             onClick={() => setSelectedOffer(offer)}
                             className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 hover:bg-gray-200"
                           >
                             <XCircle className="w-3.5 h-3.5 text-gray-500"/>
                             Declined (₹{offer.ctc} LPA)
                           </button>
                         ) : (
                           <button
                             onClick={() => {
                               setSelectedOffer(offer);
                               setTermsAccepted(false);
                               setShowDeclineConfirm(false);
                             }}
                             className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-200 animate-pulse transition-all cursor-pointer"
                           >
                             <Sparkles className="w-3.5 h-3.5 text-amber-300"/>
                             Offer Extended! Review (₹{offer.ctc} LPA) &rarr;
                           </button>
                         )
                       ) : currentStatus === "Offered" || currentStatus === "Selected" ? (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 shadow-xs">
                            <CheckCircle className="w-3.5 h-3.5"/>
                            Selected / Offered
                         </span>
                       ) : currentStatus === "Interviewing" || interview ? (
                         <button
                           onClick={() => interview && setSelectedInterview(interview)}
                           className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-amber-800 bg-amber-100/80 border border-amber-300 hover:bg-amber-200 transition-colors shadow-xs"
                         >
                            <Video className="w-3.5 h-3.5 text-amber-600"/>
                            Interviewing
                         </button>
                       ) : currentStatus === "Shortlisted" ? (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100">
                            <CheckCircle className="w-3.5 h-3.5"/>
                            Shortlisted
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

      {/* STUDENT OFFER LETTER & ACCEPTANCE MODAL */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 border border-gray-100">
            
            {/* Branded Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-700 via-teal-800 to-indigo-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-inner">
                  <Award className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded text-white">
                      Official Employment Offer Letter
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedOffer.status === "Accepted" ? "bg-emerald-300 text-emerald-950 font-extrabold" :
                      selectedOffer.status === "Declined" ? "bg-rose-300 text-rose-950" : "bg-amber-300 text-amber-950 animate-pulse"
                    }`}>
                      Status: {selectedOffer.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mt-1 text-white leading-tight">
                    {selectedOffer.company} — {selectedOffer.designation || selectedOffer.jobRole}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrintOffer}
                  title="Print / Save as PDF"
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button 
                  onClick={() => setSelectedOffer(null)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto text-gray-800">
              
              {/* Document Header */}
              <div className="border-b-2 border-gray-900 pb-5 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                    {selectedOffer.company}
                  </h1>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
                    Campus Talent Acquisition & Global HR Division
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Location: {selectedOffer.workLocation}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-gray-500">REF: {selectedOffer.id}</p>
                  <p className="text-xs text-gray-600 mt-1 font-medium">Date: {selectedOffer.releasedAt}</p>
                </div>
              </div>

              {/* Status Alert if Accepted or Declined */}
              {selectedOffer.status === "Accepted" && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Offer Officially Accepted!</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      You signed and accepted this offer on {selectedOffer.acceptedAt || selectedOffer.releasedAt}. The HR team and Placement Cell have been informed.
                    </p>
                  </div>
                </div>
              )}

              {selectedOffer.status === "Declined" && (
                <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-2xl flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Offer Declined</h4>
                    <p className="text-xs text-rose-700 mt-0.5">
                      You declined this position. Reason noted: {selectedOffer.declineReason || "Candidate opted for another role."}
                    </p>
                  </div>
                </div>
              )}

              {/* Formal Salutation */}
              <div className="space-y-3 text-sm leading-relaxed text-gray-700">
                <p>
                  <strong>Dear {selectedOffer.applicantName || user?.name || "Candidate"},</strong>
                </p>
                <p>
                  On behalf of <strong>{selectedOffer.company}</strong>, we are thrilled to extend this formal offer of campus employment for the role of <strong>{selectedOffer.designation || selectedOffer.jobRole}</strong>.
                </p>
                {selectedOffer.welcomeMessage && (
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs italic text-gray-600">
                    "{selectedOffer.welcomeMessage}"
                  </div>
                )}
              </div>

              {/* Comprehensive Compensation Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Compensation & Benefits Package
                </h4>
                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Compensation Component</th>
                        <th className="px-4 py-3 font-semibold text-right">Details / Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="bg-emerald-50/40 font-bold text-emerald-950">
                        <td className="px-4 py-3">Total Annual CTC (Cost to Company)</td>
                        <td className="px-4 py-3 text-right text-base text-emerald-700">₹{selectedOffer.ctc} LPA</td>
                      </tr>
                      {selectedOffer.baseSalary && (
                        <tr>
                          <td className="px-4 py-2.5 text-gray-600">Fixed Base Salary</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{selectedOffer.baseSalary}</td>
                        </tr>
                      )}
                      {selectedOffer.bonus && (
                        <tr>
                          <td className="px-4 py-2.5 text-gray-600">Performance Incentive / Annual Bonus</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{selectedOffer.bonus}</td>
                        </tr>
                      )}
                      {selectedOffer.stocks && (
                        <tr>
                          <td className="px-4 py-2.5 text-gray-600">Stock Grants / Long-Term ESOPs</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{selectedOffer.stocks}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="px-4 py-2.5 text-gray-600">Designation & Role</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{selectedOffer.designation || selectedOffer.jobRole}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-gray-600">Work Location</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{selectedOffer.workLocation}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-gray-600">Tentative Joining Date</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{selectedOffer.joiningDate}</td>
                      </tr>
                      <tr className="bg-amber-50/50">
                        <td className="px-4 py-2.5 text-amber-900 font-medium">Acceptance Deadline</td>
                        <td className="px-4 py-2.5 text-right font-bold text-amber-800">{selectedOffer.acceptanceDeadline}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Contingency Terms */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">
                  Terms & Conditions of Employment
                </h4>
                <p className="text-xs text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-200 leading-relaxed">
                  {selectedOffer.terms || "This offer is subject to graduation with required CGPA, clear background verification, and adherence to company policies upon onboarding."}
                </p>
              </div>

              {/* Signatures Row */}
              <div className="pt-6 border-t border-gray-200 grid grid-cols-2 gap-8 text-xs">
                <div>
                  <p className="text-gray-400 uppercase font-semibold">Authorized Signatory</p>
                  <p className="font-bold text-gray-900 mt-4">{selectedOffer.releasedBy || "University Talent Team"}</p>
                  <p className="text-gray-500">{selectedOffer.company} HR Division</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 uppercase font-semibold">Candidate Digital Acceptance</p>
                  {selectedOffer.status === "Accepted" ? (
                    <div>
                      <p className="font-bold text-emerald-700 mt-4 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Digitally Signed by {selectedOffer.applicantName || user?.name}
                      </p>
                      <p className="text-[11px] text-gray-400">Timestamp: {selectedOffer.acceptedAt || "Verified"}</p>
                    </div>
                  ) : selectedOffer.status === "Declined" ? (
                    <p className="font-bold text-rose-600 mt-4">Declined by Candidate</p>
                  ) : (
                    <p className="font-semibold text-amber-600 mt-4 italic">Pending Candidate Signature</p>
                  )}
                </div>
              </div>

              {/* Interactive Acceptance Section for Pending Offers */}
              {selectedOffer.status === "Pending" && (
                <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-200 space-y-4 print:hidden">
                  <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Formal Candidate Acceptance & Digital Signature
                  </h4>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs text-gray-700 font-medium leading-relaxed">
                      I, <strong>{selectedOffer.applicantName || user?.name}</strong>, hereby formally accept this offer of employment with <strong>{selectedOffer.company}</strong> for the position of <strong>{selectedOffer.designation || selectedOffer.jobRole}</strong> and agree to all terms and conditions outlined above.
                    </span>
                  </label>

                  {showDeclineConfirm ? (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                      <p className="text-xs font-bold text-rose-800">
                        Are you sure you want to decline this offer? This action is permanent.
                      </p>
                      <input 
                        type="text"
                        placeholder="Optional: State your reason for declining..."
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-rose-300 outline-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setShowDeclineConfirm(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
                          onClick={() => handleDeclineOffer(selectedOffer)}
                        >
                          Confirm Decline
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => setShowDeclineConfirm(true)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline"
                      >
                        Decline this offer
                      </button>
                      <Button 
                        disabled={!termsAccepted}
                        onClick={() => handleAcceptOffer(selectedOffer)}
                        className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                          termsAccepted 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 hover:scale-[1.02]" 
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Offer & Sign Digitally
                      </Button>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between print:hidden">
              <span className="text-xs text-gray-400">Offer ID: #{selectedOffer.id}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="text-xs" onClick={() => setSelectedOffer(null)}>
                  Close
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DETAILED INTERVIEW INVITATION MODAL FOR STUDENT */}
      {selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-inner">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded text-white">
                    Live Interview Invitation
                  </span>
                  <h2 className="text-xl font-bold mt-1 text-white leading-tight">
                    {selectedInterview.roundName}
                  </h2>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    {selectedInterview.company} • {selectedInterview.jobRole}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedInterview(null)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              {/* Timing Card */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
                <div>
                  <span className="text-[10px] text-indigo-600 uppercase font-extrabold tracking-wider block">Date</span>
                  <p className="text-sm font-bold text-gray-900 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    {selectedInterview.date}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-600 uppercase font-extrabold tracking-wider block">Time & Duration</span>
                  <p className="text-sm font-bold text-gray-900 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    {selectedInterview.time} ({selectedInterview.duration})
                  </p>
                </div>
              </div>

              {/* Interviewer Info */}
              <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {selectedInterview.interviewerName?.charAt(0) || "I"}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{selectedInterview.interviewerName}</p>
                  <p className="text-[11px] text-gray-500">{selectedInterview.interviewerRole || "Interviewer"}</p>
                </div>
              </div>

              {/* Meeting Link / Venue Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider">
                  Meeting Location / Video Conference Link
                </label>
                {selectedInterview.meetingLink ? (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-2">
                    <a 
                      href={selectedInterview.meetingLink} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-mono text-indigo-600 hover:text-indigo-800 hover:underline truncate"
                    >
                      {selectedInterview.meetingLink}
                    </a>
                    <button 
                      type="button"
                      onClick={() => handleCopyLink(selectedInterview.meetingLink)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-200 rounded-lg transition-colors shrink-0"
                      title="Copy meeting link"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-800 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    📍 Venue: {selectedInterview.venue || "Placement Cell"}
                  </p>
                )}
              </div>

              {/* Instructions */}
              {selectedInterview.instructions && (
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">
                    Preparation Instructions from Recruiter
                  </label>
                  <p className="text-xs text-gray-700 bg-amber-50/60 p-3 rounded-xl border border-amber-200/70 leading-relaxed">
                    {selectedInterview.instructions}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {selectedInterview.meetingLink && (
                  <a 
                    href={selectedInterview.meetingLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition-all"
                  >
                    <Video className="w-4 h-4" /> Join Video Call
                  </a>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={getGoogleCalendarUrl(selectedInterview)}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-indigo-600" /> Add to Calendar
                  </a>
                  <Button 
                    variant="outline" 
                    className="text-xs" 
                    onClick={() => setSelectedInterview(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}