import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioDataService } from '../../core/portfolio-data.service';
import { EducationItem, Skill, SkillCategory } from '../../core/models';

const SKILL_CATEGORY_META: Record<SkillCategory, { title: string; icon: string }> = {
  languages: { title: 'Programming Languages', icon: 'pi-code' },
  frameworks: { title: 'Frameworks & Libraries', icon: 'pi-cog' },
  databases: { title: 'Databases', icon: 'pi-database' },
  cloud: { title: 'Cloud & DevOps', icon: 'pi-cloud' },
  ai_llm: { title: 'AI & LLM Tooling', icon: 'pi-sparkles' },
  tools: { title: 'Tools & Technologies', icon: 'pi-wrench' },
  methodologies: { title: 'Architecture & Patterns', icon: 'pi-sitemap' },
};

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumeComponent {
  private readonly data = inject(PortfolioDataService);

  // tabs: experience | education | skills | about
  activeTab = signal<'experience' | 'education' | 'skills' | 'about'>('experience');
  expandedBio = signal(false);

  readonly profile = this.data.profile;
  readonly experience = this.data.experience;
  readonly education = this.data.education;
  readonly skills = this.data.skills;

  setTab(tab: 'experience' | 'education' | 'skills' | 'about') {
    this.activeTab.set(tab);
  }

  toggleBio() {
    this.expandedBio.update(val => !val);
  }

  // First sentence of the bio for the collapsed view; remainder behind "Read More".
  readonly bioIntro = computed(() => {
    const bio = this.profile().bio ?? '';
    const end = bio.indexOf('. ');
    return end === -1 ? bio : bio.slice(0, end + 1);
  });

  readonly bioRest = computed(() => {
    const bio = this.profile().bio ?? '';
    const end = bio.indexOf('. ');
    return end === -1 ? '' : bio.slice(end + 2);
  });

  readonly about = computed(() => {
    const p = this.profile();
    const items: { label: string; value: string }[] = [
      { label: 'Name', value: p.full_name },
      { label: 'Experience', value: `${p.years_experience}+ Years` },
      { label: 'Education', value: 'BSc in CSE' },
      { label: 'Location', value: p.location ?? '' },
      { label: 'Email', value: p.email },
      { label: 'Phone', value: p.phone ?? '' },
      { label: 'Nationality', value: p.nationality ?? '' },
      { label: 'Blood Group', value: p.blood_group ?? '' },
      { label: 'Freelance', value: p.freelance_status ?? '' },
    ];
    return items.filter(i => i.value);
  });

  // Group skills by category, keeping SKILL_CATEGORY_META display order.
  readonly skillsByCategory = computed(() => {
    const skills = this.skills();
    return (Object.keys(SKILL_CATEGORY_META) as SkillCategory[])
      .map(cat => ({
        ...SKILL_CATEGORY_META[cat],
        skills: skills.filter(s => s.category === cat) as Skill[],
      }))
      .filter(group => group.skills.length > 0);
  });

  // Two segments for education UI: Academic and Professional
  readonly educationSegments = computed(() => {
    const education = this.education();
    const academic = {
      title: 'Academic Education',
      icon: 'pi-graduation-cap',
      items: education.filter(e => e.category === 'degrees') as EducationItem[],
    };
    const professional = {
      title: 'Professional Training & Certifications',
      icon: 'pi-briefcase',
      items: education.filter(e => e.category !== 'degrees') as EducationItem[],
    };
    return [academic, professional].filter(s => s.items.length > 0);
  });
}
