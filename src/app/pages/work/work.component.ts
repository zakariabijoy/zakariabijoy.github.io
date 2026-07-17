import { ChangeDetectionStrategy, Component, computed, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioDataService } from '../../core/portfolio-data.service';

@Component({
  selector: 'app-work',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkComponent implements OnInit, OnDestroy {
  private readonly data = inject(PortfolioDataService);

  readonly projects = this.data.projects;
  readonly index = signal(0);

  readonly project = computed(() => this.projects()[this.index()]);

  readonly totalTechnologies = computed(() => {
    const allTech = this.projects().flatMap(p => p.tech ?? []);
    return new Set(allTech).size;
  });

  readonly liveDemoCount = computed(() => this.projects().filter(p => !!p.live_url).length);

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

  goTo(i: number) { this.index.set(i % this.projects().length); }

  next() {
    this.index.set((this.index() + 1) % this.projects().length);
  }

  prev() {
    this.index.set((this.index() - 1 + this.projects().length) % this.projects().length);
  }
}
