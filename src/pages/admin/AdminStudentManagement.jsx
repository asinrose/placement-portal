import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Search, Plus, Upload, Trash2, KeyRound, CheckCircle, GraduationCap, X, FileText } from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function AdminStudentManagement() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals state
  const [isAddMode, setIsAddMode] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", registerNumber: "", email: "", department: "", year: "" });
  
  const [isCsvMode, setIsCsvMode] = useState(false);
  const fileInputRef = useRef(null);
  
  // Feedback
  const [feedback, setFeedback] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    try {
        const stored = localStorage.getItem("nexus_active_users");
        if (stored) setActiveUsers(JSON.parse(stored));
    } catch {}
  }, []);

  const saveUsers = (updatedUsers) => {
    setActiveUsers(updatedUsers);
    localStorage.setItem("nexus_active_users", JSON.stringify(updatedUsers));
  };

  const showFeedback = (msg, type = "success") => {
     setFeedback({ show: true, message: msg, type });
     setTimeout(() => setFeedback({ show: false, message: "", type: "success" }), 4000);
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.registerNumber || !newStudent.department || !newStudent.year) {
       showFeedback("Please fill all required fields.", "error"); return;
    }

    const studentObj = {
      id: Date.now(),
      name: newStudent.name,
      registerNumber: newStudent.registerNumber,
      email: newStudent.email || `${newStudent.registerNumber}@university.edu`,
      department: newStudent.department,
      batch: newStudent.year,
      role: "STUDENT",
      password: "welcome123",
      mustChangePassword: true,
      status: "Active",
      joined: new Date().toLocaleDateString()
    };

    saveUsers([studentObj, ...activeUsers]);
    setIsAddMode(false);
    setNewStudent({ name: "", registerNumber: "", email: "", department: "", year: "" });
    showFeedback("Student added successfully! Default password is 'welcome123'");
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
       const text = await file.text();
       const lines = text.split('\n').filter(line => line.trim().length > 0);
       
       if (lines.length <= 1) {
          showFeedback("CSV file appears to be empty.", "error"); return;
       }

       const newStudents = [];
       // Assuming Header: Name,RegisterNumber,Email,Department,Year
       for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(item => item.trim());
          if (row.length >= 5) {
             newStudents.push({
                id: Date.now() + i, // prevent duplicate IDs instantly
                name: row[0],
                registerNumber: row[1],
                email: row[2],
                department: row[3],
                batch: row[4],
                role: "STUDENT",
                password: "welcome123",
                mustChangePassword: true,
                status: "Active",
                joined: new Date().toLocaleDateString()
             });
          }
       }

       if (newStudents.length > 0) {
          saveUsers([...newStudents, ...activeUsers]);
          showFeedback(`Successfully imported ${newStudents.length} students!`);
       } else {
          showFeedback("No valid student rows found. Check CSV format.", "error");
       }
    } catch (err) {
       showFeedback("Error reading file.", "error");
    }
    
    setIsCsvMode(false);
  };

  const handleDelete = (id) => {
     if (window.confirm("Are you sure you want to completely remove this student account?")) {
        saveUsers(activeUsers.filter(u => u.id !== id));
        showFeedback("Student removed.");
     }
  };

  const handleResetPassword = (id, e) => {
     e.stopPropagation();
     const updated = activeUsers.map(user => 
        user.id === id ? { ...user, password: "welcome123", mustChangePassword: true } : user
     );
     saveUsers(updated);
     showFeedback("Password reset to 'welcome123'. User will be prompted to change it on next login.");
  };

  const downloadCsvTemplate = () => {
     const csvContent = "data:text/csv;charset=utf-8,Name,RegisterNumber,Email,Department,Year\nJohn Doe,REG001,john@edu.com,Computer Science,2024";
     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     link.setAttribute("download", "student_import_template.csv");
     document.body.appendChild(link);
     link.click();
     link.remove();
  };

  const students = activeUsers.filter(u => u.role === "STUDENT" && (searchTerm === "" || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase())));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Student Account Management</h1>
          <p className="text-gray-500">Solely provision and oversee student access rights.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-white" onClick={() => setIsCsvMode(true)}>
            <Upload className="w-4 h-4"/> Bulk Upload CSV
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md gap-2" onClick={() => setIsAddMode(true)}>
            <Plus className="w-4 h-4"/> Add Student
          </Button>
        </div>
      </div>

      {feedback.show && (
         <div className={`p-4 rounded-xl flex items-center gap-3 border ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {feedback.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-red-500"/>}
            <p className="font-semibold text-sm">{feedback.message}</p>
         </div>
      )}

      {/* Main Student Table */}
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <div className="p-4 border-b border-gray-50 flex sm:flex-row items-center justify-between">
           <div className="relative w-full max-w-sm">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
             <Input type="text" placeholder="Search by name or register number..." className="pl-9 h-10 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
           
           <div className="text-sm font-semibold text-gray-500">
              {students.length} Total Students
           </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                   <tr>
                      <th className="px-6 py-4 font-semibold">Student Profile</th>
                      <th className="px-6 py-4 font-semibold">Reg. Number</th>
                      <th className="px-6 py-4 font-semibold">Academic Profile</th>
                      <th className="px-6 py-4 font-semibold">Credential State</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-blue-700 bg-blue-50 border border-blue-100 shrink-0">
                                  {student.name.charAt(0)}
                               </div>
                               <div>
                                  <p className="font-bold text-gray-900 leading-snug">{student.name}</p>
                                  <p className="text-gray-500 text-xs">{student.email}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded-md text-xs font-semibold text-gray-700">{student.registerNumber}</span>
                         </td>
                         <td className="px-6 py-4">
                            <p className="font-semibold text-gray-800">{student.department}</p>
                            <p className="text-xs font-medium text-gray-500">Batch of {student.batch}</p>
                         </td>
                         <td className="px-6 py-4">
                            {student.mustChangePassword ? (
                               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                 <KeyRound className="w-3 h-3"/> Pending Reset
                               </span>
                            ) : (
                               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                 <CheckCircle className="w-3 h-3"/> Secured
                               </span>
                            )}
                         </td>
                         <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="outline" className="text-amber-600 border-transparent hover:bg-amber-50 hover:border-amber-200 h-8 px-2" onClick={(e) => handleResetPassword(student.id, e)} title="Reset Password to Default">
                                   <KeyRound className="w-4 h-4"/>
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 border-transparent hover:bg-red-50 hover:border-red-200 h-8 px-2" onClick={() => handleDelete(student.id)} title="Delete Account">
                                   <Trash2 className="w-4 h-4"/>
                                </Button>
                             </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
             {students.length === 0 && (
                <div className="p-16 text-center border-t border-gray-100">
                   <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 border border-blue-100">
                      <GraduationCap className="w-8 h-8 text-blue-500" />
                   </div>
                   <p className="text-gray-900 font-bold mb-1">No students registered yet!</p>
                   <p className="text-gray-500 text-sm">Add a student manually or upload a batch via CSV to get started.</p>
                </div>
             )}
          </div>
        </CardContent>
      </Card>

      {/* Add Single Student Modal */}
      {isAddMode && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-500"/> Manually Add Student</h2>
                  <button onClick={() => setIsAddMode(false)} className="text-gray-400 hover:text-gray-600"><span className="text-2xl leading-none">&times;</span></button>
               </div>
               <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                  <Input label="Full Name" required placeholder="e.g. Jane Doe" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
                  <Input label="Register Number (User ID)" required placeholder="e.g. REG-001" value={newStudent.registerNumber} onChange={e => setNewStudent({...newStudent, registerNumber: e.target.value})} />
                  <Input type="email" label="Email Address (Optional)" placeholder="jane@university.edu" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select required className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={newStudent.department} onChange={e => setNewStudent({...newStudent, department: e.target.value})}>
                           <option value="">Select...</option>
                           <option value="Computer Science">Computer Science</option>
                           <option value="Information Tech">Information Tech</option>
                           <option value="Mechanical Eng.">Mechanical Eng.</option>
                           <option value="Civil Eng.">Civil Eng.</option>
                           <option value="Electronics">Electronics</option>
                        </select>
                     </div>
                     <Input label="Graduation Year" required type="number" min="2000" max="2035" placeholder="e.g. 2025" value={newStudent.year} onChange={e => setNewStudent({...newStudent, year: e.target.value})} />
                  </div>
                  
                  <div className="bg-amber-50 border-l-[3px] border-amber-400 p-3 mt-2">
                     <p className="text-xs text-amber-800 font-medium">New accounts are automatically generated with the password <span className="font-mono bg-white px-1 py-0.5 rounded text-[10px]">welcome123</span>.</p>
                  </div>

                  <div className="pt-4 flex gap-3">
                     <Button type="button" variant="outline" className="w-full" onClick={() => setIsAddMode(false)}>Cancel</Button>
                     <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200">Provision Account</Button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* CSV Bulk Upload Modal */}
      {isCsvMode && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Upload className="w-5 h-5 text-indigo-500"/> Bulk Import via CSV</h2>
                  <button onClick={() => setIsCsvMode(false)} className="text-gray-400 hover:text-gray-600"><span className="text-2xl leading-none">&times;</span></button>
               </div>
               <div className="p-6 space-y-5">
                  <div className="text-sm text-gray-600 leading-relaxed">
                     Upload a CSV file to provision multiple student accounts simultaneously. The file must strictly follow the required columns template.
                  </div>
                  
                  <button onClick={downloadCsvTemplate} className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors">
                     <FileText className="w-3.5 h-3.5" /> Download Schema Template File
                  </button>

                  <div 
                     className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50 hover:bg-indigo-50/30 hover:border-indigo-300 transition-colors cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}
                  >
                     <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                     <p className="text-sm font-semibold text-gray-700">Click to browse or drag and drop your `.csv` file here.</p>
                     <p className="text-xs text-gray-500 mt-1">Maximum file size ~2MB</p>
                     <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleCsvUpload} />
                  </div>

                  <div className="pt-2">
                     <Button variant="outline" className="w-full" onClick={() => setIsCsvMode(false)}>Close Window</Button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
