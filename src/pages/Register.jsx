import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Briefcase, Mail, Lock, User, Building2, Calendar, CheckCircle, ArrowRight } from "lucide-react";

export default function Register() {
  const [role, setRole] = useState("ALUMNI");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    batch: "",
    companyName: ""
  });
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      if (!formData.name || !formData.email || !formData.password) {
        setError("Please fill in all general fields.");
        setIsLoading(false);
        return;
      }

      if (role === "ALUMNI" && !formData.batch) {
        setError("Please enter your batch year.");
        setIsLoading(false);
        return;
      }

      if (role === "RECRUITER" && !formData.companyName) {
        setError("Please enter your company name.");
        setIsLoading(false);
        return;
      }

      const newUser = {
         id: Date.now(),
         name: formData.name,
         email: formData.email,
         password: formData.password,
         role: role,
         batch: formData.batch,
         companyName: formData.companyName,
         joined: new Date().toLocaleDateString(),
         status: "Active"
      };

      const existingReqs = JSON.parse(localStorage.getItem("nexus_pending_requests") || "[]");
      localStorage.setItem("nexus_pending_requests", JSON.stringify([newUser, ...existingReqs]));

      setIsLoading(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0f172a] py-12">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/30 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-purple-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Container */}
      <div 
        className={`relative z-10 w-full max-w-[600px] flex rounded-2xl overflow-hidden shadow-2xl transition-all duration-1000 transform border border-white/10 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        <div className="w-full p-8 sm:p-12 flex flex-col bg-gradient-to-b from-white/10 to-transparent backdrop-blur-xl border-l border-white/10 bg-[#0f172a]/40">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-400 flex items-center justify-center shadow-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-wide">Nexus</span>
          </div>

          {!isSuccess ? (
             <>
               <div className="mb-8 text-center">
                 <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create an Account</h2>
                 <p className="text-indigo-200/70">Join the Nexus Placement Portal.</p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-5">
                 {error && (
                   <div className="animate-in fade-in slide-in-from-top-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                     {error}
                   </div>
                 )}
                 
                 <div className="space-y-4">
                   <div className="group">
                     <label className="block text-sm font-medium text-indigo-100 mb-1.5">Are you registering as? <span className="text-red-400">*</span></label>
                     <select 
                       value={role} 
                       onChange={(e) => setRole(e.target.value)}
                       className="block w-full px-3 py-2.5 border border-white/10 rounded-xl bg-[#0f172a]/80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none backdrop-blur-md cursor-pointer"
                     >
                        <option value="ALUMNI">Alumni</option>
                        <option value="RECRUITER">Campus Recruiter</option>
                     </select>
                   </div>

                   <div className="group">
                     <label className="block text-sm font-medium text-indigo-100 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                     <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <User className="h-5 w-5 text-indigo-300/50 group-focus-within:text-indigo-400 transition-colors" />
                       </div>
                       <input
                         type="text" required placeholder="John Doe"
                         value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                         className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-[#0f172a]/50 text-white placeholder-indigo-200/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all backdrop-blur-md"
                       />
                     </div>
                   </div>

                   <div className="group">
                     <label className="block text-sm font-medium text-indigo-100 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                     <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <Mail className="h-5 w-5 text-indigo-300/50 group-focus-within:text-indigo-400 transition-colors" />
                       </div>
                       <input
                         type="email" required placeholder="you@university.edu"
                         value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                         className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-[#0f172a]/50 text-white placeholder-indigo-200/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all backdrop-blur-md"
                       />
                     </div>
                   </div>

                   {(role === "ALUMNI" || role === "RECRUITER") && (
                      <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 mb-2 animate-in zoom-in-95 duration-300">
                         {role === "ALUMNI" && (
                            <div className="group">
                               <label className="block text-sm font-semibold text-indigo-100 mb-1.5">Graduation Batch Year <span className="text-red-400">*</span></label>
                               <div className="relative">
                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                   <Calendar className="h-5 w-5 text-indigo-300/50 group-focus-within:text-indigo-400 transition-colors" />
                                 </div>
                                 <input
                                   type="number" min="1990" max="2030" required placeholder="e.g. 2021"
                                   value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})}
                                   className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-[#0f172a]/50 text-white placeholder-indigo-200/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all backdrop-blur-md"
                                 />
                               </div>
                            </div>
                         )}
                         {role === "RECRUITER" && (
                            <div className="group">
                               <label className="block text-sm font-semibold text-indigo-100 mb-1.5">Company Name <span className="text-red-400">*</span></label>
                               <div className="relative">
                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                   <Building2 className="h-5 w-5 text-indigo-300/50 group-focus-within:text-indigo-400 transition-colors" />
                                 </div>
                                 <input
                                   type="text" required placeholder="e.g. TechCorp Global"
                                   value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                   className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-[#0f172a]/50 text-white placeholder-indigo-200/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all backdrop-blur-md"
                                 />
                               </div>
                            </div>
                         )}
                      </div>
                   )}

                   <div className="group">
                     <label className="block text-sm font-medium text-indigo-100 mb-1.5">Password <span className="text-red-400">*</span></label>
                     <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <Lock className="h-5 w-5 text-indigo-300/50 group-focus-within:text-indigo-400 transition-colors" />
                       </div>
                       <input
                         type="password" required placeholder="••••••••"
                         value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                         className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-[#0f172a]/50 text-white placeholder-indigo-200/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all backdrop-blur-md"
                       />
                     </div>
                   </div>
                 </div>

                 <p className="text-xs text-amber-200/70 border-l-2 border-amber-500 pl-3 pt-1">
                   Note: {role === "ALUMNI" ? "Alumni" : "Recruiter"} accounts require manual approval by the administrator before you can log in.
                 </p>

                 <button 
                   type="submit" disabled={isLoading}
                   className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group overflow-hidden relative"
                 >
                   <div className="absolute inset-0 w-full h-full bg-white/20 transform -translate-x-full skew-x-12 group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                   {isLoading ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   ) : (
                     <>Submit Registration <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                   )}
                 </button>
                 
                 <div className="text-center mt-6">
                    <p className="text-sm text-indigo-200/60">
                      Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors ml-1">Sign in here</Link>
                    </p>
                 </div>
               </form>
             </>
          ) : (
             <div className="text-center py-10 animate-in zoom-in-95 duration-500 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                   <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Registration Successful!</h2>
                
                <p className="text-indigo-200/80 mb-8 max-w-sm mx-auto leading-relaxed">
                  Your registration request has been submitted to the Admin. You will be able to log in once your account is verified and approved.
                </p>

                <Link to="/login" className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-colors inline-block">
                   Return to Login
                </Link>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
