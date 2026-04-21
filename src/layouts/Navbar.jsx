import React, { useState, useEffect, useRef } from "react";
import { Bell, User, Menu, Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar({ onMenuClick, userName, role }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const loadNotifications = () => {
      const saved = JSON.parse(localStorage.getItem('student_notifications') || '[]');
      setNotifications(saved);
    };

    loadNotifications();
    window.addEventListener('storage', loadNotifications);
    // Custom event for same-window updates
    window.addEventListener('notifications_updated', loadNotifications);

    return () => {
      window.removeEventListener('storage', loadNotifications);
      window.removeEventListener('notifications_updated', loadNotifications);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('student_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('notifications_updated'));
  };

  const handleBellClick = () => {
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex-1 flex justify-between items-center md:justify-end">
          {/* Add a placeholder div here on mobile to push the right side content to the end */}
          <div className="md:hidden"></div>

          <div className="ml-4 flex items-center gap-4 md:ml-6">
            <div className="relative">
              <Link to={role === "STUDENT" ? "/student/notifications" : "#"} onClick={handleBellClick} className="p-1 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors relative block">
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white block"></span>}
                <Bell className="h-6 w-6" />
              </Link>
            </div>

            {/* Profile dropdown UI (Static for now) */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-medium text-gray-900">{userName || "User"}</span>
                <span className="text-xs text-gray-500 capitalize">{role?.replace("_", " ") || "Role"}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                {userName ? userName.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
