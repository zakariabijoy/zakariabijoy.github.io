import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PortfolioDataService } from '../../core/portfolio-data.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  private readonly data = inject(PortfolioDataService);

  readonly currentYear = new Date().getFullYear();
  readonly profile = this.data.profile;
  readonly socialLinks = this.data.socialLinks;
}
