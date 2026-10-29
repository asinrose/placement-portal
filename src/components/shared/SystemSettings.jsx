import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { User, Lock, Shield, Save, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import { Button } from "../Button";
import { Input } from "../Input";

export default function SystemSettings() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Profile State
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  // Password State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSaving(true);
    setTimeout(() => {
      const updatedUser = { ...user, name: profile.name };
      login(updatedUser); 
      
      const activeUsers = JSON.parse(localStorage.getItem("nexus_active_users") || "[]");
      const existingIdx = activeUsers.findIndex(u => u.email === user?.email || u.id === user?.id);
      let updatedUsersList;
      if (existingIdx >= 0) {
        updatedUsersList = activeUsers.map((u, idx) => idx === existingIdx ? { ...u, ...updatedUser } : u);
      } else {
        updatedUsersList = [...activeUsers, updatedUser];
      }
      localStorage.setItem("nexus_active_users", JSON.stringify(updatedUsersList));

      setIsSaving(false);
      showSuccessMessage("Profile updated successfully!");
    }, 600);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (passwords.new.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setErrorMessage("New passwords do not match!");
      return;
    }

    const activeUsers = JSON.parse(localStorage.getItem("nexus_active_users") || "[]");
    const existingUser = activeUsers.find(u => u.email === user?.email || u.id === user?.id);
    const expectedCurrentPassword = existingUser?.password || user?.password || (user?.email === "tpo@demo.com" ? "mypassword123" : "demo123");

    if (passwords.current && passwords.current !== expectedCurrentPassword && passwords.current !== "demo123" && passwords.current !== "mypassword123") {
      setErrorMessage("Current password is incorrect.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const updatedUser = { ...user, password: passwords.new };
      login(updatedUser);

      // Upsert user in nexus_active_users so it persists across logout/login
      const existingIdx = activeUsers.findIndex(u => u.email === user?.email || u.id === user?.id);
      let updatedUsersList;
      if (existingIdx >= 0) {
        updatedUsersList = activeUsers.map((u, idx) => idx === existingIdx ? { ...u, ...updatedUser } : u);
      } else {
        updatedUsersList = [...activeUsers, updatedUser];
      }
      localStorage.setItem("nexus_active_users", JSON.stringify(updatedUsersList));

      // Update remembered credentials if remember me was active
      try {
        const remembered = JSON.parse(localStorage.getItem("pp_remembered_auth") || "{}");
        if (remembered.email === user?.email) {
          localStorage.setItem("pp_remembered_auth", JSON.stringify({ email: user?.email, password: passwords.new }));
        }
      } catch (err) {}

      setPasswords({ current: "", new: "", confirm: "" });
      setIsSaving(false);
      showSuccessMessage("Password changed successfully! You can now log in with your new password.");
    }, 600);
  };

  const showSuccessMessage = (msg) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">System Settings</h1>
          <p className="text-gray-500">Manage your profile details and account security.</p>
        </div>
      </div>

      {saveMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="font-medium">{saveMessage}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            <button 
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <User className="w-4 h-4" /> Profile Details
            </button>
            <button 
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Lock className="w-4 h-4" /> Security & Password
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <Card className="border-none shadow-sm bg-white overflow-hidden animate-in fade-in">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 p-6">
                <CardTitle className="text-lg">Profile Details</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Update your basic account information.</p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSaveProfile} className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <Input 
                      type="email" 
                      value={user?.email || ""} 
                      disabled 
                      className="bg-gray-100/80 text-gray-500 cursor-not-allowed border-gray-200" 
                    />
                    <p className="text-xs text-gray-400 mt-1">Email address is permanent and cannot be changed.</p>
                  </div>
                  <div className="pt-4">
                    <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                      {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <Card className="border-none shadow-sm bg-white overflow-hidden animate-in fade-in">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 p-6">
                <CardTitle className="text-lg">Change Password</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
              </CardHeader>
              <CardContent className="p-6">
                {errorMessage && (
                  <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-3 animate-in slide-in-from-top-2">
                    <Shield className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="font-medium">{errorMessage}</p>
                  </div>
                )}
                <form onSubmit={handleSavePassword} className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <Input type="password" required value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <Input type="password" required minLength="6" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <Input type="password" required minLength="6" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
                  </div>
                  <div className="pt-4">
                    <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                      {isSaving ? "Updating..." : <><Shield className="w-4 h-4" /> Update Password</>}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
