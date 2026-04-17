import React from 'react';

export default function AtsResume({ data }) {
  if (!data) return null;

  return (
    <div className="hidden print:block w-full max-w-[800px] mx-auto p-4 md:p-8 font-sans text-black bg-white">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">{data.fullName}</h1>
        <p className="text-sm">
          {data.email} | {data.phone}
          {data.socials?.linkedin && ` | linkedin.com/in/${data.socials.linkedin.split('/').pop()}`}
          {data.socials?.github && ` | github.com/${data.socials.github.split('/').pop()}`}
          {data.socials?.portfolio && ` | ${data.socials.portfolio}`}
        </p>
      </div>

      {/* Education */}
      <div className="mb-6">
        <h2 className="text-lg font-bold uppercase border-b-2 border-black mb-3 pb-1">Education</h2>
        
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold">{data.college}</h3>
            <p className="italic">{data.course}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">Year: {data.yearSem}</p>
            <p>CGPA: {data.cgpa}</p>
          </div>
        </div>
        {(data.marks12th || data.marks10th) && (
          <div className="text-sm mb-2 text-gray-700">
            {data.marks12th && <span>Class 12th: {data.marks12th} </span>}
            {data.marks12th && data.marks10th && <span> | </span>}
            {data.marks10th && <span>Class 10th: {data.marks10th}</span>}
          </div>
        )}
      </div>

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div className="mb-6 break-inside-avoid">
          <h2 className="text-lg font-bold uppercase border-b-2 border-black mb-3 pb-1">Technical Skills</h2>
          <p className="leading-relaxed">
            <span className="font-bold">Core Competencies:</span> {data.skills.join(', ')}
          </p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-black mb-3 pb-1">Experience</h2>
          
          {data.experience.map((exp, idx) => (
            <div key={idx} className="mb-4 break-inside-avoid">
              <div className="flex justify-between items-baseline mb-1">
                <div>
                  <span className="font-bold text-lg">{exp.company}</span>
                  <span className="italic"> | {exp.role}</span>
                </div>
                <div className="font-semibold text-sm">
                  {exp.duration}
                </div>
              </div>
              {exp.desc && (
                <ul className="list-disc ml-5 mt-1">
                  <li className="pl-1 text-sm">{exp.desc}</li>
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-black mb-3 pb-1">Projects</h2>
          
          {data.projects.map((proj, idx) => (
            <div key={idx} className="mb-4 break-inside-avoid">
              <div className="flex justify-between items-baseline mb-1">
                <div>
                  <span className="font-bold text-lg">{proj.title}</span>
                  {proj.link && <span className="italic text-sm"> | {proj.link}</span>}
                </div>
              </div>
              <p className="font-medium text-sm mb-1">Tech Stack: {proj.tech}</p>
              {proj.desc && (
                <ul className="list-disc ml-5">
                  <li className="pl-1 text-sm">{proj.desc}</li>
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div className="mb-6 break-inside-avoid">
          <h2 className="text-lg font-bold uppercase border-b-2 border-black mb-3 pb-1">Certifications</h2>
          
          <ul className="list-disc ml-5">
            {data.certifications.map((cert, idx) => (
              <li key={idx} className="mb-1 text-sm">
                <span className="font-bold">{cert.course}</span> - {cert.platform}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
