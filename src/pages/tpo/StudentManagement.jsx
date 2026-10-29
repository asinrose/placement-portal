import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/Card";
import { Search, ShieldCheck, Mail, MapPin, MoreVertical, ShieldAlert, X } from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  useEffect(() => {
    const activeUsers = JSON.parse(localStorage.getItem("nexus_active_users") || "[]");
    const savedProfile = JSON.parse(localStorage.getItem('studentProfileData') || 'null');
    
    const studentUsers = activeUsers
      .filter(u => u.role === "STUDENT")
      .map(u => ({
        ...u,
        branch: u.department || u.branch || "Not specified",
        cgpa: u.cgpa || "N/A",
        status: u.tpoStatus || "Unverified",
        profilePicture: (savedProfile && savedProfile.email === u.email) ? savedProfile.profilePicture : null
      }));
    setStudents(studentUsers);
  }, []);

  const totalRegistered = students.length;
  const verifiedProfiles = students.filter(s => s.status === "Verified").length;
  const pendingVerification = students.filter(s => s.status === "Unverified").length;
  const flaggedAccounts = students.filter(s => s.status === "Flagged").length;

  const stats = [
    { label: "Total Registered", value: totalRegistered.toString() },
    { label: "Verified Profiles", value: verifiedProfiles.toString() },
    { label: "Pending Verification", value: pendingVerification.toString() },
    { label: "Flagged Accounts", value: flaggedAccounts.toString() },
  ];

  const handleVerify = (id) => {
    handleStatusChange(id, "Verified");
  };

  const handleStatusChange = (id, newStatus) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));

    const activeUsers = JSON.parse(localStorage.getItem("nexus_active_users") || "[]");
    const updatedActiveUsers = activeUsers.map(u => u.id === id ? { ...u, tpoStatus: newStatus } : u);
    localStorage.setItem("nexus_active_users", JSON.stringify(updatedActiveUsers));
  };

  const handleDeleteStudent = (id) => {
    if (!window.confirm("Are you sure you want to delete this student account?")) return;
    
    setStudents(students.filter(s => s.id !== id));
    const activeUsers = JSON.parse(localStorage.getItem("nexus_active_users") || "[]");
    const updatedActiveUsers = activeUsers.filter(u => u.id !== id);
    localStorage.setItem("nexus_active_users", JSON.stringify(updatedActiveUsers));
  };

  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = (s.name || "").toLowerCase().includes(q);
    const emailMatch = (s.email || "").toLowerCase().includes(q);
    const idMatch = (s.id ? String(s.id) : "").toLowerCase().includes(q);
    const regMatch = (s.registerNumber || "").toLowerCase().includes(q);
    const matchesSearch = !q || nameMatch || emailMatch || idMatch || regMatch;

    const matchesBranch = selectedBranch === "All Branches" || (s.branch || s.department || "").toLowerCase().includes(selectedBranch.toLowerCase());
    const matchesStatus = selectedStatus === "All Statuses" || (s.status || "") === selectedStatus;

    return matchesSearch && matchesBranch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Student Directory</h1>
        <p className="text-gray-500">Manage and verify student profiles across departments.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-gray-100 shadow-sm bg-white">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-visible bg-white">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50 rounded-t-xl">
           <div className="relative w-full sm:w-96">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
             <Input 
               type="text" 
               placeholder="Search by name, ID, or email..." 
               className="pl-9 pr-8 bg-white" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             {searchQuery && (
               <button 
                 onClick={() => setSearchQuery("")}
                 className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100"
               >
                 <X className="w-4 h-4" />
               </button>
             )}
           </div>
           <div className="flex items-center gap-2">
             <select 
               className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
               value={selectedBranch}
               onChange={(e) => setSelectedBranch(e.target.value)}
             >
                <option>All Branches</option>
                <option>Computer Science</option>
                <option>Information Tech</option>
                <option>Electronics</option>
             </select>
             <select 
               className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
               value={selectedStatus}
               onChange={(e) => setSelectedStatus(e.target.value)}
             >
                <option>All Statuses</option>
                <option>Verified</option>
                <option>Unverified</option>
                <option>Flagged</option>
             </select>
           </div>
        </div>
        
        <CardContent className="p-0">
          <div className="overflow-visible min-h-[300px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student Details</th>
                  <th className="px-6 py-4 font-semibold">Department</th>
                  <th className="px-6 py-4 font-semibold">CGPA</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      {searchQuery ? (
                        <div>
                          <p className="font-medium text-gray-700">No students match "{searchQuery}"</p>
                          <p className="text-xs text-gray-400 mt-1">Try searching by student name, register number, or email</p>
                        </div>
                      ) : (
                        "No students found."
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 overflow-hidden">
                             {student.profilePicture ? (
                               <img src={student.profilePicture} alt={student.name} className="w-full h-full object-cover" />
                             ) : (
                               student.name.charAt(0)
                             )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{student.name}</p>
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                               <Mail className="w-3 h-3" /> {student.email}
                            </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 font-medium">{student.branch}</p>
                      <p className="text-gray-400 text-xs">{student.id}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{student.cgpa}</td>
                    <td className="px-6 py-4">
                      {student.status === "Verified" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><ShieldCheck className="w-3 h-3"/> Verified</span>}
                      {student.status === "Unverified" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"><ShieldAlert className="w-3 h-3"/> Unverified</span>}
                      {student.status === "Flagged" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Flagged</span>}
                    </td>
                     <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2 items-center relative">
                         {student.status === "Unverified" && (
                           <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300" onClick={() => handleVerify(student.id)}>
                              Verify
                           </Button>
                         )}
                         <div className="relative">
                           <button 
                             onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                             className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                           >
                              <MoreVertical className="w-5 h-5" />
                           </button>
                           {openMenuId === student.id && (
                             <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50 border border-gray-100 py-1 overflow-hidden">
                               <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => { setSelectedStudent(student); setOpenMenuId(null); }}>View Full Profile</button>
                               {student.status !== "Flagged" && (
                                 <button className="block w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-gray-50" onClick={() => { handleStatusChange(student.id, "Flagged"); setOpenMenuId(null); }}>Flag Account</button>
                               )}
                               {student.status === "Flagged" && (
                                 <button className="block w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-gray-50" onClick={() => { handleStatusChange(student.id, "Verified"); setOpenMenuId(null); }}>Remove Flag</button>
                               )}
                               <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50" onClick={() => { handleDeleteStudent(student.id); setOpenMenuId(null); }}>Delete Account</button>
                             </div>
                           )}
                         </div>
                       </div>
                     </td>
                   </tr>
                 ))
               )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Student Profile</h2>
              <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold border border-indigo-200 overflow-hidden shrink-0">
                    {selectedStudent.profilePicture ? (
                      <img src={selectedStudent.profilePicture} alt={selectedStudent.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedStudent.name.charAt(0)
                    )}
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h3>
                    <p className="text-gray-500">{selectedStudent.email}</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Department</p>
                    <p className="text-gray-900 font-medium">{selectedStudent.branch}</p>
                 </div>
                 <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">CGPA</p>
                    <p className="text-gray-900 font-medium">{selectedStudent.cgpa}</p>
                 </div>
                 <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Student ID</p>
                    <p className="text-gray-900 font-medium">{selectedStudent.id}</p>
                 </div>
                 <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Current Status</p>
                    <p className="text-gray-900 font-medium">{selectedStudent.status}</p>
                 </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
               <Button onClick={() => setSelectedStudent(null)} className="bg-gray-900 hover:bg-gray-800 text-white">Close Profile</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
