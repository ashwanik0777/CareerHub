import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';
import { getSession } from '@/lib/auth-server';
import { formatDate } from '@platform/utils';

// Helper to escape LaTeX special characters
function escapeLatex(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
      include: {
        experiences: { orderBy: { startDate: 'desc' } },
        educations: { orderBy: { startDate: 'desc' } },
        projects: { orderBy: { startDate: 'desc' } },
        skills: { orderBy: { level: 'desc' } },
        certifications: { orderBy: { issueDate: 'desc' } },
        awards: { orderBy: { date: 'desc' } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Prepare data
    const fullName = escapeLatex(`${profile.firstName || ''} ${profile.lastName || ''}`.trim() || session.name);
    const headline = escapeLatex(profile.headline || '');
    const location = escapeLatex(
      [profile.addressCity, profile.addressState].filter(Boolean).join(', ') || profile.location || 'Location Not Provided'
    );
    const phone = escapeLatex(profile.phone || '');
    const email = escapeLatex(session.email);
    const linkedin = escapeLatex(profile.linkedinUrl || '');
    const github = escapeLatex(profile.githubUrl || '');

    // ----------------------------------------------------
    // BUILD EDUCATION SECTION
    // ----------------------------------------------------
    let educationLatex = '';
    if (profile.educations.length > 0) {
      educationLatex = '\\section*{Education}\n\n';
      profile.educations.forEach((edu, idx) => {
        const startYear = new Date(edu.startDate).getFullYear();
        const endYear = edu.isCurrent ? '(Expected)' : (edu.endDate ? new Date(edu.endDate).getFullYear() : '');
        const dateStr = `${startYear} -- ${endYear}`;
        
        educationLatex += `\\noindent\n\\textbf{${escapeLatex(edu.school)}} \\hfill ${dateStr} \\\\\n`;
        educationLatex += `${escapeLatex(edu.degree)} ${edu.fieldOfStudy ? `in ${escapeLatex(edu.fieldOfStudy)}` : ''} \n`;
        if (edu.grade) {
           educationLatex += `\\hfill Grade: ${escapeLatex(edu.grade)}`;
        }
        if (idx < profile.educations.length - 1) educationLatex += '\n\\vspace{2mm}\n\n';
      });
    }

    // ----------------------------------------------------
    // BUILD SKILLS SECTION
    // ----------------------------------------------------
    let skillsLatex = '';
    if (profile.skills.length > 0) {
      skillsLatex = '\\section*{Technical Skills}\n';
      // Group skills by category if possible, else lump them
      // Since our schema might not accurately categorize everything, let's group by proficiency or simple lump
      const allSkills = profile.skills.map(s => escapeLatex(s.name)).join(', ');
      skillsLatex += `\\noindent\n\\textbf{Core Skills:} ${allSkills} \\\\\n`;
    }

    // ----------------------------------------------------
    // BUILD EXPERIENCE SECTION
    // ----------------------------------------------------
    let experienceLatex = '';
    if (profile.experiences.length > 0) {
      experienceLatex = '\\section*{Experience}\n\n';
      profile.experiences.forEach((exp, idx) => {
        const dateStr = `${formatDate(exp.startDate.toISOString())} -- ${exp.isCurrent ? 'Present' : (exp.endDate ? formatDate(exp.endDate.toISOString()) : '')}`;
        
        experienceLatex += `\\noindent\n\\textbf{${escapeLatex(exp.company)}} ${exp.location ? `\\hfill ${escapeLatex(exp.location)}` : ''} \\\\\n`;
        experienceLatex += `\\textit{${escapeLatex(exp.position)}} \\hfill ${escapeLatex(dateStr)}\n\n`;
        
        if (exp.description) {
          experienceLatex += `\\begin{itemize}\n`;
          const lines = exp.description.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          lines.forEach(line => {
             // Handle bullet points
             let cleanLine = line.replace(/^[•\-*]\s*/, '');
             experienceLatex += `\\item ${escapeLatex(cleanLine)}\n`;
          });
          experienceLatex += `\\end{itemize}\n`;
        }
        if (idx < profile.experiences.length - 1) experienceLatex += '\n\\vspace{2mm}\n\n';
      });
    }

    // ----------------------------------------------------
    // BUILD PROJECTS SECTION
    // ----------------------------------------------------
    let projectsLatex = '';
    if (profile.projects.length > 0) {
      projectsLatex = '\\section*{Projects}\n\n';
      profile.projects.forEach((proj, idx) => {
        const techStr = proj.technologies.length > 0 ? escapeLatex(proj.technologies.join(', ')) : '';
        projectsLatex += `\\noindent\n\\textbf{${escapeLatex(proj.title)}}\n`;
        if (techStr) projectsLatex += `\\hfill ${techStr}\n`;
        projectsLatex += `\\\\\n`;
        
        if (proj.description) {
          projectsLatex += `\\begin{itemize}\n`;
          const lines = proj.description.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          lines.forEach(line => {
             let cleanLine = line.replace(/^[•\-*]\s*/, '');
             projectsLatex += `\\item ${escapeLatex(cleanLine)}\n`;
          });
          projectsLatex += `\\end{itemize}\n`;
        }
        if (idx < profile.projects.length - 1) projectsLatex += '\n\\vspace{2mm}\n\n';
      });
    }

    // ----------------------------------------------------
    // BUILD CERTIFICATIONS/AWARDS SECTION
    // ----------------------------------------------------
    let certsLatex = '';
    if (profile.certifications.length > 0 || profile.awards.length > 0) {
      certsLatex = '\\section*{Certifications \\& Achievements}\n\n';
      profile.certifications.forEach(cert => {
        certsLatex += `\\noindent\n\\textbf{${escapeLatex(cert.name)}} --- ${escapeLatex(cert.issuer)} \\\\\n`;
      });
      profile.awards.forEach(award => {
        certsLatex += `\\noindent\n\\textbf{${escapeLatex(award.title)}} --- ${escapeLatex(award.issuer)} \\\\\n`;
      });
    }

    // Assemble full LaTeX document
    const latexTemplate = `\\documentclass[11pt,a4paper]{article}
\\usepackage{fontawesome}
\\usepackage[left=0.7in, right=0.7in, top=0.3in, bottom=0.3in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{setspace}
\\usepackage{xcolor}

\\hypersetup{
    colorlinks=true,
    urlcolor=blue
}

\\linespread{0.96}
\\setlist[itemize]{noitemsep, topsep=0pt, leftmargin=*}
\\titlespacing{\\section}{0pt}{6pt}{4pt}

\\titleformat{\\section}{
  \\large\\bfseries
}{}{0em}{}[\\titlerule]

\\begin{document}

%==================== Header ====================
\\begin{center}

{\\Huge \\textbf{${fullName}}}

\\vspace{0.5mm}

{\\large ${headline}}

\\vspace{1mm}

{\\small
${location}
${phone ? `\\hspace{0.2cm}|\\hspace{0.2cm}\n${phone}` : ''}
${email ? `\\hspace{0.2cm}|\\hspace{0.2cm}\n\\href{mailto:${email.replace(/\\_/g, '_')}}{${email}}` : ''}
${linkedin ? `\\hspace{0.2cm}|\\hspace{0.2cm}\n\\href{${linkedin.replace(/\\_/g, '_')}}{LinkedIn}` : ''}
${github ? `\\hspace{0.2cm}|\\hspace{0.2cm}\n\\href{${github.replace(/\\_/g, '_')}}{GitHub}` : ''}
}

\\end{center}

%==================== Education ====================
${educationLatex}

%==================== Technical Skills ====================
${skillsLatex}

%==================== Experience ====================
${experienceLatex}

%==================== Projects ====================
${projectsLatex}

%==================== Achievements & Certifications ====================
${certsLatex}

\\end{document}
`;

    // Return the response as a downloadable file
    const headers = new Headers();
    headers.set('Content-Type', 'application/x-tex; charset=utf-8');
    headers.set('Content-Disposition', 'attachment; filename="resume.tex"');

    return new NextResponse(latexTemplate, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Failed to generate resume:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
