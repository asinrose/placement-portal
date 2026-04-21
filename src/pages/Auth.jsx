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
    setIsSignUp(!isSignUp);
    window.history.pushState({}, '', isSignUp ? '/login' : '/register');
  };

  // --- LOGIN STATE & LOGIC ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [requirePasswordChange, setRequirePasswordChange] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
        if (loginEmail === "tpo@demo.com" && loginPassword === "demo123") {
          user = { id: 2, name: "Bob Officer", email: loginEmail, role: "PLACEMENT_OFFICER" };
        } else if (loginEmail === "admin@demo.com" && loginPassword === "demo123") {
          user = { id: 4, name: "System Admin", email: loginEmail, role: "ADMIN" };
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
    setLoginPassword("demo123");
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden relative">
      <div className="relative w-full max-w-[900px] min-h-[600px] bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden">

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

                  <div className="md:hidden text-center mt-6 text-sm text-gray-500">
                    Already have an account? <span onClick={toggleMode} className="text-purple-600 font-bold cursor-pointer">Sign in</span>
                  </div>
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
                <div className="flex justify-center items-center gap-2 mb-8 md:hidden">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#e55d87] to-[#5fc3e4] flex items-center justify-center shadow-lg">
                    <Briefcase className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-800">Nexus</span>
                </div>

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
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-2 rounded text-purple-500 focus:ring-purple-500 border-gray-300" />
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

                  <div className="md:hidden text-center mt-6 text-sm text-gray-500">
                    Don't have an account? <span onClick={toggleMode} className="text-purple-600 font-bold cursor-pointer">Sign up</span>
                  </div>

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

        {/* --- OVERLAY CONTAINER --- */}
        <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-20 ${isSignUp ? '-translate-x-full' : 'translate-x-0'}`}>
          <div className={`absolute top-0 -left-[100%] w-[200%] h-full bg-gradient-to-br from-[#ff6b6b] via-[#e65c9c] to-[#9b51e0] transition-transform duration-700 ease-in-out text-white ${isSignUp ? 'translate-x-1/2' : 'translate-x-0'}`}>

            {/* Overlay Left Panel (Active when signing up, sits on the left side of the screen) */}
            <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center px-12 text-center transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-0' : '-translate-x-[20%]'}`}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-[6px] border-white mb-6 shadow-xl bg-white flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Students collaborating" className="w-full h-full object-cover" />
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
                <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Students celebrating" className="w-full h-full object-cover" />
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
