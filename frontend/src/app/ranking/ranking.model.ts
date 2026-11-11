export type TierType = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'GRANDMASTER';

export type BadgeType =
  | 'COMMIT_MACHINE'
  | 'STREAK_MASTER'
  | 'OCTOCAT_VETERAN'
  | 'WEEKLY_SPRINTER'
  | 'COMMUNITY_STAR'
  | 'PODIUM_CHAMPION';

export interface DailyActivity {
  date: string;
  commitCount: number;
}

export interface RankingItem {
  id: number;
  position: number;
  username: string;
  name: string;
  avatarUrl: string;
  htmlUrl: string;
  bio: string;
  commitsInPeriod: number;
  totalCommits: number;
  score: number;
  currentStreak: number;
  publicRepos: number;
  followers: number;
  tier: TierType;
  badges: BadgeType[];
  recentActivity: DailyActivity[];
  lastSyncedAt: string;
}

export interface LeaderboardResponse {
  preset: string;
  startDate: string;
  endDate: string;
  sortBy: string;
  totalDevelopers: number;
  leaderboard: RankingItem[];
  topThree?: RankingItem[];
  page?: number;
  size?: number;
  totalPages?: number;
}

export interface RankingFilterParams {
  period?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  search?: string;
  page?: number;
  size?: number;
}

export interface BadgeInfo {
  icon: string;
  title: string;
  color: string;
}

export const BADGE_DEFINITIONS: Record<BadgeType, BadgeInfo> = {
  COMMIT_MACHINE: { icon: 'bi-cpu-fill', title: 'Commit Machine (+1k commits)', color: '#bc8cff' },
  STREAK_MASTER: { icon: 'bi-fire', title: 'Streak Master (+7 dias seguidos)', color: '#f85149' },
  OCTOCAT_VETERAN: { icon: 'bi-box-seam-fill', title: 'Octocat Veteran (+30 repos)', color: '#58a6ff' },
  WEEKLY_SPRINTER: { icon: 'bi-lightning-charge-fill', title: 'Weekly Sprinter (+25 commits na semana)', color: '#d29922' },
  COMMUNITY_STAR: { icon: 'bi-star-fill', title: 'Community Star (+50 seguidores)', color: '#e3b341' },
  PODIUM_CHAMPION: { icon: 'bi-trophy-fill', title: 'Top 3 Podium Champion', color: '#f1e05a' }
};

export interface RepoSummary {
  name: string;
  htmlUrl: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string;
  isFork: boolean;
}

export interface RecentCommit {
  sha: string;
  shortSha: string;
  message: string;
  date: string;
  repoName: string;
  repoUrl: string;
  commitUrl: string;
}

export interface DeveloperDetails {
  username: string;
  name: string;
  avatarUrl: string;
  htmlUrl: string;
  bio: string;
  company: string;
  location: string;
  email: string;
  blog: string;
  twitterUsername: string;
  createdAt: string;
  publicRepos: number;
  followers: number;
  following: number;

  totalCommits: number;
  yearCommits: number;
  currentStreak: number;
  score: number;
  tier: TierType;
  rankingPosition: number;
  badges: BadgeType[];
  lastSyncedAt: string;

  topRepositories: RepoSummary[];
  recentCommits: RecentCommit[];
}

