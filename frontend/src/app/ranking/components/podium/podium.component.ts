import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankingItem } from '../../ranking.model';

@Component({
  selector: 'app-podium',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="podium-wrapper" *ngIf="topThree.length > 0">
      <!-- 2º Lugar -->
      <div class="podium-card rank-2" *ngIf="secondPlace">
        <div class="rank-crown silver">
          <i class="bi bi-award-fill"></i>
          <span>2</span>
        </div>
        <img [src]="secondPlace.avatarUrl" [alt]="secondPlace.username" class="podium-avatar silver-border" />
        <h4 class="podium-name">{{ secondPlace.name || secondPlace.username }}</h4>
        <span class="podium-handle">&#64;{{ secondPlace.username }}</span>
        <div class="podium-stat">
          <strong>{{ secondPlace.commitsInPeriod | number }}</strong> commits
        </div>
        <span class="tier-badge" [ngClass]="'tier-' + secondPlace.tier.toLowerCase()">
          {{ secondPlace.tier }}
        </span>
        <div class="podium-pedestal silver-pedestal"></div>
      </div>

      <!-- 1º Lugar -->
      <div class="podium-card rank-1" *ngIf="firstPlace">
        <div class="rank-crown gold">
          <i class="bi bi-trophy-fill"></i>
          <span>1</span>
        </div>
        <img [src]="firstPlace.avatarUrl" [alt]="firstPlace.username" class="podium-avatar gold-border" />
        <h4 class="podium-name">{{ firstPlace.name || firstPlace.username }}</h4>
        <span class="podium-handle">&#64;{{ firstPlace.username }}</span>
        <div class="podium-stat">
          <strong>{{ firstPlace.commitsInPeriod | number }}</strong> commits
        </div>
        <span class="tier-badge" [ngClass]="'tier-' + firstPlace.tier.toLowerCase()">
          {{ firstPlace.tier }}
        </span>
        <div class="podium-pedestal gold-pedestal"></div>
      </div>

      <!-- 3º Lugar -->
      <div class="podium-card rank-3" *ngIf="thirdPlace">
        <div class="rank-crown bronze">
          <i class="bi bi-award-fill"></i>
          <span>3</span>
        </div>
        <img [src]="thirdPlace.avatarUrl" [alt]="thirdPlace.username" class="podium-avatar bronze-border" />
        <h4 class="podium-name">{{ thirdPlace.name || thirdPlace.username }}</h4>
        <span class="podium-handle">&#64;{{ thirdPlace.username }}</span>
        <div class="podium-stat">
          <strong>{{ thirdPlace.commitsInPeriod | number }}</strong> commits
        </div>
        <span class="tier-badge" [ngClass]="'tier-' + thirdPlace.tier.toLowerCase()">
          {{ thirdPlace.tier }}
        </span>
        <div class="podium-pedestal bronze-pedestal"></div>
      </div>
    </div>
  `,
  styles: [`
    .podium-wrapper {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 1.5rem;
      margin: 2.5rem 0 3rem;
      padding: 1rem;
    }

    .podium-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      flex: 1;
      max-width: 240px;
      position: relative;
    }

    .rank-crown {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.9rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;

      &.gold {
        background: rgba(234, 179, 8, 0.2);
        color: #facc15;
        border: 1px solid rgba(234, 179, 8, 0.4);
      }
      &.silver {
        background: rgba(148, 163, 184, 0.2);
        color: #e2e8f0;
        border: 1px solid rgba(148, 163, 184, 0.4);
      }
      &.bronze {
        background: rgba(180, 83, 9, 0.2);
        color: #f59e0b;
        border: 1px solid rgba(180, 83, 9, 0.4);
      }
    }

    .podium-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 0.75rem;

      &.gold-border {
        width: 96px;
        height: 96px;
        box-shadow: 0 0 20px rgba(234, 179, 8, 0.3);
        border: 3px solid #facc15;
      }
      &.silver-border {
        border: 3px solid #cbd5e1;
      }
      &.bronze-border {
        border: 3px solid #d97706;
      }
    }

    .podium-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .podium-handle {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 0.35rem;
    }

    .podium-stat {
      font-size: 0.9rem;
      color: var(--text-main);
      margin-bottom: 0.5rem;
      strong {
        color: var(--accent-green-hover);
        font-size: 1.1rem;
      }
    }

    .podium-pedestal {
      width: 100%;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      margin-top: 1rem;

      &.gold-pedestal {
        height: 90px;
        background: linear-gradient(180deg, rgba(234, 179, 8, 0.2) 0%, rgba(22, 27, 34, 0.9) 100%);
        border: 1px solid rgba(234, 179, 8, 0.3);
        border-bottom: none;
      }
      &.silver-pedestal {
        height: 60px;
        background: linear-gradient(180deg, rgba(148, 163, 184, 0.15) 0%, rgba(22, 27, 34, 0.9) 100%);
        border: 1px solid rgba(148, 163, 184, 0.3);
        border-bottom: none;
      }
      &.bronze-pedestal {
        height: 40px;
        background: linear-gradient(180deg, rgba(180, 83, 9, 0.15) 0%, rgba(22, 27, 34, 0.9) 100%);
        border: 1px solid rgba(180, 83, 9, 0.3);
        border-bottom: none;
      }
    }

    @media (max-width: 640px) {
      .podium-wrapper {
        gap: 0.4rem;
        margin: 1rem 0 1.75rem;
        padding: 0.5rem 0.1rem;
        align-items: flex-end;
      }

      .podium-card {
        max-width: 33.3%;
        min-width: 0;

        &.rank-1 { order: 2; }
        &.rank-2 { order: 1; }
        &.rank-3 { order: 3; }
      }

      .rank-crown {
        padding: 0.15rem 0.4rem;
        font-size: 0.72rem;
        gap: 0.2rem;
        margin-bottom: 0.3rem;
      }

      .podium-avatar {
        width: 48px;
        height: 48px;
        margin-bottom: 0.4rem;

        &.gold-border {
          width: 62px;
          height: 62px;
          border-width: 2px;
        }
        &.silver-border {
          border-width: 2px;
        }
        &.bronze-border {
          border-width: 2px;
        }
      }

      .podium-name {
        font-size: 0.82rem;
        max-width: 100%;
      }

      .podium-handle {
        font-size: 0.68rem;
        margin-bottom: 0.2rem;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .podium-stat {
        font-size: 0.72rem;
        margin-bottom: 0.35rem;

        strong {
          font-size: 0.88rem;
        }
      }

      .tier-badge {
        font-size: 0.6rem;
        padding: 0.1rem 0.35rem;
        letter-spacing: 0;
      }

      .podium-pedestal {
        display: block;
        margin-top: 0.6rem;

        &.gold-pedestal {
          height: 60px;
        }
        &.silver-pedestal {
          height: 42px;
        }
        &.bronze-pedestal {
          height: 26px;
        }
      }
    }

    @media (max-width: 360px) {
      .podium-wrapper {
        gap: 0.25rem;
      }

      .podium-avatar {
        width: 42px;
        height: 42px;

        &.gold-border {
          width: 54px;
          height: 54px;
        }
      }

      .podium-name {
        font-size: 0.76rem;
      }

      .podium-stat strong {
        font-size: 0.8rem;
      }
    }
  `]
})
export class PodiumComponent {
  @Input() topThree: RankingItem[] = [];

  get firstPlace(): RankingItem | null {
    return this.topThree.find(i => i.position === 1) || this.topThree[0] || null;
  }

  get secondPlace(): RankingItem | null {
    return this.topThree.find(i => i.position === 2) || (this.topThree.length > 1 ? this.topThree[1] : null);
  }

  get thirdPlace(): RankingItem | null {
    return this.topThree.find(i => i.position === 3) || (this.topThree.length > 2 ? this.topThree[2] : null);
  }
}
