import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Briefcase, Building2, ListChecks, DollarSign, Clock, Target, AlertCircle, CheckCircle } from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function PostJob() {
  const [formData, setFormData] = useState({
    title: "", type: "Full-time", location: "",
    ctc: "", minCgpa: "", backlogs: "0", bond: "None",
    description: "", skills: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      setFormData({ title: "", type: "Full-time", location: "", ctc: "", minCgpa: "", backlogs: "0", bond: "None", description: "", skills: ""});
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Post a New Requisition</h1>
          <p className="text-gray-500">Create a detailed job listing to attract the best campus talent.</p>
        </div>
      </div>

      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <p className="font-medium">Job requisition submitted successfully! It is now pending TPO approval.</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-500" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-4">
                  <Input 
                    label="Job Title / Role" 
                    placeholder="e.g. Associate Software Engineer" 
                    required 
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Employment Type <span className="text-red-500">*</span></label>
                      <select 
                        required
                        className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                      >
                        <option>Full-time</option>
                        <option>6-Month Internship</option>
                        <option>Summer Internship</option>
                      </select>
                    </div>
                    <Input 
                      label="Location" 
                      placeholder="e.g. Bangalore, Remote" 
                      required 
                      value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="CTC / Stipend Package" 
                      placeholder="e.g. 12 LPA or 50k/month" 
                      required 
                      value={formData.ctc} onChange={e => setFormData({...formData, ctc: e.target.value})}
                    />
                    <Input 
                      label="Required Skills (Comma separated)" 
                      placeholder="e.g. React, Node, Python" 
                      required 
                      value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-indigo-500" />
                  Detailed Description
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Description & Responsibilities <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[200px] resize-y"
                    placeholder="Describe the day-to-day responsibilities and expectations..."
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5"/> Markdown formatting is supported.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar - Eligibility */}
          <div className="space-y-6">
            <Card className="border-indigo-100 shadow-md bg-white overflow-hidden ring-1 ring-indigo-50">
              <CardHeader className="border-b border-indigo-50 bg-indigo-50/30 py-4">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                  <Target className="w-5 h-5 text-indigo-500" />
                  Strict Eligibility Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Minimum CGPA <span className="text-red-500">*</span></label>
                   <p className="text-xs text-gray-500 mb-2">Only students above this cutoff can apply.</p>
                   <Input 
                     type="number" step="0.5" min="0" max="10" placeholder="e.g. 7.5" required
                     value={formData.minCgpa} onChange={e => setFormData({...formData, minCgpa: e.target.value})}
                   />
                </div>
                
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Maximum Backlogs Allowed <span className="text-red-500">*</span></label>
                   <select 
                      required
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.backlogs} onChange={e => setFormData({...formData, backlogs: e.target.value})}
                   >
                      <option value="0">0 (No active backlogs)</option>
                      <option value="1">Up to 1 backlog</option>
                      <option value="2">Up to 2 backlogs</option>
                      <option value="any">Any number allowed</option>
                   </select>
                </div>

                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bond Duration <span className="text-red-500">*</span></label>
                   <select 
                      required
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.bond} onChange={e => setFormData({...formData, bond: e.target.value})}
                   >
                      <option value="None">No Bond</option>
                      <option value="1 Year">1 Year</option>
                      <option value="2 Years">2 Years</option>
                      <option value="3 Years">3 Years</option>
                   </select>
                </div>
              </CardContent>
            </Card>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
               <h3 className="text-sm font-bold text-gray-900 mb-2">Review Process</h3>
               <p className="text-xs text-gray-500 leading-relaxed mb-6">
                 Your requisition will be hidden from students until it is explicitly approved by the Training and Placement Officer.
               </p>
               <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 group" disabled={isSubmitting}>
                 {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                    <>Submit for Approval <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"/></>
                 )}
               </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// ArrowRight mock if not imported top
const ArrowRight = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>;
