import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Search, Filter, Shield, UserX, UserCheck, MoreVertical, Download, Check, X, Clock } from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function UserManagement() {
  const [users, setUsers] = useState(() => {
     try {
         const saved = localStorage.getItem("nexus_active_users");
         return saved ? JSON.parse(saved) : [];
     } catch (e) {
         return [];
     }
  });
  const [pendingRequests, setPendingRequests] = useState(() => {
     try {
         const saved = localStorage.getItem("nexus_pending_requests");
         return saved ? JSON.parse(saved) : [];
     } catch (e) {
         return [];
     }
  });
  const [activeTab, setActiveTab] = useState("USERS");

  const [filterRole, setFilterRole] = useState("ALL");

  const toggleStatus = (id) => {
    const updated = users.map(user => 
      user.id === id 
        ? { ...user, status: user.status === "Active" ? "Suspended" : "Active" } 
        : user
    );
    setUsers(updated);
    localStorage.setItem("nexus_active_users", JSON.stringify(updated));
  };

  const acceptRequest = (id) => {
    const requestToApprove = pendingRequests.find(req => req.id === id);
    if (!requestToApprove) return;
    
    // Remove from pending
    const updatedPending = pendingRequests.filter(req => req.id !== id);
    setPendingRequests(updatedPending);
    localStorage.setItem("nexus_pending_requests", JSON.stringify(updatedPending));
    
    // Add to active users
    const newUser = { ...requestToApprove, status: "Active" };
    const updatedUsers = [newUser, ...users];
    setUsers(updatedUsers);
    localStorage.setItem("nexus_active_users", JSON.stringify(updatedUsers));
  };

  const rejectRequest = (id) => {
    const updated = pendingRequests.filter(req => req.id !== id);
    setPendingRequests(updated);
    localStorage.setItem("nexus_pending_requests", JSON.stringify(updated));
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case "STUDENT": return "bg-blue-100 text-blue-700 border-blue-200";
      case "RECRUITER": return "bg-purple-100 text-purple-700 border-purple-200";
      case "PLACEMENT_OFFICER": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "ALUMNI": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredUsers = filterRole === "ALL" ? users : users.filter(u => u.role === filterRole);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Management</h1>
          <p className="text-gray-500">Manage account access and monitor system users.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-white"><Download className="w-4 h-4"/> Export CSV</Button>
        </div>
      </div>

      <div className="flex gap-6 border-b border-gray-200 minimal-scrollbar overflow-x-auto">
        <button 
          onClick={() => setActiveTab("USERS")}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === "USERS" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Active Users
        </button>
        <button 
          onClick={() => setActiveTab("PENDING")}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === "PENDING" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Pending Approvals
          {pendingRequests.length > 0 && (
            <span className="bg-amber-100 text-amber-700 py-0.5 px-2 rounded-full text-xs shadow-sm">{pendingRequests.length}</span>
          )}
        </button>
      </div>

      {activeTab === "USERS" ? (

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input type="text" placeholder="Search by name or email..." className="pl-9 bg-gray-50 border-gray-200" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-1"><Filter className="w-4 h-4"/> Filter:</span>
                <select 
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                    <option value="ALL">All Roles</option>
                    <option value="STUDENT">Students</option>
                    <option value="RECRUITER">Recruiters</option>
                    <option value="PLACEMENT_OFFICER">Placement Officers</option>
                    <option value="ALUMNI">Alumni</option>
                </select>
            </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">User Details</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Joined Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm
                            ${user.role === 'STUDENT' ? 'bg-blue-500' : user.role === 'RECRUITER' ? 'bg-purple-500' : user.role === 'PLACEMENT_OFFICER' ? 'bg-indigo-500' : 'bg-orange-500'}`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{user.email}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.joined}</td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {user.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        {user.status === "Active" ? (
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-white border-red-200 hover:bg-red-600 hover:border-red-600" onClick={() => toggleStatus(user.id)}>
                                <UserX className="w-4 h-4 mr-1.5"/> Suspend
                            </Button>
                        ) : (
                            <Button size="sm" variant="outline" className="text-emerald-700 hover:text-white border-emerald-200 hover:bg-emerald-600 hover:border-emerald-600" onClick={() => toggleStatus(user.id)}>
                                <UserCheck className="w-4 h-4 mr-1.5"/> Activate
                            </Button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    No users found matching the selected filters.
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      ) : (
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 bg-gray-50/50 py-4">
           <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-700">
             <Clock className="w-4 h-4 text-amber-500"/> Action Required: Account Verifications
           </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Applicant Profile</th>
                  <th className="px-6 py-4 font-semibold">Role & Entity Details</th>
                  <th className="px-6 py-4 font-semibold">Applied On</th>
                  <th className="px-6 py-4 font-semibold text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm
                            ${req.role === 'RECRUITER' ? 'bg-purple-500' : 'bg-orange-500'}`}>
                            {req.name.charAt(0)}
                          </div>
                          <div>
                            <span className="inline-flex items-center gap-2 font-semibold text-gray-900">
                               {req.name} 
                               <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Pending</span>
                            </span>
                            <p className="text-gray-500 text-xs mt-0.5">{req.email}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-1">
                          <span className={`inline-flex w-max items-center px-2 py-0.5 rounded text-[11px] font-bold border ${getRoleBadgeColor(req.role)}`}>
                             {req.role}
                          </span>
                          <span className="text-xs font-medium text-gray-600">
                             {req.role === "ALUMNI" && <>Batch: <strong>{req.batch}</strong></>}
                             {req.role === "RECRUITER" && <>Company: <strong>{req.companyName}</strong></>}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{req.date}</td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                           <Button size="sm" variant="outline" className="text-red-600 hover:text-white border-red-200 hover:bg-red-600 hover:border-red-600 px-3" onClick={() => rejectRequest(req.id)}>
                               <X className="w-4 h-4 mr-1"/> Reject
                           </Button>
                           <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 px-3 border-none" onClick={() => acceptRequest(req.id)}>
                               <Check className="w-4 h-4 mr-1"/> Approve
                           </Button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pendingRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-100">
                       <UserCheck className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-gray-900 font-bold mb-1">You're all caught up!</h3>
                    <p className="text-gray-500 text-sm">There are no pending registration requests awaiting your approval.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
