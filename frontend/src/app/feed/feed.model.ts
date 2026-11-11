export interface FeedAuthor {
  username: string;
  name: string;
  avatarUrl: string;
  tier: string;
  currentStreak: number;
  score: number;
  totalCommits: number;
}

export interface FeedCommitContent {
  message: string;
  repoName: string;
  repoUrl: string;
  commitUrl: string;
  committedAt: string;
}

export interface FeedPost {
  id: number;
  sha: string;
  shortSha: string;
  author: FeedAuthor;
  commit: FeedCommitContent;
  reactionsCount: Record<string, number>;
  currentUserReactions: string[];
  timeAgo: string;
}

export interface FeedPageResponse {
  posts: FeedPost[];
  page: number;
  size: number;
  totalPosts: number;
  totalPages: number;
  totalTrackedDevelopers: number;
}
