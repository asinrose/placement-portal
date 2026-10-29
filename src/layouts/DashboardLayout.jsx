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
      {/* Mobile Sidebar overlay backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform md:hidden transition-transform duration-300 ease-in-out shadow-2xl ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar 
          navigationItems={navigationItems} 
          onLogout={handleLogout} 
          onItemClick={() => setIsMobileMenuOpen(false)}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
        <Sidebar 
          navigationItems={navigationItems} 
          onLogout={handleLogout} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full md:pl-64 min-w-0">
        <Navbar 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          userName={user?.name || user?.email?.split('@')[0]}
          role={user?.role}
          profilePicture={user?.profilePicture}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
