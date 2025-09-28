import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from './layout/header/header.component';
import { BgLayerComponent } from './shared/bg-layer/bg-layer.component';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    BgLayerComponent,
    RouterOutlet,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly theme = inject(ThemeService);
  ngOnInit() {
    this.theme.init();
  }
}
