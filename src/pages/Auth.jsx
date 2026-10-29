import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Briefcase, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Slide state based on initial route
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/register');

  useEffect(() => {
    setIsSignUp(location.pathname === '/register');
  }, [location.pathname]);

  const toggleMode = () => {
    const nextSignUp = !isSignUp;
    setIsSignUp(nextSignUp);
    window.history.pushState({}, '', nextSignUp ? '/register' : '/login');
  };

  // --- LOGIN STATE & LOGIC ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("pp_remember_me") === "true";
  });
  const [loginError, setLoginError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [requirePasswordChange, setRequirePasswordChange] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load remembered credentials on initial mount
  useEffect(() => {
    const isRemembered = localStorage.getItem("pp_remember_me") === "true";
    if (isRemembered) {
      try {
        const savedAuth = JSON.parse(localStorage.getItem("pp_remembered_auth") || "{}");
        if (savedAuth.email) {
          setLoginEmail(savedAuth.email);
          const activeUsers = JSON.parse(localStorage.getItem("nexus_active_users") || "[]");
          const storedUser = activeUsers.find(u => u.email === savedAuth.email || u.registerNumber === savedAuth.email);
          setLoginPassword(storedUser?.password || savedAuth.password || "");
        }
      } catch (e) { }
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoginLoading(true);

    setTimeout(() => {
      if (!loginEmail || !loginPassword) {
        setLoginError("Please fill in all fields.");
        setIsLoginLoading(false);
        return;
      }

      const activeUsers = JSON.parse(localStorage.getItem("nexus_active_users") || "[]");
      let user = activeUsers.find(u => (u.email === loginEmail || u.registerNumber === loginEmail) && u.password === loginPassword);

      if (!user) {
        const storedUser = activeUsers.find(u => u.email === loginEmail || u.registerNumber === loginEmail);
        if (!storedUser) {
          if (loginEmail === "tpo@demo.com" && (loginPassword === "mypassword123" || loginPassword === "demo123")) {
            user = { id: 2, name: "Bob Officer", email: loginEmail, role: "PLACEMENT_OFFICER", password: loginPassword };
          } else if (loginEmail === "admin@demo.com" && loginPassword === "demo123") {
            user = { id: 4, name: "System Admin", email: loginEmail, role: "ADMIN", password: loginPassword };
          }
        }
      }

      if (user) {
        if (user.status === "Suspended") {
          setLoginError("Your account has been suspended by an administrator.");
          setIsLoginLoading(false);
          return;
        }

        if (user.mustChangePassword) {
          setLoginError("");
          setRequirePasswordChange(user);
          setIsLoginLoading(false);
          return;
        }

        // Save or clear Remember Me
        if (rememberMe) {
          localStorage.setItem("pp_remember_me", "true");
          localStorage.setItem("pp_remembered_auth", JSON.stringify({ email: loginEmail, password: loginPassword }));
        } else {
          localStorage.removeItem("pp_remember_me");
          localStorage.removeItem("pp_remembered_auth");
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
        setLoginError("Invalid credentials.");
        setIsLoginLoading(false);
      }
    }, 800);
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setLoginError("Password must be at least 6 characters."); return;
    }
    if (newPassword !== confirmPassword) {
      setLoginError("Passwords do not match."); return;
    }

    setIsLoginLoading(true);
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
    setLoginEmail(demoEmail);
    const activeUsers = JSON.parse(localStorage.getItem("nexus_active_users") || "[]");
    const storedUser = activeUsers.find(u => u.email === demoEmail);

    const isRemembered = localStorage.getItem("pp_remember_me") === "true";
    const remembered = JSON.parse(localStorage.getItem("pp_remembered_auth") || "{}");

    if (storedUser && storedUser.password) {
      setLoginPassword(storedUser.password);
    } else if (isRemembered && remembered.email === demoEmail && remembered.password) {
      setLoginPassword(remembered.password);
    } else if (demoEmail === "tpo@demo.com") {
      setLoginPassword("mypassword123");
    } else {
      setLoginPassword("demo123");
    }
  };

  // --- REGISTER STATE & LOGIC ---
  const [regRole, setRegRole] = useState("ALUMNI");
  const [regFormData, setRegFormData] = useState({
    name: "", email: "", password: "", batch: "", companyName: ""
  });
  const [regError, setRegError] = useState("");
  const [isRegSuccess, setIsRegSuccess] = useState(false);
  const [isRegLoading, setIsRegLoading] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    setRegError("");
    setIsRegLoading(true);

    setTimeout(() => {
      if (!regFormData.name || !regFormData.email || !regFormData.password) {
        setRegError("Please fill in all general fields.");
        setIsRegLoading(false);
        return;
      }
      if (regRole === "ALUMNI" && !regFormData.batch) {
        setRegError("Please enter your batch year.");
        setIsRegLoading(false);
        return;
      }
      if (regRole === "RECRUITER" && !regFormData.companyName) {
        setRegError("Please enter your company name.");
        setIsRegLoading(false);
        return;
      }

      const newUser = {
        id: Date.now(),
        name: regFormData.name,
        email: regFormData.email,
        password: regFormData.password,
        role: regRole,
        batch: regFormData.batch,
        companyName: regFormData.companyName,
        joined: new Date().toLocaleDateString(),
        status: "Active"
      };

      const existingReqs = JSON.parse(localStorage.getItem("nexus_pending_requests") || "[]");
      localStorage.setItem("nexus_pending_requests", JSON.stringify([newUser, ...existingReqs]));

      setIsRegLoading(false);
      setIsRegSuccess(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/60 via-gray-50 to-purple-50/40 flex items-center justify-center p-3 sm:p-6 md:p-8 font-sans overflow-x-hidden relative">

      {/* ========================================================
          MOBILE / TABLET VIEW (< md)
          Features:
          1. Prominent Campus Photo & College Crest Header
          2. Smooth Sliding Segmented Toggle Pill [ Sign In | Sign Up ]
          3. Horizontal Sliding Form Track with Duration-500 Transitions
         ======================================================== */}
      <div className="md:hidden w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto flex flex-col">
        
        {/* Mobile Campus Banner */}
        <div 
          className="relative h-44 sm:h-48 w-full bg-cover bg-center overflow-hidden flex flex-col items-center justify-center text-white px-4 py-5 shrink-0"
          style={{ backgroundImage: 'linear-gradient(to bottom, rgba(15,23,42,0.45), rgba(15,23,42,0.85)), url("/college_campus.png")' }}
        >
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-xl bg-white flex items-center justify-center mb-2.5 shrink-0">
            <img src="/college_logo.png" alt="College Logo" className="w-full h-full object-contain p-1.5" />
          </div>
          <div className="text-center transition-all duration-300">
            <h2 className="text-xl font-extrabold tracking-tight drop-shadow-sm">
              {isSignUp ? "Join Our Community!" : "Welcome Back!"}
            </h2>
            <p className="text-xs text-white/85 max-w-[280px] mx-auto mt-0.5 leading-snug">
              {isSignUp ? "Create an account to browse jobs & network" : "Log in to access your placement dashboard"}
            </p>
          </div>
        </div>

        {/* Mobile Animated Segmented Control */}
        <div className="px-5 pt-4 pb-1">
          <div className="relative flex bg-gray-100 p-1 rounded-2xl">
            {/* Sliding Pill Indicator */}
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-transform duration-500 ease-in-out ${
                isSignUp ? "translate-x-[calc(100%+8px)]" : "translate-x-0"
              }`}
            />
            <button
              type="button"
              onClick={() => isSignUp && toggleMode()}
              className={`flex-1 py-2 text-xs font-bold rounded-xl relative z-10 transition-colors ${
                !isSignUp ? "text-indigo-600" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => !isSignUp && toggleMode()}
              className={`flex-1 py-2 text-xs font-bold rounded-xl relative z-10 transition-colors ${
                isSignUp ? "text-indigo-600" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Mobile Sliding Horizontal Carousel */}
        <div className="relative w-full overflow-hidden">
          <div 
            className={`flex w-[200%] transition-transform duration-500 ease-in-out ${
              isSignUp ? "-translate-x-1/2" : "translate-x-0"
            }`}
          >
            {/* SLIDE 1: Sign In on Mobile */}
            <div className="w-1/2 px-6 py-4 flex flex-col justify-center">
              {requirePasswordChange ? (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1 text-center">Security Update</h3>
                  <p className="text-xs text-gray-500 mb-4 text-center">Change your default password</p>
                  <form onSubmit={handlePasswordReset} className="space-y-3.5">
                    {loginError && <div className="p-2.5 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100 text-center">{loginError}</div>}
                    <input
                      type="password" required placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                    />
                    <input
                      type="password" required placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                    />
                    <button type="submit" disabled={isLoginLoading} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-colors flex justify-center shadow-lg shadow-indigo-500/20">
                      {isLoginLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "UPDATE PASSWORD"}
                    </button>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-3.5">
                  {loginError && <div className="p-2.5 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100 text-center">{loginError}</div>}
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Email Address</label>
                    <input
                      type="text" required placeholder="e.g. 24411@university.edu"
                      value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Password</label>
                    <input
                      type="password" required placeholder="••••••••"
                      value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-0.5 pb-1">
                    <label className="flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="mr-2 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      Remember me
                    </label>
                    <a href="#" className="hover:text-indigo-600 transition-colors">Forgot?</a>
                  </div>

                  <button
                    type="submit" disabled={isLoginLoading}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-colors flex justify-center items-center shadow-lg shadow-indigo-500/25 text-sm"
                  >
                    {isLoginLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "SIGN IN"}
                  </button>

                  <div className="text-center text-xs text-gray-500 pt-1">
                    Don't have an account?{" "}
                    <button type="button" onClick={toggleMode} className="text-indigo-600 font-bold hover:underline">
                      Sign up
                    </button>
                  </div>

                  {/* Demo Access on Mobile */}
                  <div className="pt-3 border-t border-gray-100 text-center">
                    <p className="text-[11px] font-medium text-gray-400 mb-2 uppercase tracking-wider">Quick Demo Access</p>
                    <div className="flex justify-center gap-2">
                      <button type="button" onClick={() => handleDemoClick('tpo@demo.com')} className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors">TPO</button>
                      <button type="button" onClick={() => handleDemoClick('admin@demo.com')} className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors">Admin</button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* SLIDE 2: Sign Up on Mobile */}
            <div className="w-1/2 px-6 py-4 flex flex-col justify-center">
              {!isRegSuccess ? (
                <form onSubmit={handleRegister} className="space-y-3">
                  {regError && <div className="p-2.5 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100 text-center">{regError}</div>}

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Account Type</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 cursor-pointer"
                    >
                      <option value="ALUMNI">Register as Alumni</option>
                      <option value="RECRUITER">Register as Recruiter</option>
                    </select>
                  </div>

                  <input
                    type="text" required placeholder="Full Name"
                    value={regFormData.name} onChange={(e) => setRegFormData({ ...regFormData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                  />
                  <input
                    type="email" required placeholder="Email Address"
                    value={regFormData.email} onChange={(e) => setRegFormData({ ...regFormData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                  />
                  <input
                    type="password" required placeholder="Password"
                    value={regFormData.password} onChange={(e) => setRegFormData({ ...regFormData, password: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                  />

                  {regRole === "ALUMNI" && (
                    <input
                      type="number" min="1990" max="2030" required placeholder="Batch Year (e.g. 2022)"
                      value={regFormData.batch} onChange={(e) => setRegFormData({ ...regFormData, batch: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                    />
                  )}
                  {regRole === "RECRUITER" && (
                    <input
                      type="text" required placeholder="Company Name"
                      value={regFormData.companyName} onChange={(e) => setRegFormData({ ...regFormData, companyName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                    />
                  )}

                  <button
                    type="submit" disabled={isRegLoading}
                    className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-colors disabled:opacity-70 flex justify-center items-center shadow-lg shadow-indigo-500/25 text-sm"
                  >
                    {isRegLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "SIGN UP"}
                  </button>

                  <div className="text-center text-xs text-gray-500 pt-1">
                    Already have an account?{" "}
                    <button type="button" onClick={toggleMode} className="text-indigo-600 font-bold hover:underline">
                      Sign in
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Registration Successful!</h3>
                  <p className="text-gray-500 mb-5 text-xs leading-relaxed">
                    Your request was submitted to the Administrator for approval.
                  </p>
                  <button onClick={toggleMode} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-colors shadow-md text-xs">
                    SIGN IN NOW
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          DESKTOP VIEW (>= md)
          Features:
          1. Split Two-Column Layout (max-w-[900px] min-h-[600px])
          2. Full-Height Campus Photo Overlay with College Crest
          3. Smooth 700ms Horizontal Sliding Mechanism
         ======================================================== */}
      <div className="hidden md:block relative w-full max-w-[900px] min-h-[600px] bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden">

        {/* --- SIGN UP FORM CONTAINER --- */}
        <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col justify-center px-10 py-12 transition-all duration-700 ease-in-out ${isSignUp ? 'md:translate-x-full opacity-100 z-10' : 'md:translate-x-[50%] opacity-0 pointer-events-none'}`}>
          <div className="w-full max-w-[340px] mx-auto">
            {!isRegSuccess ? (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Create Account</h2>
                <p className="text-sm text-gray-500 mb-8 text-center">Use your email for registration</p>

                <form onSubmit={handleRegister} className="space-y-4">
                  {regError && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100 text-center">{regError}</div>}

                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 cursor-pointer"
                  >
                    <option value="ALUMNI">Register as Alumni</option>
                    <option value="RECRUITER">Register as Recruiter</option>
                  </select>

                  <input
                    type="text" required placeholder="Full Name"
                    value={regFormData.name} onChange={(e) => setRegFormData({ ...regFormData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />
                  <input
                    type="email" required placeholder="Email Address"
                    value={regFormData.email} onChange={(e) => setRegFormData({ ...regFormData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />
                  <input
                    type="password" required placeholder="Password"
                    value={regFormData.password} onChange={(e) => setRegFormData({ ...regFormData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />

                  {regRole === "ALUMNI" && (
                    <input
                      type="number" min="1990" max="2030" required placeholder="Batch Year (e.g. 2021)"
                      value={regFormData.batch} onChange={(e) => setRegFormData({ ...regFormData, batch: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 animate-in fade-in"
                    />
                  )}
                  {regRole === "RECRUITER" && (
                    <input
                      type="text" required placeholder="Company Name"
                      value={regFormData.companyName} onChange={(e) => setRegFormData({ ...regFormData, companyName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 animate-in fade-in"
                    />
                  )}

                  <button
                    type="submit" disabled={isRegLoading}
                    className="w-full mt-4 py-3.5 bg-[#6658ea] hover:bg-[#5b4fdb] text-white font-bold rounded-full transition-colors disabled:opacity-70 flex justify-center items-center shadow-lg shadow-indigo-500/30"
                  >
                    {isRegLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "SIGN UP"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-10 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Registration Successful!</h2>
                <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                  Your registration request has been submitted to the Admin. You will be able to log in once your account is verified.
                </p>
                <button onClick={toggleMode} className="px-8 py-3 bg-[#6658ea] hover:bg-[#5b4fdb] text-white font-bold rounded-full transition-colors shadow-lg shadow-indigo-500/30">
                  SIGN IN NOW
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- SIGN IN FORM CONTAINER --- */}
        <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col justify-center px-10 py-12 transition-all duration-700 ease-in-out ${isSignUp ? 'md:translate-x-[100%] opacity-0 pointer-events-none' : 'md:translate-x-0 opacity-100 z-10'}`}>
          <div className="w-full max-w-[340px] mx-auto">
            {requirePasswordChange ? (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Security Update</h2>
                <p className="text-sm text-gray-500 mb-8 text-center">Please change your default password</p>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  {loginError && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100 text-center">{loginError}</div>}
                  <input
                    type="password" required placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />
                  <input
                    type="password" required placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />
                  <button type="submit" disabled={isLoginLoading} className="w-full mt-4 py-3.5 bg-[#6658ea] hover:bg-[#5b4fdb] text-white font-bold rounded-full transition-colors flex justify-center shadow-lg shadow-indigo-500/30">
                    {isLoginLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "UPDATE PASSWORD"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Sign in</h2>
                <p className="text-sm text-gray-500 mb-8 text-center">Use your account</p>

                <form onSubmit={handleLogin} className="space-y-4">
                  {loginError && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100 text-center">{loginError}</div>}

                  <input
                    type="text" required placeholder="Email Address"
                    value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />
                  <input
                    type="password" required placeholder="Password"
                    value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1 pb-2">
                    <label className="flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="mr-2 rounded text-purple-500 focus:ring-purple-500 border-gray-300"
                      />
                      Remember me
                    </label>
                    <a href="#" className="hover:text-purple-600 transition-colors">Forgot your password?</a>
                  </div>

                  <button
                    type="submit" disabled={isLoginLoading}
                    className="w-full py-3.5 bg-[#6658ea] hover:bg-[#5b4fdb] text-white font-bold rounded-full transition-colors flex justify-center items-center shadow-lg shadow-indigo-500/30"
                  >
                    {isLoginLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "SIGN IN"}
                  </button>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-400 mb-3 text-center uppercase tracking-wider">Demo Access</p>
                    <div className="flex justify-center gap-2">
                      <button type="button" onClick={() => handleDemoClick('tpo@demo.com')} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">TPO</button>
                      <button type="button" onClick={() => handleDemoClick('admin@demo.com')} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">Admin</button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* --- DESKTOP SLIDING OVERLAY CONTAINER --- */}
        <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-20 ${isSignUp ? '-translate-x-full' : 'translate-x-0'}`}>
          <div className={`absolute top-0 -left-[100%] w-[200%] h-full bg-cover bg-center transition-transform duration-700 ease-in-out text-white ${isSignUp ? 'translate-x-1/2' : 'translate-x-0'}`} style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("/college_campus.png")' }}>

            {/* Overlay Left Panel (Active when signing up, sits on the left side of the screen) */}
            <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center px-12 text-center transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-0' : '-translate-x-[20%]'}`}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-[6px] border-white mb-6 shadow-xl bg-white flex items-center justify-center">
                <img src="/college_logo.png" alt="College Logo" className="w-full h-full object-contain p-2" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
              <p className="text-white/90 text-sm leading-relaxed mb-8 max-w-[280px]">
                Log in to stay connected with recruiters, track applications, and grow your career.
              </p>
              <button
                onClick={toggleMode}
                className="px-12 py-3 rounded-full border-2 border-white text-white font-bold hover:bg-white/10 transition-colors tracking-wide"
              >
                SIGN IN
              </button>
            </div>

            {/* Overlay Right Panel (Active when signing in, sits on the right side of the screen) */}
            <div className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center px-12 text-center transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-[20%]' : 'translate-x-0'}`}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-[6px] border-white mb-6 shadow-xl bg-white flex items-center justify-center">
                <img src="/college_logo.png" alt="College Logo" className="w-full h-full object-contain p-2" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Join Our Community!</h2>
              <p className="text-white/90 text-sm leading-relaxed mb-8 max-w-[280px]">
                Create an account to browse jobs, network with alumni, and land your dream role.
              </p>
              <button
                onClick={toggleMode}
                className="px-12 py-3 rounded-full border-2 border-white text-white font-bold hover:bg-white/10 transition-colors tracking-wide"
              >
                SIGN UP
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
