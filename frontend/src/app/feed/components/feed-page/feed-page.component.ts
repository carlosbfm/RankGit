import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FeedService } from '../../feed.service';
import { FeedPost } from '../../feed.model';
import { RankingService } from '../../../ranking/ranking.service';

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="feed-page fade-in">
      <!-- Header do Feed -->
      <header class="feed-header">
        <div class="feed-badge">
          <i class="bi bi-broadcast"></i>
          <span>Linha do Tempo Social</span>
        </div>
        <h1 class="page-title">Feed de Commits</h1>
        <p class="page-subtitle">
          Acompanhe em tempo real as entregas de código dos desenvolvedores monitorados, interaja com reações e vibre com cada novo commit subido no GitHub!
        </p>

        <div class="feed-header-actions">
          <button
            type="button"
            class="rk-btn rk-btn-primary btn-sync-feed"
            (click)="onSyncFeed()"
            [disabled]="feedService.isSyncing()"
          >
            <i class="bi" [ngClass]="feedService.isSyncing() ? 'bi-arrow-repeat spin' : 'bi-arrow-clockwise'"></i>
            <span>{{ feedService.isSyncing() ? 'Sincronizando Commits...' : 'Sincronizar Novos Commits' }}</span>
          </button>
        </div>
      </header>

      <!-- Alerta de Sincronização -->
      <div *ngIf="syncAlertMessage" class="status-alert success fade-in">
        <i class="bi bi-check-circle-fill"></i>
        <span>{{ syncAlertMessage }}</span>
      </div>

      <!-- Barra de Filtros e Busca -->
      <div class="filters-card rk-card">
        <!-- Filtro por Desenvolvedor (Pills) -->
        <div class="dev-filter-pills">
          <button
            type="button"
            class="filter-pill"
            [class.active]="selectedDev === 'all'"
            (click)="selectDev('all')"
          >
            <i class="bi bi-people-fill"></i>
            <span>Todos os Desenvolvedores</span>
          </button>

          <button
            *ngFor="let dev of trackedDevs"
            type="button"
            class="filter-pill"
            [class.active]="selectedDev === dev.username"
            (click)="selectDev(dev.username)"
          >
            <img [src]="dev.avatarUrl" [alt]="dev.username" class="pill-avatar" />
            <span>&#64;{{ dev.username }}</span>
          </button>
        </div>

        <!-- Campo de Busca Rápida no Feed -->
        <div class="search-row">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input
              type="text"
              placeholder="Filtrar por mensagem de commit ou repositório..."
              [(ngModel)]="searchQuery"
            />
            <button *ngIf="searchQuery" class="btn-clear" (click)="searchQuery = ''" type="button" title="Limpar">
              <i class="bi bi-x-circle-fill"></i>
            </button>
          </div>

          <div class="feed-stats-pill">
            <i class="bi bi-git"></i>
            <span>{{ totalPosts() }} commits registrados no Feed</span>
          </div>
        </div>
      </div>

      <!-- Estado de Carregamento -->
      <div *ngIf="feedService.isLoading()" class="loading-state rk-card">
        <i class="bi bi-arrow-repeat spin"></i>
        <span>Carregando linha do tempo de commits...</span>
      </div>

      <!-- Lista de Posts do Feed -->
      <div class="feed-timeline" *ngIf="!feedService.isLoading()">
        <article *ngFor="let post of filteredPosts()" class="feed-card rk-card">
          <!-- Cabeçalho do Post (Estilo Rede Social) -->
          <header class="post-header">
            <div class="author-block">
              <a [routerLink]="['/dev', post.author.username]" class="avatar-link" title="Ver perfil do desenvolvedor">
                <img [src]="post.author.avatarUrl" [alt]="post.author.username" class="author-avatar" />
              </a>

              <div class="author-info">
                <div class="author-name-row">
                  <a [routerLink]="['/dev', post.author.username]" class="author-name">
                    {{ post.author.name || post.author.username }}
                  </a>
                  <span class="author-handle">&#64;{{ post.author.username }}</span>
                  <span class="tier-badge" [ngClass]="'tier-' + post.author.tier.toLowerCase()">
                    {{ post.author.tier }}
                  </span>
                </div>

                <div class="post-meta-row">
                  <span class="post-time" [title]="post.commit.committedAt | date:'dd/MM/yyyy HH:mm:ss'">
                    <i class="bi bi-clock"></i> {{ post.timeAgo }}
                  </span>
                  <span class="dot">&bull;</span>
                  <a *ngIf="post.commit.repoUrl" [href]="post.commit.repoUrl" target="_blank" rel="noopener noreferrer" class="repo-badge">
                    <i class="bi bi-journal-code"></i>
                    <span>{{ post.commit.repoName }}</span>
                    <i class="bi bi-box-arrow-up-right ext-icon"></i>
                  </a>
                  <span *ngIf="!post.commit.repoUrl && post.commit.repoName" class="repo-badge">
                    <i class="bi bi-journal-code"></i>
                    <span>{{ post.commit.repoName }}</span>
                  </span>
                </div>
              </div>
            </div>

            <div class="header-right">
              <span class="streak-mini" title="Sequência ativa do dev">
                <i class="bi bi-fire"></i> {{ post.author.currentStreak }}d
              </span>
            </div>
          </header>

          <!-- Corpo do Post (Mensagem do Commit) -->
          <div class="post-body">
            <div class="commit-bubble">
              <div class="commit-prefix" *ngIf="getCommitPrefix(post.commit.message) as prefix">
                <span class="tag-badge" [ngClass]="'tag-' + prefix.type">
                  {{ prefix.label }}
                </span>
              </div>

              <p class="commit-text">
                {{ cleanCommitMessage(post.commit.message) }}
              </p>
            </div>

            <!-- Hash SHA e Link do GitHub -->
            <div class="commit-meta-bar">
              <a
                *ngIf="post.commit.commitUrl"
                [href]="post.commit.commitUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="commit-hash-link"
                title="Abrir este commit específico no GitHub"
              >
                <i class="bi bi-git"></i>
                <code>{{ post.shortSha }}</code>
                <i class="bi bi-box-arrow-up-right"></i>
              </a>

              <span class="commit-date-full">
                {{ post.commit.committedAt | date:'dd/MM/yyyy, HH:mm' }}
              </span>
            </div>
          </div>

          <!-- Rodapé do Post (Barra de Reações e Engajamento Social) -->
          <footer class="post-footer">
            <div class="reactions-bar">
              <!-- Reação Fogo -->
              <button
                type="button"
                class="reaction-btn fire"
                [class.active]="hasReacted(post, 'FIRE')"
                (click)="react(post, 'FIRE')"
                title="Sensacional / Fogo!"
              >
                <span class="emoji">🔥</span>
                <span class="count">{{ post.reactionsCount['FIRE'] || 0 }}</span>
              </button>

              <!-- Reação Foguete -->
              <button
                type="button"
                class="reaction-btn rocket"
                [class.active]="hasReacted(post, 'ROCKET')"
                (click)="react(post, 'ROCKET')"
                title="Mandou bem / Foguete!"
              >
                <span class="emoji">🚀</span>
                <span class="count">{{ post.reactionsCount['ROCKET'] || 0 }}</span>
              </button>

              <!-- Reação Like -->
              <button
                type="button"
                class="reaction-btn like"
                [class.active]="hasReacted(post, 'LIKE')"
                (click)="react(post, 'LIKE')"
                title="Curtir"
              >
                <span class="emoji">❤️</span>
                <span class="count">{{ post.reactionsCount['LIKE'] || 0 }}</span>
              </button>

              <!-- Reação Código -->
              <button
                type="button"
                class="reaction-btn code"
                [class.active]="hasReacted(post, 'CODE')"
                (click)="react(post, 'CODE')"
                title="Codou muito!"
              >
                <span class="emoji">💻</span>
                <span class="count">{{ post.reactionsCount['CODE'] || 0 }}</span>
              </button>

              <!-- Reação Palmas -->
              <button
                type="button"
                class="reaction-btn clap"
                [class.active]="hasReacted(post, 'CLAP')"
                (click)="react(post, 'CLAP')"
                title="Parabéns!"
              >
                <span class="emoji">👏</span>
                <span class="count">{{ post.reactionsCount['CLAP'] || 0 }}</span>
              </button>
            </div>

            <a [routerLink]="['/dev', post.author.username]" class="post-dev-link">
              <span>Ver Perfil</span>
              <i class="bi bi-chevron-right"></i>
            </a>
          </footer>
        </article>

        <!-- Estado Vazio -->
        <div *ngIf="filteredPosts().length === 0" class="empty-feed rk-card">
          <i class="bi bi-inbox"></i>
          <h3>Nenhum commit encontrado no Feed</h3>
          <p *ngIf="searchQuery">
            Não foram encontrados commits correspondentes à busca "<strong>{{ searchQuery }}</strong>".
          </p>
          <p *ngIf="!searchQuery">
            Clique no botão acima para sincronizar os commits mais recentes dos desenvolvedores monitorados!
          </p>
          <button type="button" class="rk-btn rk-btn-primary mt-3" (click)="onSyncFeed()">
            <i class="bi bi-arrow-clockwise"></i>
            <span>Sincronizar Agora</span>
          </button>
        </div>
      </div>

      <!-- Paginação do Feed -->
      <div class="pagination-bar" *ngIf="totalPosts() > 0">
        <div class="pagination-info">
          <span>
            Página <strong>{{ currentPage() + 1 }}</strong> de <strong>{{ totalPages() }}</strong>
            &bull;
            Exibindo <strong>{{ filteredPosts().length }}</strong> de <strong>{{ totalPosts() }}</strong> commits
          </span>

          <div class="page-size-selector">
            <label for="feed-page-size">Por página:</label>
            <select
              id="feed-page-size"
              class="form-control select-size"
              [ngModel]="pageSize()"
              (ngModelChange)="onPageSizeChange($event)"
            >
              <option [value]="10">10</option>
              <option [value]="15">15</option>
              <option [value]="25">25</option>
              <option [value]="50">50</option>
            </select>
          </div>
        </div>

        <div class="pagination-nav" *ngIf="totalPages() > 1">
          <button
            type="button"
            class="page-btn"
            [disabled]="currentPage() === 0"
            (click)="prevPage()"
            title="Página Anterior"
          >
            <i class="bi bi-chevron-left"></i>
            <span>Anterior</span>
          </button>

          <div class="page-numbers">
            <button
              *ngFor="let p of pageNumbers()"
              type="button"
              class="page-number-btn"
              [class.active]="p === currentPage()"
              (click)="goToPage(p)"
            >
              {{ p + 1 }}
            </button>
          </div>

          <button
            type="button"
            class="page-btn"
            [disabled]="currentPage() >= totalPages() - 1"
            (click)="nextPage()"
            title="Próxima Página"
          >
            <span>Próxima</span>
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .feed-page {
      max-width: 860px;
      margin: 0 auto;
      padding: 2rem 1rem 4rem;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .feed-header {
      text-align: center;
      max-width: 680px;
      margin: 0 auto;

      .feed-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.35rem 0.85rem;
        background: rgba(88, 166, 255, 0.15);
        color: var(--accent-blue);
        border: 1px solid rgba(88, 166, 255, 0.3);
        border-radius: 9999px;
        font-size: 0.82rem;
        font-weight: 600;
        margin-bottom: 1rem;

        i {
          animation: pulse 2s infinite ease-in-out;
        }
      }

      .page-title {
        font-size: 2.2rem;
        font-weight: 700;
        color: var(--text-main);
        letter-spacing: -0.02em;
        margin-bottom: 0.75rem;
      }

      .page-subtitle {
        font-size: 1.05rem;
        color: var(--text-muted);
        line-height: 1.6;
      }

      .feed-header-actions {
        margin-top: 1.25rem;
        display: flex;
        justify-content: center;

        .btn-sync-feed {
          padding: 0.65rem 1.25rem;
          font-size: 0.9rem;
        }
      }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.15); }
    }

    .status-alert {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      font-size: 0.88rem;

      &.success {
        background: rgba(63, 185, 80, 0.15);
        border: 1px solid rgba(63, 185, 80, 0.4);
        color: #3fb950;
      }
    }

    /* Filters Card */
    .filters-card {
      background: #161b22;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .dev-filter-pills {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;

      .filter-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        background: #0d1117;
        border: 1px solid var(--border-color);
        color: var(--text-muted);
        padding: 0.4rem 0.8rem;
        border-radius: 9999px;
        font-size: 0.82rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;

        .pill-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          object-fit: cover;
        }

        &:hover {
          color: var(--text-main);
          border-color: var(--border-light);
          background: #21262d;
        }

        &.active {
          background: var(--accent-blue);
          color: #ffffff;
          border-color: var(--accent-blue);
          font-weight: 600;
        }
      }
    }

    .search-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;

      .search-box {
        flex: 1;
        min-width: 260px;
        position: relative;
        display: flex;
        align-items: center;

        i.bi-search {
          position: absolute;
          left: 0.85rem;
          color: var(--text-dim);
          font-size: 0.85rem;
        }

        input {
          width: 100%;
          background: #0d1117;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.55rem 2.2rem 0.55rem 2.2rem;
          color: var(--text-main);
          font-size: 0.86rem;
          outline: none;
          transition: all 0.2s ease;

          &:focus {
            border-color: var(--accent-blue);
            box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15);
          }
        }

        .btn-clear {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          padding: 0.2rem;

          &:hover {
            color: var(--text-main);
          }
        }
      }

      .feed-stats-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
        color: var(--text-muted);
        background: #0d1117;
        border: 1px solid var(--border-color);
        padding: 0.4rem 0.75rem;
        border-radius: 6px;

        i {
          color: #3fb950;
        }
      }
    }

    /* Feed Timeline */
    .feed-timeline {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .feed-card {
      background: #161b22;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      transition: transform 0.15s ease, border-color 0.15s ease;

      &:hover {
        border-color: var(--border-light);
      }
    }

    .post-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;

      .author-block {
        display: flex;
        align-items: center;
        gap: 0.85rem;

        .avatar-link {
          flex-shrink: 0;

          .author-avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--border-color);
            transition: transform 0.15s ease, border-color 0.15s ease;

            &:hover {
              transform: scale(1.05);
              border-color: var(--accent-blue);
            }
          }
        }

        .author-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          .author-name-row {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;

            .author-name {
              font-weight: 700;
              color: var(--text-main);
              font-size: 0.98rem;
              text-decoration: none;

              &:hover {
                color: var(--accent-blue);
                text-decoration: underline;
              }
            }

            .author-handle {
              font-size: 0.82rem;
              color: var(--text-muted);
            }
          }

          .post-meta-row {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.45rem;
            font-size: 0.78rem;
            color: var(--text-muted);

            .post-time {
              display: inline-flex;
              align-items: center;
              gap: 0.25rem;
            }

            .dot {
              color: var(--text-dim);
            }

            .repo-badge {
              display: inline-flex;
              align-items: center;
              gap: 0.3rem;
              background: #0d1117;
              border: 1px solid var(--border-color);
              color: var(--text-main);
              padding: 0.15rem 0.5rem;
              border-radius: 4px;
              text-decoration: none;
              font-weight: 500;

              i {
                color: var(--accent-blue);
              }

              .ext-icon {
                font-size: 0.65rem;
                opacity: 0.7;
              }

              &:hover {
                border-color: var(--accent-blue);
                color: var(--accent-blue);
              }
            }
          }
        }
      }

      .header-right {
        .streak-mini {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(249, 115, 22, 0.12);
          border: 1px solid rgba(249, 115, 22, 0.3);
          color: #fb923c;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 9999px;
        }
      }
    }

    .post-body {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;

      .commit-bubble {
        background: #0d1117;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 0.85rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        .commit-prefix {
          .tag-badge {
            font-size: 0.68rem;
            font-weight: 700;
            padding: 0.15rem 0.45rem;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.05em;

            &.tag-feat { background: rgba(46, 160, 67, 0.2); color: #3fb950; border: 1px solid rgba(46, 160, 67, 0.4); }
            &.tag-fix { background: rgba(248, 81, 73, 0.2); color: #ff7b72; border: 1px solid rgba(248, 81, 73, 0.4); }
            &.tag-refactor { background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); }
            &.tag-docs { background: rgba(88, 166, 255, 0.2); color: #58a6ff; border: 1px solid rgba(88, 166, 255, 0.4); }
            &.tag-chore { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.4); }
            &.tag-style { background: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4); }
            &.tag-test { background: rgba(20, 184, 166, 0.2); color: #2dd4bf; border: 1px solid rgba(20, 184, 166, 0.4); }
          }
        }

        .commit-text {
          color: var(--text-main);
          font-size: 0.92rem;
          line-height: 1.5;
          word-break: break-word;
          font-weight: 500;
        }
      }

      .commit-meta-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.78rem;
        padding: 0 0.2rem;

        .commit-hash-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--accent-blue);
          text-decoration: none;

          code {
            background: #0d1117;
            border: 1px solid var(--border-color);
            padding: 0.1rem 0.35rem;
            border-radius: 4px;
            color: var(--accent-blue);
            font-size: 0.75rem;
          }

          &:hover {
            text-decoration: underline;
          }
        }

        .commit-date-full {
          color: var(--text-dim);
        }
      }
    }

    .post-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(48, 54, 61, 0.6);

      .reactions-bar {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.45rem;

        .reaction-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #0d1117;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 0.3rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.15s ease;

          .emoji {
            font-size: 0.95rem;
          }

          .count {
            font-weight: 600;
            font-size: 0.78rem;
          }

          &:hover {
            background: #21262d;
            border-color: var(--border-light);
            color: var(--text-main);
            transform: translateY(-1px);
          }

          &.active {
            background: rgba(88, 166, 255, 0.15);
            border-color: var(--accent-blue);
            color: #ffffff;

            &.fire { background: rgba(249, 115, 22, 0.2); border-color: #f97316; }
            &.rocket { background: rgba(168, 85, 247, 0.2); border-color: #a855f7; }
            &.like { background: rgba(248, 81, 73, 0.2); border-color: #f85149; }
            &.code { background: rgba(59, 130, 246, 0.2); border-color: #3b82f6; }
            &.clap { background: rgba(234, 179, 8, 0.2); border-color: #eab308; }
          }
        }
      }

      .post-dev-link {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        color: var(--text-dim);
        font-size: 0.82rem;
        text-decoration: none;
        transition: color 0.15s ease;

        &:hover {
          color: var(--accent-blue);
          text-decoration: underline;
        }
      }
    }

    .empty-feed {
      padding: 4rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      color: var(--text-muted);

      i {
        font-size: 2.5rem;
        color: var(--text-dim);
      }

      h3 {
        color: var(--text-main);
        font-size: 1.25rem;
      }
    }

    .loading-state {
      padding: 3rem 1.5rem;
      text-align: center;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;

      i {
        font-size: 2rem;
        color: var(--accent-blue);
      }
    }

    /* Paginação */
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 0.75rem 0.5rem;

      .pagination-info {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        font-size: 0.85rem;
        color: var(--text-muted);

        strong {
          color: var(--text-main);
        }

        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .select-size {
            width: auto;
            padding: 0.25rem 1.8rem 0.25rem 0.6rem;
            font-size: 0.8rem;
            height: auto;
          }
        }
      }

      .pagination-nav {
        display: flex;
        align-items: center;
        gap: 0.4rem;

        .page-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #21262d;
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;

          &:hover:not(:disabled) {
            background: #30363d;
            border-color: var(--border-light);
          }

          &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }
        }

        .page-numbers {
          display: flex;
          align-items: center;
          gap: 0.25rem;

          .page-number-btn {
            min-width: 30px;
            height: 30px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: 1px solid transparent;
            color: var(--text-muted);
            border-radius: 6px;
            font-size: 0.82rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;

            &:hover:not(.active) {
              background: #21262d;
              color: var(--text-main);
            }

            &.active {
              background: var(--accent-blue);
              color: #ffffff;
              font-weight: 600;
            }
          }
        }
      }
    }

    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    @media (max-width: 640px) {
      .feed-page {
        padding: 1rem 0.5rem 3rem;
      }
      .feed-header .page-title {
        font-size: 1.75rem;
      }
      .feed-card {
        padding: 1rem 0.85rem;
      }
      .post-header {
        flex-direction: column;
        gap: 0.5rem;
      }
      .post-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }
      .post-footer .reactions-bar {
        width: 100%;
        justify-content: space-between;
      }
      .pagination-bar {
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }
    }
  `]
})
export class FeedPageComponent implements OnInit {
  posts: FeedPost[] = [];
  selectedDev: string = 'all';
  searchQuery: string = '';
  syncAlertMessage: string = '';

  // Paginação
  currentPage = signal(0);
  pageSize = signal(15);
  totalPosts = signal(0);
  totalPages = signal(1);

  // Lista dos desenvolvedores rastreados para filtros rápidos
  trackedDevs: { username: string; name: string; avatarUrl: string }[] = [];

  pageNumbers = computed<number[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  constructor(
    public feedService: FeedService,
    private rankingService: RankingService
  ) {}

  ngOnInit(): void {
    this.loadTrackedDevelopers();
    this.loadFeed(true);
  }

  loadTrackedDevelopers(): void {
    this.rankingService.fetchLeaderboard({ period: 'all_time', sortBy: 'commits', page: 0, size: 50 }).subscribe({
      next: (res) => {
        this.trackedDevs = (res.leaderboard || []).map(d => ({
          username: d.username,
          name: d.name,
          avatarUrl: d.avatarUrl
        }));
      }
    });
  }

  loadFeed(autoSyncIfEmpty: boolean = false): void {
    this.feedService.getFeed(this.currentPage(), this.pageSize(), this.selectedDev).subscribe({
      next: (res) => {
        this.posts = res.posts || [];
        this.totalPosts.set(res.totalPosts || this.posts.length);
        this.totalPages.set(res.totalPages || 1);

        // Se o banco estiver vazio na primeira abertura, sincroniza automaticamente
        if (this.posts.length === 0 && autoSyncIfEmpty) {
          this.onSyncFeed(true);
        }
      }
    });
  }

  onSyncFeed(silent: boolean = false): void {
    this.syncAlertMessage = '';
    this.feedService.syncFeed().subscribe({
      next: (res) => {
        if (!silent) {
          this.syncAlertMessage = res.message;
        }
        this.loadFeed(false);
      },
      error: () => {
        if (!silent) {
          this.syncAlertMessage = 'Falha ao sincronizar com o GitHub. Tente novamente em instantes.';
        }
      }
    });
  }

  selectDev(devUsername: string): void {
    this.selectedDev = devUsername;
    this.currentPage.set(0);
    this.loadFeed();
  }

  filteredPosts(): FeedPost[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.posts;

    return this.posts.filter(p =>
      (p.commit.message && p.commit.message.toLowerCase().includes(q)) ||
      (p.commit.repoName && p.commit.repoName.toLowerCase().includes(q)) ||
      p.author.username.toLowerCase().includes(q) ||
      (p.author.name && p.author.name.toLowerCase().includes(q))
    );
  }

  hasReacted(post: FeedPost, reactionType: string): boolean {
    return post.currentUserReactions && post.currentUserReactions.includes(reactionType);
  }

  react(post: FeedPost, reactionType: string): void {
    // Atualização otimista imediata na UI
    if (!post.reactionsCount) post.reactionsCount = {};
    if (!post.currentUserReactions) post.currentUserReactions = [];

    const isCurrentlyActive = post.currentUserReactions.includes(reactionType);
    if (isCurrentlyActive) {
      post.currentUserReactions = post.currentUserReactions.filter(r => r !== reactionType);
      post.reactionsCount[reactionType] = Math.max(0, (post.reactionsCount[reactionType] || 1) - 1);
    } else {
      post.currentUserReactions.push(reactionType);
      post.reactionsCount[reactionType] = (post.reactionsCount[reactionType] || 0) + 1;
    }

    this.feedService.toggleReaction(post.sha, reactionType).subscribe({
      error: () => {
        // Reverte em caso de erro
        this.loadFeed();
      }
    });
  }

  onPageSizeChange(newSize: any): void {
    const parsed = Number(newSize);
    if (!isNaN(parsed) && parsed > 0) {
      this.pageSize.set(parsed);
      this.currentPage.set(0);
      this.loadFeed();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.loadFeed();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.loadFeed();
    }
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages() && p !== this.currentPage()) {
      this.currentPage.set(p);
      this.loadFeed();
    }
  }

  getCommitPrefix(message: string): { type: string; label: string } | null {
    if (!message) return null;
    const match = message.match(/^([a-zA-Z]+)(?:\([a-zA-Z0-9_\-.]+\))?:\s*/);
    if (match) {
      const type = match[1].toLowerCase();
      const validTypes = ['feat', 'fix', 'refactor', 'docs', 'chore', 'style', 'test'];
      if (validTypes.includes(type)) {
        return { type, label: type };
      }
    }
    return null;
  }

  cleanCommitMessage(message: string): string {
    if (!message) return 'Commit sem mensagem';
    return message.split('\n')[0];
  }
}
