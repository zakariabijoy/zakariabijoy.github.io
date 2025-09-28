import { ChangeDetectionStrategy, Component, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

type Project = { title: string; subtitle?: string; description?: string; tech?: string[]; images?: string[] };

@Component({
  selector: 'app-work',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkComponent {
  projects: Project[] = [
    {
      title: 'Frontend Project',
      subtitle: 'Creative Home Simplify Your Furniture',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque consequat, faucibus et, et.',
      tech: ['Html 5', 'Css 3', 'Javascript'],
  images: ['/assets/work-1.svg', '/assets/work-1-2.svg'],
    },
    {
      title: 'Dashboard App',
      subtitle: 'Analytics Dashboard',
      description: 'A responsive analytics dashboard with charts and filters.',
      tech: ['Angular', 'D3', 'Tailwind'],
  images: ['/assets/work-2.svg'],
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
}
