import React, { useState } from "react";
import { Card, CardContent } from "../../components/Card";
import { Search, Building2, MapPin, ExternalLink, Mail, MoreVertical } from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function CompanyManagement() {
  const [companies, setCompanies] = useState([
    { id: "C001", name: "TechCorp Global", industry: "Software & Technology", location: "Bangalore", jobs: 3, hires: 45, email: "careers@techcorp.com" },
    { id: "C002", name: "DataSync Inc", industry: "Analytics", location: "Hyderabad", jobs: 1, hires: 12, email: "hr@datasync.com" },
    { id: "C003", name: "CloudNet Systems", industry: "Cloud Computing", location: "Pune", jobs: 2, hires: 28, email: "talent@cloudnet.io" },
    { id: "C004", name: "Acme Corp", industry: "Manufacturing", location: "Mumbai", jobs: 1, hires: 5, email: "recruitment@acmecorp.in" },
    { id: "C005", name: "FinTech Solutions", industry: "Finance", location: "Gurgaon", jobs: 0, hires: 32, email: "hr@fintech.com" },
  ]);

  const stats = [
    { label: "Partnered Companies", value: "124" },
    { label: "Active Hiring Drives", value: "8" },
    { label: "Total Students Placed", value: "412" },
    { label: "Average CTC", value: "8.5 LPA" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Company Management</h1>
          <p className="text-gray-500">Manage corporate partners and track historical recruitment data.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white">Export Directory</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">Invite Company</Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-gray-100 shadow-sm bg-white hover:border-indigo-100 hover:shadow-md transition-all">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-indigo-900 mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
           <div className="relative w-full sm:w-96">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
             <Input type="text" placeholder="Search companies or industries..." className="pl-9 bg-white" />
           </div>
           <Button variant="outline" className="bg-white whitespace-nowrap text-gray-600 border-gray-300">
              Sort by: Most Hires
           </Button>
        </div>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Company Profile</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold text-center">Active Jobs</th>
                  <th className="px-6 py-4 font-semibold text-center">Total Hires</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-indigo-600 font-bold border border-gray-200 group-hover:border-indigo-200 transition-colors shadow-sm">
                             <Building2 className="w-6 h-6 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-base flex items-center gap-2">
                               {company.name}
                               <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 transition-colors cursor-pointer" />
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">{company.industry}</p>
                            <div className="flex items-center gap-1.5 text-gray-400 text-[11px] mt-1">
                               <Mail className="w-3 h-3" /> {company.email}
                            </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {company.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${company.jobs > 0 ? 'bg-indigo-50 text-indigo-700 font-bold' : 'bg-gray-50 text-gray-400'}`}>
                        {company.jobs}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="font-semibold text-gray-700">{company.hires}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2 items-center">
                         <Button size="sm" variant="ghost" className="text-indigo-600 hover:bg-indigo-50">
                            View Details
                         </Button>
                         <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
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
