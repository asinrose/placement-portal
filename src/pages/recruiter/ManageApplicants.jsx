import React, { useState } from "react";
import { Search, MoreHorizontal, User, FileText, CheckCircle, Clock, X, Mail, Phone, GraduationCap, Briefcase } from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useJobs } from "../../context/JobContext";

export default function ManageApplicants() {
  const { jobs } = useJobs();
  const [activeJobFilter, setActiveJobFilter] = useState("All Jobs");
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const appStatuses = JSON.parse(localStorage.getItem('student_application_statuses') || '{}');
  const savedProfile = JSON.parse(localStorage.getItem('studentProfileData') || 'null');
  const activeUsers = JSON.parse(localStorage.getItem('nexus_active_users') || '[]');
  const pendingUsers = JSON.parse(localStorage.getItem('nexus_pending_requests') || '[]');
  
  const allApplicants = jobs.flatMap(job => {
    return (job.applicants || []).map((email, idx) => {
         const isSelf = savedProfile && savedProfile.email === email;
         const regUser = activeUsers.find(u => u.email === email) || pendingUsers.find(u => u.email === email);
         
         let name = email.split('@')[0];
         if (isSelf && savedProfile.fullName) {
            name = savedProfile.fullName;
         } else if (regUser && regUser.name) {
            name = regUser.name;
         } else {
            // Provide realistic mock names for generic emails
            const mockNames = ["Aarav Patel", "Priya Sharma", "Rohan Gupta", "Ananya Singh", "Karan Malhotra"];
            const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            name = mockNames[hash % mockNames.length];
         }

         const cgpa = isSelf && savedProfile.cgpa ? savedProfile.cgpa : (8.0 + (idx % 2)).toFixed(1);
         const tags = isSelf && savedProfile.skills?.length ? savedProfile.skills : ["React", "JavaScript", "Problem Solving"];
         const status = appStatuses[`${job.role}_${email}`] || "Applied";
         
         return {
           id: `${job.id}_${email}`,
           jobId: job.id,
           jobRole: job.role,
           email: email,
           name: name,
           cgpa: cgpa,
           tags: tags,
           status: status,
           phone: isSelf && savedProfile.phone ? savedProfile.phone : `+91 98765${Math.floor(10000 + Math.random() * 90000)}`,
           course: isSelf && savedProfile.course ? savedProfile.course : "B.Tech Computer Science",
           resumeFile: isSelf ? savedProfile.resumeFile : null
         };
    });
  });

  const filteredApplicants = activeJobFilter === "All Jobs" 
    ? allApplicants 
    : allApplicants.filter(app => app.jobRole === activeJobFilter);

  const uniqueJobRoles = ["All Jobs", ...new Set(jobs.map(j => j.role))];

  const stages = ["Applied", "Shortlisted", "Interviewing", "Offered"];

  const moveApplicant = (app, newStatus) => {
    const currentStatuses = JSON.parse(localStorage.getItem('student_application_statuses') || '{}');
    currentStatuses[`${app.jobRole}_${app.email}`] = newStatus;
    localStorage.setItem('student_application_statuses', JSON.stringify(currentStatuses));

    const notifications = JSON.parse(localStorage.getItem('student_notifications') || '[]');
    const newNotification = {
      id: Date.now(),
      message: `Your application for ${app.jobRole} has been moved to ${newStatus}!`,
      date: new Date().toLocaleDateString(),
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Applicant Pipeline</h1>
          <p className="text-gray-500">Track and manage candidate progress through the hiring funnel.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
             className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[200px]"
             value={activeJobFilter}
             onChange={(e) => setActiveJobFilter(e.target.value)}
          >
             {uniqueJobRoles.map(role => (
               <option key={role} value={role}>{role}</option>
             ))}
          </select>
          <Button variant="outline" className="bg-white">Export Board</Button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 shrink-0">
         <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input type="text" placeholder={`Search among ${filteredApplicants.length} candidates...`} className="pl-9 h-9" />
         </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-6 overflow-x-auto pb-4 pt-2 flex-1 items-start minimal-scrollbar">
         {stages.map((stage) => {
           const stageApplicants = filteredApplicants.filter(app => app.status === stage);
           return (
             <div key={stage} className="flex-shrink-0 w-80 bg-gray-50/50 rounded-2xl flex flex-col max-h-full border border-gray-100">
                <div className={`px-4 py-3 border-b flex items-center justify-between rounded-t-2xl font-semibold text-sm ${stageStyle(stage)}`}>
                   <span>{stage}</span>
                   <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">{stageApplicants.length}</span>
                </div>
                
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                   {stageApplicants.map((app) => (
                      <div key={app.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group" onClick={() => setSelectedApplicant(app)}>
                         <div className="flex justify-between items-start mb-3 relative">
                            <div className="flex items-center gap-2">
                               <div className="w-8 h-8 flex-shrink-0 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100">
                                  {app.name.charAt(0)}
                               </div>
                               <div>
                                 <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{app.name}</h3>
                                 <p className="text-xs text-gray-500 font-medium tracking-wide">CGPA: {app.cgpa}</p>
                                 <p className="text-[10px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" /> {app.jobRole}
                                 </p>
                               </div>
                            </div>
                            <div className="relative">
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setOpenDropdownId(openDropdownId === app.id ? null : app.id); 
                                }} 
                                className="text-gray-400 hover:text-indigo-600 p-1 rounded hover:bg-gray-50 -mt-1 -mr-1"
                              >
                                 <MoreHorizontal className="w-4 h-4"/>
                              </button>
                              {openDropdownId === app.id && (
                                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1" onClick={e => e.stopPropagation()}>
                                  {stage !== "Shortlisted" && stage !== "Interviewing" && stage !== "Offered" && (
                                    <button onClick={() => moveApplicant(app, "Shortlisted")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Move to Shortlisted</button>
                                  )}
                                  {stage !== "Interviewing" && stage !== "Offered" && (
                                    <button onClick={() => moveApplicant(app, "Interviewing")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600">Move to Interviewing</button>
                                  )}
                                  {stage !== "Offered" && (
                                    <button onClick={() => moveApplicant(app, "Offered")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">Move to Offered</button>
                                  )}
                                </div>
                              )}
                            </div>
                         </div>
                         
                         <div className="flex flex-wrap gap-1.5 mb-4">
                           {app.tags.map(tag => (
                             <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium border border-gray-200">
                               {tag}
                             </span>
                           ))}
                         </div>

                         <div className="flex items-center justify-between pt-3 border-t border-gray-100/80">
                            <button 
                               onClick={(e) => { e.stopPropagation(); }}
                               className="text-xs text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors"
                            >
                               <FileText className="w-3.5 h-3.5" /> Resume
                            </button>
                         </div>
                      </div>
                   ))}

                   {stageApplicants.length === 0 && (
                      <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                         <User className="w-8 h-8 text-gray-300 mb-2" />
                         <p className="text-sm font-medium text-gray-500">No candidates in this stage.</p>
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

      {/* Student Details Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Applicant Details</h2>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedApplicant(null); }}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl border-4 border-white shadow-sm">
                  {selectedApplicant.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedApplicant.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${stageStyle(selectedApplicant.status)}`}>
                      {selectedApplicant.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium">{selectedApplicant.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium">{selectedApplicant.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <GraduationCap className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium">{selectedApplicant.course}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 mt-2 p-3 bg-gray-50 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase font-semibold">CGPA</span>
                    <span className="text-lg font-bold text-indigo-700">{selectedApplicant.cgpa}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                 <h4 className="text-sm font-semibold text-gray-900 mb-2">Skills</h4>
                 <div className="flex flex-wrap gap-2">
                   {selectedApplicant.tags.map(tag => (
                     <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
                       {tag}
                     </span>
                   ))}
                 </div>
              </div>

            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedApplicant(null)}>Close</Button>
              {selectedApplicant.resumeFile ? (
                 <Button 
                   className="flex items-center gap-2 bg-indigo-600"
                   onClick={() => window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank')}
                 >
                   <FileText className="w-4 h-4" /> View Resume
                 </Button>
              ) : (
                 <Button className="flex items-center gap-2 bg-gray-400 cursor-not-allowed text-white" disabled>
                   <FileText className="w-4 h-4" /> No resume available
                 </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
