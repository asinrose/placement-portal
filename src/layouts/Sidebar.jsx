import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Briefcase, X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function Sidebar({ navigationItems = [], onLogout, onItemClick, onClose }) {
  const location = useLocation();

  return (
    <div className="flex w-64 flex-col h-full bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between h-16 flex-shrink-0 px-6 bg-indigo-600 text-white">
          <div className="flex items-center">
            <Briefcase className="w-8 h-8 mr-3" />
            <span className="font-bold text-lg tracking-wide">PlacementPortal</span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-indigo-700 focus:outline-none transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onItemClick}
                  className={twMerge(
                    clsx(
                      "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )
                  )}
                >
                  <Icon
                    className={clsx(
                      "flex-shrink-0 -ml-1 mr-3 h-5 w-5",
                      isActive ? "text-indigo-700" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <button
            onClick={onLogout}
            className="flex-shrink-0 w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-red-500 group-hover:text-red-600" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
