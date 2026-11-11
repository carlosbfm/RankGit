import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RankingService } from '../../ranking.service';
import { BADGE_DEFINITIONS, DeveloperDetails } from '../../ranking.model';

@Component({
  selector: 'app-developer-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dev-details-page fade-in">
      <!-- Breadcrumb / Voltar -->
      <nav class="back-nav">
        <a routerLink="/commits" class="back-link">
          <i class="bi bi-arrow-left"></i>
          <span>Voltar para a Tabela de Commits</span>
        </a>
      </nav>

      <!-- Estado de Carregamento -->
      <div *ngIf="isLoading" class="loading-state rk-card">
        <i class="bi bi-arrow-repeat spin"></i>
        <span>Carregando dados completos de &#64;{{ username }}...</span>
      </div>

      <!-- Estado de Erro -->
      <div *ngIf="errorMessage && !isLoading" class="error-card rk-card">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <h3>Não foi possível carregar os dados</h3>
        <p>{{ errorMessage }}</p>
        <a routerLink="/commits" class="rk-btn rk-btn-primary">
          <i class="bi bi-arrow-left"></i>
          <span>Voltar ao Ranking</span>
        </a>
      </div>

      <!-- Conteúdo do Perfil -->
      <div *ngIf="dev && !isLoading" class="details-content">
        <!-- Card Principal de Perfil -->
        <header class="profile-hero-card rk-card">
          <div class="profile-hero-main">
            <div class="avatar-wrapper">
              <img [src]="dev.avatarUrl" [alt]="dev.username" class="profile-avatar" />
              <span class="position-badge" [class.top1]="dev.rankingPosition === 1" [class.top2]="dev.rankingPosition === 2" [class.top3]="dev.rankingPosition === 3">
                #{{ dev.rankingPosition }}
              </span>
            </div>

            <div class="profile-info">
              <div class="title-row">
                <h1 class="dev-display-name">{{ dev.name || dev.username }}</h1>
                <span class="tier-pill" [ngClass]="'tier-' + dev.tier.toLowerCase()">
                  <i class="bi bi-shield-shaded"></i>
                  {{ dev.tier }}
                </span>
              </div>

              <div class="username-row">
                <span class="user-handle">&#64;{{ dev.username }}</span>
                <span class="dot-separator">&bull;</span>
                <span class="sync-date" *ngIf="dev.lastSyncedAt">
                  Sincronizado: {{ dev.lastSyncedAt | date:'dd/MM/yyyy HH:mm' }}
                </span>
              </div>

              <!-- Bio / Descrição -->
              <p class="dev-bio" *ngIf="dev.bio">{{ dev.bio }}</p>
              <p class="dev-bio empty" *ngIf="!dev.bio">Desenvolvedor monitorado no ecossistema RankGit.</p>

              <!-- Metadados do GitHub com Ícones -->
              <div class="meta-tags-list">
                <!-- Data de Criação do Perfil no GitHub -->
                <div class="meta-item" *ngIf="dev.createdAt" title="Data de criação da conta no GitHub">
                  <i class="bi bi-calendar-check-fill text-green"></i>
                  <span>No GitHub desde <strong>{{ formatCreationDate(dev.createdAt) }}</strong></span>
                </div>

                <!-- Localização -->
                <div class="meta-item" *ngIf="dev.location">
                  <i class="bi bi-geo-alt-fill text-red"></i>
                  <span>{{ dev.location }}</span>
                </div>

                <!-- Empresa -->
                <div class="meta-item" *ngIf="dev.company">
                  <i class="bi bi-building text-blue"></i>
                  <span>{{ dev.company }}</span>
                </div>

                <!-- Blog / Site -->
                <a *ngIf="dev.blog" [href]="formatUrl(dev.blog)" target="_blank" rel="noopener noreferrer" class="meta-item link-item" title="Website / Portfólio">
                  <i class="bi bi-link-45deg text-purple"></i>
                  <span>{{ cleanUrl(dev.blog) }}</span>
                </a>

                <!-- Twitter / X -->
                <a *ngIf="dev.twitterUsername" [href]="'https://twitter.com/' + dev.twitterUsername" target="_blank" rel="noopener noreferrer" class="meta-item link-item" title="Twitter / X">
                  <i class="bi bi-twitter-x"></i>
                  <span>&#64;{{ dev.twitterUsername }}</span>
                </a>

                <!-- E-mail -->
                <div class="meta-item" *ngIf="dev.email">
                  <i class="bi bi-envelope-fill text-yellow"></i>
                  <span>{{ dev.email }}</span>
                </div>

                <!-- Repositórios Públicos -->
                <div class="meta-item">
                  <i class="bi bi-journal-code text-blue"></i>
                  <span><strong>{{ dev.publicRepos }}</strong> repositórios públicos</span>
                </div>

                <!-- Seguidores e Seguindo -->
                <div class="meta-item">
                  <i class="bi bi-people-fill text-muted"></i>
                  <span><strong>{{ dev.followers }}</strong> seguidores &bull; <strong>{{ dev.following }}</strong> seguindo</span>
                </div>
              </div>
            </div>
          </div>

          <div class="profile-hero-actions">
            <button
              type="button"
              class="rk-btn rk-btn-secondary btn-sync-dev"
              (click)="syncDevNow()"
              [disabled]="isSyncing"
              title="Buscar novos commits deste desenvolvedor no GitHub agora"
            >
              <i class="bi" [ngClass]="isSyncing ? 'bi-arrow-repeat spin' : 'bi-arrow-clockwise'"></i>
              <span>{{ isSyncing ? 'Sincronizando...' : 'Sincronizar Commits' }}</span>
            </button>

            <a [href]="dev.htmlUrl" target="_blank" rel="noopener noreferrer" class="rk-btn rk-btn-primary">
              <i class="bi bi-github"></i>
              <span>Abrir Perfil no GitHub</span>
              <i class="bi bi-box-arrow-up-right external-icon"></i>
            </a>
          </div>
        </header>

        <!-- Grade de Métricas RankGit -->
        <section class="metrics-grid">
          <div class="metric-card rk-card">
            <div class="metric-icon rank-icon">
              <i class="bi bi-trophy-fill"></i>
            </div>
            <div class="metric-content">
              <span class="metric-label">Posição no Ranking</span>
              <strong class="metric-value">#{{ dev.rankingPosition }} Lugar</strong>
              <span class="metric-sub">Classificação geral de atividade</span>
            </div>
          </div>

          <div class="metric-card rk-card">
            <div class="metric-icon commits-icon">
              <i class="bi bi-git"></i>
            </div>
            <div class="metric-content">
              <span class="metric-label">Commits Monitorados</span>
              <strong class="metric-value">{{ dev.totalCommits | number }}</strong>
              <span class="metric-sub" *ngIf="dev.yearCommits">{{ dev.yearCommits | number }} commits este ano</span>
              <span class="metric-sub" *ngIf="!dev.yearCommits">Histórico completo</span>
            </div>
          </div>

          <div class="metric-card rk-card">
            <div class="metric-icon streak-icon">
              <i class="bi bi-fire"></i>
            </div>
            <div class="metric-content">
              <span class="metric-label">Sequência Ativa (Streak)</span>
              <strong class="metric-value">{{ dev.currentStreak }} dias</strong>
              <span class="metric-sub">Dias ininterruptos com commits</span>
            </div>
          </div>

          <div class="metric-card rk-card">
            <div class="metric-icon score-icon">
              <i class="bi bi-stars"></i>
            </div>
            <div class="metric-content">
              <span class="metric-label">Score RankGit</span>
              <strong class="metric-value">{{ dev.score | number }} pts</strong>
              <span class="metric-sub">(Commits &times; 10) + (Streak &times; 25)</span>
            </div>
          </div>
        </section>

        <!-- Seção de Insígnias e Badges -->
        <section class="badges-section rk-card" *ngIf="dev.badges && dev.badges.length > 0">
          <h3 class="section-title">
            <i class="bi bi-award-fill"></i>
            <span>Insígnias e Conquistas</span>
            <span class="badge-count">{{ dev.badges.length }}</span>
          </h3>
          <div class="badges-wrap">
            <div *ngFor="let b of dev.badges" class="badge-card">
              <i class="bi" [ngClass]="getBadgeInfo(b).icon" [style.color]="getBadgeInfo(b).color"></i>
              <div class="badge-text">
                <strong>{{ getBadgeInfo(b).title }}</strong>
              </div>
            </div>
          </div>
        </section>

        <!-- Duas Colunas: Repositórios e Últimos Commits -->
        <div class="content-columns">
          <!-- Coluna 1: Repositórios em Destaque -->
          <section class="repos-column">
            <div class="column-header">
              <h3>
                <i class="bi bi-journal-bookmark-fill text-blue"></i>
                <span>Repositórios Recentes do GitHub</span>
              </h3>
              <span class="count-badge">{{ dev.topRepositories.length }} listados</span>
            </div>

            <div class="repos-list" *ngIf="dev.topRepositories && dev.topRepositories.length > 0">
              <div *ngFor="let repo of dev.topRepositories" class="repo-card rk-card">
                <div class="repo-card-header">
                  <a [href]="repo.htmlUrl" target="_blank" rel="noopener noreferrer" class="repo-name">
                    <i class="bi bi-journal-code"></i>
                    <span>{{ repo.name }}</span>
                    <i class="bi bi-box-arrow-up-right ext-sm"></i>
                  </a>
                  <span class="repo-visibility" [class.fork]="repo.isFork">
                    {{ repo.isFork ? 'Fork' : 'Público' }}
                  </span>
                </div>

                <p class="repo-desc" *ngIf="repo.description">{{ repo.description }}</p>
                <p class="repo-desc empty" *ngIf="!repo.description">Sem descrição informada no GitHub.</p>

                <div class="repo-footer">
                  <span class="repo-lang" *ngIf="repo.language">
                    <span class="lang-color" [ngClass]="getLangClass(repo.language)"></span>
                    <span>{{ repo.language }}</span>
                  </span>

                  <div class="repo-stats">
                    <span class="stat-item" *ngIf="repo.stars > 0">
                      <i class="bi bi-star"></i> {{ repo.stars }}
                    </span>
                    <span class="stat-item" *ngIf="repo.forks > 0">
                      <i class="bi bi-git"></i> {{ repo.forks }}
                    </span>
                    <span class="stat-item update-time" *ngIf="repo.updatedAt">
                      Atualizado {{ formatRelativeDate(repo.updatedAt) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="!dev.topRepositories || dev.topRepositories.length === 0" class="empty-column rk-card">
              <i class="bi bi-inbox"></i>
              <p>Nenhum repositório público recente encontrado.</p>
            </div>
          </section>

          <!-- Coluna 2: Últimos Commits -->
          <section class="commits-column">
            <div class="column-header">
              <h3>
                <i class="bi bi-clock-history text-green"></i>
                <span>Últimos Commits Registrados</span>
              </h3>
              <span class="count-badge">{{ dev.recentCommits.length }} recentes</span>
            </div>

            <div class="commits-timeline" *ngIf="dev.recentCommits && dev.recentCommits.length > 0">
              <div *ngFor="let commit of dev.recentCommits" class="commit-item rk-card">
                <div class="commit-header">
                  <div class="commit-repo" *ngIf="commit.repoName">
                    <i class="bi bi-journal-text"></i>
                    <a *ngIf="commit.repoUrl" [href]="commit.repoUrl" target="_blank" rel="noopener noreferrer">
                      {{ commit.repoName }}
                    </a>
                    <span *ngIf="!commit.repoUrl">{{ commit.repoName }}</span>
                  </div>

                  <a
                    *ngIf="commit.commitUrl"
                    [href]="commit.commitUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="commit-sha"
                    title="Ver commit no GitHub"
                  >
                    <code>{{ commit.shortSha }}</code>
                    <i class="bi bi-box-arrow-up-right"></i>
                  </a>
                </div>

                <p class="commit-message">{{ commit.message || 'Commit sem mensagem' }}</p>

                <div class="commit-footer" *ngIf="commit.date">
                  <i class="bi bi-calendar3"></i>
                  <span>{{ formatCommitDate(commit.date) }}</span>
                </div>
              </div>
            </div>

            <div *ngIf="!dev.recentCommits || dev.recentCommits.length === 0" class="empty-column rk-card">
              <i class="bi bi-git"></i>
              <p>Nenhum commit recente indexado para este autor.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dev-details-page {
      max-width: 1100px;
      width: 100%;
      margin: 0 auto;
      padding: 1.5rem 1rem 4rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      box-sizing: border-box;
      overflow-x: hidden;
    }

    .back-nav {
      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-muted);
        font-size: 0.9rem;
        font-weight: 500;
        text-decoration: none;
        transition: color 0.15s ease;

        i {
          font-size: 1.1rem;
        }

        &:hover {
          color: var(--accent-blue);
          text-decoration: underline;
        }
      }
    }

    .loading-state, .error-card {
      padding: 4rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      color: var(--text-muted);

      i {
        font-size: 2.2rem;
        color: var(--accent-blue);
      }

      &.error-card i {
        color: var(--accent-red);
      }

      h3 {
        color: var(--text-main);
        font-size: 1.3rem;
      }
    }

    .details-content {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    /* Profile Hero Card */
    .profile-hero-card {
      background: #161b22;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      @media (min-width: 768px) {
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
      }
    }

    .profile-hero-main {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      @media (min-width: 600px) {
        flex-direction: row;
        gap: 1.75rem;
      }
    }

    .avatar-wrapper {
      position: relative;
      width: 104px;
      height: 104px;
      flex-shrink: 0;

      .profile-avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #30363d;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
      }

      .position-badge {
        position: absolute;
        bottom: 0;
        right: 0;
        background: #21262d;
        border: 2px solid #161b22;
        color: var(--text-main);
        font-size: 0.8rem;
        font-weight: 700;
        padding: 0.2rem 0.55rem;
        border-radius: 9999px;

        &.top1 {
          background: #e3b341;
          color: #0d1117;
        }
        &.top2 {
          background: #8b949e;
          color: #0d1117;
        }
        &.top3 {
          background: #d97706;
          color: #ffffff;
        }
      }
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .title-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.75rem;

        .dev-display-name {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }

        .tier-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          border: 1px solid;
        }
      }

      .username-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.95rem;

        .user-handle {
          color: var(--accent-blue);
          font-weight: 500;
        }

        .dot-separator {
          color: var(--text-dim);
        }

        .sync-date {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      }

      .dev-bio {
        font-size: 0.95rem;
        color: var(--text-main);
        line-height: 1.5;
        margin-top: 0.3rem;

        &.empty {
          color: var(--text-muted);
          font-style: italic;
        }
      }
    }

    .meta-tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem 1rem;
      margin-top: 0.75rem;

      .meta-item {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.84rem;
        color: var(--text-muted);

        i {
          font-size: 0.95rem;
        }

        strong {
          color: var(--text-main);
        }

        &.link-item {
          color: var(--accent-blue);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .profile-hero-actions {
      flex-shrink: 0;

      .rk-btn {
        padding: 0.65rem 1.15rem;
        font-size: 0.88rem;

        .external-icon {
          font-size: 0.75rem;
          opacity: 0.8;
        }
      }
    }

    /* Colors */
    .text-green { color: #3fb950; }
    .text-red { color: #ff7b72; }
    .text-blue { color: #58a6ff; }
    .text-purple { color: #bc8cff; }
    .text-yellow { color: #facc15; }
    .text-muted { color: #8b949e; }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;

      .metric-card {
        background: #161b22;
        border: 1px solid var(--border-color);
        border-radius: 10px;
        padding: 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;

        .metric-icon {
          width: 46px;
          height: 46px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          flex-shrink: 0;

          &.rank-icon {
            background: rgba(234, 179, 8, 0.12);
            color: #facc15;
            border: 1px solid rgba(234, 179, 8, 0.3);
          }
          &.commits-icon {
            background: rgba(46, 160, 67, 0.12);
            color: #3fb950;
            border: 1px solid rgba(46, 160, 67, 0.3);
          }
          &.streak-icon {
            background: rgba(249, 115, 22, 0.12);
            color: #fb923c;
            border: 1px solid rgba(249, 115, 22, 0.3);
          }
          &.score-icon {
            background: rgba(168, 85, 247, 0.12);
            color: #c084fc;
            border: 1px solid rgba(168, 85, 247, 0.3);
          }
        }

        .metric-content {
          display: flex;
          flex-direction: column;

          .metric-label {
            font-size: 0.78rem;
            color: var(--text-muted);
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.04em;
          }

          .metric-value {
            font-size: 1.4rem;
            font-weight: 700;
            color: var(--text-main);
            line-height: 1.25;
            margin: 0.2rem 0;
          }

          .metric-sub {
            font-size: 0.75rem;
            color: var(--text-dim);
          }
        }
      }
    }

    /* Badges Section */
    .badges-section {
      background: #161b22;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 1.5rem;

      .section-title {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--text-main);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;

        i { color: #facc15; }

        .badge-count {
          background: #21262d;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          font-size: 0.75rem;
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
        }
      }

      .badges-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;

        .badge-card {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          background: #0d1117;
          border: 1px solid var(--border-color);
          padding: 0.5rem 0.85rem;
          border-radius: 8px;
          font-size: 0.82rem;

          i {
            font-size: 1.1rem;
          }

          strong {
            color: var(--text-main);
            font-weight: 500;
          }
        }
      }
    }

    /* Content Columns: Repos & Commits */
    .content-columns {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 1.5rem;
      width: 100%;
      box-sizing: border-box;

      @media (min-width: 900px) {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      }

      .repos-column, .commits-column {
        min-width: 0;
        width: 100%;
        box-sizing: border-box;
      }

      .column-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        gap: 0.5rem;

        h3 {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 0;
          word-break: break-word;
        }

        .count-badge {
          font-size: 0.75rem;
          color: var(--text-muted);
          background: #21262d;
          padding: 0.2rem 0.5rem;
          border-radius: 9999px;
          border: 1px solid var(--border-color);
          flex-shrink: 0;
        }
      }
    }

    /* Repos Column */
    .repos-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      width: 100%;
      min-width: 0;
    }

    .repo-card {
      background: #161b22;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 0;
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
      word-break: break-word;
      overflow-wrap: break-word;
      transition: border-color 0.15s ease;

      &:hover {
        border-color: var(--border-light);
      }

      .repo-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        flex-wrap: wrap;

        .repo-name {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--accent-blue);
          text-decoration: none;
          min-width: 0;
          word-break: break-all;
          overflow-wrap: anywhere;

          .ext-sm {
            font-size: 0.7rem;
            opacity: 0.7;
            flex-shrink: 0;
          }

          &:hover {
            text-decoration: underline;
          }
        }

        .repo-visibility {
          font-size: 0.68rem;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 0.1rem 0.45rem;
          border-radius: 9999px;
          flex-shrink: 0;

          &.fork {
            color: #d29922;
            border-color: rgba(210, 153, 34, 0.4);
          }
        }
      }

      .repo-desc {
        font-size: 0.84rem;
        color: var(--text-muted);
        line-height: 1.45;
        word-break: break-word;
        overflow-wrap: anywhere;

        &.empty {
          font-style: italic;
          color: var(--text-dim);
        }
      }

      .repo-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.6rem;
        margin-top: 0.3rem;
        font-size: 0.78rem;

        .repo-lang {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--text-main);
          flex-shrink: 0;

          .lang-color {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
            background: #8b949e;

            &.lang-typescript { background: #3178c6; }
            &.lang-javascript { background: #f1e05a; }
            &.lang-java { background: #b07219; }
            &.lang-python { background: #3572a5; }
            &.lang-html { background: #e34c26; }
            &.lang-css, &.lang-scss { background: #563d7c; }
            &.lang-csharp { background: #178600; }
            &.lang-php { background: #4f5d95; }
            &.lang-go { background: #00add8; }
            &.lang-rust { background: #dea584; }
          }
        }

        .repo-stats {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-dim);
          flex-wrap: wrap;

          .stat-item {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
          }

          .update-time {
            font-size: 0.72rem;
          }
        }
      }
    }

    /* Commits Timeline */
    .commits-timeline {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      width: 100%;
      min-width: 0;
    }

    .commit-item {
      background: #161b22;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      min-width: 0;
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
      word-break: break-word;
      overflow-wrap: break-word;

      .commit-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        flex-wrap: wrap;
        font-size: 0.82rem;

        .commit-repo {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--text-muted);
          min-width: 0;
          word-break: break-all;
          overflow-wrap: anywhere;

          a {
            color: var(--text-main);
            font-weight: 500;
            text-decoration: none;
            word-break: break-all;
            overflow-wrap: anywhere;

            &:hover {
              color: var(--accent-blue);
              text-decoration: underline;
            }
          }
        }

        .commit-sha {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: var(--accent-blue);
          text-decoration: none;
          font-size: 0.78rem;
          flex-shrink: 0;

          code {
            background: #21262d;
            border: 1px solid var(--border-color);
            padding: 0.1rem 0.35rem;
            border-radius: 4px;
            color: var(--accent-blue);
          }

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .commit-message {
        font-size: 0.88rem;
        color: var(--text-main);
        font-weight: 500;
        line-height: 1.45;
        word-break: break-word;
        overflow-wrap: anywhere;
        white-space: normal;
      }

      .commit-footer {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.75rem;
        color: var(--text-dim);
        flex-wrap: wrap;
      }
    }

    .empty-column {
      padding: 2.5rem 1rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;

      i {
        font-size: 1.8rem;
        color: var(--text-dim);
      }
    }

    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    @media (max-width: 640px) {
      .profile-hero-card {
        padding: 1.25rem 1rem;
      }
      .profile-hero-main {
        align-items: center;
        text-align: center;
      }
      .profile-info .title-row {
        justify-content: center;
      }
      .profile-info .username-row {
        justify-content: center;
      }
      .meta-tags-list {
        justify-content: center;
      }
      .profile-hero-actions {
        width: 100%;
        .rk-btn {
          width: 100%;
          justify-content: center;
        }
      }
      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DeveloperDetailsComponent implements OnInit {
  username = '';
  dev: DeveloperDetails | null = null;
  isLoading = true;
  isSyncing = false;
  errorMessage = '';

  readonly badgeDefs = BADGE_DEFINITIONS;

  constructor(
    private route: ActivatedRoute,
    private rankingService: RankingService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const u = params.get('username');
      if (u) {
        this.username = u;
        this.loadDetails(u);
      }
    });
  }

  loadDetails(username: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.rankingService.getDeveloperDetails(username).subscribe({
      next: (data) => {
        if (data && data.recentCommits) {
          // Ordena sempre do mais novo até o mais velho
          data.recentCommits.sort((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
        }
        this.dev = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Falha ao carregar detalhes do desenvolvedor no GitHub.';
      }
    });
  }

  syncDevNow(): void {
    if (!this.username) return;
    this.isSyncing = true;
    this.rankingService.syncDeveloper(this.username).subscribe({
      next: (data) => {
        if (data && data.recentCommits) {
          data.recentCommits.sort((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
        }
        this.dev = data;
        this.isSyncing = false;
      },
      error: () => {
        this.isSyncing = false;
      }
    });
  }

  getBadgeInfo(badge: string): { icon: string; title: string; color: string } {
    return (this.badgeDefs as any)[badge] || {
      icon: 'bi-award-fill',
      title: badge,
      color: '#58a6ff'
    };
  }

  formatCreationDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const currentYear = new Date().getFullYear();
      const yearsDiff = currentYear - year;
      const yearsText = yearsDiff > 0 ? ` (${yearsDiff} ${yearsDiff === 1 ? 'ano' : 'anos'} de GitHub)` : '';
      return `${month} de ${year}${yearsText}`;
    } catch {
      return dateString;
    }
  }

  formatCommitDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  formatRelativeDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'hoje';
      if (diffDays === 1) return 'ontem';
      if (diffDays < 30) return `há ${diffDays} dias`;
      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths < 12) return `há ${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`;
      const diffYears = Math.floor(diffDays / 365);
      return `há ${diffYears} ${diffYears === 1 ? 'ano' : 'anos'}`;
    } catch {
      return dateString;
    }
  }

  formatUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return 'https://' + url;
  }

  cleanUrl(url: string): string {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  getLangClass(language: string): string {
    if (!language) return '';
    return 'lang-' + language.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
}
