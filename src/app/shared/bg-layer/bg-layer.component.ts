import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-bg-layer',
  standalone: true,
  template: '<div class="bg-animated" aria-hidden="true"></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BgLayerComponent {}