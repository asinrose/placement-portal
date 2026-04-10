import React, { useState } from "react";
import { Search, MoreHorizontal, User, FileText, CheckCircle, Clock } from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function ManageApplicants() {
  const [activeJob, setActiveJob] = useState("Software Engineer Intern");

  // Mock list of applicants
  const [applicants, setApplicants] = useState([
    { id: 1, name: "Alice Johnson", cgpa: "8.9", status: "Applied", tags: ["React", "Node"] },
    { id: 2, name: "Ravi Kumar", cgpa: "7.5", status: "Applied", tags: ["Python", "Django"] },
    { id: 3, name: "Sarah Smith", cgpa: "9.2", status: "Shortlisted", tags: ["UI/UX", "Figma"] },
    { id: 4, name: "Michael Chang", cgpa: "8.1", status: "Interviewing", tags: ["C++", "Java"] },
    { id: 5, name: "Priya Sharma", cgpa: "8.6", status: "Offered", tags: ["React", "Typescript"] },
    { id: 6, name: "Tom Hollanders", cgpa: "9.5", status: "Shortlisted", tags: ["AWS", "DevOps"] },
  ]);

  const stages = ["Applied", "Shortlisted", "Interviewing", "Offered"];

  const moveApplicant = (id, newStatus) => {
    setApplicants(applicants.map(app => app.id === id ? { ...app, status: newStatus } : app));
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
             value={activeJob}
             onChange={(e) => setActiveJob(e.target.value)}
          >
             <option>Software Engineer Intern</option>
             <option>Full-Stack Developer</option>
             <option>UX Designer</option>
          </select>
          <Button variant="outline" className="bg-white">Export Board</Button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 shrink-0">
         <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input type="text" placeholder={`Search among ${applicants.length} candidates...`} className="pl-9 h-9" />
         </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-6 overflow-x-auto pb-4 pt-2 flex-1 items-start minimal-scrollbar">
         {stages.map((stage) => {
           const stageApplicants = applicants.filter(app => app.status === stage);
           return (
             <div key={stage} className="flex-shrink-0 w-80 bg-gray-50/50 rounded-2xl flex flex-col max-h-full border border-gray-100">
                <div className={`px-4 py-3 border-b flex items-center justify-between rounded-t-2xl font-semibold text-sm ${stageStyle(stage)}`}>
                   <span>{stage}</span>
                   <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">{stageApplicants.length}</span>
                </div>
                
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                   {stageApplicants.map((app) => (
                      <div key={app.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group">
                         <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                               <div className="w-8 h-8 flex-shrink-0 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100">
                                  {app.name.charAt(0)}
                               </div>
                               <div>
                                 <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{app.name}</h3>
                                 <p className="text-xs text-gray-500 font-medium tracking-wide">CGPA: {app.cgpa}</p>
                               </div>
                            </div>
                            <button className="text-gray-400 hover:text-indigo-600 p-1 rounded hover:bg-gray-50 -mt-1 -mr-1">
                               <MoreHorizontal className="w-4 h-4"/>
                            </button>
                         </div>
                         
                         <div className="flex flex-wrap gap-1.5 mb-4">
                           {app.tags.map(tag => (
                             <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium border border-gray-200">
                               {tag}
                             </span>
                           ))}
                         </div>

                         <div className="flex items-center justify-between pt-3 border-t border-gray-100/80">
                            <button className="text-xs text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors">
                               <FileText className="w-3.5 h-3.5" /> Resume
                            </button>
                            
                            {/* Actions to move candidate */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               {stage === "Applied" && (
                                  <button onClick={() => moveApplicant(app.id, "Shortlisted")} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-semibold hover:bg-indigo-100">
                                     Shortlist
                                  </button>
                               )}
                               {stage === "Shortlisted" && (
                                  <button onClick={() => moveApplicant(app.id, "Interviewing")} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded font-semibold hover:bg-amber-100">
                                     Interview
                                  </button>
                               )}
                               {stage === "Interviewing" && (
                                  <button onClick={() => moveApplicant(app.id, "Offered")} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-semibold hover:bg-emerald-100">
                                     Offer
                                  </button>
                               )}
                            </div>
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
    </div>
  );
}
