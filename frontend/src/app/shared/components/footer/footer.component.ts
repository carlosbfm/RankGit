import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer-wrapper">
      <div class="rk-container footer-content">
        <div class="footer-left">
          <i class="bi bi-git"></i>
          <span>RankGit &bull; Leaderboard de Commits do GitHub</span>
        </div>
        <div class="footer-right">
          <span>Spring Boot 3 + Angular 21 + PostgreSQL</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-wrapper {
      margin-top: 5rem;
      border-top: 1px solid var(--border-color);
      padding: 2rem 0;
      color: var(--text-dim);
      font-size: 0.85rem;
    }
    .footer-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .footer-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      i {
        color: var(--accent-green);
        font-size: 1.1rem;
      }
    }
  `]
})
export class FooterComponent {}
