import React, { createContext, useState, useContext } from 'react';

const JobContext = createContext();

const initialDummyJobs = [
  {
    id: 1,
    role: "Frontend Developer Intern",
    company: "Google",
    companyLogo: "google_logo.png",
    type: "Summer Internship",
    workMode: "Hybrid",
    location: "Bangalore",
    
    description: "Develop new features for Google Cloud dashboards.",
    rolesAndResponsibilities: "Participate in agile cycles, write clean React code, optimize bundled assets.",
    
    minCgpa: "8.5",
    courses: "B.Tech, M.Tech",
    branches: "Computer Science, Information Technology",
    passingYear: "2025, 2026",
    backlogs: "0",
    
    requiredSkills: "React, TypeScript, CSS",
    preferredSkills: "Figma, Node.js",
    
    salaryAmount: "1,20,000",
    salaryCurrency: "₹",
    salaryType: "Monthly",
    benefits: "Free meals, Transport, Health Insurance",
    
    selectionProcess: ["Aptitude Test", "Technical Online Assessment", "HR Interview"],
    deadline: "2026-05-10",
    vacancies: "15",
    
    applyMethod: "Portal",
    externalLink: "",
    
    recruiterName: "Sundar P.",
    recruiterEmail: "careers@google.college.edu",
    recruiterPhone: "",
    
    status: "Approved",
    visibility: "All students",
    autoCheckEligibility: true,
    
    date: "2026-04-10",
    postedBy: "recruiter@example.com",
    applicants: ["student@example.com", "otherstudent@domain.com"],
    selected: ["student@example.com"],
    savedBy: []
  },
  {
    id: 2,
    role: "Backend Engineer",
    company: "Microsoft",
    companyLogo: "ms_logo.png",
    type: "Full-time",
    workMode: "Remote",
    location: "Hyderabad / Remote",
    
    description: "Design and implement highly scalable services in Azure.",
    rolesAndResponsibilities: "Build microservices in C#, manage database lifecycles, respond to incident reports.",
    
    minCgpa: "8.0",
    courses: "B.Tech, MCA",
    branches: "CS, IT, ECE",
    passingYear: "2024",
    backlogs: "1",
    
    requiredSkills: "C#, .NET, Azure",
    preferredSkills: "Kubernetes, Docker",
    
    salaryAmount: "24,00,000",
    salaryCurrency: "₹",
    salaryType: "CTC",
    benefits: "Stocks, Performance Bonus",
    
    selectionProcess: ["Technical Interview 1", "Technical Interview 2", "System Design"],
    // Mocking an expired deadline below to test the auto-disable logic
    deadline: "2026-04-01", 
    vacancies: "5",
    
    applyMethod: "External link",
    externalLink: "https://careers.microsoft.com/student",
    
    recruiterName: "Satya N.",
    recruiterEmail: "satya.n@ms.com",
    recruiterPhone: "9876543210",
    
    status: "Pending", // TPO needs to approve this
    visibility: "Only eligible students",
    autoCheckEligibility: true,
    
    date: "2026-04-15",
    postedBy: "alumni@example.com",
    applicants: [],
    selected: [],
    savedBy: []
  }
];

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState(() => {
    const savedData = localStorage.getItem("pp_jobs_global");
    if (savedData) {
      return JSON.parse(savedData);
    }
    return initialDummyJobs;
  });

  // Whenever jobs array changes, hard save it to storage
  React.useEffect(() => {
    localStorage.setItem("pp_jobs_global", JSON.stringify(jobs));
  }, [jobs]);

  const addJob = (job) => {
    const newJob = {
      ...job,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      status: "Pending", // Always starts as pending for TPO approval
      applicants: [],
      selected: [],
      savedBy: []
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const approveJob = (id) => {
    setJobs(prev => prev.map(job => job.id === id ? { ...job, status: "Approved" } : job));
  };

  const rejectJob = (id, reason) => {
    setJobs(prev => prev.map(job => job.id === id ? { ...job, status: "Rejected", rejectReason: reason } : job));
  };

  const updateJob = (id, updatedData) => {
    setJobs(prev => prev.map(job => 
      job.id === id 
        ? { ...job, ...updatedData, status: "Pending" } // Re-trigger TPO approval logic
        : job
    ));
  };

  const deleteJob = (id) => {
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  const applyForJob = (jobId, studentEmail) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
         const currentApplicants = job.applicants || [];
         if (!currentApplicants.includes(studentEmail)) {
            return { ...job, applicants: [...currentApplicants, studentEmail] };
         }
      }
      return job;
    }));
  };

  const toggleSaveJob = (jobId, studentEmail) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        const currentSavedBy = job.savedBy || [];
        if (currentSavedBy.includes(studentEmail)) {
          return { ...job, savedBy: currentSavedBy.filter(email => email !== studentEmail) };
        } else {
          return { ...job, savedBy: [...currentSavedBy, studentEmail] };
        }
      }
      return job;
    }));
  };

  return (
    <JobContext.Provider value={{ jobs, addJob, approveJob, rejectJob, updateJob, deleteJob, applyForJob, toggleSaveJob }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
