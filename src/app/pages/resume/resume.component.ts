import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ResumeItem { date?: string; title?: string; company?: string; bullets?: string[]; category?: string }
interface Skill {
  name: string;
  category: string;
}

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumeComponent {
  // tabs: experience | education | skills | about
  activeTab = signal<'experience' | 'education' | 'skills' | 'about'>('experience');
  expandedBio = signal(false);

  experience: ResumeItem[] = [
    { 
      date: 'Apr 2023 – Present', 
      title: 'Software Engineer L-II', 
      company: 'S3 Innovate Pte. Ltd. (Singapore)', 
      bullets: [
        'Developing REST API using ASP.NET Core with Clean Architecture and CQRS pattern',
        'Developing and modifying IoT Backend microservices (.NET Worker services)',
        'Front-End development using Angular, Angular Material, Angular Flex-Layout',
        'Using Docker and Kubernetes for testing and deployment to AWS EKS Fargate',
        'Working with MSSQL Server and PostgreSQL using Dapper and EF Core'
      ] 
    },
    { 
      date: 'May 2021 – Mar 2023', 
      title: 'Junior Software Engineer', 
      company: 'S3 Innovate Pte. Ltd. (Singapore)', 
      bullets: [
        'Developed ETL for IoT sensors data from MQTT Broker',
        'R&D on C# advance features, Kubernetes, Rancher',
        'Version controlling using Git, SourceTree, Azure DevOps',
        'Developing Jobs using Quartz.NET',
        'Requirements Analysis, UAT, Documentation'
      ] 
    },
    { 
      date: 'July 2020 – Jan 2021', 
      title: 'Software Developer', 
      company: 'Vonome Software and System', 
      bullets: [
        'Making SRS for PIM & VMS Modules of ERP Project',
        'Database design with PostgreSQL',
        'Developing Web API with ASP.NET Core using Clean Architecture',
        'API testing and version control on SourceTree'
      ] 
    },
    { 
      date: 'Jan 2020 – March 2020', 
      title: 'Trainee Software Developer', 
      company: 'Chandrim Soft', 
      bullets: [
        'Database design in Microsoft SQL Server',
        'Back-End development with ASP.NET MVC',
        'Client presentations for CMP Officer\'s Mess Project'
      ] 
    },
  ];

  education: ResumeItem[] = [
    {
      date: '2014 - 2019',
      title: 'BSc in Computer Science and Engineering',
      company: 'East Delta University, Chittagong, Bangladesh',
      category: 'degrees',
      bullets: [
        'Graduated with CGPA: 3.67/4.00',
        'Specialized in Software Engineering and Database Systems',
        'Key coursework: Data Structures, Algorithms, Web Development, Database Management',
        'Final year project: "Smart Campus Management System" using ASP.NET and SQL Server'
      ]
    },
    {
      date: '2021',
      title: 'ASP.NET CORE MVC WITH ANGULAR AND EF CORE',
      company: 'PencilBox Training Institute',
      category: 'certifications',
      bullets: [
        'Comprehensive full-stack development course',
        'Covered modern .NET Core, Angular framework, and Entity Framework',
        'Hands-on projects and real-world application development',
        'Certificate of completion with distinction'
      ]
    },
    {
      date: '2020',
      title: 'Complete guide to ASP.NET Core MVC (v3.1)',
      company: 'Udemy - Online Learning Platform',
      category: 'courses',
      bullets: [
        'In-depth understanding of ASP.NET Core MVC architecture',
        'Best practices for building scalable web applications',
        'Authentication, authorization, and security implementations',
        'Rating: 4.6/5, 15+ hours of content'
      ]
    },
    {
      date: '2019',
      title: 'Web Application Development-DotNet',
      company: 'BASIS Institute of Technology and Management (BITM)',
      category: 'training',
      bullets: [
        'Professional training program by BASIS',
        'Focus on enterprise-level web application development',
        'Industry-standard practices and methodologies',
        'Project-based learning with industry mentors'
      ]
    },
  ];

  skills: Skill[] = [
    // Programming Languages
    { name: 'C#', category: 'languages' },
    { name: 'JavaScript', category: 'languages' },
    { name: 'TypeScript', category: 'languages' },
    { name: 'Python', category: 'languages' },
    { name: 'Java', category: 'languages' },
    { name: 'PHP', category: 'languages' },

    // Frameworks & Libraries
    { name: '.NET Core', category: 'frameworks' },
    { name: 'ASP.NET', category: 'frameworks' },
    { name: 'Angular', category: 'frameworks' },
    { name: 'React', category: 'frameworks' },
    { name: 'Laravel', category: 'frameworks' },
    { name: 'EF Core', category: 'frameworks' },

    // Databases
    { name: 'SQL Server', category: 'databases' },
    { name: 'PostgreSQL', category: 'databases' },
    { name: 'MySQL', category: 'databases' },

    // Tools & Technologies
    { name: 'Docker', category: 'tools' },
    { name: 'Kubernetes', category: 'tools' },
    { name: 'Git', category: 'tools' },
    { name: 'Azure DevOps', category: 'tools' },
    { name: 'AWS EKS', category: 'tools' },
    { name: 'MQTT', category: 'tools' },

    // Other Skills
    { name: 'Clean Architecture', category: 'methodologies' },
    { name: 'CQRS', category: 'methodologies' },
    { name: 'MediatR', category: 'methodologies' },
    { name: 'SignalR', category: 'methodologies' },
  ];

  about: { label: string; value: string }[] = [
    { label: 'Name', value: 'Md. Zakaria Masud' },
    { label: 'Experience', value: '4+ Years' },
    { label: 'Education', value: 'BSc in CSE' },
    { label: 'Location', value: 'Chittagong, Bangladesh' },
    { label: 'Email', value: 'zakaria.bijoy@live.com' },
    { label: 'Phone', value: '+880-1683680668' },
    { label: 'Date of Birth', value: '11th December 1996' },
    { label: 'Nationality', value: 'Bangladeshi' },
    { label: 'Blood Group', value: 'B+' },
    { label: 'Freelance', value: 'Available' },
  ];

  setTab(tab: 'experience' | 'education' | 'skills' | 'about') {
    this.activeTab.set(tab);
  }

  toggleBio() {
    this.expandedBio.update(val => !val);
  }

  get currentItems() {
    const t = this.activeTab();
    if (t === 'experience') return this.experience;
    if (t === 'education') return this.education;
    if (t === 'skills') return this.skills;
    return this.about;
  }

  // Group skills by category
  get skillsByCategory() {
    const categories = {
      languages: { title: 'Programming Languages', icon: 'pi-code', skills: [] as Skill[] },
      frameworks: { title: 'Frameworks & Libraries', icon: 'pi-cog', skills: [] as Skill[] },
      databases: { title: 'Databases', icon: 'pi-database', skills: [] as Skill[] },
      tools: { title: 'Tools & Technologies', icon: 'pi-wrench', skills: [] as Skill[] },
      methodologies: { title: 'Architecture & Patterns', icon: 'pi-sitemap', skills: [] as Skill[] }
    };

    this.skills.forEach(skill => {
      if (categories[skill.category as keyof typeof categories]) {
        categories[skill.category as keyof typeof categories].skills.push(skill);
      }
    });

    return Object.values(categories).filter(cat => cat.skills.length > 0);
  }

  // Group education by category
  get educationByCategory() {
    const categories = {
      degrees: { title: 'Academic Degrees', icon: 'pi-graduation-cap', items: [] as ResumeItem[] },
      certifications: { title: 'Professional Certifications', icon: 'pi-certificate', items: [] as ResumeItem[] },
      courses: { title: 'Online Courses', icon: 'pi-video', items: [] as ResumeItem[] },
      training: { title: 'Training Programs', icon: 'pi-users', items: [] as ResumeItem[] }
    };

    this.education.forEach(item => {
      if (item.category && categories[item.category as keyof typeof categories]) {
        categories[item.category as keyof typeof categories].items.push(item);
      }
    });

    return Object.values(categories).filter(cat => cat.items.length > 0);
  }

  // Two segments for education UI: Academic and Professional
  get educationSegments() {
    const academic = {
      title: 'Academic Education',
      icon: 'pi-graduation-cap',
      items: this.education.filter(e => e.category === 'degrees')
    };

    const professional = {
      title: 'Professional Training & Certifications',
      icon: 'pi-briefcase',
      items: this.education.filter(e => e.category && e.category !== 'degrees')
    };

    return [academic, professional].filter(s => s.items && s.items.length > 0);
  }
}

