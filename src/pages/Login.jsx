import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Briefcase, Mail, Lock, Sparkles, LogIn, ArrowRight, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [requirePasswordChange, setRequirePasswordChange] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate network delay for premium feel
    setTimeout(() => {
      if (!email || !password) {
        setError("Please fill in all fields.");
        setIsLoading(false);
        return;
      }

      // Check mocked local storage database first
      const activeUsers = JSON.parse(localStorage.getItem("nexus_active_users") || "[]");
      let user = activeUsers.find(u => (u.email === email || u.registerNumber === email) && u.password === password);

      // If not found, check hardcoded demo accounts
      if (!user) {
        if (email === "tpo@demo.com" && password === "demo123") {
          user = { id: 2, name: "Bob Officer", email, role: "PLACEMENT_OFFICER" };
        } else if (email === "admin@demo.com" && password === "demo123") {
          user = { id: 4, name: "System Admin", email, role: "ADMIN" };
        }
      }

      if (user) {
        if (user.status === "Suspended") {
          setError("Your account has been suspended by an administrator.");
          setIsLoading(false);
          return;
        }

        if (user.mustChangePassword) {
           setError("");
           setRequirePasswordChange(user);
           setIsLoading(false);
           return;
        }

        login(user);
        switch (user.role) {
          case "STUDENT": navigate("/student/dashboard"); break;
          case "PLACEMENT_OFFICER": navigate("/tpo/dashboard"); break;
          case "RECRUITER": navigate("/recruiter/dashboard"); break;
          case "ADMIN": navigate("/admin/dashboard"); break;
          case "ALUMNI": navigate("/alumni/dashboard"); break;
          default: navigate("/");
        }
      } else {
        setError("Invalid credentials.");
        setIsLoading(false);
      }
    }, 800);
  };

  const handlePasswordReset = (e) => {
     e.preventDefault();
     if (newPassword.length < 6) {
        setError("Password must be at least 6 characters."); return;
     }
     if (newPassword !== confirmPassword) {
        setError("Passwords do not match."); return;
     }

     setIsLoading(true);
     setTimeout(() => {
        const activeUsers = JSON.parse(localStorage.getItem("nexus_active_users") || "[]");
        const updatedUsers = activeUsers.map(u => 
           u.id === requirePasswordChange.id ? { ...u, password: newPassword, mustChangePassword: false } : u
        );
        localStorage.setItem("nexus_active_users", JSON.stringify(updatedUsers));

        const completeUser = { ...requirePasswordChange, password: newPassword, mustChangePassword: false };
        login(completeUser);
        
        switch (completeUser.role) {
          case "STUDENT": navigate("/student/dashboard"); break;
          case "PLACEMENT_OFFICER": navigate("/tpo/dashboard"); break;
          case "RECRUITER": navigate("/recruiter/dashboard"); break;
          case "ADMIN": navigate("/admin/dashboard"); break;
          case "ALUMNI": navigate("/alumni/dashboard"); break;
          default: navigate("/");
        }
     }, 1000);
  };

  const handleDemoClick = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("demo123");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0f172a]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/30 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-purple-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Container */}
      <div 
        className={`relative z-10 w-full max-w-[1000px] flex rounded-2xl overflow-hidden shadow-2xl transition-all duration-1000 transform border border-white/10 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
        style={{ minHeight: '600px' }}
      >
        {/* Left Side: Branding/Information Panel */}
        <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 bg-gradient-to-br from-indigo-900/90 to-[#0f172a]/90 backdrop-blur-xl border-r border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-400 flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-wide">Nexus</span>
            </div>
            
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-6">
              Accelerate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Career Journey</span>
            </h1>
            <p className="text-indigo-200/80 text-lg leading-relaxed mb-8">
              Connect with top companies, streamline the recruitment process, and land your dream job seamlessly.
            </p>

            <div className="space-y-4">
               {[
                 { icon: <Sparkles className="w-5 h-5 text-amber-300" />, text: "AI-Powered Matching" },
                 { icon: <Lock className="w-5 h-5 text-emerald-400" />, text: "Secure & Verified Profiles" },
                 { icon: <ArrowRight className="w-5 h-5 text-blue-400" />, text: "Streamlined Offer Management" },
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center gap-3 text-indigo-100">
                   <div className="p-1.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/5">
                     {item.icon}
                   </div>
                   <span className="font-medium">{item.text}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="mt-12 text-sm text-indigo-300/60 font-medium">
            © {new Date().getFullYear()} Nexus Placement Portal. All rights reserved.
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="w-full lg:w-[55%] p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white/5 backdrop-blur-xl border-l border-white/10">
          <div className="w-full max-w-[400px] mx-auto">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-400 flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-wide">Nexus</span>
            </div>

            {requirePasswordChange ? (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Security Update</h2>
                  <p className="text-indigo-200/70">For security reasons, please change your default password to continue.</p>
                </div>
                <form onSubmit={handlePasswordReset} className="space-y-5">
                  {error && (
                    <div className="animate-in fade-in p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="group">
                      <label className="block text-sm font-medium text-indigo-100 mb-1.5">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="block w-full px-3 py-2.5 border border-white/10 rounded-xl bg-[#0f172a]/50 text-white placeholder-indigo-200/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-medium text-indigo-100 mb-1.5">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="block w-full px-3 py-2.5 border border-white/10 rounded-xl bg-[#0f172a]/50 text-white placeholder-indigo-200/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" disabled={isLoading}
                    className="w-full mt-8 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all"
                  >
                    {isLoading ? "Updating..." : "Set Password & Continue"}
                  </button>
                </form>
              </>
            ) : (
            <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
              <p className="text-indigo-200/70">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="animate-in fade-in slide-in-from-top-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-sm font-medium text-indigo-100 mb-1.5">Email or Register Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-indigo-300/50 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="you@example.com or REG123"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-[#0f172a]/50 text-white placeholder-indigo-200/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all backdrop-blur-md"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-indigo-100 mb-1.5">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-indigo-300/50 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-[#0f172a]/50 text-white placeholder-indigo-200/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all backdrop-blur-md"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm mt-6">
                <label className="flex items-center text-indigo-200/70 cursor-pointer group">
                  <input type="checkbox" className="mr-2.5 rounded border-white/20 bg-[#0f172a]/50 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0" />
                  <span className="group-hover:text-indigo-200 transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Forgot password?</a>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-8 py-3 px-4 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a] focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group overflow-hidden relative"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 transform -translate-x-full skew-x-12 group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            <div className="text-center mt-6">
              <p className="text-sm text-indigo-200/60">
                Don't have an account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors ml-1">Sign up</Link>
              </p>
            </div>

            <div className="mt-10 pt-6 border-t border-white/10">
              <p className="text-sm font-medium text-indigo-200/60 mb-3 text-center">Fast Login (Demo)</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['tpo', 'admin'].map((role) => (
                   <button
                     key={role}
                     onClick={() => handleDemoClick(`${role}@demo.com`)}
                     className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-200 transition-colors capitalize"
                   >
                     {role}
                   </button>
                ))}
              </div>
            </div>
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
