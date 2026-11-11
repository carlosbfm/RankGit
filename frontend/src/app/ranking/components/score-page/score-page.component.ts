import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-score-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="score-page fade-in">
      <!-- Header -->
      <header class="score-header">
        <div class="score-badge">
          <i class="bi bi-stars"></i>
          <span>Sistema de Pontuação</span>
        </div>
        <h1 class="page-title">Como Funciona o Score RankGit?</h1>
        <p class="page-subtitle">
          O <strong>Score RankGit</strong> foi desenhado para premiar não apenas a quantidade bruta de código, mas principalmente a <strong>consistência</strong> e a disciplina contínua de contribuição.
        </p>
      </header>

      <!-- Fórmula Matemática Central -->
      <section class="formula-section rk-card">
        <h3 class="section-title"><i class="bi bi-calculator"></i> A Fórmula do Score</h3>
        <div class="formula-box">
          <span class="formula-part highlight">Score Total</span>
          <span class="formula-op">=</span>
          <span class="formula-part">
            (<strong>Commits no Período</strong> &times; 10)
          </span>
          <span class="formula-op">+</span>
          <span class="formula-part">
            (<strong>Sequência Ativa (Streak)</strong> &times; 25)
          </span>
        </div>
        <p class="formula-note">
          * A contagem de commits respeita estritamente o filtro de período selecionado (Geral, Este Ano, Este Mês, Esta Semana ou Hoje).
        </p>
      </section>

      <!-- Cards de Pesos e Critérios -->
      <section class="weights-grid">
        <div class="weight-card rk-card">
          <div class="weight-icon commits">
            <i class="bi bi-git"></i>
          </div>
          <div class="weight-content">
            <span class="multiplier">+10 Pontos</span>
            <h3>Por Cada Commit</h3>
            <p>
              Cada commit realizado dentro do intervalo de tempo selecionado adiciona 10 pontos ao score do desenvolvedor.
            </p>
          </div>
        </div>

        <div class="weight-card rk-card highlight">
          <div class="weight-icon streak">
            <i class="bi bi-fire"></i>
          </div>
          <div class="weight-content">
            <span class="multiplier streak-mult">+25 Pontos/Dia</span>
            <h3>Consistência (Streak Diária)</h3>
            <p>
              Programar com constância é o pilar do RankGit. Cada dia consecutivo com commits ativos confere um bônus de 25 pontos.
            </p>
          </div>
        </div>

        <div class="weight-card rk-card">
          <div class="weight-icon podium">
            <i class="bi bi-trophy"></i>
          </div>
          <div class="weight-content">
            <span class="multiplier podium-mult">Destaque</span>
            <h3>Pódio Competitivo</h3>
            <p>
              Os três maiores pontuadores do ranking geral garantem lugar de honra no Pódio com medalhas de Ouro, Prata e Bronze.
            </p>
          </div>
        </div>
      </section>

      <!-- Tiers e Ligas Competitivas -->
      <section class="tiers-section rk-card">
        <h3 class="section-title"><i class="bi bi-shield-shaded"></i> Ligas e Tiers Competitivos</h3>
        <p class="section-desc">
          Conforme seu score aumenta, seu perfil é promovido automaticamente de divisão:
        </p>

        <div class="tiers-grid">
          <div class="tier-item tier-bronze">
            <div class="tier-crown"><i class="bi bi-shield"></i></div>
            <h4>Bronze</h4>
            <span class="tier-range">0 - 499 pts</span>
            <p>Primeiros passos e contribuições iniciais.</p>
          </div>

          <div class="tier-item tier-silver">
            <div class="tier-crown"><i class="bi bi-shield-check"></i></div>
            <h4>Prata</h4>
            <span class="tier-range">500 - 1.499 pts</span>
            <p>Ritmo estável de contribuições no GitHub.</p>
          </div>

          <div class="tier-item tier-gold">
            <div class="tier-crown"><i class="bi bi-shield-fill-check"></i></div>
            <h4>Ouro</h4>
            <span class="tier-range">1.500 - 3.499 pts</span>
            <p>Desenvolvedor ativo com commits regulares.</p>
          </div>

          <div class="tier-item tier-platinum">
            <div class="tier-crown"><i class="bi bi-gem"></i></div>
            <h4>Platina</h4>
            <span class="tier-range">3.500 - 6.999 pts</span>
            <p>Alto impacto, consistência e frequência.</p>
          </div>

          <div class="tier-item tier-diamond">
            <div class="tier-crown"><i class="bi bi-suit-diamond-fill"></i></div>
            <h4>Diamante</h4>
            <span class="tier-range">7.000 - 11.999 pts</span>
            <p>Elite de desenvolvedores open source.</p>
          </div>

          <div class="tier-item tier-grandmaster">
            <div class="tier-crown"><i class="bi bi-award-fill"></i></div>
            <h4>Grandmaster</h4>
            <span class="tier-range">12.000+ pts</span>
            <p>Lendas vivas da programação mundial.</p>
          </div>
        </div>
      </section>

      <!-- Badges e Conquistas -->
      <section class="badges-section rk-card">
        <h3 class="section-title"><i class="bi bi-award"></i> Conquistas e Badges</h3>
        <div class="badges-grid">
          <div class="badge-item">
            <i class="bi bi-cpu-fill badge-ico" style="color: #bc8cff;"></i>
            <div>
              <h4>Commit Machine</h4>
              <p>Concedido a quem atinge mais de 1.000 commits.</p>
            </div>
          </div>

          <div class="badge-item">
            <i class="bi bi-fire badge-ico" style="color: #f97316;"></i>
            <div>
              <h4>Streak Master</h4>
              <p>Manter 14 ou mais dias consecutivos de commits.</p>
            </div>
          </div>

          <div class="badge-item">
            <i class="bi bi-trophy-fill badge-ico" style="color: #e3b341;"></i>
            <div>
              <h4>Podium Champion</h4>
              <p>Top 3 colocado no ranking geral de desenvolvedores.</p>
            </div>
          </div>

          <div class="badge-item">
            <i class="bi bi-lightning-charge-fill badge-ico" style="color: #3fb950;"></i>
            <div>
              <h4>Weekly Sprinter</h4>
              <p>Mais de 20 commits realizados em uma única semana.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Ações de Navegação -->
      <div class="score-actions">
        <a routerLink="/ranking" class="rk-btn rk-btn-primary">
          <i class="bi bi-trophy"></i>
          <span>Ver Ranking e Pódio</span>
        </a>
        <a routerLink="/commits" class="rk-btn rk-btn-secondary">
          <i class="bi bi-table"></i>
          <span>Explorar Tabela de Commits</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .score-page {
      max-width: 980px;
      margin: 0 auto;
      padding: 2rem 1rem 4rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .score-header {
      text-align: center;
      max-width: 720px;
      margin: 0 auto;

      .score-badge {
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

        strong {
          color: var(--text-main);
        }
      }
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;

      i {
        color: var(--accent-blue);
      }
    }

    .section-desc {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }

    /* Fórmula */
    .formula-section {
      background: #161b22;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;

      .formula-box {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.85rem;
        background: #0d1117;
        border: 1px solid var(--border-color);
        padding: 1.25rem 1.75rem;
        border-radius: 8px;
        font-family: var(--font-mono);
        font-size: 1.15rem;
        margin: 1.25rem 0;

        .formula-part {
          color: var(--text-main);
          strong {
            color: var(--accent-green-hover);
          }

          &.highlight {
            color: var(--accent-yellow);
            font-weight: 700;
          }
        }

        .formula-op {
          color: var(--text-dim);
          font-weight: 700;
        }
      }

      .formula-note {
        font-size: 0.82rem;
        color: var(--text-dim);
      }
    }

    /* Grid de Pesos */
    .weights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;

      .weight-card {
        background: #161b22;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        gap: 1.25rem;
        transition: all 0.2s ease;

        &:hover {
          border-color: #8b949e;
          transform: translateY(-2px);
        }

        &.highlight {
          border-color: rgba(249, 115, 22, 0.4);
          background: radial-gradient(circle at top right, rgba(249, 115, 22, 0.08), #161b22);
        }

        .weight-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          flex-shrink: 0;

          &.commits {
            background: rgba(46, 160, 67, 0.15);
            color: #3fb950;
          }

          &.streak {
            background: rgba(249, 115, 22, 0.15);
            color: #f97316;
          }

          &.podium {
            background: rgba(227, 179, 65, 0.15);
            color: #e3b341;
          }
        }

        .weight-content {
          .multiplier {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #3fb950;
            display: block;
            margin-bottom: 0.25rem;

            &.streak-mult { color: #f97316; }
            &.podium-mult { color: #e3b341; }
          }

          h3 {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-main);
            margin-bottom: 0.5rem;
          }

          p {
            font-size: 0.88rem;
            color: var(--text-muted);
            line-height: 1.45;
          }
        }
      }
    }

    /* Tiers Grid */
    .tiers-section {
      background: #161b22;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 2rem;

      .tiers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
      }

      .tier-item {
        background: #0d1117;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1.25rem 0.85rem;
        text-align: center;
        transition: all 0.2s;

        &:hover {
          transform: translateY(-2px);
        }

        .tier-crown {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }

        h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.35rem;
        }

        .tier-range {
          font-size: 0.78rem;
          font-family: var(--font-mono);
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        p {
          font-size: 0.75rem;
          color: var(--text-dim);
          line-height: 1.3;
        }

        &.tier-bronze {
          border-color: rgba(205, 127, 50, 0.4);
          .tier-crown, h4, .tier-range { color: #cd7f32; }
        }
        &.tier-silver {
          border-color: rgba(192, 192, 192, 0.4);
          .tier-crown, h4, .tier-range { color: #c0c0c0; }
        }
        &.tier-gold {
          border-color: rgba(227, 179, 65, 0.4);
          .tier-crown, h4, .tier-range { color: #e3b341; }
        }
        &.tier-platinum {
          border-color: rgba(69, 182, 156, 0.4);
          .tier-crown, h4, .tier-range { color: #45b69c; }
        }
        &.tier-diamond {
          border-color: rgba(88, 166, 255, 0.4);
          .tier-crown, h4, .tier-range { color: #58a6ff; }
        }
        &.tier-grandmaster {
          border-color: rgba(188, 140, 255, 0.4);
          .tier-crown, h4, .tier-range { color: #bc8cff; }
        }
      }
    }

    /* Badges Grid */
    .badges-section {
      background: #161b22;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 2rem;

      .badges-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        gap: 1.25rem;
      }

      .badge-item {
        display: flex;
        align-items: flex-start;
        gap: 0.85rem;
        background: #0d1117;
        border: 1px solid var(--border-color);
        padding: 1rem;
        border-radius: 8px;

        .badge-ico {
          font-size: 1.6rem;
          flex-shrink: 0;
        }

        h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.25rem;
        }

        p {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.4;
        }
      }
    }

    .score-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
    }

    @media (max-width: 640px) {
      .score-page {
        padding: 1.5rem 0.5rem 3rem;
      }
      .page-title {
        font-size: 1.75rem;
      }
      .formula-section .formula-box {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.5rem;
        font-size: 0.95rem;
        padding: 1rem;
      }
      .weights-grid {
        grid-template-columns: 1fr;
      }
      .tiers-section {
        padding: 1.25rem 1rem;
      }
      .tiers-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .badges-section {
        padding: 1.25rem 1rem;
      }
      .badges-grid {
        grid-template-columns: 1fr;
      }
      .score-actions {
        flex-direction: column;
        .rk-btn {
          width: 100%;
        }
      }
    }
  `]
})
export class ScorePageComponent {}
