import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar-wrapper">
      <div class="rk-container nav-content">
        <!-- Brand -->
        <a routerLink="/ranking" class="nav-brand" (click)="closeMobileMenu()">
          <i class="bi bi-git brand-icon"></i>
          <span class="brand-title">Rank<strong>Git</strong></span>
        </a>

        <!-- Menu de Navegação na Navbar (Visível no Desktop/Tablet) -->
        <nav class="nav-menu" *ngIf="authService.isAuthenticated()">
          <a routerLink="/ranking" routerLinkActive="active" class="nav-menu-btn">
            <i class="bi bi-trophy"></i>
            <span>Ranking</span>
          </a>

          <a routerLink="/commits" routerLinkActive="active" class="nav-menu-btn">
            <i class="bi bi-table"></i>
            <span>Tabela</span>
          </a>

          <a routerLink="/feed" routerLinkActive="active" class="nav-menu-btn">
            <i class="bi bi-broadcast"></i>
            <span>Feed</span>
          </a>

          <a routerLink="/score" routerLinkActive="active" class="nav-menu-btn">
            <i class="bi bi-stars"></i>
            <span>Score</span>
          </a>

          <a
            *ngIf="authService.isAdmin()"
            routerLink="/admin"
            routerLinkActive="active"
            class="nav-menu-btn nav-admin-btn"
          >
            <i class="bi bi-shield-lock-fill"></i>
            <span>Painel Admin</span>
          </a>
        </nav>

        <!-- Ações do Usuário à Direita -->
        <div class="nav-actions">
          <!-- Usuário Autenticado -->
          <div *ngIf="authService.isAuthenticated()" class="user-badge">
            <img
              [src]="authService.currentUser()?.avatarUrl"
              [alt]="authService.currentUser()?.username"
              class="user-avatar"
            />
            <div class="user-info">
              <span class="username">&#64;{{ authService.currentUser()?.username }}</span>
              <span *ngIf="authService.isAdmin()" class="role-pill">Admin</span>
            </div>
            <button class="btn-logout" (click)="authService.logout()" title="Sair da Conta">
              <i class="bi bi-box-arrow-right"></i>
            </button>
          </div>

          <!-- Usuário Não Autenticado -->
          <div *ngIf="!authService.isAuthenticated()" class="login-group">
            <a routerLink="/login" class="rk-btn rk-btn-primary">
              <i class="bi bi-box-arrow-in-right"></i>
              <span>Entrar</span>
            </a>
          </div>

          <!-- Botão Hambúrguer Mobile -->
          <button
            *ngIf="authService.isAuthenticated()"
            type="button"
            class="btn-hamburger"
            (click)="toggleMobileMenu()"
            [attr.aria-expanded]="isMobileMenuOpen"
            title="Menu de navegação"
          >
            <i class="bi" [ngClass]="isMobileMenuOpen ? 'bi-x-lg' : 'bi-list'"></i>
          </button>
        </div>
      </div>

      <!-- Menu Gaveta Mobile (Dropdown expansível em smartphones e tablets pequenos) -->
      <div class="mobile-drawer fade-in" *ngIf="isMobileMenuOpen && authService.isAuthenticated()">
        <nav class="mobile-nav-links">
          <a routerLink="/ranking" routerLinkActive="active" class="mobile-link" (click)="closeMobileMenu()">
            <i class="bi bi-trophy"></i>
            <span>Ranking Geral</span>
          </a>

          <a routerLink="/commits" routerLinkActive="active" class="mobile-link" (click)="closeMobileMenu()">
            <i class="bi bi-table"></i>
            <span>Tabela de Commits</span>
          </a>

          <a routerLink="/feed" routerLinkActive="active" class="mobile-link" (click)="closeMobileMenu()">
            <i class="bi bi-broadcast"></i>
            <span>Feed Social de Commits</span>
          </a>

          <a routerLink="/score" routerLinkActive="active" class="mobile-link" (click)="closeMobileMenu()">
            <i class="bi bi-stars"></i>
            <span>Como Funciona o Score</span>
          </a>

          <a
            *ngIf="authService.isAdmin()"
            routerLink="/admin"
            routerLinkActive="active"
            class="mobile-link admin-link"
            (click)="closeMobileMenu()"
          >
            <i class="bi bi-shield-lock-fill"></i>
            <span>Painel Administrativo</span>
          </a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .navbar-wrapper {
      background: rgba(13, 17, 23, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 0.75rem 0;
      width: 100%;
      max-width: 100vw;
      box-sizing: border-box;
    }

    .nav-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      width: 100%;
      box-sizing: border-box;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      cursor: pointer;
      flex-shrink: 0;

      .brand-icon {
        font-size: 1.6rem;
        color: #f78166;
      }

      .brand-title {
        font-size: 1.25rem;
        color: var(--text-main);
        font-weight: 500;
        strong {
          color: var(--accent-green-hover);
        }
      }
    }

    /* Menu Central */
    .nav-menu {
      display: flex;
      align-items: center;
      gap: 0.4rem;

      .nav-menu-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        background: transparent;
        border: 1px solid transparent;
        color: var(--text-muted);
        padding: 0.45rem 0.75rem;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s ease;

        i {
          font-size: 0.95rem;
          color: var(--text-dim);
          transition: color 0.2s ease;
        }

        &:hover {
          color: var(--text-main);
          background: #21262d;
          border-color: var(--border-color);

          i {
            color: var(--accent-blue);
          }
        }

        &.active {
          color: var(--text-main);
          background: #21262d;
          border-color: var(--accent-blue);
          font-weight: 600;

          i {
            color: var(--accent-blue);
          }
        }

        &.nav-admin-btn {
          color: #c084fc;
          background: rgba(168, 85, 247, 0.1);
          border-color: rgba(168, 85, 247, 0.25);

          i {
            color: #c084fc;
          }

          &:hover {
            background: rgba(168, 85, 247, 0.2);
            border-color: rgba(168, 85, 247, 0.4);
          }

          &.active {
            color: #fff;
            background: rgba(168, 85, 247, 0.25);
            border-color: #a855f7;

            i {
              color: #e9d5ff;
            }
          }
        }
      }
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .user-badge {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 0.3rem 0.7rem;
      border-radius: 20px;

      .user-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        object-fit: cover;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 0.4rem;

        .username {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-main);
        }

        .role-pill {
          font-size: 0.65rem;
          background: rgba(168, 85, 247, 0.2);
          color: var(--accent-purple);
          border: 1px solid rgba(168, 85, 247, 0.4);
          padding: 0.1rem 0.4rem;
          border-radius: 9999px;
          text-transform: uppercase;
          font-weight: 600;
        }
      }

      .btn-logout {
        background: transparent;
        border: none;
        color: var(--text-dim);
        cursor: pointer;
        padding: 0.2rem;
        display: flex;
        align-items: center;
        transition: color 0.15s ease;

        &:hover {
          color: var(--accent-red);
        }
      }
    }

    .login-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-hamburger {
      display: none;
      background: #21262d;
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 1.25rem;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #30363d;
        border-color: var(--border-light);
      }
    }

    /* Mobile Drawer */
    .mobile-drawer {
      display: none;
      background: #161b22;
      border-top: 1px solid var(--border-color);
      margin-top: 0.75rem;
      padding: 1rem 1.25rem;
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.6);

      .mobile-nav-links {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .mobile-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-muted);
          padding: 0.65rem 0.85rem;
          border-radius: 6px;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.15s ease;

          i {
            font-size: 1.15rem;
            color: var(--text-dim);
          }

          &:hover {
            color: var(--text-main);
            background: #21262d;

            i {
              color: var(--accent-blue);
            }
          }

          &.active {
            color: #ffffff;
            background: #21262d;
            font-weight: 600;
            border-left: 3px solid var(--accent-blue);

            i {
              color: var(--accent-blue);
            }
          }

          &.admin-link {
            color: #c084fc;
            background: rgba(168, 85, 247, 0.1);
            border: 1px solid rgba(168, 85, 247, 0.25);

            i {
              color: #c084fc;
            }

            &.active {
              border-left: 3px solid #c084fc;
            }
          }
        }
      }
    }

    /* Responsividade */
    @media (max-width: 860px) {
      .nav-menu {
        display: none;
      }
      .btn-hamburger {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .mobile-drawer {
        display: block;
      }
      .user-badge .user-info {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .brand-icon {
        font-size: 1.35rem;
      }
      .brand-title {
        font-size: 1.05rem;
      }
      .user-badge {
        padding: 0.2rem 0.4rem;
        gap: 0.35rem;

        .user-avatar {
          width: 24px;
          height: 24px;
        }
      }
      .btn-hamburger {
        padding: 0.3rem 0.5rem;
        font-size: 1.15rem;
      }
    }
  `]
})
export class NavbarComponent {
  isMobileMenuOpen = false;

  constructor(public authService: AuthService) {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
