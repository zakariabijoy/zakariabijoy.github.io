import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type ResumeItem = { date?: string; title?: string; company?: string; bullets?: string[] };

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
    { date: '2022 - Present', title: 'Full Stack Developer', company: 'Tech Solutions Inc.', bullets: ['Angular, Node.js, PostgreSQL', 'Led feature development for client-facing dashboard'] },
    { date: '2020 - 2021', title: 'Freelance Web Developer', company: 'Various', bullets: ['Built e-commerce sites', 'Performance and accessibility improvements'] },
    { date: '2019 - 2020', title: 'Teaching Assistant', company: 'Tech Academy', bullets: ['Assisted with web dev bootcamp labs'] },
  ];

  education: ResumeItem[] = [
    { date: '2023', title: 'Full Stack Web Development Bootcamp', company: 'Online Course Platform' },
    { date: '2021', title: 'Front-end Track', company: 'Codecademy' },
    { date: '2019', title: 'Programming Course', company: 'Online Course' },
  ];

  skills: ResumeItem[] = [
    { title: 'HTML5' },
    { title: 'CSS3' },
    { title: 'JavaScript' },
    { title: 'Angular' },
    { title: 'Node.js' },
    { title: 'Tailwind' },
    { title: 'Testing' },
  ];

  about: { label: string; value: string }[] = [
    { label: 'Name', value: 'Zakaria Masud' },
    { label: 'Experience', value: '5+ Years' },
    { label: 'Freelance', value: 'Available' },
    { label: 'Email', value: 'zakaria@example.com' },
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
