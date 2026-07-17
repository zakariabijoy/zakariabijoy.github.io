-- Portfolio seed data (from Md_Zakaria_Masud_Resume_SSE.pdf, July 2026)
-- Run AFTER schema.sql. Safe to re-run: clears content tables first.

truncate public.profile, public.social_links, public.projects, public.experience, public.education, public.skills;

-- ============================================================
-- Profile (single row)
-- ============================================================

insert into public.profile (
  id, full_name, headline, bio, email, phone, phone_alt, location,
  date_of_birth, nationality, blood_group, freelance_status,
  years_experience, projects_count, companies_count, resume_url, avatar_url
) values (
  1,
  'Md Zakaria Masud',
  'Senior Software Engineer',
  'Senior Software Engineer with 5+ years of experience designing and building enterprise web applications, REST APIs, and cloud-native microservices on the .NET stack. Skilled in Clean Architecture, CQRS, and event-driven systems across Azure and AWS, with production experience spanning IoT platforms, ERP systems, and government infrastructure monitoring. Currently extending this background into Agentic AI and LLM-integrated applications using Microsoft Agent Framework, Azure AI Foundry, and MCP.',
  'zakaria.bijoy@live.com',
  '+880-1787789807',
  '+880-1683680668',
  'Chittagong, Bangladesh',
  '1996-12-11',
  'Bangladeshi',
  'B+',
  'Available',
  5, 15, 4,
  '/assets/Md_Zakaria_Masud_Resume_SSE.pdf',
  '/assets/profile.jpg'
);

-- ============================================================
-- Social links
-- ============================================================

insert into public.social_links (label, url, icon, sort_order) values
  ('GitHub',   'https://github.com/zakariabijoy',                'pi pi-github',   1),
  ('LinkedIn', 'https://www.linkedin.com/in/mdzakariamasud',     'pi pi-linkedin', 2),
  ('Email',    'mailto:zakaria.bijoy@live.com',                  'pi pi-envelope', 3);

-- ============================================================
-- Projects
-- ============================================================

insert into public.projects (title, subtitle, description, tech, images, live_url, github_url, sort_order) values
(
  'CFEMS',
  'IoT Equipment Monitoring Platform (Official - S3 Innovate)',
  'IoT equipment-monitoring platform for a Singapore government commuter-facility program. Real-time device telemetry, configurable alarm rules, events, and monitoring dashboards.',
  array['.NET 6','Web API','Worker Services','SignalR','EF Core','EMQX MQTT','Angular 12','Clean Architecture','CQRS','MediatR','Kubernetes'],
  array['/assets/work-1.svg','/assets/work-1-2.svg'],
  null,
  null,
  1
),
(
  'Reactivities',
  'Full-stack Social Activity App (Personal)',
  'Full-stack social/activity-feed application with real-time chat, photo upload, and follower system. ASP.NET Core Web API backend with a React + TypeScript + MobX front end.',
  array['ASP.NET Core','Clean Architecture','CQRS','MediatR','Identity','SignalR','React','TypeScript','MobX'],
  array['/assets/work-2.svg'],
  null,
  'https://github.com/zakariabijoy/Reactivities',
  2
),
(
  'BulkyBook',
  'Online Bookstore (Personal)',
  'Online bookstore built with ASP.NET Core MVC and EF Core, featuring Identity-based auth, the Repository pattern, and integrated Stripe and Braintree payments.',
  array['ASP.NET Core MVC','EF Core','Identity','Repository Pattern','Stripe','Braintree','SQL Server'],
  array['/assets/work-1.svg'],
  'https://bulkybookzb.azurewebsites.net/',
  'https://github.com/zakariabijoy/BulkyBook',
  3
);

-- ============================================================
-- Experience
-- ============================================================

insert into public.experience (title, company, date_label, bullets, sort_order) values
(
  'Senior Software Engineer',
  'Kaz Software | Dhaka, Bangladesh (Hybrid)',
  'Oct 2025 - Present',
  array[
    'Promoted to Senior Software Engineer after one year, taking on greater ownership of architecture and delivery.',
    'Own delivery of RESTful APIs in ASP.NET Core following Clean Architecture and CQRS, from design through production deployment for local and international clients.',
    'Architect event-driven microservices using RabbitMQ for asynchronous communication and real-time notifications.',
    'Evaluate and integrate emerging AI tooling - Microsoft.Extensions.AI, Azure AI Foundry, Microsoft Agent Framework, and MCP - into existing software solutions.'
  ],
  1
),
(
  'Software Engineer',
  'Kaz Software | Dhaka, Bangladesh (Hybrid)',
  'Oct 2024 - Sep 2025',
  array[
    'Built and maintained enterprise web applications using ASP.NET Core, Angular, React, PostgreSQL, SQL Server, and MongoDB.',
    'Designed serverless and background-processing solutions with Azure WebJobs, AWS Lambda, Amazon SQS, and EventBridge.',
    'Developed responsive front-end features with Angular, PrimeNG, and React.',
    'Deployed and managed workloads on Azure App Service and AWS (S3, serverless infrastructure), using Docker for containerization.',
    'Partnered with cross-functional teams on requirements analysis, system design, code review, UAT, and production releases.'
  ],
  2
),
(
  'Software Engineer L-II',
  'S3 Innovate Pte. Ltd. | Midview City, Singapore (Remote)',
  'Apr 2023 - Sep 2024',
  array[
    'Developed REST APIs in ASP.NET Core Web API following Clean Architecture with CQRS and the Mediator pattern.',
    'Built and maintained .NET Worker Services powering backend microservices for an IoT device-monitoring platform.',
    'Developed ETL pipelines processing IoT sensor data from an MQTT broker against configurable rule sets to generate alarms, events, and monitoring dashboards.',
    'Automated scheduled jobs with Quartz.NET; containerized services with Docker and Kubernetes, deploying to AWS EKS Fargate.'
  ],
  3
),
(
  'Junior Software Engineer',
  'S3 Innovate Pte. Ltd. | Midview City, Singapore (Remote)',
  'May 2021 - Mar 2023',
  array[
    'Maintained SQL Server and PostgreSQL databases using Dapper and EF Core.',
    'Delivered front-end features with Angular, Angular Material, and Angular Flex-Layout, working from Figma designs.',
    'Researched advanced C# features, Kubernetes/Rancher, and API tooling to inform technical decisions; contributed to requirements analysis, UAT, and documentation.'
  ],
  4
),
(
  'Software Developer',
  'Vonome Software and System | Dhaka, Bangladesh',
  'Jul 2020 - Jan 2021',
  array[
    'Authored SRS documentation and designed the PostgreSQL database for the PIM and VMS modules of an ERP system.',
    'Developed Web APIs in ASP.NET Core following Clean Architecture; tested APIs and managed version control via SourceTree.'
  ],
  5
),
(
  'Trainee Software Developer',
  'Chandrim Soft | Chittagong, Bangladesh',
  'Jan 2020 - Mar 2020',
  array[
    'Designed the database schema in Microsoft SQL Server for the CMP Officer''s Mess project and built the back end using ASP.NET MVC.',
    'Presented project deliverables directly to the client.'
  ],
  6
);

-- ============================================================
-- Education (degrees | certifications | courses | training)
-- ============================================================

insert into public.education (title, institution, category, date_label, bullets, sort_order) values
(
  'BSc in Computer Science and Engineering',
  'East Delta University, Chittagong, Bangladesh',
  'degrees',
  '2014 - 2019',
  array[
    'Thesis: "DDoS Attack Detection with Protocol Type Using Machine Learning" - proposed a hybrid ensemble model combining five classifiers, achieving over 96.85% detection accuracy across three protocol types.',
    'Tools: Python, scikit-learn, Pandas, NumPy, Matplotlib.'
  ],
  1
),
(
  '.NET Aspire and GenAI: Developing Distributed Architectures',
  'Udemy',
  'certifications',
  '2025',
  array['Credential ID: UC-240e8b95-7a83-4a97-b7a3-078f5bf48fd4'],
  2
),
(
  'ASP.NET Core MVC with Angular and EF Core',
  'PencilBox, Dhaka, Bangladesh',
  'certifications',
  '2021',
  array[]::text[],
  3
),
(
  'Complete Guide to ASP.NET Core MVC (v3.1)',
  'Udemy',
  'courses',
  '2020',
  array[]::text[],
  4
),
(
  'Web Application Development - .NET',
  'BASIS Institute of Technology and Management (BITM), Chittagong',
  'training',
  '2019',
  array[]::text[],
  5
);

-- ============================================================
-- Skills
-- ============================================================

insert into public.skills (name, category, sort_order) values
  -- Languages
  ('C#', 'languages', 1),
  ('TypeScript/JavaScript', 'languages', 2),
  ('SQL', 'languages', 3),
  ('Python', 'languages', 4),
  ('Java', 'languages', 5),
  ('PHP', 'languages', 6),
  -- Frameworks
  ('ASP.NET Core (MVC, Web API, EF Core)', 'frameworks', 1),
  ('SignalR', 'frameworks', 2),
  ('Dapper', 'frameworks', 3),
  ('Quartz.NET', 'frameworks', 4),
  ('Angular', 'frameworks', 5),
  ('React', 'frameworks', 6),
  ('PrimeNG', 'frameworks', 7),
  ('Angular Material', 'frameworks', 8),
  ('Bootstrap', 'frameworks', 9),
  ('Laravel', 'frameworks', 10),
  -- Databases
  ('SQL Server', 'databases', 1),
  ('PostgreSQL', 'databases', 2),
  ('MySQL', 'databases', 3),
  ('MongoDB', 'databases', 4),
  ('SQLite', 'databases', 5),
  -- Cloud & DevOps
  ('Azure App Service', 'cloud', 1),
  ('AWS (EKS Fargate, Lambda, S3, SQS, EventBridge)', 'cloud', 2),
  ('Docker', 'cloud', 3),
  ('Kubernetes', 'cloud', 4),
  ('RabbitMQ', 'cloud', 5),
  ('EMQX MQTT', 'cloud', 6),
  ('.NET Aspire', 'cloud', 7),
  -- AI & LLM Tooling
  ('Prompt Engineering', 'ai_llm', 1),
  ('RAG', 'ai_llm', 2),
  ('Microsoft Agent Framework', 'ai_llm', 3),
  ('Microsoft.Extensions.AI', 'ai_llm', 4),
  ('Azure AI Foundry', 'ai_llm', 5),
  ('MCP', 'ai_llm', 6),
  ('Vector Databases', 'ai_llm', 7),
  ('Agentic AI', 'ai_llm', 8),
  -- Tools
  ('Git / GitHub / GitLab', 'tools', 1),
  ('Azure DevOps / TFS', 'tools', 2),
  ('Figma', 'tools', 3),
  ('OutSystems', 'tools', 4),
  -- Methodologies
  ('Clean Architecture', 'methodologies', 1),
  ('CQRS with MediatR', 'methodologies', 2),
  ('Microservices', 'methodologies', 3),
  ('Event-Driven Design', 'methodologies', 4),
  ('Repository & Unit of Work', 'methodologies', 5),
  ('Agile/Scrum', 'methodologies', 6);
