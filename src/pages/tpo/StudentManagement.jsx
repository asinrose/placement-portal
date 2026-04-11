import React, { useState } from "react";
import { Card, CardContent } from "../../components/Card";
import { Search, Filter, ShieldCheck, Mail, MapPin, MoreVertical, ShieldAlert } from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function StudentManagement() {
  const [students, setStudents] = useState([]);

  const stats = [
    { label: "Total Registered", value: "0" },
    { label: "Verified Profiles", value: "0" },
    { label: "Pending Verification", value: "0" },
    { label: "Flagged Accounts", value: "0" },
  ];

  const handleVerify = (id) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: "Verified" } : s));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Student Directory</h1>
          <p className="text-gray-500">Manage and verify student profiles across departments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white">Export CSV</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">Add Student</Button>
        </div>
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

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
           <div className="relative w-full sm:w-96">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
             <Input type="text" placeholder="Search by name, ID, or email..." className="pl-9 bg-white" />
           </div>
           <div className="flex items-center gap-2">
             <select className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer">
                <option>All Branches</option>
                <option>Computer Science</option>
                <option>Information Tech</option>
                <option>Electronics</option>
             </select>
             <select className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer">
                <option>All Statuses</option>
                <option>Verified</option>
                <option>Unverified</option>
                <option>Flagged</option>
             </select>
           </div>
        </div>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
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
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                             {student.name.charAt(0)}
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
                       <div className="flex justify-end gap-2 items-center">
                         {student.status === "Unverified" && (
                           <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300" onClick={() => handleVerify(student.id)}>
                              Verify
                           </Button>
                         )}
                         <button className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
