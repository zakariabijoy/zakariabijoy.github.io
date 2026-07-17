import { ChangeDetectionStrategy, Component, AfterViewInit, ElementRef, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PortfolioDataService } from '../../core/portfolio-data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit {
  private readonly data = inject(PortfolioDataService);
  private readonly elementRef = inject(ElementRef);

  readonly profile = this.data.profile;
  readonly socialLinks = this.data.socialLinks;

  readonly featuredProject = computed(() => this.data.projects()[0]);

  readonly coreSkills = computed(() =>
    this.data.skills()
      .filter(s => s.category === 'languages' || s.category === 'frameworks')
      .slice(0, 8),
  );

  readonly aiSkills = computed(() =>
    this.data.skills().filter(s => s.category === 'ai_llm').slice(0, 6),
  );

  ngAfterViewInit(): void {
    this.initCounterAnimations();
  }

  private initCounterAnimations(): void {
    const counters = this.elementRef.nativeElement.querySelectorAll('.counter');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target as HTMLElement;
          const target = parseInt(counter.getAttribute('data-count') || '0');
          this.animateCounter(counter, target);
          observer.unobserve(counter);
        }
      });
    }, { threshold: 0.7 });

    counters.forEach((counter: HTMLElement) => observer.observe(counter));
  }

  private animateCounter(element: HTMLElement, target: number): void {
    let current = 0;
    const increment = target / 60; // 60 frames for smooth animation
    const duration = 2000; // 2 seconds
    const frameTime = duration / 60;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target.toString();
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current).toString();
      }
    }, frameTime);
  }
}
