import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card rk-card fade-in">
        <!-- Brand Header -->
        <div class="login-brand">
          <div class="logo-circle">
            <i class="bi bi-git"></i>
          </div>
          <h2>Rank<strong>Git</strong></h2>
          <p class="subtitle">Acesse sua conta para gerenciar e acompanhar os rankings</p>
        </div>

        <!-- Botão Direto GitHub OAuth Oficial -->
        <div class="oauth-section">
          <button
            type="button"
            class="btn-github-oauth"
            (click)="loginWithGitHub()"
            [disabled]="authService.isLoading()"
          >
            <i class="bi bi-github"></i>
            <span>Continuar com o GitHub</span>
          </button>
        </div>

        <div class="auth-divider">
          <span>ou com usuário e senha</span>
        </div>

        <!-- Tabs: Entrar / Cadastrar -->
        <div class="auth-tabs">
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab === 'login'"
            (click)="switchTab('login')"
          >
            Entrar
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab === 'register'"
            (click)="switchTab('register')"
          >
            Criar Conta
          </button>
        </div>

        <!-- Mensagens de Alerta -->
        <div *ngIf="errorMessage" class="status-alert error">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <div *ngIf="successMessage" class="status-alert success">
          <i class="bi bi-check-circle-fill"></i>
          <span>{{ successMessage }}</span>
        </div>

        <!-- Formulário de Login -->
        <form *ngIf="activeTab === 'login'" (ngSubmit)="onLogin()" class="auth-form">
          <div class="form-group">
            <label for="login-username">Nome de Usuário</label>
            <div class="input-wrapper">
              <i class="bi bi-person input-icon"></i>
              <input
                id="login-username"
                type="text"
                class="form-control"
                placeholder="Seu usuário"
                [(ngModel)]="loginData.username"
                name="username"
                required
                maxlength="30"
                autocomplete="username"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="login-password">Senha</label>
            <div class="input-wrapper">
              <i class="bi bi-lock input-icon"></i>
              <input
                id="login-password"
                type="password"
                class="form-control"
                placeholder="Sua senha"
                [(ngModel)]="loginData.password"
                name="password"
                required
                maxlength="50"
                autocomplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            class="rk-btn rk-btn-primary btn-submit"
            [disabled]="authService.isLoading() || !loginData.username || !loginData.password"
          >
            <i class="bi" [ngClass]="authService.isLoading() ? 'bi-arrow-repeat spin' : 'bi-box-arrow-in-right'"></i>
            <span>{{ authService.isLoading() ? 'Entrando...' : 'Entrar' }}</span>
          </button>
        </form>

        <!-- Formulário de Cadastro -->
        <form *ngIf="activeTab === 'register'" (ngSubmit)="onRegister()" class="auth-form">
          <div class="form-group">
            <label for="reg-username">Nome de Usuário *</label>
            <div class="input-wrapper">
              <i class="bi bi-person input-icon"></i>
              <input
                id="reg-username"
                type="text"
                class="form-control"
                placeholder="Ex: seunome"
                [(ngModel)]="registerData.username"
                name="regUsername"
                required
                maxlength="30"
                autocomplete="username"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="reg-name">Nome Completo</label>
            <div class="input-wrapper">
              <i class="bi bi-card-text input-icon"></i>
              <input
                id="reg-name"
                type="text"
                class="form-control"
                placeholder="Ex: Seu Nome"
                [(ngModel)]="registerData.name"
                name="regName"
                maxlength="60"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="reg-email">E-mail</label>
            <div class="input-wrapper">
              <i class="bi bi-envelope input-icon"></i>
              <input
                id="reg-email"
                type="email"
                class="form-control"
                placeholder="seu.email@exemplo.com"
                [(ngModel)]="registerData.email"
                name="regEmail"
                maxlength="80"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="reg-password">Senha *</label>
            <div class="input-wrapper">
              <i class="bi bi-lock input-icon"></i>
              <input
                id="reg-password"
                type="password"
                class="form-control"
                placeholder="Mínimo 4 caracteres"
                [(ngModel)]="registerData.password"
                name="regPassword"
                required
                maxlength="50"
                autocomplete="new-password"
              />
            </div>
          </div>

          <div class="approval-notice">
            <i class="bi bi-info-circle"></i>
            <span>Novas contas criadas ficam pendentes de aprovação por um administrador antes de liberadas.</span>
          </div>

          <button
            type="submit"
            class="rk-btn rk-btn-primary btn-submit"
            [disabled]="authService.isLoading() || !registerData.username || !registerData.password"
          >
            <i class="bi" [ngClass]="authService.isLoading() ? 'bi-arrow-repeat spin' : 'bi-person-plus-fill'"></i>
            <span>{{ authService.isLoading() ? 'Cadastrando...' : 'Criar Conta' }}</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem 1rem;
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 2.25rem;
      background: #161b22;
      border: 1px solid var(--border-color);
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
      border-radius: 12px;
    }

    .login-brand {
      text-align: center;
      margin-bottom: 1.5rem;

      .logo-circle {
        width: 52px;
        height: 52px;
        margin: 0 auto 0.75rem;
        background: rgba(247, 129, 102, 0.15);
        border: 1px solid rgba(247, 129, 102, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          font-size: 1.8rem;
          color: #f78166;
        }
      }

      h2 {
        font-size: 1.6rem;
        font-weight: 700;
        color: var(--text-main);
        letter-spacing: -0.02em;

        strong {
          color: var(--accent-green-hover);
        }
      }

      .subtitle {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin-top: 0.35rem;
      }
    }

    .oauth-section {
      margin-bottom: 1.25rem;
    }

    .btn-github-oauth {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      background: #21262d;
      color: var(--text-main);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      i {
        font-size: 1.25rem;
      }

      &:hover {
        background: #30363d;
        border-color: #8b949e;
      }
    }

    .auth-divider {
      position: relative;
      text-align: center;
      margin: 1.25rem 0;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--border-color);
      }

      span {
        position: relative;
        background: #161b22;
        padding: 0 0.75rem;
        font-size: 0.75rem;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    .auth-tabs {
      display: flex;
      background: var(--bg-primary);
      border-radius: 8px;
      padding: 0.25rem;
      margin-bottom: 1.25rem;
      border: 1px solid var(--border-color);

      .tab-btn {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--text-muted);
        padding: 0.5rem;
        font-size: 0.85rem;
        font-weight: 500;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;

        &.active {
          background: #21262d;
          color: var(--text-main);
          font-weight: 600;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }

        &:hover:not(.active) {
          color: var(--text-main);
        }
      }
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      label {
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--text-main);
      }
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .input-icon {
        position: absolute;
        left: 0.75rem;
        color: var(--text-muted);
        font-size: 1rem;
        pointer-events: none;
      }

      .form-control {
        width: 100%;
        padding: 0.6rem 0.75rem 0.6rem 2.25rem;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        color: var(--text-main);
        font-size: 0.9rem;
        transition: all 0.2s;

        &:focus {
          outline: none;
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.2);
        }

        &::placeholder {
          color: var(--text-dim);
        }
      }
    }

    .approval-notice {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.65rem 0.75rem;
      background: rgba(56, 139, 253, 0.1);
      border: 1px solid rgba(56, 139, 253, 0.25);
      border-radius: 6px;
      font-size: 0.78rem;
      color: #58a6ff;
      line-height: 1.4;

      i {
        font-size: 0.95rem;
        margin-top: 0.1rem;
        flex-shrink: 0;
      }
    }

    .btn-submit {
      width: 100%;
      padding: 0.7rem;
      font-size: 0.95rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }

    .status-alert {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
      line-height: 1.4;
      margin-bottom: 1rem;

      i {
        font-size: 1.1rem;
        flex-shrink: 0;
      }

      &.error {
        background: rgba(248, 81, 73, 0.15);
        border: 1px solid rgba(248, 81, 73, 0.4);
        color: #ff7b72;
      }

      &.success {
        background: rgba(63, 185, 80, 0.15);
        border: 1px solid rgba(63, 185, 80, 0.4);
        color: #3fb950;
      }
    }

    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class LoginComponent implements OnInit {
  activeTab: 'login' | 'register' = 'login';

  errorMessage = '';
  successMessage = '';

  loginData = {
    username: '',
    password: ''
  };

  registerData = {
    username: '',
    password: '',
    name: '',
    email: ''
  };

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['unapproved'] === 'true') {
        this.errorMessage = 'Sua conta do GitHub foi conectada com sucesso, mas está aguardando aprovação de um administrador para liberar seu acesso.';
      }
    });
  }

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  loginWithGitHub(): void {
    this.authService.loginWithGitHub();
  }

  onLogin(): void {
    if (!this.loginData.username || !this.loginData.password) return;

    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.loginData.username.trim(), this.loginData.password).subscribe({
      next: (res) => {
        this.successMessage = `Bem-vindo(a), @${res.user.username}!`;
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Falha ao efetuar login. Verifique suas credenciais.';
      }
    });
  }

  onRegister(): void {
    if (!this.registerData.username || !this.registerData.password) return;

    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(
      this.registerData.username.trim(),
      this.registerData.password,
      this.registerData.name,
      this.registerData.email
    ).subscribe({
      next: (res) => {
        if (res.token) {
          this.successMessage = `Conta criada com sucesso! Bem-vindo(a), @${res.user.username}!`;
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 600);
        } else {
          // Usuário comum aguardando aprovação do admin
          this.successMessage = res.message || 'Cadastro realizado com sucesso! Sua conta está aguardando aprovação de um administrador.';
          const registeredUser = this.registerData.username;
          this.registerData = { username: '', password: '', name: '', email: '' };

          // Preenche o campo de login e alterna a aba
          setTimeout(() => {
            this.switchTab('login');
            this.loginData.username = registeredUser;
          }, 2500);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Falha ao criar conta.';
      }
    });
  }
}
