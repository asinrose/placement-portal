import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Users, Briefcase, MessageSquare, Award, ArrowRight, Video, Link as LinkIcon, Heart } from "lucide-react";
import { Button } from "../../components/Button";
import { Link } from "react-router-dom";

export default function AlumniDashboard() {
  const stats = [
    { title: "Active Referrals", value: "0", icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-50", border: "hover:border-indigo-200" },
    { title: "Students Mentored", value: "0", icon: Users, color: "text-blue-500", bg: "bg-blue-50", border: "hover:border-blue-200" },
    { title: "Upcoming Interviews", value: "0", icon: Video, color: "text-amber-500", bg: "bg-amber-50", border: "hover:border-amber-200" },
    { title: "Community Rank", value: "Unranked", icon: Award, color: "text-emerald-500", bg: "bg-emerald-50", border: "hover:border-emerald-200" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Alumni Portal</h1>
          <p className="text-gray-500 mt-1">Welcome back! Give back to the community by mentoring and referring students.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link to="/alumni/interviews">
             <Button variant="outline" className="bg-white hover:bg-gray-50 text-gray-700 gap-2">
                <Video className="w-4 h-4"/> Schedule Interview
             </Button>
           </Link>
           <Link to="/alumni/referrals">
             <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 gap-2">
                <LinkIcon className="w-4 h-4"/> Post Referral
             </Button>
           </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all ${stat.border}`}>
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 opacity-50 group-hover:scale-150 transition-transform duration-700" />
               <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Community Feed / QA */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-gray-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between py-4 bg-gray-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                Latest Community Questions
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 flex items-center gap-1 group">
                View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
               <div className="flex flex-col divide-y divide-gray-50">
                 {[].map((post) => (
                    <div key={post.id} className="p-6 hover:bg-gray-50/50 transition-colors group cursor-pointer">
                       <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-200">
                             {post.author.charAt(0)}
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900 text-sm">{post.author}</span>
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase font-semibold">{post.role}</span>
                                <span className="text-xs text-gray-400 ml-auto">{post.time}</span>
                             </div>
                             <h4 className="text-base font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors mb-3 leading-snug">
                               {post.question}
                             </h4>
                             <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                                <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors"><Heart className="w-4 h-4"/> {post.likes}</span>
                                <span className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors"><MessageSquare className="w-4 h-4"/> {post.comments} Answers</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 ))}
               </div>
            </CardContent>
             <div className="p-4 border-t border-gray-100 bg-gray-50/50">
               <div className="flex gap-3 relative">
                  <input type="text" placeholder="Share a tip or answer a query to help students..." className="w-full text-sm rounded-full border border-gray-200 px-4 py-2.5 bg-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" />
                  <Button className="rounded-full px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shrink-0">
                     Post
                  </Button>
               </div>
            </div>
          </Card>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
           <Card className="border-indigo-100 shadow-sm bg-gradient-to-br from-indigo-600 to-blue-700 text-white overflow-hidden relative">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute left-0 bottom-0 w-24 h-24 bg-blue-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
              
              <CardContent className="p-6 relative z-10">
                 <h3 className="text-lg font-bold mb-2">Host an AMA</h3>
                 <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                    Connect directly with students! Host an "Ask Me Anything" session to share your journey and industry insights.
                 </p>
                 <Button className="w-full bg-white text-indigo-700 hover:bg-gray-50 font-bold border-0">
                    Schedule AMA Session
                 </Button>
              </CardContent>
           </Card>

           <Card className="border-gray-100 shadow-sm bg-white">
              <CardHeader className="border-b border-gray-100 py-4">
                 <CardTitle className="text-sm font-bold text-gray-900 uppercase tracking-wide">Top Impact Alumni</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-gray-50">
                   {[].map((alum, idx) => (
                     <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                           <div className="text-base font-bold text-gray-400 w-4 text-center">#{idx + 1}</div>
                           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">
                             {alum.name.charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-gray-900 leading-none">{alum.name}</p>
                              <p className="text-[11px] text-gray-500 font-medium mt-1">{alum.company}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{alum.score} pts</span>
                        </div>
                     </div>
                   ))}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
