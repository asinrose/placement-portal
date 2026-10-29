import React, { useState } from "react";
import { 
  User, Mail, Phone, Calendar, MapPin, Briefcase, GraduationCap, 
  Award, FileText, Globe, Upload, Edit2, Save, Download, 
  Plus, Trash2, CheckCircle2, XCircle, Code, DollarSign, Link, ExternalLink,
  ShieldAlert, Check, Sparkles, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/Card";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import AtsResume from "../../components/AtsResume";
import { useAuth } from "../../context/AuthContext";
import { downloadAtsResume } from "../../utils/resumeHelper";

const createBlankProfile = (user) => ({
  fullName: user?.name || "Aliya",
  studentId: user?.registerNumber || user?.studentId || "24411",
  email: user?.email || "24411@university.edu",
  phone: user?.phone || "",
  dob: user?.dob || "2006-07-20",
  degree: user?.degree || "B.Tech",
  course: user?.branch || user?.department || user?.course || "Data Analytics",
  college: user?.college || "National Institute of Technology and sciences",
  yearSem: user?.yearSem || "3, 6th semester",
  cgpa: user?.cgpa || "7",
  backlogs: user?.backlogs || "0",
  marks10th: user?.marks10th || "85%",
  marks12th: user?.marks12th || "85%",
  resumeFile: null,
  resumeData: null,
  skills: ["React", "Node.js", "Express", "MongoDB"],
  projects: [],
  experience: [],
  certifications: [],
  preferences: {
    role: "front-end dev, software engineer",
    location: "Any",
    salary: ""
  },
  socials: {
    github: "",
    linkedin: "",
    portfolio: ""
  },
  status: "Eligible"
});

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");
  
  const [data, setData] = useState(() => {
    try {
      const userKey = user?.email ? `studentProfileData_${user.email}` : 'studentProfileData';
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!user?.email || parsed.email === user.email || !parsed.email) {
          return { 
            ...createBlankProfile(user), 
            ...parsed,
            degree: parsed.degree || "B.Tech",
            backlogs: parsed.backlogs !== undefined ? parsed.backlogs : "0"
          };
        }
      }
      const generalSaved = localStorage.getItem('studentProfileData');
      if (generalSaved) {
        const parsed = JSON.parse(generalSaved);
        if (user?.email && parsed.email === user.email) {
          return { 
            ...createBlankProfile(user), 
            ...parsed,
            degree: parsed.degree || "B.Tech",
            backlogs: parsed.backlogs !== undefined ? parsed.backlogs : "0"
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return createBlankProfile(user);
  });

  const [newSkill, setNewSkill] = useState("");
  const [resumeUrl, setResumeUrl] = useState(null);

  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('profilePicture', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // 1. Save to localStorage keys for student profile
    localStorage.setItem('studentProfileData', JSON.stringify(data));
    if (user?.email) {
      localStorage.setItem(`studentProfileData_${user.email}`, JSON.stringify(data));
    }
    if (data.email && data.email !== user?.email) {
      localStorage.setItem(`studentProfileData_${data.email}`, JSON.stringify(data));
    }

    // 2. Synchronize with nexus_active_users directory
    try {
      const activeUsers = JSON.parse(localStorage.getItem('nexus_active_users') || '[]');
      const userEmailToMatch = user?.email || data.email;
      const updatedUsers = activeUsers.map(u => {
        if (u.email === userEmailToMatch) {
          return {
            ...u,
            name: data.fullName,
            phone: data.phone,
            cgpa: data.cgpa,
            course: data.course,
            degree: data.degree || "B.Tech",
            branch: data.course,
            department: data.course,
            backlogs: data.backlogs,
            profilePicture: data.profilePicture || u.profilePicture
          };
        }
        return u;
      });
      localStorage.setItem('nexus_active_users', JSON.stringify(updatedUsers));
    } catch (e) {
      console.error("Error updating active users:", e);
    }

    // 3. Update Auth context & current logged-in user state
    updateUser({ 
      name: data.fullName, 
      profilePicture: data.profilePicture,
      cgpa: data.cgpa,
      course: data.course,
      degree: data.degree,
      branch: data.course,
      backlogs: data.backlogs,
      phone: data.phone
    });

    // 4. Dispatch live browser events for real-time Job Board criteria evaluation
    window.dispatchEvent(new Event('profile_updated'));
    window.dispatchEvent(new Event('storage'));

    setIsEditing(false);
    setSaveSuccessMessage("Profile changes saved! Eligibility criteria updated on Job Board.");
    setTimeout(() => setSaveSuccessMessage(""), 4500);
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
    const targetData = resumeUrl || data.resumeData;
    if (targetData) {
      if (targetData.startsWith('data:')) {
        try {
          const arr = targetData.split(',');
          const mimeMatch = arr[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const blob = new Blob([u8arr], { type: mime });
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
          return;
        } catch (err) {
          console.error(err);
        }
      }
      window.open(targetData, '_blank');
    } else {
      alert("No uploaded resume found. Please click 'Edit Profile' to upload a custom resume PDF, or click 'Download PDF' above to export your ATS resume.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({
          ...prev,
          resumeFile: file.name,
          resumeData: reader.result
        }));
        setResumeUrl(reader.result);
      };
      reader.readAsDataURL(file);
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

  const addProject = () => {
    const newProj = { id: Date.now(), title: "Project Title", desc: "", tech: "", link: "" };
    setData(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
  };
  const removeProject = (id) => {
    setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const addExperience = () => {
    const newExp = { id: Date.now(), role: "Role / Position", company: "", duration: "", desc: "" };
    setData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
  };
  const removeExperience = (id) => {
    setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  };

  const addCertification = () => {
    const newCert = { id: Date.now(), course: "Certification Title", platform: "", link: "" };
    setData(prev => ({ ...prev, certifications: [...prev.certifications, newCert] }));
  };
  const removeCertification = (id) => {
    setData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c.id !== id) }));
  };

  const calculateCompletion = () => {
    let score = 0;
    const total = 9;
    if (data.fullName) score++;
    if (data.email) score++;
    if (data.phone) score++;
    if (data.college) score++;
    if (data.degree) score++;
    if (data.course) score++;
    if (data.cgpa) score++;
    if (data.resumeFile) score++;
    if (data.skills?.length > 0) score++;
    return Math.round((score / total) * 100);
  };

  const completionPercent = calculateCompletion();

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
      
      {/* Save Success Alert Banner */}
      {saveSuccessMessage && (
        <div className="bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span className="text-sm font-semibold">{saveSuccessMessage}</span>
          </div>
          <button onClick={() => setSaveSuccessMessage("")} className="text-white/80 hover:text-white p-1">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden relative group">
              {data.profilePicture ? (
                <img src={data.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-indigo-400" />
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="w-6 h-6 text-white" />
                  <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              )}
            </div>
            {isEditing && (
              <div className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full shadow-sm pointer-events-none">
                <Edit2 size={12} />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{data.fullName}</h1>
            <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
              <GraduationCap size={16} /> {data.degree ? `${data.degree} • ` : ""}{data.course}
            </p>
            <div className="flex items-center gap-2 mt-3">
               <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(data.status)}`}>
                  {data.status}
               </span>
               <span className="text-sm text-gray-500 font-medium ml-2">Profile Complete: {completionPercent}%</span>
               <div className="w-24 h-2 bg-gray-200 rounded-full ml-1 overflow-hidden">
                 <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${completionPercent}%` }}></div>
               </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={() => downloadAtsResume(data)} variant="outline" className="flex items-center gap-2">
            <Download size={16} /> Download PDF
          </Button>
          {isEditing ? (
            <Button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm font-bold">
              <Save size={16} /> Save Changes
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 font-semibold">
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
                  <Input label="Student ID / Reg No" value={data.studentId} onChange={(e) => handleChange('studentId', e.target.value)} />
                  <Input label="Email" type="email" value={data.email} onChange={(e) => handleChange('email', e.target.value)} />
                  <Input label="Phone" value={data.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                  <Input label="Date of Birth" type="date" max={new Date().toLocaleDateString('en-CA')} value={data.dob} onChange={(e) => handleChange('dob', e.target.value)} />
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
                    <span className="text-sm font-medium">{data.phone || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm font-medium">{data.dob || "2006-07-20"}</span>
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
                    <p className="text-sm text-gray-800 font-medium">{data.preferences.salary || "Competitive"}</p>
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
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Code size={18} className="text-gray-400" />
                    <span>{data.socials.github || "github.com"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Link size={18} className="text-gray-400" />
                    <span>{data.socials.linkedin || "linkedin.com"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Globe size={18} className="text-gray-400" />
                    <span>{data.socials.portfolio || "portfolio.dev"}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Academic Details - Directly Connected to Job Board Eligibility Evaluation */}
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4 mb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  Academic Details
                </CardTitle>
                <CardDescription>
                  These credentials directly determine your eligibility check on the Job Board.
                </CardDescription>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                Synced with Job Board
              </span>
            </CardHeader>
            <CardContent>
               {isEditing ? (
                 <div className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        label="College Name" 
                        value={data.college} 
                        onChange={(e) => handleChange('college', e.target.value)} 
                      />
                      
                      {/* Degree / Program Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Degree / Program <span className="text-xs text-indigo-600 font-semibold">(Matches Eligible Courses)</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="w-full text-sm p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                            value={data.degree || "B.Tech"}
                            onChange={(e) => handleChange('degree', e.target.value)}
                            placeholder="e.g. B.Tech, B.Sc, BCA, MCA"
                          />
                        </div>
                        {/* Quick Selection Chips */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {["B.Tech", "B.Sc", "BCA", "MCA", "B.E.", "M.Tech"].map(deg => (
                            <button
                              key={deg}
                              type="button"
                              onClick={() => handleChange('degree', deg)}
                              className={`text-[11px] px-2 py-0.5 rounded-md font-semibold transition-colors border ${
                                data.degree === deg 
                                  ? "bg-indigo-600 text-white border-indigo-600" 
                                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-indigo-50"
                              }`}
                            >
                              {deg}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Input 
                        label="Course / Branch / Specialization" 
                        value={data.course} 
                        onChange={(e) => handleChange('course', e.target.value)} 
                        placeholder="e.g. Data Analytics, Computer Science"
                      />

                      <Input 
                        label="Year & Semester" 
                        value={data.yearSem} 
                        onChange={(e) => handleChange('yearSem', e.target.value)} 
                        placeholder="e.g. 3, 6th semester"
                      />

                      <Input 
                        label="CGPA" 
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={data.cgpa} 
                        onChange={(e) => handleChange('cgpa', e.target.value)} 
                        placeholder="e.g. 7.5"
                      />

                      <Input 
                        label="Active / Standing Backlogs" 
                        type="number"
                        min="0"
                        value={data.backlogs !== undefined ? data.backlogs : "0"} 
                        onChange={(e) => handleChange('backlogs', e.target.value)} 
                        placeholder="e.g. 0"
                      />

                      <Input 
                        label="12th Marks (%)" 
                        value={data.marks12th} 
                        onChange={(e) => handleChange('marks12th', e.target.value)} 
                        placeholder="e.g. 85%"
                      />

                      <Input 
                        label="10th Marks (%)" 
                        value={data.marks10th} 
                        onChange={(e) => handleChange('marks10th', e.target.value)} 
                        placeholder="e.g. 85%"
                      />
                   </div>

                   <div className="pt-2 flex justify-end">
                     <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
                       <Save size={16} /> Save Changes
                     </Button>
                   </div>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">College</p>
                      <p className="text-sm font-semibold text-gray-900">{data.college}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Degree / Program</p>
                      <span className="inline-block text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                        {data.degree || "B.Tech"}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Course / Branch</p>
                      <p className="text-sm font-semibold text-gray-900">{data.course}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Current Year / Sem</p>
                      <p className="text-sm font-semibold text-gray-900">{data.yearSem}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">CGPA</p>
                      <div className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 font-extrabold px-3 py-1 rounded-lg text-lg border border-indigo-100">
                        {data.cgpa}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Standing Backlogs</p>
                      <span className={`inline-flex items-center justify-center font-bold px-3 py-1 rounded-lg text-sm border ${
                        parseInt(data.backlogs || 0) === 0 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {data.backlogs !== undefined ? data.backlogs : "0"}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">12th Marks</p>
                      <p className="text-sm font-semibold text-gray-900">{data.marks12th}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">10th Marks</p>
                      <p className="text-sm font-semibold text-gray-900">{data.marks10th}</p>
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
                  {data.skills && data.skills.length > 0 ? (
                    data.skills.map((skill, idx) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 group">
                        {skill}
                        {isEditing && (
                          <button onClick={() => removeSkill(skill)} className="text-indigo-400 hover:text-red-500 focus:outline-none">
                             <XCircle size={14} />
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">No skills added yet.</p>
                  )}
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
              {isEditing && (
                <Button onClick={addProject} type="button" variant="ghost" size="sm" className="text-indigo-600">
                  <Plus size={16} className="mr-1"/> Add Project
                </Button>
              )}
            </CardHeader>
            <CardContent>
               <div className="space-y-4 mt-2">
                  {data.projects && data.projects.length > 0 ? (
                    data.projects.map((proj) => (
                      <div key={proj.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 relative group">
                         {isEditing ? (
                           <div className="space-y-3">
                             <div className="flex justify-between items-center">
                               <span className="text-xs font-bold text-gray-500 uppercase">Project #{proj.id}</span>
                               <Button type="button" size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2" onClick={() => removeProject(proj.id)}>
                                 <Trash2 size={14} className="mr-1"/> Delete
                               </Button>
                             </div>
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
                             <p className="text-sm text-gray-600 mb-3">{proj.desc || "No description provided."}</p>
                             {proj.tech && (
                               <div className="flex items-center gap-2 mt-auto">
                                  <span className="text-xs font-semibold text-gray-500">Tech:</span>
                                  <p className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-700">{proj.tech}</p>
                               </div>
                             )}
                           </>
                         )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic py-2">No projects added yet.</p>
                  )}
               </div>
            </CardContent>
          </Card>

          {/* Internships / Experience */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Experience & Internships</CardTitle>
              {isEditing && (
                <Button onClick={addExperience} type="button" variant="ghost" size="sm" className="text-indigo-600">
                  <Plus size={16} className="mr-1"/> Add Exp
                </Button>
              )}
            </CardHeader>
            <CardContent>
               <div className="space-y-4 mt-2">
                  {data.experience && data.experience.length > 0 ? (
                    data.experience.map((exp) => (
                      <div key={exp.id} className="relative pl-6 py-2 border-l-2 border-indigo-100">
                         <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-4 border-2 border-white"></div>
                         {isEditing ? (
                           <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100 ml-2">
                             <div className="flex justify-between items-center">
                               <span className="text-xs font-bold text-gray-500 uppercase">Experience #{exp.id}</span>
                               <Button type="button" size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2" onClick={() => removeExperience(exp.id)}>
                                 <Trash2 size={14} className="mr-1"/> Delete
                               </Button>
                             </div>
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
                               <span className="font-medium text-indigo-600">{exp.company || "Company"}</span>
                               <span>•</span>
                               <span>{exp.duration || "Duration"}</span>
                             </div>
                             <p className="text-sm text-gray-600">{exp.desc || "No description provided."}</p>
                           </div>
                         )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic py-2">No experience added yet.</p>
                  )}
               </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><Award size={18} className="text-indigo-500"/> Certifications</CardTitle>
              {isEditing && (
                <Button onClick={addCertification} type="button" variant="ghost" size="sm" className="text-indigo-600">
                  <Plus size={16} className="mr-1"/> Add Cert
                </Button>
              )}
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {data.certifications && data.certifications.length > 0 ? (
                    data.certifications.map((cert) => (
                      <div key={cert.id} className="flex flex-col p-4 rounded-xl border border-gray-100 bg-gray-50">
                         {isEditing ? (
                           <div className="space-y-3">
                             <div className="flex justify-between items-center">
                               <span className="text-xs font-bold text-gray-500 uppercase">Cert #{cert.id}</span>
                               <Button type="button" size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2" onClick={() => removeCertification(cert.id)}>
                                 <Trash2 size={14} className="mr-1"/> Delete
                               </Button>
                             </div>
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
                    ))
                  ) : (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-400 italic py-2">No certifications added yet.</p>
                    </div>
                  )}
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