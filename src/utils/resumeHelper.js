import { jsPDF } from "jspdf";

/**
 * Downloads a base64 DataURL as a native binary file.
 */
export const downloadBase64File = (dataUrl, filename = 'Resume.pdf') => {
  if (!dataUrl) return false;

  try {
    if (dataUrl.startsWith('data:')) {
      const arr = dataUrl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      return true;
    } else {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }
  } catch (err) {
    console.error("Error downloading base64 file:", err);
    return false;
  }
};

/**
 * Opens a resume data URL or PDF blob in a new browser tab.
 */
export const openResumeInNewTab = (dataUrl, title = 'Resume') => {
  if (!dataUrl) return false;

  try {
    if (dataUrl.startsWith('data:')) {
      const arr = dataUrl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      return true;
    } else {
      window.open(dataUrl, '_blank');
      return true;
    }
  } catch (err) {
    console.error("Error opening resume in new tab:", err);
    window.open(dataUrl, '_blank');
    return true;
  }
};

/**
 * Generates a genuine, high-quality, ATS-friendly binary PDF document using jsPDF.
 */
export const createAtsPdfDocument = (profile) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let y = 18;

  const checkPageBreak = (neededSpace = 15) => {
    if (y + neededSpace > pageHeight - margin) {
      doc.addPage();
      y = 18;
    }
  };

  const name = (profile.fullName || profile.name || "Student Applicant").toUpperCase();
  const email = profile.email || "";
  const phone = profile.phone && profile.phone !== "N/A" ? profile.phone : "";
  const college = profile.college || "University Institute of Technology";
  const course = profile.course || profile.department || profile.branch || "Computer Science & Engineering";
  const cgpa = profile.cgpa && profile.cgpa !== "N/A" ? profile.cgpa : "";
  const yearSem = profile.yearSem || profile.batch || "Batch 2026";
  const skills = Array.isArray(profile.skills) ? profile.skills.join(', ') : (profile.skills || "");
  const experience = Array.isArray(profile.experience) ? profile.experience : [];
  const projects = Array.isArray(profile.projects) ? profile.projects : [];
  const certifications = Array.isArray(profile.certifications) ? profile.certifications : [];
  const summary = profile.summary || "";

  // 1. Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(20, 24, 33);
  doc.text(name, pageWidth / 2, y, { align: "center" });
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(70, 75, 85);
  const contactParts = [email, phone, course].filter(Boolean);
  doc.text(contactParts.join("  |  "), pageWidth / 2, y, { align: "center" });
  y += 5;

  // Header dividing rule
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  // Helper for Section Titles
  const renderSectionHeader = (title) => {
    checkPageBreak(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text(title.toUpperCase(), margin, y);
    y += 1.5;
    doc.setDrawColor(200, 205, 215);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  // 2. Summary (if available)
  if (summary) {
    renderSectionHeader("Professional Summary");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);
    const splitSummary = doc.splitTextToSize(summary, contentWidth);
    doc.text(splitSummary, margin, y);
    y += splitSummary.length * 4.5 + 4;
  }

  // 3. Education
  renderSectionHeader("Education");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text(college, margin, y);
  
  if (cgpa) {
    doc.text(`CGPA: ${cgpa}`, pageWidth - margin, y, { align: "right" });
  }
  y += 4.5;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.text(course, margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(yearSem, pageWidth - margin, y, { align: "right" });
  y += 5;

  if (profile.marks10th || profile.marks12th) {
    const marksArr = [];
    if (profile.marks12th) marksArr.push(`Class 12th: ${profile.marks12th}`);
    if (profile.marks10th) marksArr.push(`Class 10th: ${profile.marks10th}`);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 110, 120);
    doc.text(marksArr.join("  |  "), margin, y);
    y += 5;
  }
  y += 2;

  // 4. Skills
  if (skills) {
    renderSectionHeader("Technical Skills");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text("Core Competencies & Stack:", margin, y);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    const splitSkills = doc.splitTextToSize(skills, contentWidth - 55);
    doc.text(splitSkills, margin + 55, y);
    y += splitSkills.length * 4.5 + 4;
  }

  // 5. Experience
  if (experience && experience.length > 0) {
    renderSectionHeader("Experience & Internships");
    experience.forEach(exp => {
      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      doc.text(exp.company || "Company", margin, y);

      if (exp.duration) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 110, 120);
        doc.text(exp.duration, pageWidth - margin, y, { align: "right" });
      }
      y += 4.5;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      doc.text(exp.role || "Intern", margin, y);
      y += 4.5;

      if (exp.desc) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(55, 65, 81);
        const splitDesc = doc.splitTextToSize(`• ${exp.desc}`, contentWidth - 4);
        doc.text(splitDesc, margin + 2, y);
        y += splitDesc.length * 4.2 + 3;
      } else {
        y += 2;
      }
    });
  }

  // 6. Projects
  if (projects && projects.length > 0) {
    renderSectionHeader("Academic & Personal Projects");
    projects.forEach(proj => {
      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      doc.text(proj.title || "Project Title", margin, y);

      if (proj.link) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(79, 70, 229);
        doc.text(proj.link, pageWidth - margin, y, { align: "right" });
      }
      y += 4.5;

      if (proj.tech) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 110, 120);
        doc.text(`Tech Stack: ${proj.tech}`, margin, y);
        y += 4;
      }

      if (proj.desc) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(55, 65, 81);
        const splitDesc = doc.splitTextToSize(`• ${proj.desc}`, contentWidth - 4);
        doc.text(splitDesc, margin + 2, y);
        y += splitDesc.length * 4.2 + 3;
      } else {
        y += 2;
      }
    });
  }

  // 7. Certifications
  if (certifications && certifications.length > 0) {
    renderSectionHeader("Certifications & Credentials");
    certifications.forEach(cert => {
      checkPageBreak(8);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      const title = cert.course || cert.title || "Certification";
      const platform = cert.platform ? ` - ${cert.platform}` : "";
      doc.text(`•  ${title}${platform}`, margin, y);
      y += 4.5;
    });
  }

  return doc;
};

/**
 * Downloads the ATS resume directly as a genuine .pdf binary file.
 */
export const downloadAtsResume = (profile, filename) => {
  const name = profile.fullName || profile.name || "Student";
  const safeFilename = filename && filename.endsWith('.pdf') ? filename : `${name.replace(/\s+/g, '_')}_ATS_Resume.pdf`;
  
  const doc = createAtsPdfDocument(profile);
  doc.save(safeFilename);
};

/**
 * Returns a Data URL for the generated ATS PDF.
 */
export const getAtsResumeDataUrl = (profile) => {
  const doc = createAtsPdfDocument(profile);
  return doc.output('datauristring');
};

/**
 * Native Print ATS Resume
 */
export const printAtsResume = (profile) => {
  const doc = createAtsPdfDocument(profile);
  doc.autoPrint();
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
};
