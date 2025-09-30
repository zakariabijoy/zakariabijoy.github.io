import { Directive, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private observer?: IntersectionObserver;

  ngOnInit() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Skip animations for users who prefer reduced motion
      this.el.nativeElement.style.opacity = '1';
      this.el.nativeElement.style.transform = 'none';
      return;
    }

    // Initial hidden state
    this.el.nativeElement.style.opacity = '0';
    this.el.nativeElement.style.transform = 'translateY(30px)';
    this.el.nativeElement.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

    // Set up intersection observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Element is in view - reveal it
            this.el.nativeElement.style.opacity = '1';
            this.el.nativeElement.style.transform = 'translateY(0)';
            
            // Stop observing once revealed
            this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters viewport
      }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
