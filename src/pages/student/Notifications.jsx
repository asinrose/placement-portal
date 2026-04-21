import React, { useState, useEffect } from "react";
import { Check, Bell, BellRing, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Button } from "../../components/Button";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = () => {
      const saved = JSON.parse(localStorage.getItem('student_notifications') || '[]');
      setNotifications(saved);
    };

    loadNotifications();
    window.addEventListener('storage', loadNotifications);
    window.addEventListener('notifications_updated', loadNotifications);

    return () => {
      window.removeEventListener('storage', loadNotifications);
      window.removeEventListener('notifications_updated', loadNotifications);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('student_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('notifications_updated'));
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('student_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('notifications_updated'));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <BellRing className="w-6 h-6 text-indigo-600" /> My Notifications
          </h1>
          <p className="text-gray-500 mt-1">Stay updated on your application status and messages.</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none shadow-sm flex items-center gap-2">
            <Check className="w-4 h-4" /> Mark all as read
          </Button>
        )}
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Alerts</CardTitle>
          <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">
             {unreadCount} Unread
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
               <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-gray-300" />
               </div>
               <h3 className="text-lg font-medium text-gray-900">No Notifications</h3>
               <p className="text-gray-500 max-w-sm mt-1">You're all caught up! When recruiters review your applications, updates will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <li key={notif.id} className={`p-6 hover:bg-gray-50 transition-colors group ${!notif.read ? 'bg-indigo-50/20' : ''}`} onClick={() => !notif.read && markAsRead(notif.id)}>
                  <div className="flex items-start gap-4">
                     <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${!notif.read ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Bell className="w-5 h-5" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                           <p className={`text-base ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                              {notif.message}
                           </p>
                           {!notif.read && (
                             <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 flex-shrink-0 mt-1.5 shadow-sm"></span>
                           )}
                        </div>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                           <Clock className="w-4 h-4 text-gray-400" /> {notif.date}
                        </p>
                     </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
