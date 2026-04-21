import React, { useState } from "react";
import { 
  User, Mail, Phone, Calendar, MapPin, Briefcase, GraduationCap, 
  Award, FileText, Globe, Upload, Edit2, Save, Download, 
  Plus, Trash2, CheckCircle2, XCircle, Code, DollarSign, Link, ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/Card";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import AtsResume from "../../components/AtsResume";

// Initial Demo Data
const initialProfileData = {
  fullName: "Aliya Sharma",
  studentId: "CS2024-042",
  email: "aliya.sharma@college.edu",
  phone: "+91 98765 43210",
  dob: "2002-05-15",
  course: "B.Tech Computer Science",
  college: "National Institute of Technology",
  yearSem: "4th Year / 8th Sem",
  cgpa: "8.9",
  marks10th: "95%",
  marks12th: "92%",
  resumeFile: "aliya_sharma_resume_v2.pdf",
  skills: ["React", "JavaScript", "Python", "Tailwind CSS", "Node.js", "SQL", "Git"],
  projects: [
    { id: 1, title: "Placement Portal Management System", desc: "A comprehensive dual-portal for students and TPO to manage drives.", tech: "React, Node, Express, MongoDB", link: "github.com/aliyas/placement-portal" },
    { id: 2, title: "AI Image Generator", desc: "Uses Stable Diffusion API to generate images from text prompts.", tech: "Python, FastAPI, React", link: "github.com/aliyas/ai-gen" }
  ],
  experience: [
    { id: 1, company: "TechNova Solutions", role: "Frontend Developer Intern", duration: "May 2023 - July 2023", desc: "Developed responsive dashboards using React and tailwind CSS leading to a 20% increase in performance." }
  ],
  certifications: [
    { id: 1, course: "Meta Front-End Developer", platform: "Coursera", link: "coursera.org/verify/MFE123" },
    { id: 2, course: "AWS Cloud Practitioner", platform: "AWS Training", link: "aws.amazon.com/cert/ABC" }
  ],
  preferences: {
    role: "Frontend Engineer / Full Stack Developer",
    location: "Bangalore, Pune, Remote",
    salary: "8 - 12 LPA"
  },
  socials: {
    github: "github.com/aliyas",
    linkedin: "linkedin.com/in/aliyas",
    portfolio: "aliyasharma.dev"
  },
  status: "Eligible" // Eligible, Not Placed, Placed
};

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('studentProfileData');
    return saved ? JSON.parse(saved) : initialProfileData;
  });
  const [newSkill, setNewSkill] = useState("");
  const [resumeUrl, setResumeUrl] = useState(null);

  const handleSave = () => {
    localStorage.setItem('studentProfileData', JSON.stringify(data));
    setIsEditing(false);
  };
  const handleChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleNestedChange = (category, field, value) => {
    setData(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleArrayChange = (category, id, field, value) => {
    setData(prev => ({
      ...prev,
      [category]: prev[category].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleViewResume = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    } else {
      // Open a sample PDF to demonstrate view functionality if no file uploaded
      window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleChange('resumeFile', file.name);
      if (resumeUrl) {
        URL.revokeObjectURL(resumeUrl);
      }
      const fileUrl = URL.createObjectURL(file);
      setResumeUrl(fileUrl);
    }
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !data.skills.includes(newSkill.trim())) {
      setData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Placed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Not Placed': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Eligible': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
    <div className="print:hidden flex flex-col gap-6 p-1 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
              <User size={40} className="text-indigo-400" />
              {/* Image would go here */}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full shadow-sm hover:bg-indigo-700">
                <Edit2 size={12} />
              </button>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{data.fullName}</h1>
            <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
              <GraduationCap size={16} /> {data.course}
            </p>
            <div className="flex items-center gap-2 mt-3">
               <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(data.status)}`}>
                  {data.status}
               </span>
               <span className="text-sm text-gray-500 font-medium ml-2">Profile Complete: 85%</span>
               <div className="w-24 h-2 bg-gray-200 rounded-full ml-1 overflow-hidden">
                 <div className="bg-indigo-600 h-full rounded-full" style={{ width: '85%' }}></div>
               </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={() => window.print()} variant="outline" className="flex items-center gap-2">
            <Download size={16} /> Download PDF
          </Button>
          {isEditing ? (
            <Button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600">
              <Save size={16} /> Save Profile
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-indigo-600">
              <Edit2 size={16} /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <Input label="Full Name" value={data.fullName} onChange={(e) => handleChange('fullName', e.target.value)} />
                  <Input label="Student ID" value={data.studentId} onChange={(e) => handleChange('studentId', e.target.value)} />
                  <Input label="Email" type="email" value={data.email} onChange={(e) => handleChange('email', e.target.value)} />
                  <Input label="Phone" value={data.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                  <Input label="Date of Birth" type="date" value={data.dob} onChange={(e) => handleChange('dob', e.target.value)} />
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm font-medium">{data.studentId}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm font-medium">{data.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm font-medium">{data.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm font-medium">{data.dob}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Placement Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><MapPin size={18} className="text-indigo-500"/> Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <Input label="Preferred Role" value={data.preferences.role} onChange={(e) => handleNestedChange('preferences', 'role', e.target.value)} />
                  <Input label="Preferred Location" value={data.preferences.location} onChange={(e) => handleNestedChange('preferences', 'location', e.target.value)} />
                  <Input label="Expected Salary" value={data.preferences.salary} onChange={(e) => handleNestedChange('preferences', 'salary', e.target.value)} />
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Roles</p>
                    <p className="text-sm text-gray-800 font-medium">{data.preferences.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Locations</p>
                    <p className="text-sm text-gray-800 font-medium">{data.preferences.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign size={12}/> Salary</p>
                    <p className="text-sm text-gray-800 font-medium">{data.preferences.salary}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Globe size={18} className="text-indigo-500"/> Web Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <Input label="GitHub" value={data.socials.github} onChange={(e) => handleNestedChange('socials', 'github', e.target.value)} />
                  <Input label="LinkedIn" value={data.socials.linkedin} onChange={(e) => handleNestedChange('socials', 'linkedin', e.target.value)} />
                  <Input label="Portfolio" value={data.socials.portfolio} onChange={(e) => handleNestedChange('socials', 'portfolio', e.target.value)} />
                </>
              ) : (
                <div className="space-y-3">
                  <a href={`https://${data.socials.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-gray-700 hover:text-indigo-600 transition-colors">
                    <Code size={18} /> {data.socials.github}
                  </a>
                  <a href={`https://${data.socials.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-gray-700 hover:text-indigo-600 transition-colors">
                    <Link size={18} /> {data.socials.linkedin}
                  </a>
                  <a href={`https://${data.socials.portfolio}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-gray-700 hover:text-indigo-600 transition-colors">
                    <Globe size={18} /> {data.socials.portfolio}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Academic Details */}
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4 mb-4">
              <CardTitle className="text-lg">Academic Details</CardTitle>
            </CardHeader>
            <CardContent>
               {isEditing ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="College Name" value={data.college} onChange={(e) => handleChange('college', e.target.value)} />
                    <Input label="Course" value={data.course} onChange={(e) => handleChange('course', e.target.value)} />
                    <Input label="Year & Semester" value={data.yearSem} onChange={(e) => handleChange('yearSem', e.target.value)} />
                    <Input label="CGPA / Percentage" value={data.cgpa} onChange={(e) => handleChange('cgpa', e.target.value)} />
                    <Input label="12th Marks" value={data.marks12th} onChange={(e) => handleChange('marks12th', e.target.value)} />
                    <Input label="10th Marks" value={data.marks10th} onChange={(e) => handleChange('marks10th', e.target.value)} />
                 </div>
               ) : (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">College</p>
                      <p className="text-sm font-semibold">{data.college}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Course</p>
                      <p className="text-sm font-semibold">{data.course}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Current Year / Sem</p>
                      <p className="text-sm font-semibold">{data.yearSem}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">CGPA</p>
                      <div className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg text-lg">
                        {data.cgpa}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">12th Marks</p>
                      <p className="text-sm font-semibold">{data.marks12th}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">10th Marks</p>
                      <p className="text-sm font-semibold">{data.marks10th}</p>
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>

          {/* Resume & Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <FileText size={32} className="text-indigo-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">{data.resumeFile || "No resume uploaded"}</p>
                  <p className="text-xs text-gray-500 mb-4">PDF up to 5MB</p>
                  <div className="flex gap-2 w-full">
                    <Button onClick={handleViewResume} type="button" variant="outline" size="sm" className="w-full flex-1"><Download size={14} className="mr-1"/> View</Button>
                    {isEditing && (
                       <div className="w-full flex-1 relative">
                         <input 
                           type="file" 
                           accept=".pdf"
                           onChange={handleFileUpload}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           title="Upload Resume"
                         />
                         <Button type="button" variant="secondary" size="sm" className="w-full pointer-events-none"><Upload size={14} className="mr-1"/> Upload</Button>
                       </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Code size={18} className="text-indigo-500"/> Technical Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {data.skills.map((skill, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 group">
                      {skill}
                      {isEditing && (
                        <button onClick={() => removeSkill(skill)} className="text-indigo-400 hover:text-red-500 focus:outline-none">
                           <XCircle size={14} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <form onSubmit={addSkill} className="flex gap-2">
                    <Input placeholder="Add a skill (e.g. React)..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)} />
                    <Button type="submit" variant="secondary" size="icon"><Plus size={18} /></Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Projects</CardTitle>
              {isEditing && <Button variant="ghost" size="sm" className="text-indigo-600"><Plus size={16} className="mr-1"/> Add Project</Button>}
            </CardHeader>
            <CardContent>
               <div className="space-y-4 mt-2">
                  {data.projects.map((proj) => (
                    <div key={proj.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                       {isEditing ? (
                         <div className="space-y-3">
                           <Input label="Project Title" value={proj.title} onChange={(e) => handleArrayChange('projects', proj.id, 'title', e.target.value)} />
                           <div>
                             <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                             <textarea 
                               className="w-full text-sm p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" 
                               rows={2} 
                               value={proj.desc} 
                               onChange={(e) => handleArrayChange('projects', proj.id, 'desc', e.target.value)}
                             />
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <Input label="Technologies Used" value={proj.tech} onChange={(e) => handleArrayChange('projects', proj.id, 'tech', e.target.value)} />
                              <Input label="Link" value={proj.link} onChange={(e) => handleArrayChange('projects', proj.id, 'link', e.target.value)} />
                           </div>
                         </div>
                       ) : (
                         <>
                           <div className="flex justify-between items-start mb-1">
                             <h4 className="font-semibold text-gray-900">{proj.title}</h4>
                             {proj.link && <a href={`https://${proj.link}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-sm flex items-center gap-1"><ExternalLink size={14}/> Repo</a>}
                           </div>
                           <p className="text-sm text-gray-600 mb-3">{proj.desc}</p>
                           <div className="flex items-center gap-2 mt-auto">
                              <span className="text-xs font-semibold text-gray-500">Tech:</span>
                              <p className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-700">{proj.tech}</p>
                           </div>
                         </>
                       )}
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>

          {/* Internships / Experience */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Experience & Internships</CardTitle>
              {isEditing && <Button variant="ghost" size="sm" className="text-indigo-600"><Plus size={16} className="mr-1"/> Add Exp</Button>}
            </CardHeader>
            <CardContent>
               <div className="space-y-4 mt-2">
                  {data.experience.map((exp) => (
                    <div key={exp.id} className="relative pl-6 py-2 border-l-2 border-indigo-100">
                       <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-4 border-2 border-white"></div>
                       {isEditing ? (
                         <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100 ml-2">
                           <Input label="Role" value={exp.role} onChange={(e) => handleArrayChange('experience', exp.id, 'role', e.target.value)} />
                           <div className="grid grid-cols-2 gap-3">
                              <Input label="Company Name" value={exp.company} onChange={(e) => handleArrayChange('experience', exp.id, 'company', e.target.value)} />
                              <Input label="Duration" value={exp.duration} onChange={(e) => handleArrayChange('experience', exp.id, 'duration', e.target.value)} />
                           </div>
                           <div>
                             <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                             <textarea 
                               className="w-full text-sm p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" 
                               rows={2} 
                               value={exp.desc} 
                               onChange={(e) => handleArrayChange('experience', exp.id, 'desc', e.target.value)}
                             />
                           </div>
                         </div>
                       ) : (
                         <div className="ml-2">
                           <h4 className="font-semibold text-gray-900">{exp.role}</h4>
                           <div className="flex items-center text-sm text-gray-500 mb-2 gap-2">
                             <span className="font-medium text-indigo-600">{exp.company}</span>
                             <span>•</span>
                             <span>{exp.duration}</span>
                           </div>
                           <p className="text-sm text-gray-600">{exp.desc}</p>
                         </div>
                       )}
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><Award size={18} className="text-indigo-500"/> Certifications</CardTitle>
              {isEditing && <Button variant="ghost" size="sm" className="text-indigo-600"><Plus size={16} className="mr-1"/> Add Cert</Button>}
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="flex flex-col p-4 rounded-xl border border-gray-100 bg-gray-50">
                       {isEditing ? (
                         <div className="space-y-3">
                           <Input label="Course Name" value={cert.course} onChange={(e) => handleArrayChange('certifications', cert.id, 'course', e.target.value)} />
                           <Input label="Platform" value={cert.platform} onChange={(e) => handleArrayChange('certifications', cert.id, 'platform', e.target.value)} />
                           <Input label="Link" value={cert.link} onChange={(e) => handleArrayChange('certifications', cert.id, 'link', e.target.value)} />
                         </div>
                       ) : (
                         <>
                           <h4 className="font-semibold text-gray-900 text-sm mb-1">{cert.course}</h4>
                           <p className="text-xs text-gray-500 mb-3">{cert.platform}</p>
                           {cert.link && (
                             <a href={`https://${cert.link}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-indigo-600 hover:underline mt-auto flex items-center gap-1 group">
                               Verify Credential <CheckCircle2 size={12} className="group-hover:text-indigo-800"/>
                             </a>
                           )}
                         </>
                       )}
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
    <AtsResume data={data} />
    </>
  );
}
