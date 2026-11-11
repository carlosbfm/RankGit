import { Component, EventEmitter, OnInit, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService, AdminUserFormData, AdminUsersPageResponse } from '../../admin.service';
import { UserProfile } from '../../../auth/auth.model';
import { RankingService } from '../../../ranking/ranking.service';
import { RankingItem } from '../../../ranking/ranking.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-page fade-in">
      <!-- Header da Página -->
      <header class="admin-header">
        <div class="admin-badge">
          <i class="bi bi-shield-lock-fill"></i>
          <span>Área Administrativa</span>
        </div>
        <h1 class="page-title">Painel de Controle</h1>
        <p class="page-subtitle">
          Gerencie os desenvolvedores rastreados no ranking e administre as contas e aprovações de acesso dos usuários.
        </p>
      </header>

      <div class="admin-card rk-card">
        <!-- Navigation Tabs -->
        <div class="admin-tabs">
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab === 'developers'"
            (click)="setTab('developers')"
          >
            <i class="bi bi-git"></i>
            <span>Rastreamento de Devs</span>
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab === 'users'"
            (click)="setTab('users')"
          >
            <i class="bi bi-people-fill"></i>
            <span>Gestão de Usuários</span>
          </button>
        </div>

        <!-- Mensagens Globais de Status -->
        <div class="status-alert error" *ngIf="errorMessage">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <div class="status-alert success" *ngIf="successMessage">
          <i class="bi bi-check-circle-fill"></i>
          <span>{{ successMessage }}</span>
        </div>

        <!-- ========================================== -->
        <!-- ABA 1: GERENCIAR DEVS DO RANKING          -->
        <!-- ========================================== -->
        <div class="tab-content" *ngIf="activeTab === 'developers'">
          <div class="dev-actions-grid">
            <!-- Form Adicionar Dev -->
            <div class="sub-card">
              <h4 class="sub-title"><i class="bi bi-person-plus-fill"></i> Adicionar Desenvolvedor</h4>
              <p class="sub-desc">
                Adicione desenvolvedores ao ranking colando o link do perfil do GitHub ou o &#64;username.
              </p>

              <form (ngSubmit)="onAddDeveloper()" class="dev-form">
                <div class="input-group">
                  <span class="input-icon"><i class="bi bi-github"></i></span>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="ex: https://github.com/fulano ou fulano"
                    [(ngModel)]="githubInput"
                    name="githubInput"
                    [disabled]="adminService.isProcessing()"
                    required
                  />
                </div>

                <button
                  type="submit"
                  class="rk-btn rk-btn-primary"
                  [disabled]="!githubInput.trim() || adminService.isProcessing()"
                >
                  <i class="bi" [ngClass]="adminService.isProcessing() ? 'bi-arrow-repeat spin' : 'bi-plus-circle'"></i>
                  <span>{{ adminService.isProcessing() ? 'Buscando...' : 'Adicionar ao Ranking' }}</span>
                </button>
              </form>
            </div>

            <!-- Sync em Lote -->
            <div class="sub-card">
              <h4 class="sub-title"><i class="bi bi-arrow-repeat"></i> Sincronização em Lote</h4>
              <p class="sub-desc">
                Atualiza os commits, streaks e pontuações de todos os desenvolvedores na API pública do GitHub.
              </p>

              <button
                class="rk-btn rk-btn-secondary btn-sync-all"
                (click)="onSyncAll()"
                [disabled]="adminService.isProcessing()"
              >
                <i class="bi" [ngClass]="adminService.isProcessing() ? 'bi-arrow-repeat spin' : 'bi-arrow-clockwise'"></i>
                <span>Sincronizar Todos os Desenvolvedores</span>
              </button>
            </div>
          </div>

          <hr class="separator" />

          <!-- Tabela de Desenvolvedores Monitorados -->
          <div class="table-container">
            <div class="table-header-row">
              <div>
                <h4 class="table-title">Desenvolvedores Monitorados no Ranking</h4>
                <p class="table-subtitle">Lista de perfis sincronizados com cálculo de score e streak ativo.</p>
              </div>
              <span class="badge-count">{{ devsTotal() }} Desenvolvedor(es)</span>
            </div>

            <div *ngIf="isLoadingDevs" class="loading-state">
              <i class="bi bi-arrow-repeat spin"></i>
              <span>Carregando desenvolvedores...</span>
            </div>

            <div class="table-responsive" *ngIf="!isLoadingDevs">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Desenvolvedor</th>
                    <th>Commits Totais</th>
                    <th>Sequência (Streak)</th>
                    <th>Score</th>
                    <th class="text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let d of trackedDevelopers">
                    <td>
                      <div class="user-cell">
                        <img [src]="d.avatarUrl" [alt]="d.username" class="user-avatar-sm" />
                        <div class="user-details">
                          <strong class="user-name">{{ d.name || d.username }}</strong>
                          <a [href]="'https://github.com/' + d.username" target="_blank" rel="noopener noreferrer" class="user-sub">
                            &#64;{{ d.username }} <i class="bi bi-box-arrow-up-right external-icon"></i>
                          </a>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="commits-badge">
                        <i class="bi bi-git"></i>
                        <strong>{{ d.totalCommits | number }}</strong>
                      </span>
                    </td>
                    <td>
                      <span class="streak-pill">
                        <i class="bi bi-fire"></i> {{ d.currentStreak }} dias
                      </span>
                    </td>
                    <td>
                      <span class="score-pill">
                        <i class="bi bi-stars"></i> {{ d.score | number }} pts
                      </span>
                    </td>
                    <td class="text-right">
                      <div class="actions-group">
                        <a
                          [routerLink]="['/dev', d.username]"
                          class="btn-action-icon edit"
                          title="Ver detalhes completos do desenvolvedor"
                        >
                          <i class="bi bi-person-badge"></i>
                        </a>
                        <button
                          type="button"
                          class="btn-action-icon delete"
                          (click)="deleteDeveloper(d)"
                          title="Excluir do Ranking"
                        >
                          <i class="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr *ngIf="trackedDevelopers.length === 0">
                    <td colspan="5" class="text-center empty-state-cell">
                      <i class="bi bi-inbox"></i>
                      <span>Nenhum desenvolvedor monitorado no momento.</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Paginação dos Desenvolvedores -->
            <div class="pagination-bar" *ngIf="devsTotal() > 0">
              <div class="pagination-info">
                <span>
                  Mostrando
                  <strong>{{ (devsPage() * devsPageSize()) + (trackedDevelopers.length > 0 ? 1 : 0) }}</strong>
                  a
                  <strong>{{ Math.min((devsPage() + 1) * devsPageSize(), devsTotal()) }}</strong>
                  de
                  <strong>{{ devsTotal() }}</strong> desenvolvedores
                </span>

                <div class="page-size-selector">
                  <label for="devs-page-size">Exibir:</label>
                  <select
                    id="devs-page-size"
                    class="form-control select-size"
                    [ngModel]="devsPageSize()"
                    (ngModelChange)="onDevsPageSizeChange($event)"
                  >
                    <option [value]="5">5 por pág.</option>
                    <option [value]="10">10 por pág.</option>
                    <option [value]="25">25 por pág.</option>
                    <option [value]="50">50 por pág.</option>
                  </select>
                </div>
              </div>

              <div class="pagination-nav" *ngIf="devsTotalPages() > 1">
                <button
                  type="button"
                  class="page-btn"
                  [disabled]="devsPage() === 0"
                  (click)="prevDevsPage()"
                  title="Página Anterior"
                >
                  <i class="bi bi-chevron-left"></i>
                  <span>Anterior</span>
                </button>

                <div class="page-numbers">
                  <button
                    *ngFor="let p of devsPageNumbers()"
                    type="button"
                    class="page-number-btn"
                    [class.active]="p === devsPage()"
                    (click)="goToDevsPage(p)"
                  >
                    {{ p + 1 }}
                  </button>
                </div>

                <button
                  type="button"
                  class="page-btn"
                  [disabled]="devsPage() >= devsTotalPages() - 1"
                  (click)="nextDevsPage()"
                  title="Próxima Página"
                >
                  <span>Próxima</span>
                  <i class="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- ABA 2: CRUD DE USUÁRIOS                   -->
        <!-- ========================================== -->
        <div class="tab-content" *ngIf="activeTab === 'users'">
          <!-- Cabeçalho do CRUD de Usuários -->
          <div class="users-header">
            <div>
              <h4 class="table-title">Contas de Usuários do Sistema</h4>
              <p class="table-subtitle">Gerencie permissões de acesso, crie novos acessos ou aprove contas pendentes.</p>
            </div>
            <button
              *ngIf="!showUserForm"
              type="button"
              class="rk-btn rk-btn-primary btn-sm"
              (click)="openCreateUser()"
            >
              <i class="bi bi-person-plus-fill"></i>
              <span>Novo Usuário</span>
            </button>
          </div>

          <!-- Formulário de Criar/Editar Usuário -->
          <div *ngIf="showUserForm" class="user-form-card fade-in">
            <h5 class="form-title">
              <i class="bi" [ngClass]="editingUserId ? 'bi-pencil-square' : 'bi-person-plus'"></i>
              <span>{{ editingUserId ? 'Editar Dados do Usuário' : 'Cadastrar Novo Usuário' }}</span>
            </h5>

            <form (ngSubmit)="saveUser()">
              <div class="form-grid">
                <div class="form-field">
                  <label>Nome de Usuário *</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="ex: joao"
                    [(ngModel)]="userFormData.username"
                    name="username"
                    required
                  />
                </div>

                <div class="form-field">
                  <label>Perfil de Acesso *</label>
                  <select
                    class="form-control select-role"
                    [(ngModel)]="userFormData.role"
                    name="role"
                  >
                    <option value="ROLE_USER">Usuário Comum (ROLE_USER)</option>
                    <option value="ROLE_ADMIN">Administrador (ROLE_ADMIN)</option>
                  </select>
                </div>

                <div class="form-field">
                  <label>Nome Completo</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="ex: João da Silva"
                    [(ngModel)]="userFormData.name"
                    name="name"
                  />
                </div>

                <div class="form-field">
                  <label>E-mail</label>
                  <input
                    type="email"
                    class="form-control"
                    placeholder="ex: joao@email.com"
                    [(ngModel)]="userFormData.email"
                    name="email"
                  />
                </div>

                <div class="form-field full-width">
                  <label>
                    {{ editingUserId ? 'Nova Senha (deixe vazio para não alterar)' : 'Senha de Acesso *' }}
                  </label>
                  <input
                    type="password"
                    class="form-control"
                    placeholder="Mínimo 4 caracteres"
                    [(ngModel)]="userFormData.password"
                    name="password"
                    [required]="!editingUserId"
                  />
                </div>

                <div class="form-field full-width" *ngIf="editingUserId">
                  <label class="custom-checkbox-container">
                    <input
                      type="checkbox"
                      [(ngModel)]="userFormData.approved"
                      name="approved"
                    />
                    <span class="checkmark"></span>
                    <span class="label-text">Conta Aprovada (liberada para login na aplicação)</span>
                  </label>
                </div>
              </div>

              <div class="form-actions mt-3">
                <button type="button" class="rk-btn rk-btn-secondary" (click)="cancelUserForm()">
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="rk-btn rk-btn-primary"
                  [disabled]="!userFormData.username || (!editingUserId && !userFormData.password)"
                >
                  <i class="bi bi-check2"></i>
                  <span>{{ editingUserId ? 'Salvar Alterações' : 'Criar Usuário' }}</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Tabela de Usuários -->
          <div *ngIf="!showUserForm" class="table-container">
            <div *ngIf="isLoadingUsers" class="loading-state">
              <i class="bi bi-arrow-repeat spin"></i>
              <span>Carregando usuários...</span>
            </div>

            <div class="table-responsive" *ngIf="!isLoadingUsers">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    <th class="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let u of users">
                    <td>
                      <div class="user-cell">
                        <img [src]="u.avatarUrl" [alt]="u.username" class="user-avatar-sm" />
                        <div class="user-details">
                          <strong class="user-name">{{ u.name || u.username }}</strong>
                          <span class="user-sub">&#64;{{ u.username }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span *ngIf="u.email" class="email-text">{{ u.email }}</span>
                      <span *ngIf="!u.email" class="empty-field">Não informado</span>
                    </td>
                    <td>
                      <span class="role-badge" [class.admin]="u.role === 'ROLE_ADMIN'" [class.user]="u.role !== 'ROLE_ADMIN'">
                        <i class="bi" [ngClass]="u.role === 'ROLE_ADMIN' ? 'bi-shield-lock-fill' : 'bi-person-fill'"></i>
                        <span>{{ u.role === 'ROLE_ADMIN' ? 'Admin' : 'Usuário' }}</span>
                      </span>
                    </td>
                    <td>
                      <span class="status-badge" [class.approved]="u.approved" [class.pending]="!u.approved">
                        <i class="bi" [ngClass]="u.approved ? 'bi-check-circle-fill' : 'bi-hourglass-split'"></i>
                        <span>{{ u.approved ? 'Liberado' : 'Pendente' }}</span>
                      </span>
                    </td>
                    <td class="text-right">
                      <div class="actions-group">
                        <button
                          type="button"
                          class="btn-action-icon"
                          [class.approve]="!u.approved"
                          [class.revoke]="u.approved"
                          (click)="toggleApproval(u)"
                          [title]="u.approved ? 'Revogar acesso' : 'Aprovar usuário'"
                        >
                          <i class="bi" [ngClass]="u.approved ? 'bi-person-x-fill' : 'bi-person-check-fill'"></i>
                        </button>
                        <button
                          type="button"
                          class="btn-action-icon edit"
                          (click)="openEditUser(u)"
                          title="Editar dados e senha"
                        >
                          <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          type="button"
                          class="btn-action-icon delete"
                          (click)="deleteUser(u)"
                          title="Excluir usuário"
                        >
                          <i class="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr *ngIf="users.length === 0">
                    <td colspan="5" class="text-center empty-state-cell">
                      <i class="bi bi-inbox"></i>
                      <span>Nenhum usuário cadastrado.</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Paginação dos Usuários -->
            <div class="pagination-bar" *ngIf="usersTotal() > 0">
              <div class="pagination-info">
                <span>
                  Mostrando
                  <strong>{{ (usersPage() * usersPageSize()) + (users.length > 0 ? 1 : 0) }}</strong>
                  a
                  <strong>{{ Math.min((usersPage() + 1) * usersPageSize(), usersTotal()) }}</strong>
                  de
                  <strong>{{ usersTotal() }}</strong> contas
                </span>

                <div class="page-size-selector">
                  <label for="users-page-size">Exibir:</label>
                  <select
                    id="users-page-size"
                    class="form-control select-size"
                    [ngModel]="usersPageSize()"
                    (ngModelChange)="onUsersPageSizeChange($event)"
                  >
                    <option [value]="5">5 por pág.</option>
                    <option [value]="10">10 por pág.</option>
                    <option [value]="25">25 por pág.</option>
                    <option [value]="50">50 por pág.</option>
                  </select>
                </div>
              </div>

              <div class="pagination-nav" *ngIf="usersTotalPages() > 1">
                <button
                  type="button"
                  class="page-btn"
                  [disabled]="usersPage() === 0"
                  (click)="prevUsersPage()"
                  title="Página Anterior"
                >
                  <i class="bi bi-chevron-left"></i>
                  <span>Anterior</span>
                </button>

                <div class="page-numbers">
                  <button
                    *ngFor="let p of usersPageNumbers()"
                    type="button"
                    class="page-number-btn"
                    [class.active]="p === usersPage()"
                    (click)="goToUsersPage(p)"
                  >
                    {{ p + 1 }}
                  </button>
                </div>

                <button
                  type="button"
                  class="page-btn"
                  [disabled]="usersPage() >= usersTotalPages() - 1"
                  (click)="nextUsersPage()"
                  title="Próxima Página"
                >
                  <span>Próxima</span>
                  <i class="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem 1rem 4rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .admin-header {
      text-align: center;
      max-width: 680px;
      margin: 0 auto;

      .admin-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.35rem 0.85rem;
        background: rgba(168, 85, 247, 0.15);
        color: #c084fc;
        border: 1px solid rgba(168, 85, 247, 0.3);
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
      }
    }

    .admin-card {
      background: #161b22;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5);
      padding: 2rem;
    }

    /* Tabs */
    .admin-tabs {
      display: flex;
      background: var(--bg-primary);
      border-radius: 8px;
      padding: 0.25rem;
      margin-bottom: 1.75rem;
      border: 1px solid var(--border-color);

      .tab-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background: transparent;
        border: none;
        color: var(--text-muted);
        padding: 0.65rem 1rem;
        font-size: 0.9rem;
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

    /* Status Alerts */
    .status-alert {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;

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

    /* Input Groups & Form Controls */
    .input-group {
      display: flex;
      align-items: center;
      background: #0d1117;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      transition: all 0.2s ease;
      overflow: hidden;

      &:focus-within {
        border-color: var(--accent-blue);
        box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15);
      }

      .input-icon {
        padding: 0 0.75rem;
        color: var(--text-muted);
        font-size: 1.1rem;
        display: flex;
        align-items: center;
      }

      .form-control {
        border: none;
        background: transparent;
        padding-left: 0;

        &:focus {
          box-shadow: none;
          border-color: transparent;
        }
      }
    }

    .form-control {
      width: 100%;
      background: #0d1117;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 0.6rem 0.85rem;
      font-size: 0.88rem;
      color: var(--text-main);
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;

      &::placeholder {
        color: var(--text-dim);
      }

      &:focus {
        border-color: var(--accent-blue);
        box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    select.form-control {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%238b949e' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 12px;
      padding-right: 2rem;

      option {
        background-color: #161b22;
        color: #f0f6fc;
      }
    }

    .dev-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;

      .sub-card {
        background: #0d1117;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1.25rem;

        .sub-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.4rem;

          i { color: var(--accent-blue); }
        }

        .sub-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.45;
          margin-bottom: 1rem;
        }

        .dev-form {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .btn-sync-all {
          width: 100%;
          padding: 0.65rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
      }
    }

    .separator {
      border: none;
      border-top: 1px solid var(--border-color);
      margin: 1.5rem 0;
    }

    /* Container de Tabelas */
    .table-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .table-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;

      .table-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-main);
      }

      .table-subtitle {
        font-size: 0.82rem;
        color: var(--text-muted);
        margin-top: 0.2rem;
      }

      .badge-count {
        font-size: 0.78rem;
        background: #21262d;
        border: 1px solid var(--border-color);
        color: var(--text-main);
        font-weight: 600;
        padding: 0.3rem 0.75rem;
        border-radius: 9999px;
      }
    }

    .table-responsive {
      width: 100%;
      overflow-x: auto;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: #0d1117;
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;

      th {
        text-align: left;
        padding: 0.85rem 1rem;
        background: #161b22;
        color: var(--text-muted);
        font-size: 0.76rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        border-bottom: 1px solid var(--border-color);
        white-space: nowrap;
      }

      td {
        padding: 0.85rem 1rem;
        border-bottom: 1px solid rgba(48, 54, 61, 0.4);
        color: var(--text-main);
        vertical-align: middle;
      }

      tr:last-child td {
        border-bottom: none;
      }

      tr:hover td {
        background: rgba(255, 255, 255, 0.02);
      }
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .user-avatar-sm {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid var(--border-color);
      }

      .user-details {
        display: flex;
        flex-direction: column;
      }

      .user-name {
        font-weight: 600;
        color: var(--text-main);
        font-size: 0.9rem;
      }

      .user-sub {
        font-size: 0.78rem;
        color: var(--text-muted);
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        text-decoration: none;

        .external-icon {
          font-size: 0.65rem;
          opacity: 0.7;
        }

        &:hover {
          color: var(--accent-blue);
          text-decoration: underline;
        }
      }
    }

    .commits-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.6rem;
      background: rgba(46, 160, 67, 0.12);
      border: 1px solid rgba(46, 160, 67, 0.3);
      color: #3fb950;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;

      i { font-size: 0.9rem; }
    }

    .streak-pill {
      font-size: 0.82rem;
      color: #fb923c;
      background: rgba(249, 115, 22, 0.12);
      border: 1px solid rgba(249, 115, 22, 0.3);
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .score-pill {
      font-size: 0.82rem;
      color: #facc15;
      background: rgba(234, 179, 8, 0.12);
      border: 1px solid rgba(234, 179, 8, 0.3);
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .email-text {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .empty-field {
      font-size: 0.78rem;
      color: var(--text-dim);
      font-style: italic;
    }

    /* Users Tab Specifics */
    .users-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .user-form-card {
      background: #0d1117;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;

      .form-title {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--text-main);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--border-color);

        i { color: var(--accent-blue); }
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.25rem;

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;

          &.full-width {
            grid-column: 1 / -1;
          }

          label {
            font-size: 0.82rem;
            color: var(--text-muted);
            font-weight: 500;
          }
        }
      }

      .form-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
      }
    }

    /* Checkbox Custom */
    .custom-checkbox-container {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      cursor: pointer;
      user-select: none;
      margin-top: 0.5rem;

      input {
        width: 18px;
        height: 18px;
        accent-color: var(--accent-green);
        cursor: pointer;
      }

      .label-text {
        color: var(--text-main);
        font-size: 0.88rem;
        font-weight: 500;
      }
    }

    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 600;

      &.admin {
        background: rgba(168, 85, 247, 0.15);
        color: #c084fc;
        border: 1px solid rgba(168, 85, 247, 0.35);
      }

      &.user {
        background: rgba(88, 166, 255, 0.12);
        color: #58a6ff;
        border: 1px solid rgba(88, 166, 255, 0.3);
      }
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 600;

      &.approved {
        background: rgba(63, 185, 80, 0.15);
        color: #3fb950;
        border: 1px solid rgba(63, 185, 80, 0.35);
      }

      &.pending {
        background: rgba(210, 153, 34, 0.15);
        color: #d29922;
        border: 1px solid rgba(210, 153, 34, 0.35);
      }
    }

    .actions-group {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      justify-content: flex-end;
    }

    .btn-action-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: #21262d;
      border: 1px solid var(--border-color);
      cursor: pointer;
      border-radius: 6px;
      font-size: 0.88rem;
      color: var(--text-muted);
      transition: all 0.2s ease;

      &:hover {
        color: var(--text-main);
        border-color: var(--border-light);
        background: #30363d;
      }

      &.approve {
        color: #3fb950;
        &:hover {
          background: rgba(63, 185, 80, 0.2);
          border-color: #3fb950;
        }
      }

      &.revoke {
        color: #d29922;
        &:hover {
          background: rgba(210, 153, 34, 0.2);
          border-color: #d29922;
        }
      }

      &.edit {
        color: var(--accent-blue);
        &:hover {
          background: rgba(88, 166, 255, 0.2);
          border-color: var(--accent-blue);
        }
      }

      &.delete {
        color: #f85149;
        &:hover {
          background: rgba(248, 81, 73, 0.2);
          border-color: #f85149;
        }
      }
    }

    /* Paginação Moderna */
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 0.75rem 0.5rem;
      margin-top: 0.5rem;

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

    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .mt-3 { margin-top: 1rem; }

    .loading-state, .empty-state-cell {
      padding: 3rem 1.5rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.9rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;

      i {
        font-size: 1.6rem;
        color: var(--text-dim);
      }
    }

    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    @media (max-width: 640px) {
      .admin-page {
        padding: 1.25rem 0.5rem 3rem;
      }
      .admin-card {
        padding: 1.25rem 0.85rem;
      }
      .page-title {
        font-size: 1.75rem;
      }
      .dev-actions-grid {
        grid-template-columns: 1fr;
      }
      .pagination-bar {
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }
      .users-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
        button {
          width: 100%;
        }
      }
    }
  `]
})
export class AdminPanelComponent implements OnInit {
  protected readonly Math = Math;

  @Output() closed = new EventEmitter<void>();
  @Output() developerAdded = new EventEmitter<void>();

  activeTab: 'developers' | 'users' = 'developers';

  githubInput = '';
  errorMessage = '';
  successMessage = '';

  // Tracked Devs State & Paginação
  trackedDevelopers: RankingItem[] = [];
  isLoadingDevs = false;
  devsPage = signal(0);
  devsPageSize = signal(10);
  devsTotal = signal(0);
  devsTotalPages = signal(1);

  devsPageNumbers = computed<number[]>(() => {
    const total = this.devsTotalPages();
    const current = this.devsPage();
    const pages: number[] = [];
    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  // Users CRUD State & Paginação
  users: UserProfile[] = [];
  isLoadingUsers = false;
  showUserForm = false;
  editingUserId: number | null = null;
  usersPage = signal(0);
  usersPageSize = signal(10);
  usersTotal = signal(0);
  usersTotalPages = signal(1);

  usersPageNumbers = computed<number[]>(() => {
    const total = this.usersTotalPages();
    const current = this.usersPage();
    const pages: number[] = [];
    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  userFormData: AdminUserFormData = {
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'ROLE_USER'
  };

  constructor(
    public adminService: AdminService,
    private rankingService: RankingService
  ) {}

  ngOnInit(): void {
    this.loadTrackedDevelopers();
  }

  setTab(tab: 'developers' | 'users'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
    if (tab === 'developers') {
      this.loadTrackedDevelopers();
    } else if (tab === 'users') {
      this.loadUsers();
    }
  }

  // ==========================================
  // Métodos de Rastreamento de Devs
  // ==========================================

  loadTrackedDevelopers(): void {
    this.isLoadingDevs = true;
    this.rankingService.fetchLeaderboard({
      period: 'all_time',
      sortBy: 'commits',
      page: this.devsPage(),
      size: this.devsPageSize()
    }).subscribe({
      next: (res) => {
        this.trackedDevelopers = res.leaderboard || [];
        this.devsTotal.set(res.totalDevelopers || this.trackedDevelopers.length);
        this.devsTotalPages.set(res.totalPages || 1);
        this.isLoadingDevs = false;
      },
      error: () => {
        this.isLoadingDevs = false;
      }
    });
  }

  onDevsPageSizeChange(newSize: any): void {
    const parsed = Number(newSize);
    if (!isNaN(parsed) && parsed > 0) {
      this.devsPageSize.set(parsed);
      this.devsPage.set(0);
      this.loadTrackedDevelopers();
    }
  }

  prevDevsPage(): void {
    if (this.devsPage() > 0) {
      this.devsPage.update(p => p - 1);
      this.loadTrackedDevelopers();
    }
  }

  nextDevsPage(): void {
    if (this.devsPage() < this.devsTotalPages() - 1) {
      this.devsPage.update(p => p + 1);
      this.loadTrackedDevelopers();
    }
  }

  goToDevsPage(page: number): void {
    if (page >= 0 && page < this.devsTotalPages() && page !== this.devsPage()) {
      this.devsPage.set(page);
      this.loadTrackedDevelopers();
    }
  }

  onAddDeveloper(): void {
    if (!this.githubInput.trim()) return;

    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.addDeveloper(this.githubInput.trim()).subscribe({
      next: (res) => {
        this.successMessage = `Desenvolvedor @${res.username} adicionado com sucesso!`;
        this.githubInput = '';
        this.loadTrackedDevelopers();
        this.developerAdded.emit();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao adicionar desenvolvedor do GitHub.';
      }
    });
  }

  onSyncAll(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.syncAll().subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.loadTrackedDevelopers();
        this.developerAdded.emit();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Falha ao sincronizar desenvolvedores.';
      }
    });
  }

  deleteDeveloper(dev: RankingItem): void {
    if (!confirm(`Deseja remover @${dev.username} do ranking?`)) {
      return;
    }

    this.adminService.deleteDeveloper(dev.id).subscribe({
      next: () => {
        this.successMessage = `Desenvolvedor @${dev.username} removido com sucesso.`;
        this.loadTrackedDevelopers();
        this.developerAdded.emit();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Falha ao remover desenvolvedor.';
      }
    });
  }

  // ==========================================
  // Métodos CRUD de Usuários
  // ==========================================

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.adminService.getUsers(this.usersPage(), this.usersPageSize()).subscribe({
      next: (res: AdminUsersPageResponse) => {
        this.users = res.users || [];
        this.usersTotal.set(res.totalUsers || this.users.length);
        this.usersTotalPages.set(res.totalPages || 1);
        this.isLoadingUsers = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao listar usuários.';
        this.isLoadingUsers = false;
      }
    });
  }

  onUsersPageSizeChange(newSize: any): void {
    const parsed = Number(newSize);
    if (!isNaN(parsed) && parsed > 0) {
      this.usersPageSize.set(parsed);
      this.usersPage.set(0);
      this.loadUsers();
    }
  }

  prevUsersPage(): void {
    if (this.usersPage() > 0) {
      this.usersPage.update(p => p - 1);
      this.loadUsers();
    }
  }

  nextUsersPage(): void {
    if (this.usersPage() < this.usersTotalPages() - 1) {
      this.usersPage.update(p => p + 1);
      this.loadUsers();
    }
  }

  goToUsersPage(page: number): void {
    if (page >= 0 && page < this.usersTotalPages() && page !== this.usersPage()) {
      this.usersPage.set(page);
      this.loadUsers();
    }
  }

  openCreateUser(): void {
    this.editingUserId = null;
    this.userFormData = {
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'ROLE_USER'
    };
    this.errorMessage = '';
    this.successMessage = '';
    this.showUserForm = true;
  }

  openEditUser(user: UserProfile): void {
    this.editingUserId = user.id;
    this.userFormData = {
      username: user.username,
      password: '',
      name: user.name || '',
      email: user.email || '',
      role: user.role,
      approved: user.approved
    };
    this.errorMessage = '';
    this.successMessage = '';
    this.showUserForm = true;
  }

  toggleApproval(user: UserProfile): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.toggleUserApproval(user.id).subscribe({
      next: (updated) => {
        user.approved = updated.approved;
        this.successMessage = `Status de @${user.username} alterado para: ${user.approved ? 'Liberado' : 'Pendente'}.`;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Falha ao alterar status de aprovação.';
      }
    });
  }

  cancelUserForm(): void {
    this.showUserForm = false;
    this.editingUserId = null;
  }

  saveUser(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.userFormData.username) return;

    if (this.editingUserId) {
      this.adminService.updateUser(this.editingUserId, this.userFormData).subscribe({
        next: (updated) => {
          this.successMessage = `Usuário @${updated.username} atualizado com sucesso!`;
          this.showUserForm = false;
          this.editingUserId = null;
          this.loadUsers();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Falha ao atualizar usuário.';
        }
      });
    } else {
      if (!this.userFormData.password) {
        this.errorMessage = 'A senha é obrigatória para criar um novo usuário.';
        return;
      }

      this.adminService.createUser(this.userFormData).subscribe({
        next: (created) => {
          this.successMessage = `Usuário @${created.username} criado com sucesso!`;
          this.showUserForm = false;
          this.loadUsers();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Falha ao criar usuário.';
        }
      });
    }
  }

  deleteUser(user: UserProfile): void {
    if (!confirm(`Tem certeza que deseja excluir o usuário @${user.username}?`)) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.successMessage = `Usuário @${user.username} excluído com sucesso.`;
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao excluir usuário.';
      }
    });
  }
}
