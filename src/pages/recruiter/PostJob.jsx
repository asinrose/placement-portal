import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Briefcase, Building2, ListChecks, DollarSign, Clock, Target, AlertCircle, CheckCircle, Calendar, Users, Eye, Link as LinkIcon, Upload } from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useJobs } from "../../context/JobContext";
import { useAuth } from "../../context/AuthContext";

export default function PostJob() {
  const { addJob, updateJob, jobs } = useJobs();
  const { user } = useAuth();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(jobId);

  const [formData, setFormData] = useState({
    title: "", company: "", logo: "", type: "Full-time", workMode: "Onsite", location: "",
    description: "", responsibilities: "",
    minCgpa: "", courses: "", branches: "", passingYear: "", backlogs: "0",
    requiredSkills: "", preferredSkills: "",
    salaryAmount: "", salaryCurrency: "₹", salaryType: "CTC", benefits: "",
    aptitudeTest: false, technicalInterview: false, hrInterview: false, customSelection: "",
    deadline: "", vacancies: "",
    applyMethod: "Portal", externalLink: "",
    recruiterName: "", recruiterEmail: "", recruiterPhone: "",
    visibility: "All students", autoCheckEligibility: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const jobToEdit = jobs.find(j => j.id.toString() === jobId);
      if (jobToEdit) {
        setFormData({
           title: jobToEdit.role || "", company: jobToEdit.company || "", logo: jobToEdit.companyLogo || "", 
           type: jobToEdit.type || "Full-time", workMode: jobToEdit.workMode || "Onsite", location: jobToEdit.location || "",
           description: jobToEdit.description || "", responsibilities: jobToEdit.rolesAndResponsibilities || "",
           minCgpa: jobToEdit.minCgpa || "", courses: jobToEdit.courses || "", branches: jobToEdit.branches || "", 
           passingYear: jobToEdit.passingYear || "", backlogs: jobToEdit.backlogs || "0",
           requiredSkills: jobToEdit.requiredSkills || "", preferredSkills: jobToEdit.preferredSkills || "",
           salaryAmount: jobToEdit.salaryAmount || "", salaryCurrency: jobToEdit.salaryCurrency || "₹", salaryType: jobToEdit.salaryType || "CTC", benefits: jobToEdit.benefits || "",
           aptitudeTest: jobToEdit.selectionProcess?.includes("Aptitude Test") || false, 
           technicalInterview: jobToEdit.selectionProcess?.includes("Technical Interview") || false, 
           hrInterview: jobToEdit.selectionProcess?.includes("HR Interview") || false, 
           customSelection: jobToEdit.selectionProcess?.find(s => !["Aptitude Test", "Technical Interview", "HR Interview"].includes(s)) || "",
           deadline: jobToEdit.deadline || "", vacancies: jobToEdit.vacancies || "",
           applyMethod: jobToEdit.applyMethod || "Portal", externalLink: jobToEdit.externalLink || "",
           recruiterName: jobToEdit.recruiterName || "", recruiterEmail: jobToEdit.recruiterEmail || "", recruiterPhone: jobToEdit.recruiterPhone || "",
           visibility: jobToEdit.visibility || "All students", autoCheckEligibility: jobToEdit.autoCheckEligibility || false
        });
      }
    }
  }, [jobId, jobs, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Convert checkbox states into the string array expected by the context schema
    const selectionProcess = [];
    if (formData.aptitudeTest) selectionProcess.push("Aptitude Test");
    if (formData.technicalInterview) selectionProcess.push("Technical Interview");
    if (formData.hrInterview) selectionProcess.push("HR Interview");
    if (formData.customSelection) selectionProcess.push(formData.customSelection);

    setTimeout(() => {
      const refinedData = {
        role: formData.title,
        company: formData.company,
        companyLogo: formData.logo,
        type: formData.type,
        workMode: formData.workMode,
        location: formData.location,
        description: formData.description,
        rolesAndResponsibilities: formData.responsibilities,
        minCgpa: formData.minCgpa,
        courses: formData.courses,
        branches: formData.branches,
        passingYear: formData.passingYear,
        backlogs: formData.backlogs,
        requiredSkills: formData.requiredSkills,
        preferredSkills: formData.preferredSkills,
        salaryAmount: formData.salaryAmount,
        salaryCurrency: formData.salaryCurrency,
        salaryType: formData.salaryType,
        benefits: formData.benefits,
        selectionProcess: selectionProcess,
        deadline: formData.deadline,
        vacancies: formData.vacancies,
        applyMethod: formData.applyMethod,
        externalLink: formData.externalLink,
        recruiterName: formData.recruiterName,
        recruiterEmail: formData.recruiterEmail,
        recruiterPhone: formData.recruiterPhone,
        visibility: formData.visibility,
        autoCheckEligibility: formData.autoCheckEligibility,
        postedBy: user?.email || "alumni@example.com"
      };

      if (isEditing) {
        updateJob(Number(jobId), refinedData);
      } else {
        addJob(refinedData);
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
         setIsSuccess(false);
         if (isEditing) {
            // go back to Manage Jobs page automatically
            navigate(-1);
         }
      }, 3000);
      
      if (!isEditing) {
         setFormData({
           title: "", company: "", logo: "", type: "Full-time", workMode: "Onsite", location: "",
           description: "", responsibilities: "", minCgpa: "", courses: "", branches: "", passingYear: "", backlogs: "0",
           requiredSkills: "", preferredSkills: "", salaryAmount: "", salaryCurrency: "₹", salaryType: "CTC", benefits: "",
           aptitudeTest: false, technicalInterview: false, hrInterview: false, customSelection: "",
           deadline: "", vacancies: "", applyMethod: "Portal", externalLink: "", recruiterName: "", recruiterEmail: "", recruiterPhone: "",
           visibility: "All students", autoCheckEligibility: false
         });
      }
    }, 1200);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{isEditing ? "Edit Requisition" : "Post a New Requisition"}</h1>
          <p className="text-gray-500">{isEditing ? "Modify your existing requisition details before TPO review." : "Create a detailed job listing to attract the best campus talent."}</p>
        </div>
      </div>

      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <p className="font-medium">{isEditing ? "Job requisition updated successfully!" : "Job requisition submitted successfully! It is now pending TPO approval."}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Left Column */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* 1. Basic Information */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                <CardTitle className="text-lg flex items-center gap-2"><Briefcase className="w-5 h-5 text-indigo-500" /> Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Job Title" placeholder="e.g. Software Engineer Intern" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  <Input label="Company Name" placeholder="e.g. Google" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Employment Type</label>
                    <select required className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option>Full-time</option><option>Summer Internship</option><option>6-Month Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Work Mode</label>
                    <select required className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.workMode} onChange={e => setFormData({...formData, workMode: e.target.value})}>
                      <option>Onsite</option><option>Remote</option><option>Hybrid</option>
                    </select>
                  </div>
                  <Input label="Location" placeholder="e.g. Bangalore" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Logo</label>
                   <div className="flex border border-gray-300 rounded-md p-1 bg-white items-center h-10 px-3 relative w-full md:w-1/2">
                     <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} />
                     <Upload size={16} className="text-gray-400 mr-2" />
                     <span className="text-sm text-gray-600 truncate">{formData.logo && (formData.logo.startsWith("blob:") || formData.logo.startsWith("data:")) ? "Image selected" : formData.logo || "Click to upload image..."}</span>
                   </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Description & Responsibilities */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                <CardTitle className="text-lg flex items-center gap-2"><ListChecks className="w-5 h-5 text-indigo-500" /> Job Description</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Detailed Job Description</label>
                  <textarea required className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]" placeholder="Briefly describe the overall role requirements..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Roles & Responsibilities</label>
                  <textarea required className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]" placeholder="Specific day-to-day duties..." value={formData.responsibilities} onChange={e => setFormData({...formData, responsibilities: e.target.value})} />
                </div>
              </CardContent>
            </Card>

            {/* 4. Skills Required */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                <CardTitle className="text-lg flex items-center gap-2"><CheckCircle className="w-5 h-5 text-indigo-500" /> Skills</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 <Input label="Required Skills (Comma separated)" placeholder="e.g. React, Python, SQL" required value={formData.requiredSkills} onChange={e => setFormData({...formData, requiredSkills: e.target.value})} />
                 <Input label="Preferred Skills (Optional)" placeholder="e.g. Docker, AWS" value={formData.preferredSkills} onChange={e => setFormData({...formData, preferredSkills: e.target.value})} />
              </CardContent>
            </Card>

            {/* 5. Salary Details */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="w-5 h-5 text-indigo-500" /> Salary / Stipend Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Input label="Amount" placeholder="e.g. 100000" type="number" required value={formData.salaryAmount} onChange={e => setFormData({...formData, salaryAmount: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                    <select required className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.salaryCurrency} onChange={e => setFormData({...formData, salaryCurrency: e.target.value})}>
                      <option value="₹">INR (₹)</option><option value="$">USD ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                    <select required className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.salaryType} onChange={e => setFormData({...formData, salaryType: e.target.value})}>
                      <option>CTC</option><option>Monthly</option>
                    </select>
                  </div>
                </div>
                <Input label="Additional Benefits (Optional)" placeholder="e.g. ESOPs, Relocation bonus" value={formData.benefits} onChange={e => setFormData({...formData, benefits: e.target.value})} />
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar - Eligibility, Process, & Control */}
          <div className="space-y-6">
            
            {/* 3. Strict Eligibility Criteria */}
            <Card className="border-indigo-100 shadow-md bg-white overflow-hidden ring-1 ring-indigo-50">
              <CardHeader className="border-b border-indigo-50 bg-indigo-50/30 py-4">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                  <Target className="w-5 h-5 text-indigo-500" /> Eligibility
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Input type="number" step="0.1" min="0" max="10" label="Minimum CGPA" placeholder="e.g. 7.5" required value={formData.minCgpa} onChange={e => setFormData({...formData, minCgpa: e.target.value})} />
                <Input label="Allowed Courses" placeholder="e.g. B.Tech, MCA" value={formData.courses} onChange={e => setFormData({...formData, courses: e.target.value})} />
                <Input label="Allowed Branches" placeholder="e.g. CS, IT, ECE" value={formData.branches} onChange={e => setFormData({...formData, branches: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Year of Passing" placeholder="e.g. 2025" required value={formData.passingYear} onChange={e => setFormData({...formData, passingYear: e.target.value})} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Backlogs</label>
                    <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.backlogs} onChange={e => setFormData({...formData, backlogs: e.target.value})}>
                      <option value="0">0 (None)</option><option value="1">1</option><option value="2">2</option><option value="Any">Any</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 6 & 7. Selection Process & Dates */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
               <CardContent className="p-6 space-y-5">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-500"/> Process & Stats</h3>
                    <div className="space-y-2 mb-4">
                       <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" checked={formData.aptitudeTest} onChange={e=>setFormData({...formData, aptitudeTest: e.target.checked})}/> Aptitude Test</label>
                       <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" checked={formData.technicalInterview} onChange={e=>setFormData({...formData, technicalInterview: e.target.checked})}/> Technical Interview</label>
                       <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" checked={formData.hrInterview} onChange={e=>setFormData({...formData, hrInterview: e.target.checked})}/> HR Interview</label>
                    </div>
                    <Input label="Custom Stage (Optional)" placeholder="e.g. Group Discussion" value={formData.customSelection} onChange={e => setFormData({...formData, customSelection: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <Input type="date" label="Deadline" required value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                    <Input type="number" label="Vacancies" required placeholder="Number" value={formData.vacancies} onChange={e => setFormData({...formData, vacancies: e.target.value})} />
                  </div>
               </CardContent>
            </Card>

            {/* 9 & 10. Application, Contact, & Status Controls */}
            <Card className="border-none shadow-sm bg-white overflow-hidden bg-gradient-to-ob from-white to-gray-50/50">
               <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2"><LinkIcon className="w-4 h-4 text-indigo-500"/> Workflow Controls</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Apply Method</label>
                    <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mb-2 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.applyMethod} onChange={e => setFormData({...formData, applyMethod: e.target.value})}>
                      <option>Portal</option><option>External link</option>
                    </select>
                    {formData.applyMethod === "External link" && (
                      <Input placeholder="https://careers..." value={formData.externalLink} onChange={e => setFormData({...formData, externalLink: e.target.value})} />
                    )}
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recruiter Information</label>
                    <div className="space-y-2">
                       <Input placeholder="Name" value={formData.recruiterName} onChange={e => setFormData({...formData, recruiterName: e.target.value})} />
                       <Input placeholder="Email" type="email" required value={formData.recruiterEmail} onChange={e => setFormData({...formData, recruiterEmail: e.target.value})} />
                       <Input placeholder="Phone (Optional)" value={formData.recruiterPhone} onChange={e => setFormData({...formData, recruiterPhone: e.target.value})} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">System Controls</label>
                    <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.visibility} onChange={e => setFormData({...formData, visibility: e.target.value})}>
                      <option>All students</option><option>Only eligible students</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                       <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" checked={formData.autoCheckEligibility} onChange={e=>setFormData({...formData, autoCheckEligibility: e.target.checked})}/> 
                       Auto-verify Eligibility rules
                    </label>
                  </div>
               </CardContent>
            </Card>

            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
               <h3 className="text-sm font-bold text-indigo-900 mb-2">{isEditing ? "Update Requisition?" : "Ready to Post?"}</h3>
               <p className="text-xs text-indigo-700 leading-relaxed mb-4">
                 {isEditing ? "This requisition will be saved and re-submitted to the TPO as Pending for fresh approval." : "This requisition will be saved as **Pending** and requires formal approval by the TPO before becoming visible to students."}
               </p>
               <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-sm" disabled={isSubmitting}>
                 {isSubmitting ? (isEditing ? "Updating..." : "Submitting...") : (isEditing ? "Save & Send for Re-approval" : "Send Requisition to TPO")}
               </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
