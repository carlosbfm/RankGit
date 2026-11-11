import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RankingService } from '../../ranking.service';
import { BADGE_DEFINITIONS, RankingFilterParams, RankingItem } from '../../ranking.model';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  protected readonly Math = Math;

  activePreset = 'all_time';
  searchQuery = signal('');
  sortBy = 'commits';
  customStart = '';
  customEnd = '';
  showCustomDates = false;
  showScoreModal = signal(false);
  isSyncing = signal(false);

  // Paginação
  currentPage = signal(0);
  pageSize = signal(10);

  readonly badgeDefs = BADGE_DEFINITIONS;

  topThree = computed<RankingItem[]>(() => {
    const data = this.rankingService.leaderboardData();
    if (data?.topThree && data.topThree.length > 0) {
      return data.topThree;
    }
    const list = data?.leaderboard;
    return list && list.length > 0 ? list.slice(0, 3) : [];
  });

  filteredLeaderboard = computed<RankingItem[]>(() => {
    const list = this.rankingService.leaderboardData()?.leaderboard || [];
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return list;
    return list.filter(item =>
      item.username.toLowerCase().includes(query) ||
      (item.name && item.name.toLowerCase().includes(query))
    );
  });

  pageNumbers = computed<number[]>(() => {
    const total = this.rankingService.leaderboardData()?.totalPages || 1;
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  presets = [
    { id: 'all_time', label: 'Geral (All Time)', icon: 'bi-infinity' },
    { id: 'this_year', label: 'Este Ano', icon: 'bi-calendar3' },
    { id: 'this_month', label: 'Este Mês', icon: 'bi-calendar-month' },
    { id: 'this_week', label: 'Esta Semana', icon: 'bi-calendar-week' },
    { id: 'today', label: 'Hoje', icon: 'bi-clock' },
    { id: 'custom', label: 'Customizado', icon: 'bi-sliders' }
  ];

  sortOptions = [
    { id: 'commits', label: 'Commits no Período' },
    { id: 'score', label: 'Score RankGit' },
    { id: 'streak', label: 'Sequência (Streak)' },
    { id: 'repos', label: 'Repositórios' },
    { id: 'followers', label: 'Seguidores' }
  ];

  constructor(public rankingService: RankingService) {}

  ngOnInit(): void {
    this.refresh();
  }

  setPreset(presetId: string): void {
    this.activePreset = presetId;
    this.showCustomDates = presetId === 'custom';
    this.currentPage.set(0);
    if (!this.showCustomDates) {
      this.refresh();
    }
  }

  onSortChange(sort: string): void {
    this.sortBy = sort;
    this.currentPage.set(0);
    this.refresh();
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(0);
    this.refresh();
  }

  openScoreModal(): void {
    this.showScoreModal.set(true);
  }

  closeScoreModal(): void {
    this.showScoreModal.set(false);
  }

  applyCustomRange(): void {
    if (this.customStart && this.customEnd) {
      this.currentPage.set(0);
      this.refresh();
    }
  }

  goToPage(p: number): void {
    const total = this.rankingService.leaderboardData()?.totalPages || 1;
    if (p >= 0 && p < total) {
      this.currentPage.set(p);
      this.refresh();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(0);
    this.refresh();
  }

  scrollToSection(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  refresh(): void {
    const filter: RankingFilterParams = {
      period: this.activePreset,
      sortBy: this.sortBy,
      page: this.currentPage(),
      size: this.pageSize()
    };

    if (this.activePreset === 'custom' && this.customStart && this.customEnd) {
      filter.startDate = this.customStart;
      filter.endDate = this.customEnd;
    }

    this.rankingService.fetchLeaderboard(filter).subscribe();
  }

  syncCommits(): void {
    this.isSyncing.set(true);
    this.rankingService.syncRankings().subscribe({
      next: () => {
        this.isSyncing.set(false);
        this.refresh();
      },
      error: () => {
        this.isSyncing.set(false);
        this.refresh();
      }
    });
  }

  trackByDevId(_index: number, item: RankingItem): number {
    return item.id;
  }

  calcSparkHeight(count: number, activity: { commitCount: number }[]): number {
    if (!activity || activity.length === 0) return 0;
    const max = Math.max(...activity.map(a => a.commitCount), 1);
    return Math.round((count / max) * 100);
  }
}
