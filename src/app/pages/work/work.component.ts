import { ChangeDetectionStrategy, Component, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Project { title: string; subtitle?: string; description?: string; tech?: string[]; images?: string[] }

@Component({
  selector: 'app-work',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkComponent implements OnInit, OnDestroy {
  projects: Project[] = [
    {
      title: 'CFEMS',
      subtitle: 'Commuter Facility Equipment Monitoring Services',
      description: 'A government project of Singapore for monitoring equipment of different contractors. IoT devices monitoring service with real-time data processing and alarm generation.',
      tech: ['.NET 6 Web API', 'Worker Services', 'SignalR', 'EMQX MQTT', 'Angular 12', 'SQL Server 2019', 'Docker', 'Kubernetes'],
      images: ['/assets/work-1.svg', '/assets/work-1-2.svg'],
    },
    {
      title: 'Reactivities',
      subtitle: 'Social Media Application',
      description: 'A social media app similar to Facebook where users can post activities, follow other activities, and interact with the community. Built with modern full-stack technologies.',
      tech: ['ASP.NET Core Web API', 'Clean Architecture', 'CQRS', 'MediatR', 'React', 'TypeScript', 'MobX', 'EF Core', 'SQLite'],
      images: ['/assets/work-2.svg'],
    },
    {
      title: 'BulkyBook',
      subtitle: 'Online Book Store',
      description: 'An online book selling platform built with ASP.NET Core MVC featuring all MVC capabilities with integrated Stripe and Braintree payment systems.',
      tech: ['ASP.NET Core MVC', 'Identity', 'EF Core', 'Repository Pattern', 'MS SQL Server', 'Stripe API', 'Braintree'],
      images: ['/assets/work-1.svg'],
    },
  ];

  index = signal(0);

  private keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.prev();
  };

  ngOnInit(): void {
    window.addEventListener('keydown', this.keyHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.keyHandler);
  }

  goTo(i: number) { this.index.set(i % this.projects.length); }

  next() {
    this.index.set((this.index() + 1) % this.projects.length);
  }

  prev() {
    this.index.set((this.index() - 1 + this.projects.length) % this.projects.length);
  }

  get project() { return this.projects[this.index()]; }

  getTotalTechnologies(): number {
    const allTech = this.projects.flatMap(p => p.tech || []);
    return new Set(allTech).size;
  }

  getProjectUrl(project: Project): string | null {
    if (project.title === 'Reactivities') {
      return null; // No live demo available
    }
    if (project.title === 'BulkyBook') {
      return 'https://bulkybookzb.azurewebsites.net/';
    }
    return null; // CFEMS is internal/private
  }

  getGithubUrl(project: Project): string | null {
    if (project.title === 'Reactivities') {
      return 'https://github.com/zakariabijoy/Reactivities';
    }
    if (project.title === 'BulkyBook') {
      return 'https://github.com/zakariabijoy/BulkyBook';
    }
    return null; // CFEMS is proprietary
  }

  openProject(project: Project): void {
    const url = this.getProjectUrl(project);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  openGithub(project: Project): void {
    const url = this.getGithubUrl(project);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
