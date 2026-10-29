import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "../../components/Card";
import { Search, Building2, MapPin, ExternalLink, Mail, MoreVertical, X, CheckCircle, Users } from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useJobs } from "../../context/JobContext";

export default function CompanyManagement() {
  const { jobs } = useJobs();
  const [searchQuery, setSearchQuery] = useState("");
  const [offers, setOffers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('student_job_offers') || '[]');
    } catch {
      return [];
    }
  });

  const loadOffers = () => {
    try {
      setOffers(JSON.parse(localStorage.getItem('student_job_offers') || '[]'));
    } catch {
      setOffers([]);
    }
  };

  useEffect(() => {
    loadOffers();
    window.addEventListener('offers_updated', loadOffers);
    window.addEventListener('jobs_updated', loadOffers);
    window.addEventListener('storage', loadOffers);
    return () => {
      window.removeEventListener('offers_updated', loadOffers);
      window.removeEventListener('jobs_updated', loadOffers);
      window.removeEventListener('storage', loadOffers);
    };
  }, []);

  const companiesList = useMemo(() => {
    const map = new Map();

    // 1. Seed companies and active jobs
    jobs.forEach(job => {
      if (!job.company) return;
      const compKey = job.company.trim();
      if (!map.has(compKey)) {
        map.set(compKey, {
          id: compKey,
          name: job.company,
          industry: job.type || "Technology",
          email: job.recruiterEmail || `careers@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          location: job.location || "Multiple Locations",
          jobs: 0,
          hiredSet: new Set()
        });
      }
      const entry = map.get(compKey);
      if (job.status === "Approved") entry.jobs += 1;
      (job.selected || []).forEach(email => entry.hiredSet.add(email));
    });

    // 2. Correlate accepted offer letters from student_job_offers
    offers.forEach(offer => {
      if (!offer.company || offer.status !== "Accepted") return;

      let matchedEntry = null;
      for (const [key, comp] of map.entries()) {
        const kLow = key.toLowerCase().trim();
        const offLow = offer.company.toLowerCase().trim();
        if (kLow === offLow || kLow.includes(offLow) || offLow.includes(kLow)) {
          matchedEntry = comp;
          break;
        }
      }

      if (!matchedEntry) {
        const compKey = offer.company.trim();
        matchedEntry = {
          id: compKey,
          name: offer.company,
          industry: "Technology",
          email: `careers@${offer.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          location: offer.workLocation || "Multiple Locations",
          jobs: 0,
          hiredSet: new Set()
        };
        map.set(compKey, matchedEntry);
      }

      if (offer.applicantEmail) {
        matchedEntry.hiredSet.add(offer.applicantEmail);
      }
    });

    return Array.from(map.values()).map(comp => ({
      ...comp,
      hires: comp.hiredSet.size
    }));
  }, [jobs, offers]);

  // Total unique students who accepted offers or were selected
  const totalPlacedCount = useMemo(() => {
    const allPlacedEmails = new Set();
    companiesList.forEach(c => {
      c.hiredSet.forEach(email => allPlacedEmails.add(email));
    });
    return allPlacedEmails.size;
  }, [companiesList]);

  const activeDrives = jobs.filter(j => j.status === "Approved").length;

  const stats = [
    { label: "Partnered Companies", value: companiesList.length.toString() },
    { label: "Active Hiring Drives", value: activeDrives.toString() },
    { label: "Total Students Placed", value: totalPlacedCount.toString() },
    { label: "Average CTC", value: "12 LPA" },
  ];

  const filteredCompanies = companiesList.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = (c.name || "").toLowerCase().includes(q);
    const indMatch = (c.industry || "").toLowerCase().includes(q);
    const locMatch = (c.location || "").toLowerCase().includes(q);
    return nameMatch || indMatch || locMatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Company Management</h1>
        <p className="text-gray-500">Manage corporate partners and track historical recruitment data.</p>
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
             <Input 
               type="text" 
               placeholder="Search companies, industries, or location..." 
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
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      {searchQuery ? (
                        <div>
                          <p className="font-medium text-gray-700">No companies match "{searchQuery}"</p>
                          <p className="text-xs text-gray-400 mt-1">Try searching by company name, industry, or location</p>
                        </div>
                      ) : (
                        "No partnered companies found."
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => (
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
                         <span className={`inline-flex items-center justify-center font-bold px-3 py-1 rounded-full text-xs ${
                           company.hires > 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs' : 'text-gray-400 bg-gray-50'
                         }`}>
                           {company.hires}
                         </span>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}