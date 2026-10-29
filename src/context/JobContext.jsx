import React, { createContext, useState, useContext } from 'react';

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState(() => {
    try {
      const savedData = localStorage.getItem("pp_jobs_global");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Filter out leftover hardcoded demo entries if any
        return Array.isArray(parsed) 
          ? parsed.filter(j => j.postedBy !== "recruiter@example.com" && j.postedBy !== "alumni@example.com" && j.id !== 1 && j.id !== 2)
          : [];
      }
    } catch (e) {
      console.error("Error reading jobs from storage:", e);
    }
    return [];
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
