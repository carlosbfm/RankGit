import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-oauth-redirect',
  standalone: true,
  template: `
    <div style="display: flex; height: 80vh; align-items: center; justify-content: center; flex-direction: column; gap: 1rem;">
      <i class="bi bi-arrow-repeat" style="font-size: 2.5rem; animation: spin 1s linear infinite; color: var(--accent-blue);"></i>
      <p style="color: var(--text-muted); font-size: 1.1rem;">Autenticando com o GitHub, aguarde...</p>
    </div>
    <style>
      @keyframes spin { 100% { transform: rotate(360deg); } }
    </style>
  `
})
export class OAuthRedirectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];
      const username = params['username'] || '';

      if (error === 'unapproved') {
        this.router.navigate(['/login'], { queryParams: { unapproved: 'true' } });
        return;
      }

      if (token) {
        this.authService.setToken(token);
        this.router.navigate(['/']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
