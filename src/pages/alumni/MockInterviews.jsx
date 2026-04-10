import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Clock, Calendar, CheckCircle, Video, Plus, User, Trash2 } from "lucide-react";
import { Button } from "../../components/Button";

export default function MockInterviews() {
  const [slots, setSlots] = useState([
    { id: 1, date: "2024-05-12", time: "10:00 AM", duration: "45 mins", bookedBy: null, topic: "System Design" },
    { id: 2, date: "2024-05-14", time: "02:00 PM", duration: "45 mins", bookedBy: { name: "Alice Johnson", email: "alice.j@university.edu" }, topic: "Data Structures & Algorithms" },
    { id: 3, date: "2024-05-15", time: "11:00 AM", duration: "60 mins", bookedBy: null, topic: "Behavioral / HR" },
    { id: 4, date: "2024-05-18", time: "05:00 PM", duration: "30 mins", bookedBy: { name: "Ravi Kumar", email: "ravi.k@university.edu" }, topic: "React.js Frontend" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: "", time: "", duration: "45 mins", topic: "" });

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!newSlot.date || !newSlot.time || !newSlot.topic) return;
    setSlots([{ id: Date.now(), ...newSlot, bookedBy: null }, ...slots]);
    setIsModalOpen(false);
    setNewSlot({ date: "", time: "", duration: "45 mins", topic: "" });
  };

  const handleRemoveSlot = (id) => {
    setSlots(slots.filter(slot => slot.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">Mentorship & Interviews</h1>
           <p className="text-gray-500">Give back to the campus community by hosting 1-on-1 mock interviews.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
           <Plus className="w-4 h-4"/> Schedule New Slot
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
         {/* Available Hosted Slots */}
         <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
               <Calendar className="w-5 h-5 text-indigo-500" />
               Your Open Slots
            </h2>
            <div className="space-y-4">
               {slots.filter(s => !s.bookedBy).map(slot => (
                 <Card key={slot.id} className="border-indigo-100 shadow-sm transition-all hover:shadow-md bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                       <div>
                          <div className="flex items-center gap-2">
                             <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                               {slot.topic}
                             </span>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-medium text-gray-700">
                             <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400"/> {slot.date}</span>
                             <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400"/> {slot.time} ({slot.duration})</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">Awaiting student booking...</p>
                       </div>
                       <button onClick={() => handleRemoveSlot(slot.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors">
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </CardContent>
                 </Card>
               ))}
               {slots.filter(s => !s.bookedBy).length === 0 && (
                  <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    <p className="text-sm font-medium text-gray-500">You have no open slots available. Click above to schedule one!</p>
                  </div>
               )}
            </div>
         </div>

         {/* Upcoming Booked Interviews */}
         <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
               <CheckCircle className="w-5 h-5 text-emerald-500" />
               Upcoming Booked Interviews
            </h2>
            <div className="space-y-4">
               {slots.filter(s => s.bookedBy).map(slot => (
                 <Card key={slot.id} className="border-emerald-100 shadow-md bg-gradient-to-br from-white to-emerald-50/30 overflow-hidden ring-1 ring-emerald-50">
                    <CardContent className="p-5">
                       <div className="flex items-start justify-between">
                          <div>
                             <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                               {slot.topic}
                             </span>
                             <div className="mt-4 flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 font-bold shrink-0">
                                      {slot.bookedBy.name.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-gray-900 leading-tight">{slot.bookedBy.name}</p>
                                      <p className="text-[11px] text-gray-500 font-medium">{slot.bookedBy.email}</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="inline-flex flex-col items-end gap-1 px-3 py-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                                <span className="text-xs font-bold text-gray-900 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-indigo-500"/> {slot.date}</span>
                                <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {slot.time}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="mt-5 pt-4 border-t border-emerald-100/50 flex gap-3">
                          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 shadow flex items-center justify-center gap-2 text-sm h-9">
                             <Video className="w-4 h-4"/> Join Meeting
                          </Button>
                          <Button variant="outline" className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 text-sm h-9">
                             <User className="w-4 h-4 mr-2"/> View Profile
                          </Button>
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </div>
         </div>
      </div>

      {/* Adding Slot Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900">Post Interview Slot</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none"><span className="text-xl leading-none">&times;</span></button>
               </div>
               <form onSubmit={handleAddSlot} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" required value={newSlot.date} onChange={e => setNewSlot({...newSlot, date: e.target.value})} className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                        <input type="time" required value={newSlot.time} onChange={e => setNewSlot({...newSlot, time: e.target.value})} className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                     <select value={newSlot.duration} onChange={e => setNewSlot({...newSlot, duration: e.target.value})} className="w-full h-10 px-3 flex items-center rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                        <option>30 mins</option>
                        <option>45 mins</option>
                        <option>60 mins</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Interview Topic</label>
                     <input type="text" placeholder="e.g. System Design, Resume Review" required value={newSlot.topic} onChange={e => setNewSlot({...newSlot, topic: e.target.value})} className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="pt-4 flex gap-3">
                     <Button type="button" variant="outline" className="w-full" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                     <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Publish Slot</Button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
