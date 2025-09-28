import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ResumeItem { date?: string; title?: string; company?: string; bullets?: string[] }

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
      company: 'East Delta University' 
    },
    { 
      date: '2021', 
      title: 'ASP.NET CORE MVC WITH ANGULAR AND EF CORE', 
      company: 'PencilBox' 
    },
    { 
      date: '2020', 
      title: 'Complete guide to ASP.NET Core MVC (v3.1)', 
      company: 'Udemy' 
    },
    { 
      date: '2019', 
      title: 'Web Application Development-DotNet', 
      company: 'BASIS Institute of Technology and Management (BITM)' 
    },
  ];

  skills: ResumeItem[] = [
    { title: 'C#' },
    { title: '.NET Core' },
    { title: 'ASP.NET' },
    { title: 'JavaScript' },
    { title: 'TypeScript' },
    { title: 'Angular' },
    { title: 'React' },
    { title: 'HTML/CSS' },
    { title: 'Bootstrap' },
    { title: 'jQuery' },
    { title: 'SQL Server' },
    { title: 'PostgreSQL' },
    { title: 'MySQL' },
    { title: 'EF Core' },
    { title: 'Dapper' },
    { title: 'SignalR' },
    { title: 'Docker' },
    { title: 'Kubernetes' },
    { title: 'AWS EKS' },
    { title: 'MQTT' },
    { title: 'Git' },
    { title: 'Azure DevOps' },
    { title: 'Python' },
    { title: 'Java' },
    { title: 'PHP' },
    { title: 'Laravel' },
    { title: 'OutSystems' },
    { title: 'Clean Architecture' },
    { title: 'CQRS' },
    { title: 'MediatR' },
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

  get currentItems() {
    const t = this.activeTab();
    if (t === 'experience') return this.experience;
    if (t === 'education') return this.education;
    if (t === 'skills') return this.skills;
    return this.about;
  }
}
