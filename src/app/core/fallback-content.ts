import {
  EducationItem,
  ExperienceItem,
  Profile,
  Project,
  Skill,
  SocialLink,
} from './models';

// In-code fallback content, kept in sync with supabase/seed.sql.
// Used as initial signal values so the site never renders empty when
// Supabase is unreachable (e.g. offline, outage, misconfigured keys).

export const FALLBACK_PROFILE: Profile = {
  id: 1,
  full_name: 'Md Zakaria Masud',
  headline: 'Senior Software Engineer',
  bio: 'Senior Software Engineer with 5+ years of experience designing and building enterprise web applications, REST APIs, and cloud-native microservices on the .NET stack. Skilled in Clean Architecture, CQRS, and event-driven systems across Azure and AWS, with production experience spanning IoT platforms, ERP systems, and government infrastructure monitoring. Currently extending this background into Agentic AI and LLM-integrated applications using Microsoft Agent Framework, Azure AI Foundry, and MCP.',
  email: 'zakaria.bijoy@live.com',
  phone: '+880-1787789807',
  phone_alt: '+880-1683680668',
  location: 'Chittagong, Bangladesh',
  date_of_birth: '1996-12-11',
  nationality: 'Bangladeshi',
  blood_group: 'B+',
  freelance_status: 'Available',
  years_experience: 5,
  projects_count: 15,
  companies_count: 4,
  resume_url: '/assets/Md_Zakaria_Masud_Resume_SSE.pdf',
  avatar_url: '/assets/profile.jpg',
};

export const FALLBACK_SOCIAL_LINKS: SocialLink[] = [
  { label: 'GitHub', url: 'https://github.com/zakariabijoy', icon: 'pi pi-github', sort_order: 1, is_active: true },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/mdzakariamasud', icon: 'pi pi-linkedin', sort_order: 2, is_active: true },
  { label: 'Email', url: 'mailto:zakaria.bijoy@live.com', icon: 'pi pi-envelope', sort_order: 3, is_active: true },
];

export const FALLBACK_PROJECTS: Project[] = [
  {
    title: 'CFEMS',
    subtitle: 'IoT Equipment Monitoring Platform (Official - S3 Innovate)',
    description:
      'IoT equipment-monitoring platform for a Singapore government commuter-facility program. Real-time device telemetry, configurable alarm rules, events, and monitoring dashboards.',
    tech: ['.NET 6', 'Web API', 'Worker Services', 'SignalR', 'EF Core', 'EMQX MQTT', 'Angular 12', 'Clean Architecture', 'CQRS', 'MediatR', 'Kubernetes'],
    images: ['/assets/work-1.svg', '/assets/work-1-2.svg'],
    live_url: null,
    github_url: null,
    sort_order: 1,
    is_published: true,
  },
  {
    title: 'Reactivities',
    subtitle: 'Full-stack Social Activity App (Personal)',
    description:
      'Full-stack social/activity-feed application with real-time chat, photo upload, and follower system. ASP.NET Core Web API backend with a React + TypeScript + MobX front end.',
    tech: ['ASP.NET Core', 'Clean Architecture', 'CQRS', 'MediatR', 'Identity', 'SignalR', 'React', 'TypeScript', 'MobX'],
    images: ['/assets/work-2.svg'],
    live_url: null,
    github_url: 'https://github.com/zakariabijoy/Reactivities',
    sort_order: 2,
    is_published: true,
  },
  {
    title: 'BulkyBook',
    subtitle: 'Online Bookstore (Personal)',
    description:
      'Online bookstore built with ASP.NET Core MVC and EF Core, featuring Identity-based auth, the Repository pattern, and integrated Stripe and Braintree payments.',
    tech: ['ASP.NET Core MVC', 'EF Core', 'Identity', 'Repository Pattern', 'Stripe', 'Braintree', 'SQL Server'],
    images: ['/assets/work-1.svg'],
    live_url: 'https://bulkybookzb.azurewebsites.net/',
    github_url: 'https://github.com/zakariabijoy/BulkyBook',
    sort_order: 3,
    is_published: true,
  },
];

export const FALLBACK_EXPERIENCE: ExperienceItem[] = [
  {
    title: 'Senior Software Engineer',
    company: 'Kaz Software | Dhaka, Bangladesh (Hybrid)',
    date_label: 'Oct 2025 - Present',
    bullets: [
      'Promoted to Senior Software Engineer after one year, taking on greater ownership of architecture and delivery.',
      'Own delivery of RESTful APIs in ASP.NET Core following Clean Architecture and CQRS, from design through production deployment for local and international clients.',
      'Architect event-driven microservices using RabbitMQ for asynchronous communication and real-time notifications.',
      'Evaluate and integrate emerging AI tooling - Microsoft.Extensions.AI, Azure AI Foundry, Microsoft Agent Framework, and MCP - into existing software solutions.',
    ],
    sort_order: 1,
  },
  {
    title: 'Software Engineer',
    company: 'Kaz Software | Dhaka, Bangladesh (Hybrid)',
    date_label: 'Oct 2024 - Sep 2025',
    bullets: [
      'Built and maintained enterprise web applications using ASP.NET Core, Angular, React, PostgreSQL, SQL Server, and MongoDB.',
      'Designed serverless and background-processing solutions with Azure WebJobs, AWS Lambda, Amazon SQS, and EventBridge.',
      'Developed responsive front-end features with Angular, PrimeNG, and React.',
      'Deployed and managed workloads on Azure App Service and AWS (S3, serverless infrastructure), using Docker for containerization.',
      'Partnered with cross-functional teams on requirements analysis, system design, code review, UAT, and production releases.',
    ],
    sort_order: 2,
  },
  {
    title: 'Software Engineer L-II',
    company: 'S3 Innovate Pte. Ltd. | Midview City, Singapore (Remote)',
    date_label: 'Apr 2023 - Sep 2024',
    bullets: [
      'Developed REST APIs in ASP.NET Core Web API following Clean Architecture with CQRS and the Mediator pattern.',
      'Built and maintained .NET Worker Services powering backend microservices for an IoT device-monitoring platform.',
      'Developed ETL pipelines processing IoT sensor data from an MQTT broker against configurable rule sets to generate alarms, events, and monitoring dashboards.',
      'Automated scheduled jobs with Quartz.NET; containerized services with Docker and Kubernetes, deploying to AWS EKS Fargate.',
    ],
    sort_order: 3,
  },
  {
    title: 'Junior Software Engineer',
    company: 'S3 Innovate Pte. Ltd. | Midview City, Singapore (Remote)',
    date_label: 'May 2021 - Mar 2023',
    bullets: [
      'Maintained SQL Server and PostgreSQL databases using Dapper and EF Core.',
      'Delivered front-end features with Angular, Angular Material, and Angular Flex-Layout, working from Figma designs.',
      'Researched advanced C# features, Kubernetes/Rancher, and API tooling to inform technical decisions; contributed to requirements analysis, UAT, and documentation.',
    ],
    sort_order: 4,
  },
  {
    title: 'Software Developer',
    company: 'Vonome Software and System | Dhaka, Bangladesh',
    date_label: 'Jul 2020 - Jan 2021',
    bullets: [
      'Authored SRS documentation and designed the PostgreSQL database for the PIM and VMS modules of an ERP system.',
      'Developed Web APIs in ASP.NET Core following Clean Architecture; tested APIs and managed version control via SourceTree.',
    ],
    sort_order: 5,
  },
  {
    title: 'Trainee Software Developer',
    company: 'Chandrim Soft | Chittagong, Bangladesh',
    date_label: 'Jan 2020 - Mar 2020',
    bullets: [
      "Designed the database schema in Microsoft SQL Server for the CMP Officer's Mess project and built the back end using ASP.NET MVC.",
      'Presented project deliverables directly to the client.',
    ],
    sort_order: 6,
  },
];

export const FALLBACK_EDUCATION: EducationItem[] = [
  {
    title: 'BSc in Computer Science and Engineering',
    institution: 'East Delta University, Chittagong, Bangladesh',
    category: 'degrees',
    date_label: '2014 - 2019',
    bullets: [
      'Thesis: "DDoS Attack Detection with Protocol Type Using Machine Learning" - proposed a hybrid ensemble model combining five classifiers, achieving over 96.85% detection accuracy across three protocol types.',
      'Tools: Python, scikit-learn, Pandas, NumPy, Matplotlib.',
    ],
    sort_order: 1,
  },
  {
    title: '.NET Aspire and GenAI: Developing Distributed Architectures',
    institution: 'Udemy',
    category: 'certifications',
    date_label: '2025',
    bullets: ['Credential ID: UC-240e8b95-7a83-4a97-b7a3-078f5bf48fd4'],
    sort_order: 2,
  },
  {
    title: 'ASP.NET Core MVC with Angular and EF Core',
    institution: 'PencilBox, Dhaka, Bangladesh',
    category: 'certifications',
    date_label: '2021',
    bullets: [],
    sort_order: 3,
  },
  {
    title: 'Complete Guide to ASP.NET Core MVC (v3.1)',
    institution: 'Udemy',
    category: 'courses',
    date_label: '2020',
    bullets: [],
    sort_order: 4,
  },
  {
    title: 'Web Application Development - .NET',
    institution: 'BASIS Institute of Technology and Management (BITM), Chittagong',
    category: 'training',
    date_label: '2019',
    bullets: [],
    sort_order: 5,
  },
];

export const FALLBACK_SKILLS: Skill[] = [
  { name: 'C#', category: 'languages', sort_order: 1 },
  { name: 'TypeScript/JavaScript', category: 'languages', sort_order: 2 },
  { name: 'SQL', category: 'languages', sort_order: 3 },
  { name: 'Python', category: 'languages', sort_order: 4 },
  { name: 'Java', category: 'languages', sort_order: 5 },
  { name: 'PHP', category: 'languages', sort_order: 6 },
  { name: 'ASP.NET Core (MVC, Web API, EF Core)', category: 'frameworks', sort_order: 1 },
  { name: 'SignalR', category: 'frameworks', sort_order: 2 },
  { name: 'Dapper', category: 'frameworks', sort_order: 3 },
  { name: 'Quartz.NET', category: 'frameworks', sort_order: 4 },
  { name: 'Angular', category: 'frameworks', sort_order: 5 },
  { name: 'React', category: 'frameworks', sort_order: 6 },
  { name: 'PrimeNG', category: 'frameworks', sort_order: 7 },
  { name: 'Angular Material', category: 'frameworks', sort_order: 8 },
  { name: 'Bootstrap', category: 'frameworks', sort_order: 9 },
  { name: 'Laravel', category: 'frameworks', sort_order: 10 },
  { name: 'SQL Server', category: 'databases', sort_order: 1 },
  { name: 'PostgreSQL', category: 'databases', sort_order: 2 },
  { name: 'MySQL', category: 'databases', sort_order: 3 },
  { name: 'MongoDB', category: 'databases', sort_order: 4 },
  { name: 'SQLite', category: 'databases', sort_order: 5 },
  { name: 'Azure App Service', category: 'cloud', sort_order: 1 },
  { name: 'AWS (EKS Fargate, Lambda, S3, SQS, EventBridge)', category: 'cloud', sort_order: 2 },
  { name: 'Docker', category: 'cloud', sort_order: 3 },
  { name: 'Kubernetes', category: 'cloud', sort_order: 4 },
  { name: 'RabbitMQ', category: 'cloud', sort_order: 5 },
  { name: 'EMQX MQTT', category: 'cloud', sort_order: 6 },
  { name: '.NET Aspire', category: 'cloud', sort_order: 7 },
  { name: 'Prompt Engineering', category: 'ai_llm', sort_order: 1 },
  { name: 'RAG', category: 'ai_llm', sort_order: 2 },
  { name: 'Microsoft Agent Framework', category: 'ai_llm', sort_order: 3 },
  { name: 'Microsoft.Extensions.AI', category: 'ai_llm', sort_order: 4 },
  { name: 'Azure AI Foundry', category: 'ai_llm', sort_order: 5 },
  { name: 'MCP', category: 'ai_llm', sort_order: 6 },
  { name: 'Vector Databases', category: 'ai_llm', sort_order: 7 },
  { name: 'Agentic AI', category: 'ai_llm', sort_order: 8 },
  { name: 'Git / GitHub / GitLab', category: 'tools', sort_order: 1 },
  { name: 'Azure DevOps / TFS', category: 'tools', sort_order: 2 },
  { name: 'Figma', category: 'tools', sort_order: 3 },
  { name: 'OutSystems', category: 'tools', sort_order: 4 },
  { name: 'Clean Architecture', category: 'methodologies', sort_order: 1 },
  { name: 'CQRS with MediatR', category: 'methodologies', sort_order: 2 },
  { name: 'Microservices', category: 'methodologies', sort_order: 3 },
  { name: 'Event-Driven Design', category: 'methodologies', sort_order: 4 },
  { name: 'Repository & Unit of Work', category: 'methodologies', sort_order: 5 },
  { name: 'Agile/Scrum', category: 'methodologies', sort_order: 6 },
];
