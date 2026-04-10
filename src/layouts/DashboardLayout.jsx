import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ navigationItems }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop and Mobile conditionally */}
      <div className={`fixed inset-y-0 left-0 z-30 transform md:relative md:translate-x-0 transition duration-200 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
         <div className="w-64 h-full md:w-auto">
            <Sidebar navigationItems={navigationItems} onLogout={handleLogout} />
         </div>
      </div>

      <div className="flex flex-col flex-1 w-full md:pl-64">
        {/* Pass down user data to Navbar */}
        <Navbar 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          userName={user?.name || user?.email?.split('@')[0]}
          role={user?.role}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
