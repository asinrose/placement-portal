import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Link, Briefcase, ExternalLink, Activity, Plus, TrendingUp } from "lucide-react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";

export default function JobReferrals() {
  const [referrals, setReferrals] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReferral, setNewReferral] = useState({ company: "", role: "", url: "" });

  const handlePostReferral = (e) => {
    e.preventDefault();
    if (!newReferral.company || !newReferral.role || !newReferral.url) return;
    setReferrals([{ id: Date.now(), ...newReferral, date: "Just now", clicks: 0, applicants: 0 }, ...referrals]);
    setIsModalOpen(false);
    setNewReferral({ company: "", role: "", url: "" });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">Job Referrals</h1>
           <p className="text-gray-500">Post open roles from your company and track campus applications.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
           <Plus className="w-4 h-4"/> Post Referral Link
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Active Referrals Feed */}
        <div className="lg:col-span-2 space-y-6">
           {referrals.map((ref) => (
             <Card key={ref.id} className="border-gray-200 shadow-sm hover:shadow transition-shadow bg-white overflow-hidden">
                <CardContent className="p-0">
                   <div className="p-6">
                      <div className="flex justify-between items-start">
                         <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-200 shrink-0 shadow-sm">
                               <Briefcase className="w-6 h-6"/>
                            </div>
                            <div>
                               <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors cursor-pointer">{ref.role}</h3>
                               <p className="text-sm font-medium text-gray-500">{ref.company} • Posted {ref.date}</p>
                            </div>
                         </div>
                         <a href="#" className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
                            Apply <ExternalLink className="w-3.5 h-3.5"/>
                         </a>
                      </div>
                      <div className="mt-6 flex flex-wrap gap-4">
                         <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            <Activity className="w-4 h-4 text-blue-500"/>
                            <span className="text-sm font-medium text-gray-700"><strong>{ref.clicks}</strong> Link Clicks</span>
                         </div>
                         <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            <TrendingUp className="w-4 h-4 text-emerald-500"/>
                            <span className="text-sm font-medium text-gray-700"><strong>{ref.applicants}</strong> Portal Applications</span>
                         </div>
                      </div>
                   </div>
                </CardContent>
             </Card>
           ))}
           {referrals.length === 0 && (
             <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-500">
                You haven't posted any referrals yet.
             </div>
           )}
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
           <Card className="border-indigo-100 shadow-sm bg-gradient-to-b from-white to-gray-50/50">
             <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                   <Activity className="w-4 h-4 text-indigo-500"/> Your Impact Stats
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Students Placed via Referrals</p>
                  <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400 mt-1">0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Link Clicks</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">0</p>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>

      {/* Post Referral Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h2 className="text-lg font-bold text-gray-900">Share Job Referral</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><span className="text-xl">&times;</span></button>
               </div>
               <form onSubmit={handlePostReferral} className="p-6 space-y-4">
                  <Input 
                     label="Company Name" 
                     placeholder="e.g. Amazon" 
                     required 
                     value={newReferral.company} onChange={e => setNewReferral({...newReferral, company: e.target.value})}
                  />
                  <Input 
                     label="Role Title" 
                     placeholder="e.g. SDE-1" 
                     required 
                     value={newReferral.role} onChange={e => setNewReferral({...newReferral, role: e.target.value})}
                  />
                  <Input 
                     label="Referral Link / Career Page URL" 
                     placeholder="https://..." 
                     required 
                     type="url"
                     value={newReferral.url} onChange={e => setNewReferral({...newReferral, url: e.target.value})}
                  />
                  <div className="pt-4 flex gap-3">
                     <Button type="button" variant="outline" className="w-full" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                     <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Post Referral</Button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
