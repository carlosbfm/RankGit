import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RankingService } from '../../ranking.service';
import { RankingItem } from '../../ranking.model';
import { PodiumComponent } from '../podium/podium.component';

@Component({
  selector: 'app-ranking-page',
  standalone: true,
  imports: [CommonModule, RouterLink, PodiumComponent],
  template: `
    <div class="ranking-page fade-in">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-badge">
          <i class="bi bi-trophy-fill"></i>
          <span>Pódio e Destaques</span>
        </div>
        <h1 class="hero-title">Ranking de Desenvolvedores</h1>
        <p class="hero-subtitle">
          Acompanhe os líderes de contribuição, suas medalhas, sequências ativas de commits e pontuações do RankGit.
        </p>

        <div class="hero-actions">
          <a routerLink="/commits" class="rk-btn rk-btn-primary">
            <i class="bi bi-table"></i>
            <span>Ver Tabela de Commits</span>
          </a>
          <a routerLink="/score" class="rk-btn rk-btn-secondary">
            <i class="bi bi-stars"></i>
            <span>Como Funciona o Score</span>
          </a>
        </div>
      </section>

      <!-- Pódio Oficial Top 3 -->
      <section class="podium-section" *ngIf="topThree().length > 0">
        <app-podium [topThree]="topThree()"></app-podium>
      </section>

      <!-- Cards de Destaque dos Desenvolvedores Monitorados -->
      <section class="devs-cards-section">
        <div class="section-header">
          <h3><i class="bi bi-people-fill"></i> Desenvolvedores no Ranking Geral</h3>
          <span class="count-pill">{{ allDevelopers().length }} Desenvolvedores</span>
        </div>

        <div class="devs-grid">
          <div *ngFor="let dev of allDevelopers()" class="dev-card rk-card">
            <div class="dev-card-header">
              <span class="rank-pos">#{{ dev.position }}</span>
              <span class="tier-pill" [ngClass]="'tier-' + dev.tier.toLowerCase()">
                {{ dev.tier }}
              </span>
            </div>

            <div class="dev-card-body">
              <img [src]="dev.avatarUrl" [alt]="dev.username" class="dev-avatar" />
              <h4 class="dev-name">{{ dev.name || dev.username }}</h4>
              <span class="dev-user">&#64;{{ dev.username }}</span>

              <div class="dev-metrics">
                <div class="metric-box">
                  <span class="metric-val text-green">{{ dev.commitsInPeriod | number }}</span>
                  <span class="metric-label">Commits</span>
                </div>
                <div class="metric-box">
                  <span class="metric-val text-orange">
                    <i class="bi bi-fire"></i> {{ dev.currentStreak }}d
                  </span>
                  <span class="metric-label">Sequência</span>
                </div>
                <div class="metric-box">
                  <span class="metric-val text-yellow">{{ dev.score | number }}</span>
                  <span class="metric-label">Score</span>
                </div>
              </div>
            </div>

            <div class="dev-card-footer">
              <a [href]="dev.htmlUrl" target="_blank" rel="noopener noreferrer" class="link-gh">
                <i class="bi bi-github"></i>
                <span>Ver no GitHub</span>
              </a>
              <a
                [routerLink]="['/dev', dev.username]"
                class="btn-icon-details"
                title="Ver detalhes de @{{ dev.username }}"
              >
                <i class="bi bi-person-badge"></i>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .ranking-page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem 1rem 4rem;
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }

    .hero-section {
      text-align: center;
      max-width: 720px;
      margin: 0 auto;

      .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.35rem 0.85rem;
        background: rgba(227, 179, 65, 0.15);
        color: var(--accent-yellow);
        border: 1px solid rgba(227, 179, 65, 0.3);
        border-radius: 9999px;
        font-size: 0.82rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }

      .hero-title {
        font-size: 2.4rem;
        font-weight: 700;
        color: var(--text-main);
        letter-spacing: -0.02em;
        margin-bottom: 0.75rem;
      }

      .hero-subtitle {
        font-size: 1.05rem;
        color: var(--text-muted);
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }

      .hero-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
      }
    }

    .podium-section {
      margin-top: 1rem;
    }

    .devs-cards-section {
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.25rem;

        h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 0.5rem;

          i {
            color: var(--accent-blue);
          }
        }

        .count-pill {
          font-size: 0.78rem;
          background: #21262d;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          font-weight: 500;
        }
      }

      .devs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1.25rem;
      }

      .dev-card {
        background: #161b22;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: all 0.2s ease;

        &:hover {
          border-color: #8b949e;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
        }

        .dev-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.85rem;

          .rank-pos {
            font-size: 1.1rem;
            font-weight: 800;
            font-family: var(--font-mono);
            color: var(--text-dim);
          }

          .tier-pill {
            font-size: 0.68rem;
            font-weight: 700;
            padding: 0.15rem 0.5rem;
            border-radius: 9999px;
            text-transform: uppercase;

            &.tier-bronze { background: rgba(205, 127, 50, 0.2); color: #cd7f32; }
            &.tier-silver { background: rgba(192, 192, 192, 0.2); color: #c0c0c0; }
            &.tier-gold { background: rgba(227, 179, 65, 0.2); color: #e3b341; }
            &.tier-platinum { background: rgba(69, 182, 156, 0.2); color: #45b69c; }
            &.tier-diamond { background: rgba(88, 166, 255, 0.2); color: #58a6ff; }
            &.tier-grandmaster { background: rgba(188, 140, 255, 0.2); color: #bc8cff; }
          }
        }

        .dev-card-body {
          text-align: center;
          margin-bottom: 1.25rem;

          .dev-avatar {
            width: 68px;
            height: 68px;
            border-radius: 50%;
            border: 2px solid var(--border-color);
            margin: 0 auto 0.75rem;
            object-fit: cover;
          }

          .dev-name {
            font-size: 1.05rem;
            font-weight: 600;
            color: var(--text-main);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .dev-user {
            font-size: 0.82rem;
            color: var(--text-muted);
            display: block;
            margin-bottom: 1rem;
          }

          .dev-metrics {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
            background: #0d1117;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 0.65rem 0.35rem;

            .metric-box {
              display: flex;
              flex-direction: column;

              .metric-val {
                font-size: 0.95rem;
                font-weight: 700;
                font-family: var(--font-mono);

                &.text-green { color: var(--accent-green-hover); }
                &.text-orange { color: #f97316; }
                &.text-yellow { color: var(--accent-yellow); }
              }

              .metric-label {
                font-size: 0.68rem;
                color: var(--text-dim);
                text-transform: uppercase;
                margin-top: 0.15rem;
              }
            }
          }
        }

        .dev-card-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .link-gh {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            font-size: 0.82rem;
            color: var(--text-muted);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.15s ease;

            i {
              font-size: 0.95rem;
            }

            &:hover {
              color: var(--accent-blue);
            }
          }

          .btn-icon-details {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 6px;
            background: #21262d;
            border: 1px solid var(--border-color);
            color: var(--text-muted);
            font-size: 0.88rem;
            text-decoration: none;
            transition: all 0.15s ease;

            &:hover {
              color: var(--accent-blue);
              border-color: var(--accent-blue);
              background: rgba(88, 166, 255, 0.12);
            }
          }
        }
      }
    }

    @media (max-width: 640px) {
      .ranking-page {
        padding: 1.5rem 0.5rem 3rem;
      }
      .hero-section .hero-title {
        font-size: 1.8rem;
      }
      .hero-section .hero-actions {
        flex-direction: column;
        .rk-btn {
          width: 100%;
        }
      }
      .devs-cards-section .devs-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RankingPageComponent implements OnInit {
  constructor(public rankingService: RankingService) {}

  topThree = computed<RankingItem[]>(() => {
    const data = this.rankingService.leaderboardData();
    if (data?.topThree && data.topThree.length > 0) {
      return data.topThree;
    }
    const list = data?.leaderboard;
    return list && list.length > 0 ? list.slice(0, 3) : [];
  });

  allDevelopers = computed<RankingItem[]>(() => {
    return this.rankingService.leaderboardData()?.leaderboard || [];
  });

  ngOnInit(): void {
    // Carrega o ranking geral
    this.rankingService.fetchLeaderboard({ period: 'all_time', sortBy: 'commits', page: 0, size: 10 }).subscribe();
  }
}
